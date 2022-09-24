package trip

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	rentalpb "coolcar/rental/api/gen/v1"
	"coolcar/rental/trip/dao"
	"coolcar/shared/auth"
	"coolcar/shared/id"
	"coolcar/shared/mongo/objid"

	"go.uber.org/zap"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Service struct {
	ProfileManager ProfileManager
	CarManger      CarManager
	POIManager     POIManager
	DistanceCalc   DistanceCalc
	Mongo          *dao.Mongo
	Logger         *zap.Logger
}

//对用户身份进行验证
type ProfileManager interface {
	Verify(c context.Context, aid id.AccountID) (id.IdentityID, error)
}

//车辆管理，车辆状态，解锁
type CarManager interface {
	Verify(c context.Context, cid id.CarID, loc *rentalpb.Location) error
	Unlock(c context.Context, cid id.CarID, aid id.AccountID, tid id.TripID, AvatarUrl string) error
	Lock(c context.Context, cid id.CarID) error
}

//利用经纬度找出地名
type POIManager interface {
	Resolve(c context.Context, loc *rentalpb.Location) (string, error)
}

//计算距离
type DistanceCalc interface {
	Distance(c context.Context, last *rentalpb.Location, cur *rentalpb.Location) (float64, error)
}

//服务层，直接面向客户端，需要注意隐藏一些数据
//event handling method
//TripServiceServer is the server API for TripService service.

//CreateTrip create a trip
func (s *Service) CreateTrip(c context.Context, req *rentalpb.CreateTripRequest) (*rentalpb.TripEntity, error) {
	aid, err := auth.AccountIDFromContext(c)
	if err != nil {
		return nil, err
	}

	if req.CarId == "" || req.Start == nil {
		return nil, status.Error(codes.InvalidArgument, "")
	}

	//验证驾驶者身份,并返回用户身份信息
	iID, err := s.ProfileManager.Verify(c, aid)
	if err != nil {
		return nil, status.Error(codes.FailedPrecondition, err.Error())
	}

	//检查车辆状态
	carID := id.CarID(req.CarId)
	fmt.Printf("用户上传carID:%v\n", carID)
	err = s.CarManger.Verify(c, carID, req.Start)
	if err != nil {
		return nil, status.Error(codes.FailedPrecondition, err.Error())
	}

	//创建行程， 开始计算行程，费用
	ls := s.calcCurrentStatus(c, &rentalpb.LocationStatus{
		Location:     req.Start,
		TimestampSec: nowFunc(),
	}, req.Start)
	tr, err := s.Mongo.CreateTrip(c, &rentalpb.Trip{
		AccountId:  aid.String(),
		CarId:      carID.String(),
		Start:      ls,
		Current:    ls,
		Status:     rentalpb.TripStatus_IN_PROGRESS,
		IdentityId: iID.String(),
	})
	if err != nil {
		s.Logger.Warn("不能创建行程", zap.Error(err))
		return nil, status.Error(codes.AlreadyExists, "")
	}

	//车辆开锁
	//同时行程创建并立即进行车辆解锁,使用并发
	//开锁需要在后台进行，需要新开context
	go func() {
		err := s.CarManger.Unlock(context.Background(), carID, aid, objid.ToTripID(tr.ID), req.AvatarUrl)
		if err != nil {
			s.Logger.Error("cannot unlock car", zap.Error(err))
		}
	}()

	fmt.Printf("响应id:%s; 响应:%s", tr.ID.Hex(), tr.Trip)
	return &rentalpb.TripEntity{
		Id:   tr.ID.Hex(),
		Trip: tr.Trip,
	}, nil
}

//GetTrip to get a trip
func (s *Service) GetTrip(c context.Context, req *rentalpb.GetTripRequest) (*rentalpb.Trip, error) {

	//需要将用户aid拿出
	aid, err := auth.AccountIDFromContext(c)
	if err != nil {
		return nil, err
	}
	//获取行程信息
	trip, err := s.Mongo.GetTrip(c, id.TripID(req.Id), aid)
	if err != nil {
		return nil, status.Error(codes.NotFound, "无法获取行程")
	}

	fmt.Printf("GetTrip_ID:%s; GetTrip_ID:%s", trip.ID.Hex(), trip.Trip)
	return trip.Trip, nil
}

//GetTrips go get the trips
func (s *Service) GetTrips(c context.Context, req *rentalpb.GetTripsRequest) (*rentalpb.GetTripsResponse, error) {
	aid, err := auth.AccountIDFromContext(c)
	if err != nil {
		return nil, err
	}

	trips, err := s.Mongo.GetTrips(c, aid, req.Status)
	if err != nil {
		s.Logger.Error("cannot get trips:", zap.Error(err))
		return nil, status.Error(codes.Unimplemented, "")
	}
	res := &rentalpb.GetTripsResponse{}
	for _, tr := range trips {
		res.Trips = append(res.Trips, &rentalpb.TripEntity{
			Id:   tr.ID.Hex(),
			Trip: tr.Trip,
		},
		)
	}

	return res, nil
}

//UpdateTrip go update trip
func (s *Service) UpdateTrip(c context.Context, req *rentalpb.UpdateTripRequest) (*rentalpb.Trip, error) {
	aid, err := auth.AccountIDFromContext(c)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "")
	}

	tid := id.TripID(req.Id)
	tr, err := s.Mongo.GetTrip(c, tid, aid)
	if err != nil {
		return nil, status.Error(codes.NotFound, "")
	}
	//保护行程行程状态
	if tr.Trip.Status == rentalpb.TripStatus_FINISHED {
		return nil, status.Error(codes.FailedPrecondition, "该行程已为完成状态")
	}
	//检测数据库中位置信息是否存在
	if tr.Trip.Current == nil {
		s.Logger.Error("trip without current set", zap.String("id", tid.String()))
		return nil, status.Error(codes.Internal, "")
	}

	cur := tr.Trip.Current.Location
	//检测用户是否上传当前位置
	if req.Current != nil {
		cur = req.Current
	}

	tr.Trip.Current = s.calcCurrentStatus(c, tr.Trip.Current, cur)

	if req.EndTrip {
		tr.Trip.End = tr.Trip.Current
		tr.Trip.Status = rentalpb.TripStatus_FINISHED
		err := s.CarManger.Lock(c, id.CarID(tr.Trip.CarId))
		if err != nil {
			return nil, status.Errorf(codes.FailedPrecondition, "cannot lock car :%v", err)
		}
	}

	err = s.Mongo.UpdateTrip(c, id.TripID(req.Id), aid, tr.UpdatedAt, tr.Trip)
	if err != nil {
		return nil, status.Error(codes.Aborted, "")
	}
	return tr.Trip, nil
}

//当前时间
var nowFunc = func() int64 {
	return time.Now().Unix()
}

//计价比率
const centsPerSec = 0.7

//计算价格，距离，时间等
func (s *Service) calcCurrentStatus(c context.Context, last *rentalpb.LocationStatus, cur *rentalpb.Location) *rentalpb.LocationStatus {
	now := nowFunc()
	elapsedSec := float64(now - last.TimestampSec)

	dist, err := s.DistanceCalc.Distance(c, last.Location, cur)
	if err != nil {
		s.Logger.Warn("cannot calculate distance", zap.Error(err))
	}

	poi, err := s.POIManager.Resolve(c, cur)
	if err != nil {
		s.Logger.Info("cannot resolve poi", zap.Stringer("loc", cur))
	}

	return &rentalpb.LocationStatus{
		Location:     cur,
		FeeCent:      last.FeeCent + int32(centsPerSec*elapsedSec*2*rand.Float64()),
		KmDriven:     last.KmDriven + dist,
		TimestampSec: now,
		PoiName:      poi,
	}
}

package car

import (
	"context"
	"fmt"

	carpb "coolcar/car/api/gen/v1"
	"coolcar/car/dao"
	"coolcar/car/mq"
	"coolcar/shared/id"

	"go.mongodb.org/mongo-driver/mongo"
	"go.uber.org/zap"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

//Publisher向中间件发消息
// type Publisher interface {
// 	Publish(c context.Context, req *carpb.CarEntity) error
// }

// Server is the server API for CarService service.
type Service struct {
	Mongo     *dao.Mongo
	Logger    *zap.Logger
	Publisher mq.Publisher
}

//CreateCar创建car
func (s *Service) CreateCar(c context.Context, req *carpb.CreateCarRequest) (*carpb.CarEntity, error) {
	car, err := s.Mongo.CreateCar(c)
	if err != nil {
		s.Logger.Warn("不能创建车辆", zap.Error(err))
		return nil, status.Error(codes.AlreadyExists, "")
	}
	return &carpb.CarEntity{
		Id:  car.ID.Hex(),
		Car: car.Car,
	}, nil
}

//GetCar获取指定车辆信息
func (s *Service) GetCar(c context.Context, req *carpb.GetCarRequest) (*carpb.Car, error) {
	car, err := s.Mongo.GetCar(c, id.CarID(req.Id))
	if err != nil {
		return nil, status.Error(codes.NotFound, "不能获取车辆信息")
	}
	return car.Car, nil
}

//GetCars批量获取车辆信息
func (s *Service) GetCars(c context.Context, req *carpb.GetCarsRequest) (*carpb.GetCarsResponse, error) {
	cars, err := s.Mongo.GetCars(c)
	if err != nil {
		return nil, status.Error(codes.NotFound, "不能获取车辆信息")
	}
	res := &carpb.GetCarsResponse{}
	for _, car := range cars {
		res.Cars = append(res.Cars, &carpb.CarEntity{
			Id:  car.ID.Hex(),
			Car: car.Car,
		})
	}
	return res, nil
}

//LockCar向指定车辆发出关锁指令
func (s *Service) LockCar(c context.Context, req *carpb.LockCarRequest) (*carpb.LockCarResponse, error) {
	car, err := s.Mongo.UpdataCar(c, id.CarID(req.Id), carpb.CarStatus_UNLOCKED, &dao.CarUpdate{
		Status: carpb.CarStatus_LOCKING,
	})
	if err != nil {
		code := codes.Internal
		if err == mongo.ErrNoDocuments {
			code = codes.NotFound
		}
		return nil, status.Error(code, "")
	}
	fmt.Printf("关锁的行程ID:%+s\n", car.Car.TripId)
	s.publish(c, car)
	return &carpb.LockCarResponse{}, nil
}

//UnlockCar向指定车辆发出解锁指令
func (s *Service) UnlockCar(c context.Context, req *carpb.UnlockCarRequest) (*carpb.UnlockCarResponse, error) {
	car, err := s.Mongo.UpdataCar(c, id.CarID(req.Id), carpb.CarStatus_LOCKED, &dao.CarUpdate{
		Status:       carpb.CarStatus_UNLOCKING,
		Driver:       req.Driver,
		UpdateTripID: true,
		TripID:       id.TripID(req.TripId),
	})
	if err != nil {
		code := codes.Internal
		if err == mongo.ErrNoDocuments {
			code = codes.NotFound
		}
		return nil, status.Error(code, "")
	}
	fmt.Printf("更新数据库的行程ID: %+s\n", req.TripId)
	fmt.Printf("开锁的行程ID:%+s\n", car.Car.TripId)
	s.publish(c, car)
	return &carpb.UnlockCarResponse{}, nil
}

// UpdateCar 更新汽车的位置和状态
// 前置条件检查。
// 适合汽车软件/硬件调用。
func (s *Service) UpdataCar(c context.Context, req *carpb.UpdataCarRequest) (*carpb.Car, error) {
	update := &dao.CarUpdate{
		Status:   req.Status,
		Position: req.Position,
	}

	if req.Status == carpb.CarStatus_LOCKED {
		update.Driver = nil
		update.TripID = id.TripID("")
		update.UpdateTripID = true
	}

	car, err := s.Mongo.UpdataCar(c, id.CarID(req.Id), carpb.CarStatus_CS_NOT_SPECIFID, update)
	if err != nil {
		return nil, status.Error(codes.Internal, "")
	}
	fmt.Printf("更新车辆状态的行程ID:%+s\n", car.Car.TripId)
	s.publish(c, car)
	return &carpb.Car{
		Status:   car.Car.Status,
		Driver:   car.Car.Driver,
		Position: car.Car.Position,
		TripId:   car.Car.TripId,
	}, nil
}

//向中间件发消息
func (s *Service) publish(c context.Context, car *dao.CarRecord) {
	err := s.Publisher.Publish(c, &carpb.CarEntity{
		Id:  car.ID.Hex(),
		Car: car.Car,
	})

	if err != nil {
		s.Logger.Warn("cannot publish", zap.Error(err))
	}
}

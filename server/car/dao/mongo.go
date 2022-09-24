package dao

import (
	"context"
	"fmt"

	carpb "coolcar/car/api/gen/v1"
	"coolcar/shared/id"
	mgo "coolcar/shared/mongo"
	"coolcar/shared/mongo/objid"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	carField      = "car"
	statusField   = carField + ".status"
	driverField   = carField + ".driver"
	positionField = carField + ".position"
	tripIDField   = carField + ".tripid"
)

type Mongo struct {
	col *mongo.Collection
}

//数据库初始化，类似构造函数
func NewMongo(db *mongo.Database) *Mongo {
	return &Mongo{
		col: db.Collection("car"),
	}
}

type CarRecord struct {
	mgo.IDField `bson:"inline"`
	Car         *carpb.Car `bson:"car"`
}

//CreateCar创建car写入数据库
func (m *Mongo) CreateCar(c context.Context) (*CarRecord, error) {
	r := &CarRecord{
		Car: &carpb.Car{
			Position: &carpb.Location{
				Longitude: 120,
				Latitude:  30,
			},
			Status: carpb.CarStatus_LOCKED,
		},
	}
	r.ID = mgo.NewObjID()
	_, err := m.col.InsertOne(c, r)
	if err != nil {
		return nil, err
	}
	return r, nil
}

//GetCar根据id从数据库获取车辆信息
func (m *Mongo) GetCar(c context.Context, id id.CarID) (*CarRecord, error) {
	objID, err := objid.FromID(id)
	if err != nil {
		return nil, fmt.Errorf("不能转换为ObjectID: %v", err)
	}
	filter := bson.M{
		mgo.IDFieldName: objID,
	}
	res := m.col.FindOne(c, filter)
	return convertSing(res)
}

//GetCar从数据库批量获取车辆信息
func (m *Mongo) GetCars(c context.Context) ([]*CarRecord, error) {
	filter := bson.M{}
	res, err := m.col.Find(c, filter)
	if err != nil {
		return nil, fmt.Errorf("不能获取车辆信息: %v", err)
	}

	var cars []*CarRecord
	for res.Next(c) {
		var car CarRecord
		err := res.Decode(&car)
		if err != nil {
			return nil, err
		}
		cars = append(cars, &car)
	}
	return cars, nil
}

type CarUpdate struct {
	Status       carpb.CarStatus //更新状态
	Position     *carpb.Location //更新位置
	Driver       *carpb.Driver   //更新驾驶者信息
	UpdateTripID bool            //行程更新判断
	TripID       id.TripID       //更新行程ID
}

//UpdataCar更新车辆信息
func (m *Mongo) UpdataCar(c context.Context, id id.CarID, status carpb.CarStatus, update *CarUpdate) (*CarRecord, error) {
	objID, err := objid.FromID(id)
	if err != nil {
		return nil, fmt.Errorf("不能转换类型: %v", err)
	}
	filter := bson.M{
		mgo.IDFieldName: objID,
	}
	if status != carpb.CarStatus_CS_NOT_SPECIFID {
		filter[statusField] = status
	}

	//判断前置数据，对信息状态进行保护，
	u := bson.M{}
	if update.Status != carpb.CarStatus_CS_NOT_SPECIFID {
		u[statusField] = update.Status
	}
	if update.Driver != nil {
		u[driverField] = update.Driver
	}
	if update.Position != nil {
		u[positionField] = update.Position
	}
	if update.UpdateTripID {
		u[tripIDField] = update.TripID.String()
	}
	//根据条件查找或创建
	res := m.col.FindOneAndUpdate(c, filter, mgo.Set(u), options.FindOneAndUpdate().SetReturnDocument(options.After))

	return convertSing(res)
}

//解码
func convertSing(r *mongo.SingleResult) (*CarRecord, error) {
	if err := r.Err(); err != nil {
		return nil, err
	}
	var car CarRecord
	err := r.Decode(&car)
	if err != nil {
		return nil, fmt.Errorf("不能解码: %v", err)
	}
	return &car, nil
}

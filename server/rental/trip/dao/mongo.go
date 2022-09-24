package dao

import (
	"context"
	"fmt"

	rentalpb "coolcar/rental/api/gen/v1"
	"coolcar/shared/id"
	mgo "coolcar/shared/mongo"
	objid "coolcar/shared/mongo/objid"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	tripField      = "trip"
	accountIDField = tripField + ".accountid"
	statusField    = tripField + ".status"
	//accountIDFilter    = "trip.accountid"
	//tripstatusFilter   = "trip.status"
	//IDFieldName        = "_id"
	//UpdatedAtFieldName = "updatedat"
)

//定义一个 Mongo 类型
type Mongo struct {
	col *mongo.Collection
}

//初始化数据库， 类似构造函数
func NewMongo(db *mongo.Database) *Mongo {
	return &Mongo{
		col: db.Collection("trip"),
	}
}

type TripRecord struct {
	mgo.IDField        `bson:"inline"`
	mgo.UpdatedAtField `bson:"inline"` //时间戳
	Trip               *rentalpb.Trip  `bson:"trip"`
}

// CreateTrip creates a trip.
func (m *Mongo) CreateTripTest(c context.Context, trip *rentalpb.Trip) (*TripRecord, error) {
	r := &TripRecord{
		Trip: trip,
	}
	r.ID = mgo.NewObjID()
	r.UpdatedAt = mgo.UpdatedAt()

	_, err := m.col.InsertOne(c, r)
	if err != nil {
		return nil, err
	}

	return r, nil
}

//创建行程， 将初始化数据放入数据库中并分配Trip ID和时间戳
func (m *Mongo) CreateTrip(c context.Context, trip *rentalpb.Trip) (*TripRecord, error) {
	r := &TripRecord{
		Trip: trip,
	}
	r.ID = mgo.NewObjID()
	r.UpdatedAt = mgo.UpdatedAt()
	_, err := m.col.InsertOne(c, r)
	if err != nil {
		return nil, err
	}
	return r, nil
}

//根据条件获取行程信息
func (m *Mongo) GetTrip(c context.Context, id id.TripID, accountId id.AccountID) (*TripRecord, error) {
	//将id做类型转换
	ojbid, err := objid.FromID(id)
	if err != nil {
		return nil, fmt.Errorf("不能将id转换: %v", err)
	}
	// filter := bson.M{
	// 	"id": ojbid,
	// 	"trip.accountid": accountId,
	// }
	// res := m.col.FindOne(c, filter)

	res := m.col.FindOne(c, bson.M{
		mgo.IDFieldName: ojbid,
		accountIDField:  accountId,
	})

	//将res以TripRecord的结构解码
	var tr TripRecord
	err = res.Decode(&tr)
	if err != nil {
		fmt.Errorf("不能解码: %v", err)
	}
	return &tr, nil
}

//GetTrips 根据条件去批量获取用户的行程信息
func (m *Mongo) GetTrips(c context.Context, accountID id.AccountID, status rentalpb.TripStatus) ([]*TripRecord, error) {
	filter := bson.M{
		accountIDField: accountID.String(),
	}
	if status != rentalpb.TripStatus_TS_NOT_SPECIFIED {
		filter[statusField] = status
	}

	res, err := m.col.Find(c, filter, options.Find().SetSort(bson.M{
		mgo.IDFieldName: -1,
	}))

	if err != nil {
		return nil, fmt.Errorf("cannot Find matching documents: %v", err)
	}

	var trips []*TripRecord
	for res.Next(c) {

		//将res以TripRecord的结构解码
		var trip TripRecord
		err := res.Decode(&trip)
		if err != nil {
			fmt.Errorf("不能解码: %v", err)
		}
		trips = append(trips, &trip)
	}
	return trips, nil
}

//UpdateTrip 根据输入更新数据
func (m *Mongo) UpdateTrip(c context.Context, tripid id.TripID, accountid id.AccountID, updatedAt int64, trip *rentalpb.Trip) error {
	ojbid, err := objid.FromID(tripid)
	if err != nil {
		//fmt.Errorf("类型转换失败: %v", err)
		return err
	}
	//筛选器
	newUpdateAt := mgo.UpdatedAt()

	filter := bson.M{
		mgo.IDFieldName:        ojbid,
		accountIDField:         accountid.String(),
		mgo.UpdatedAtFieldName: updatedAt,
	}
	//更改数据
	change := mgo.Set(bson.M{
		tripField:              trip,
		mgo.UpdatedAtFieldName: newUpdateAt,
	})

	res, err := m.col.UpdateOne(c, filter, change)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return mongo.ErrNoDocuments
	}

	return nil
}

// UpdateTrip updates a trip.
func (m *Mongo) UpdateTriptest(c context.Context, tid id.TripID, aid id.AccountID, updatedAt int64, trip *rentalpb.Trip) error {
	objID, err := objid.FromID(tid)
	if err != nil {
		return fmt.Errorf("invalid id: %v", err)
	}

	newUpdatedAt := mgo.UpdatedAt()
	res, err := m.col.UpdateOne(c, bson.M{
		mgo.IDFieldName:        objID,
		accountIDField:         aid.String(),
		mgo.UpdatedAtFieldName: updatedAt,
	}, mgo.Set(bson.M{
		tripField:              trip,
		mgo.UpdatedAtFieldName: newUpdatedAt,
	}))
	if err != nil {
		return err
	}

	if res.MatchedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}

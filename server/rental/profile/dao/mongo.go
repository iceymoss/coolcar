package dao

import (
	"context"
	"fmt"

	rentalpb "coolcar/rental/api/gen/v1"
	"coolcar/shared/id"
	mgo "coolcar/shared/mongo"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	accountIDField      = "accountid"
	profileField        = "profile"
	identityStatusField = profileField + ".identitystatus"
	photoblobIDField    = "photoblobid"
)

type Mongo struct {
	col *mongo.Collection
}

//构造函数
func NewMongo(db *mongo.Database) *Mongo {
	return &Mongo{
		col: db.Collection("profile"),
	}
}

//ProfileRecord定义profile在数据库中的解码方式
type ProfileRecord struct {
	AccountID   string            `bson:"accountid"`
	Profile     *rentalpb.Profile `bson:"profile"`
	PhotoBlobID string            `bson:"photoblobid"`
}

//获取身份信息
func (m *Mongo) GetProfile(c context.Context, aid id.AccountID) (*ProfileRecord, error) {
	filter := bson.M{
		accountIDField: aid.String(),
	}
	res := m.col.FindOne(c, filter)
	//如果文档为空
	if err := res.Err(); err != nil {
		return nil, err
	}
	//对res进行解码
	var pr ProfileRecord
	err := res.Decode(&pr)
	if err != nil {
		return nil, fmt.Errorf("解码失败: %v", err)
	}
	return &pr, nil
}

//更新身份信息
func (m *Mongo) UpdateProfile(c context.Context, aid id.AccountID, prevState rentalpb.IdentityStatus, p *rentalpb.Profile) error {
	filter := bson.M{
		identityStatusField: prevState,
	}
	if prevState == rentalpb.IdentityStatus_UNSUBMITTED {
		filter = mgo.ZeroOrDoesNotExist(identityStatusField, prevState)

	}

	filter[accountIDField] = aid.String()

	change := mgo.Set(bson.M{
		accountIDField: aid.String(),
		profileField:   p,
	})
	_, err := m.col.UpdateOne(c, filter, change,
		options.Update().SetUpsert(true))
	if err != nil {
		return fmt.Errorf("更新失败:%v", err)
	}
	return nil
}

//UpdateProfilePhoto 更新个人资料照片和blob id。
func (m *Mongo) UpdateProfilePhoto(c context.Context, aid id.AccountID, bid id.BlobID) error {
	filter := bson.M{
		accountIDField: aid.String(),
	}
	change := mgo.Set(bson.M{
		accountIDField:   aid.String(),
		photoblobIDField: bid.String(),
	})
	_, err := m.col.UpdateOne(c, filter, change,
		options.Update().SetUpsert(true))
	if err != nil {
		return fmt.Errorf("更新失败:%v", err)
	}
	return err
}

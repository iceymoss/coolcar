package dao

import (
	"context"
	"fmt"

	"coolcar/shared/id"
	mgo "coolcar/shared/mongo"
	"coolcar/shared/mongo/objid"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Mongo struct {
	col *mongo.Collection
}

//构造函数
func NewMongo(db *mongo.Database) *Mongo {
	return &Mongo{
		col: db.Collection("blob"),
	}
}

type BlobRecord struct {
	mgo.IDField `bson:"inline"`
	AccountID   string `bson:"accountid"`
	Path        string `bson:"path"`
}

//CreateBlob创建一个blod记录
func (m *Mongo) CreateBlob(c context.Context, aid id.AccountID) (*BlobRecord, error) {
	br := &BlobRecord{
		AccountID: aid.String(),
	}
	objID := mgo.NewObjID()
	br.ID = objID
	br.Path = fmt.Sprintf("%s/%s", aid, objID.Hex())
	fmt.Printf("MYRUL:%s\n", br.Path)

	_, err := m.col.InsertOne(c, br)
	if err != nil {
		return nil, err
	}
	return br, nil
}

//获取blobID
func (m *Mongo) GetBlob(c context.Context, bid id.BlobID) (*BlobRecord, error) {
	objID, err := objid.FromID(bid)
	if err != nil {
		return nil, fmt.Errorf("失效的objid id: %v", err)
	}
	filter := bson.M{
		mgo.IDFieldName: objID,
	}
	res := m.col.FindOne(c, filter)

	if err = res.Err(); err != nil {
		return nil, err
	}
	var br BlobRecord
	err = res.Decode(&br)
	if err != nil {
		return nil, fmt.Errorf("解码失败: %v", err)
	}
	return &br, nil
}

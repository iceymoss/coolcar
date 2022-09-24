package dao

import (
	"context"
	"fmt"

	"coolcar/shared/id"
	mgo "coolcar/shared/mongo"
	"coolcar/shared/mongo/objid"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const openidfield = "open_id"

//定义一个 Mongo 类型
type Mongo struct {
	col *mongo.Collection
}

//初始化数据库， 类似构造函数
func NewMongo(db *mongo.Database) *Mongo {
	return &Mongo{
		col: db.Collection("account"),
	}
}

//将openID存入数据库，返回对应_id给用户
func (m *Mongo) ResolveAccountID(c context.Context, openID string) (id.AccountID, error) {
	//先生成一个primitive.ObjectID类型作为文档索引
	insertedID := mgo.NewObjID()
	//然后再去查找openID，如果查到原来的openID,没有则插入我们固定的insertedID,然后将对应_id返回出来
	res := m.col.FindOneAndUpdate(c, bson.M{
		openidfield: openID,
	}, mgo.SetInsert(bson.M{
		mgo.IDFieldName: insertedID,
		openidfield:     openID,
	}), options.FindOneAndUpdate().SetUpsert(true).
		SetReturnDocument(options.After))
	//检测是否返回成功
	if err := res.Err(); err != nil {
		return "", fmt.Errorf("cannot findOneAndUpdate: %v", err)
	}
	var row mgo.IDField
	//解码
	err := res.Decode(&row)
	if err != nil {
		return "", fmt.Errorf("cannot Decode result: %v", err)
	}
	return objid.ToAccountID(row.ID), nil
}

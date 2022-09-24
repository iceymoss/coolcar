package mgo

import (
	"fmt"
	"time"

	"coolcar/shared/mongo/objid"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	IDFieldName        = "_id"
	UpdatedAtFieldName = "updatedat"
)

//ObjID defines the object field
type IDField struct {
	ID primitive.ObjectID `bson:"_id"`
}

//UpdatedAtField 定义一个时间筛选器
type UpdatedAtField struct {
	UpdatedAt int64 `bson:"updatedat"`
}

//NewObjectID 生成一个object id , NewObjID是一个函数
var NewObjID = primitive.NewObjectID

//NewObjIDWithValue 生成id 为下一个NewObjID，对id进一步包装，
func NewObjIDWithValue(id fmt.Stringer) {
	NewObjID = func() primitive.ObjectID {
		return objid.MustFromID(id)
	}
}

//Updateda 返回一个合适的值，你赋值给它
var UpdatedAt = func() int64 {
	return time.Now().UnixNano() //当前时间取纳秒
}

//Set return a $set updata document
func Set(V interface{}) bson.M {
	return bson.M{
		"$set": V,
	}
}

func SetInsert(V interface{}) bson.M {
	return bson.M{
		"$setOnInsert": V,
	}
}

//ZeroOrDoesNotExist是一个生成筛选器的表达式去筛选zero或者不存在的值
func ZeroOrDoesNotExist(field string, zero interface{}) bson.M {
	return bson.M{
		"$or": []bson.M{
			{
				field: zero,
			},
			{
				field: bson.M{
					"$exists": false,
				},
			},
		},
	}
}

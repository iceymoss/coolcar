package main

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

//查找数据
func findRows(c context.Context, col *mongo.Collection) {
	cur, err := col.Find(c, bson.M{})
	if err != nil {
		panic(err)
	}
	for cur.Next(c) {
		var row struct {
			ID   primitive.ObjectID `bson:"_id"`
			NAME string             `bson:"name"`
		}
		err := cur.Decode(&row)
		if err != nil {
			panic(err)
		}
		fmt.Printf("%+v\n", row)
	}
}

//向数据库写入数据
func insertRows(c context.Context, col *mongo.Collection) {
	res, err := col.InsertMany(c, []interface{}{ //向数据库中写入数据
		bson.M{
			"open_id": "001",
		},
		bson.M{
			"open_id": "002",
		},
		bson.M{
			"open_id": "003",
		},
	})
	if err != nil {
		panic(err)
	}
	fmt.Printf("%+v\n", res)
}

func resolveFindOesAndUpdate(c context.Context, m *mongo.Collection, name string) {
	mc := m.FindOneAndUpdate(c, bson.M{
		"name": name, //筛选字段
	}, bson.M{
		"$set": bson.M{ //创建字段
			"name": name,
		},
	}, options.FindOneAndUpdate().
		SetUpsert(true).
		SetReturnDocument(options.After))

	if err := mc.Err(); err != nil {
		log.Fatal("更新失败:", err)
	}

	//解码格式
	var row struct {
		ID   primitive.ObjectID `bson:"_id"`
		NAME string             `bson:"name"`
		FROM string             `bson:"from"`
	}
	err := mc.Decode(&row)
	if err != nil {
		log.Fatal("解码失败:", err)
	}
	fmt.Printf("row:%v\n", row)
}

func main() {
	c := context.Background()
	//连接MongoDB端口
	mc, err := mongo.Connect(c, options.Client().ApplyURI("mongodb://localhost:27017/coolcar"))
	if err != nil {
		panic(err)
	}
	//连入MongoDB中的数据库coolcar中的集合account
	col := mc.Database("coolcar").Collection("my_db")
	resolveFindOesAndUpdate(c, col, "杨旷第12号")
}

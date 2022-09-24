package mongolearn

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

//连接MongoDB端口
func Database() *mongo.Database {
	// opt := options.Client().ApplyURI("mongodb://localhost:27017")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err.Error())
	}
	return client.Database("SomeDatabase")
}

// CreateIndex - creates an index for a specific field in a collection
func CreateIndex(collectionName string, field string, unique bool) bool {

	// 1. Lets define the keys for the index we want to create
	// 1. 让我们定义我们要创建的索引的键
	mod := mongo.IndexModel{
		Keys:    bson.M{field: 1}, // 升序索引 1, 或降序索引 -1
		Options: options.Index().SetUnique(unique),
	}

	// 2. Create the context for this operation
	// 2. 为此操作创建上下文
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 3. Connect to the database and access the collection
	// 3.连接数据库并访问集合
	collection := Database().Collection(collectionName)

	// 4. Create a single index
	// 4.创建单个索引
	_, err := collection.Indexes().CreateOne(ctx, mod)
	if err != nil {
		// 5. Something went wrong, we log it and return false
		// 5. 出错了，我们记录它并返回 false
		fmt.Println(err.Error())
		return false
	}

	// 6. All went well, we return true
	// 6. 一切顺利，我们返回 true
	return true
}

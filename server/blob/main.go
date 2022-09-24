package main

import (
	"context"
	"log"

	blobpb "coolcar/blob/api/gen/v1"
	"coolcar/blob/blob"
	"coolcar/blob/blob/cos"
	"coolcar/blob/blob/dao"
	"coolcar/shared/server"

	"github.com/namsral/flag"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

var addr = flag.String("addr", ":8083", "address to listen")
var mongoURI = flag.String("mongo_uri", "mongodb://localhost:27017", "mongo url")
var cosAddr = flag.String("cos_addr", "https://your tencent aountID for cos.com", "cos address")
var cosID = flag.String("cos_sec_id", "your cosID", "cos secret id")
var coskey = flag.String("cos_sec_key", "your coskey", "cos secret key")

func main() {

	flag.Parse()

	//使用zap包，打印日志
	logger, err := zap.NewDevelopment()
	if err != nil {
		log.Fatalf("cannot creat logger: %v", err)
	}

	//连接Mongo数据库
	c := context.Background()
	mongoClient, err := mongo.Connect(c, options.Client().ApplyURI(*mongoURI))
	if err != nil {
		logger.Fatal("不能连接Mongo数据库: %v", zap.Error(err))
	}

	str, err := cos.NewService(*cosAddr, *cosID, *coskey)
	if err != nil {
		logger.Fatal("不能构造cos service:%v", zap.Error(err))
	}
	db := mongoClient.Database("coolcar")
	server.RunGRPCServer(&server.GRPCConfig{
		Name:   "blob",
		Addr:   *addr,
		Logger: logger,
		RegisterFunc: func(s *grpc.Server) {
			blobpb.RegisterBlobServiceServer(s, &blob.Service{
				Storage: str,
				Mongo:   dao.NewMongo(db),
				Logger:  logger,
			})
		},
	})

}

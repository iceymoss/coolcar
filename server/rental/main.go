package main

import (
	"context"
	"log"
	"time"

	blobpb "coolcar/blob/api/gen/v1"
	carpb "coolcar/car/api/gen/v1"
	"coolcar/rental/ai"
	rentalpb "coolcar/rental/api/gen/v1"
	"coolcar/rental/profile"
	profiledao "coolcar/rental/profile/dao"
	"coolcar/rental/trip"
	"coolcar/rental/trip/client/car"
	"coolcar/rental/trip/client/poi"
	profClient "coolcar/rental/trip/client/profile"
	tripdao "coolcar/rental/trip/dao"
	coolenvpb "coolcar/shared/coolenv"
	"coolcar/shared/server"

	"github.com/namsral/flag"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

var addr = flag.String("addr", ":8082", "address to listen")
var authPublicKeyFile = flag.String("auth_public_key_file", "../shared/auth/public.key", "public file key")
var mongoURI = flag.String("mongo_uri", "mongodb://localhost:27017", "mongo uri")
var aiAddr = flag.String("ai_addr", "localhost:18001", "address for ai service")
var blobAddr = flag.String("blob_addr", "localhost:8083", "address for blob service")
var carAddr = flag.String("car_addr", "localhost:8084", "address for car service")

func main() {

	flag.Parse()

	//使用zap包，打印日志
	logger, err := zap.NewDevelopment()
	if err != nil {
		log.Fatalf("cannot creat logger: %v", err)
	}

	//连接Mongo数据库端口
	c := context.Background()
	mongoClient, err := mongo.Connect(c, options.Client().ApplyURI(*mongoURI))
	if err != nil {
		logger.Fatal("不能连接Mongo数据库: %v", zap.Error(err))
	}
	db := mongoClient.Database("coolcar")

	//连接DistanceServerAPI端口
	conn, err := grpc.Dial(*aiAddr, grpc.WithInsecure())
	if err != nil {
		logger.Fatal("不能连接distanceServerAPI: %v", zap.Error(err))
	}

	//连接8083端口
	blobConn, err := grpc.Dial(*blobAddr, grpc.WithInsecure())
	if err != nil {
		logger.Fatal("不能连接blob service: %v", zap.Error(err))
	}

	//连接8084端口
	carConn, err := grpc.Dial(*carAddr, grpc.WithInsecure())
	if err != nil {
		logger.Fatal("cannot connect car service", zap.Error(err))
	}

	acli := coolenvpb.NewAIServiceClient(conn)

	profileSer := &profile.Service{
		BlobClient:           blobpb.NewBlobServiceClient(blobConn),
		PhotoGetExprie:       3 * time.Second,
		PhotoGetUploadExprie: 10 * time.Minute,
		Mongo:                profiledao.NewMongo(db),
		Logger:               logger,
	}

	logger.Sugar().Fatal(server.RunGRPCServer(&server.GRPCConfig{
		Name:              "rental",
		Addr:              *addr,
		AuthPublicKeyFile: *authPublicKeyFile,
		Logger:            logger,
		RegisterFunc: func(s *grpc.Server) {
			rentalpb.RegisterTripServiceServer(s, &trip.Service{ //注册服务
				Logger: logger,
				ProfileManager: &profClient.Manager{
					Fetcher: profileSer,
				},
				CarManger: &car.Manager{
					CarService: carpb.NewCarServiceClient(carConn),
				},
				POIManager: &poi.Manager{},
				DistanceCalc: &ai.Client{
					AIClient: acli,
				},
				Mongo: tripdao.NewMongo(db),
			})

			rentalpb.RegisterProfileServiceServer(s, profileSer)

		},
	}))

}

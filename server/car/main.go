package main

import (
	"context"
	"coolcar/car/amqpclt"
	carpb "coolcar/car/api/gen/v1"
	"coolcar/car/car"
	"coolcar/car/dao"
	"coolcar/car/sim"
	"coolcar/car/sim/pos"
	"coolcar/car/trip"
	"coolcar/car/ws"
	rentalpb "coolcar/rental/api/gen/v1"
	coolenvpb "coolcar/shared/coolenv"
	"coolcar/shared/server"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/namsral/flag"
	"github.com/streadway/amqp"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

var addr = flag.String("addr", ":8084", "address to listen")
var tripAddr = flag.String("trip_addr", "localhost:8082", "address for trip service")
var wsAddr = flag.String("ws_addr", ":9090", "websocket address to listen")
var aiAddr = flag.String("ai_addr", "localhost:18001", "address for ai service")
var carAddr = flag.String("car_addr", "localhost:8084", "address for car service")
var amqpURI = flag.String("amqp_uri", "amqp://guest:guest@localhost:5672/", "amqp url")
var mongoURI = flag.String("mongo_uri", "mongodb://localhost:27017", "mongo url")

func main() {

	flag.Parse()

	//创建日志
	logger, err := zap.NewDevelopment()
	if err != nil {
		log.Fatalf("cannot creat logger: %v", err)
	}
	fmt.Println("addr at:", *addr)
	fmt.Println("trip_addr at:", *tripAddr)
	fmt.Println("ws_addr at:", *wsAddr)
	fmt.Println("ai_addr at:", *aiAddr)
	fmt.Println("car_addr at:", *carAddr)
	fmt.Println("amqp_uri:", *amqpURI)
	fmt.Println("mongo_uri:", *mongoURI)

	//连接数据库
	c := context.Background()
	client, err := mongo.Connect(c, options.Client().ApplyURI(*mongoURI))
	if err != nil {
		logger.Fatal("cannot connect MongoClient: %v", zap.Error(err))
	}

	//建立连接amqp
	amqpConn, err := amqp.Dial(*amqpURI)
	if err != nil {
		logger.Fatal("cannot connot amqpClient: %v", zap.Error(err))
	}

	exchange := "coolcar"
	//create publisher
	pub, err := amqpclt.NewPublisher(amqpConn, exchange)
	if err != nil {
		logger.Fatal("cannot create publisher: %v", zap.Error(err))
	}

	//连接自己
	carConn, err := grpc.Dial(*carAddr, grpc.WithInsecure())
	if err != nil {
		logger.Error("cannot connot localhost:8084", zap.Error(err))
	}

	//连接ai服务
	aiConn, err := grpc.Dial(*aiAddr, grpc.WithInsecure())
	if err != nil {
		logger.Error("cannot connot localhost:18001 for ai service", zap.Error(err))
	}

	sub, err := amqpclt.NewSubscriber(amqpConn, exchange, logger)
	if err != nil {
		logger.Fatal("cannot create subscriber", zap.Error(err))
	}

	//车辆实时位置更新服务
	posSum, err := amqpclt.NewSubscriber(amqpConn, "pos_sim", logger)
	if err != nil {
		logger.Fatal("cannot create posSubscribe: %v", zap.Error(err))
	}

	//实例化Controller的对象
	simController := &sim.Controller{
		CarService:    carpb.NewCarServiceClient(carConn),
		AIService:     coolenvpb.NewAIServiceClient(aiConn),
		CarSubscriber: sub,
		Logger:        logger,
		PosSubscriber: &pos.Subscriber{
			Sub:    posSum,
			Logger: logger,
		},
	}

	//绑定车辆
	go simController.RunSimulations(context.Background())

	u := &websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	http.HandleFunc("/ws", ws.Handler(u, sub, logger))

	go func() {
		addr := *wsAddr
		logger.Info("HTTP start", zap.String("addr:", addr))
		log.Fatal(http.ListenAndServe(addr, nil))
	}()

	//连接trip service
	tripConn, err := grpc.Dial(*tripAddr, grpc.WithInsecure())
	if err != nil {
		logger.Fatal("cannot connect trip service", zap.Error(err))
	}
	go trip.RunUpdater(sub, rentalpb.NewTripServiceClient(tripConn), logger)

	//开启carservice端口
	server.RunGRPCServer(&server.GRPCConfig{
		Name:   "car",
		Addr:   *addr,
		Logger: logger,
		RegisterFunc: func(s *grpc.Server) {
			carpb.RegisterCarServiceServer(s, &car.Service{
				Mongo:     dao.NewMongo(client.Database("coolcar")),
				Logger:    logger,
				Publisher: pub,
			},
			)
		},
	})
}

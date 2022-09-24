package main

import (
	"context"
	"coolcar/car/amqpclt"
	coolenvpb "coolcar/shared/coolenv"
	"coolcar/shared/server"
	"fmt"
	"time"

	"github.com/streadway/amqp"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

func main() {
	// conn, err := grpc.Dial("localhost:18001", grpc.WithInsecure)
	// if err != nil {
	// 	panic(err)
	// }

	//连接ai服务
	conn, err := grpc.Dial("localhost:18001", grpc.WithInsecure())
	if err != nil {
		panic(err)
	}

	//调用客户端
	ac := coolenvpb.NewAIServiceClient(conn)
	c := context.Background()

	//距离计算
	res, err := ac.MeasureDistance(c, &coolenvpb.MeasureDistanceRequest{
		From: &coolenvpb.Location{
			Latitude:  32.5,
			Longitude: 120.9,
		},
		To: &coolenvpb.Location{
			Latitude:  31.11,
			Longitude: 103,
		},
	})
	if err != nil {
		panic(err)
	}

	fmt.Printf("距离:%+v\n", res)

	//驾驶身份认证
	iden, err := ac.LicIdentity(c, &coolenvpb.IdentityRequest{
		Photo: []byte{32, 34, 100, 5, 123},
	})
	if err != nil {
		panic(err)
	}
	fmt.Printf("test: %+v", iden)

	//位置更新
	_, err = ac.SimulateCarPos(c, &coolenvpb.SimulateCarPosRequest{
		CarId: "奔驰",
		Type:  coolenvpb.PosType_NINGBO,
		InitialPos: &coolenvpb.Location{
			Latitude:  120,
			Longitude: 30,
		},
	})
	if err != nil {
		panic(err)
	}

	logger, err := server.NewZapLogger()
	if err != nil {
		panic(err)
	}

	//建立连接amqp
	ampqconn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		logger.Fatal("cannot connot amqpClient: %v", zap.Error(err))
	}

	sub, err := amqpclt.NewSubscriber(ampqconn, "pos_sim", logger)
	if err != nil {
		panic(err)
	}

	ch, clearUp, err := sub.SubscribeRaw(c)
	if err != nil {
		panic(err)
	}
	defer clearUp()
	time := time.After(10 * time.Second)
	for {
		close := false
		select {
		case msgs := <-ch:
			fmt.Printf("position: %+s\n", msgs.Body)
		case <-time:
			close = true
		}
		if close {
			break
		}
	}

	_, err = ac.EndSimulateCarPos(c, &coolenvpb.EndSimulateCarPosRequest{
		CarId: "奔驰",
	})
	if err != nil {
		panic(err)
	}

}

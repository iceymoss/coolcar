package main

import (
	"context"
	carpb "coolcar/car/api/gen/v1"
	"fmt"

	"google.golang.org/grpc"
)

func main() {
	conn, err := grpc.Dial("localhost:8084", grpc.WithInsecure())
	if err != nil {
		panic(err)
	}
	client := carpb.NewCarServiceClient(conn)
	c := context.Background()
	for i := 0; i < 3; i++ {
		client.CreateCar(c, &carpb.CreateCarRequest{})
	}

	res, err := client.GetCars(c, &carpb.GetCarsRequest{})
	if err != nil {
		fmt.Errorf("拿不到: %v", err)
	}
	fmt.Println(res)
}

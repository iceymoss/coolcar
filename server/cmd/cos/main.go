package main

import (
	"context"
	"fmt"

	blobpb "coolcar/blob/api/gen/v1"

	"google.golang.org/grpc"
)

func main() {
	conn, err := grpc.Dial("localhost:8083", grpc.WithInsecure())
	if err != nil {
		panic(err)
	}

	c := blobpb.NewBlobServiceClient(conn)

	ctx := context.Background()

	res, err := c.CreateBlob(ctx, &blobpb.CreateBlobRequest{
		Account:             "ice_moss",
		UploadUrlTimeoutSec: 1000,
	})
	if err != nil {
		panic(err)
	}

	fmt.Print(res.UploadUrl)
	fmt.Printf("结果: %+v", res)

}

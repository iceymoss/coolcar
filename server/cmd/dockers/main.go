package main

import (
	"context"
	"fmt"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
)

func main() {

	c, err := client.NewClientWithOpts()
	if err != nil {
		panic(err)
	}

	ctx := context.Background()
	//开启docker service端口，端口始终是27017，27017端口映射到Host端口
	resp, err := c.ContainerCreate(ctx, &container.Config{
		Image: "mongo:4.4",
		ExposedPorts: nat.PortSet{
			"27017/tcp": {},
		},
	}, &container.HostConfig{
		PortBindings: nat.PortMap{
			"27017/tcp": []nat.PortBinding{
				{
					HostIP:   "127.0.0.1",
					HostPort: "0", //0，系统分配端口
				},
			},
		},
	}, nil, nil, "")
	if err != nil {
		panic(err)
	}
	//开启docker service
	err = c.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{})
	if err != nil {
		panic(err)
	}
	inspRes, err := c.ContainerInspect(ctx, resp.ID)
	if err != nil {
		panic(err)
	}
	fmt.Printf("listen: %+v\n", inspRes.NetworkSettings.Ports["27017/tcp"][0])
	fmt.Println("conainer staert")
	time.Sleep(5 * time.Second)
	fmt.Println("container kill")
	//kill docker service
	err = c.ContainerRemove(ctx, resp.ID, types.ContainerRemoveOptions{
		Force: true,
	})
	if err != nil {
		panic(err)
	}
}

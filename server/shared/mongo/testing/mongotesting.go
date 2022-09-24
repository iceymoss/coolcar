package mongotesting

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

//使用docker开启一个MongoDB的service，在规定的时间后 kill service
const (
	image        = "mongo:4.4"
	conainerPort = "27017/tcp"
)

const defaultMongoURL = "mongodb://locahost:27017"

var mongoURL string

//使用docker开启一个MongoDB的service，=>kill service
func RunWithMongoInDocker(m *testing.M) int {
	c, err := client.NewClientWithOpts()
	if err != nil {
		panic(err)
	}

	ctx := context.Background()
	//开启docker service端口，端口始终是27017，27017端口映射到Host端口
	resp, err := c.ContainerCreate(ctx, &container.Config{
		Image: image,
		ExposedPorts: nat.PortSet{
			conainerPort: {},
		},
	}, &container.HostConfig{
		PortBindings: nat.PortMap{
			conainerPort: []nat.PortBinding{
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
	//kill docker service
	containerID := resp.ID
	defer func() {
		fmt.Println("container kill")
		err := c.ContainerRemove(ctx, containerID, types.ContainerRemoveOptions{
			Force: true,
		})
		if err != nil {
			panic(err)
		}
	}()
	//开启docker service
	fmt.Println("conainer start")
	err = c.ContainerStart(ctx, containerID, types.ContainerStartOptions{})
	if err != nil {
		panic(err)
	}
	inspRes, err := c.ContainerInspect(ctx, containerID)
	if err != nil {
		panic(err)
	}

	fmt.Printf("listen: %+v\n", inspRes.NetworkSettings.Ports[conainerPort][0])

	time.Sleep(5 * time.Second)

	honstPort := inspRes.NetworkSettings.Ports[conainerPort][0]
	mongoURL = fmt.Sprintf("mongodb://%s:%s", honstPort.HostIP, honstPort.HostPort)

	return m.Run()
}

//NewClient创建一个Mongo Client 去连接mongodb localhonstd端口
func NewClient(c context.Context) (*mongo.Client, error) {
	if mongoURL == "" {
		return nil, fmt.Errorf("mongo url 没有设置, 请前往RunWithMongoInDocker中设置")
	}
	return mongo.Connect(c, options.Client().ApplyURI(mongoURL))
}

// NewDefaultClient 创建一个Mongo Client 去连接mongodb localhonstd端口
func NewDefaultClient(c context.Context) (*mongo.Client, error) {
	return mongo.Connect(c, options.Client().ApplyURI(defaultMongoURL))
}

//SetupIndex 为给定的数据库设置索引
func SetupIndex(c context.Context, d *mongo.Database) error {
	//auth数据库
	_, err := d.Collection("auth").Indexes().CreateOne(c, mongo.IndexModel{
		Keys: bson.D{
			{Key: "open_id", Value: 1},
		},
		Options: options.Index().SetUnique(true),
	})

	if err != nil {
		return err
	}

	//trip数据库
	_, err = d.Collection("trip").Indexes().CreateOne(c, mongo.IndexModel{
		Keys: bson.D{
			{Key: "trip.accountid", Value: 1},
			{Key: "trip.status", Value: 1},
		},
		Options: options.Index().SetUnique(true).SetPartialFilterExpression(
			bson.M{
				"trip.satus": 1,
			}),
	})
	if err != nil {
		return err
	}

	//profile数据库
	_, err = d.Collection("profile").Indexes().CreateOne(c, mongo.IndexModel{
		Keys: bson.D{
			{Key: "accountid", Value: 1},
		},
		Options: options.Index().SetUnique(true),
	})
	return err

}

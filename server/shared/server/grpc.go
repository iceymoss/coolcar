package server

import (
	"net"

	"coolcar/shared/auth"

	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/health"
	"google.golang.org/grpc/health/grpc_health_v1"
)

type GRPCConfig struct {
	Name              string
	Addr              string
	AuthPublicKeyFile string
	RegisterFunc      func(*grpc.Server)
	Logger            *zap.Logger
}

//server端，启动server
func RunGRPCServer(c *GRPCConfig) error {
	nameField := zap.String("name", c.Name)
	//tcp,监听Addr端口
	list, err := net.Listen("tcp", c.Addr)
	if err != nil {
		c.Logger.Fatal("不能监听:%v", nameField, zap.Error(err))
	}
	var opts []grpc.ServerOption
	if c.AuthPublicKeyFile != "" {
		in, err := auth.Interceptor(c.AuthPublicKeyFile)
		if err != nil {
			c.Logger.Fatal("不能创建拦截器intercept", nameField, zap.Error(err))
		}
		opts = append(opts, grpc.UnaryInterceptor(in))
	}
	s := grpc.NewServer(opts...)
	c.RegisterFunc(s)
	grpc_health_v1.RegisterHealthServer(s, health.NewServer())
	return s.Serve(list)

	// 	s := grpc.NewServer(opts...)       //创建s
	// 	rentalpb.RegisterTripServiceServer(s, &trip.Serivce{ //注册服务
	// 		Logger: logger,
	// 	})
	// 	err = s.Serve(list) //开启服务
	// 	logger.Fatal("connot sever", zap.Error(err))
}

package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"time"

	authpb "coolcar/auth/api/gen/v1"
	"coolcar/auth/auth"
	"coolcar/auth/dao"
	"coolcar/auth/token"
	"coolcar/auth/wechat"
	"coolcar/shared/server"

	"github.com/dgrijalva/jwt-go"
	"github.com/namsral/flag"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

var addr = flag.String("addr", ":8081", "address to listen")
var mongoURI = flag.String("mongo_uri", "mongodb://localhost:27017", "mongo url")
var privateKeyFile = flag.String("private_key_file", "../server/auth/private.key", "private key file")
var wechatAppId = flag.String("wechat_app_id", "your miniapp id", "wechat app id")
var wechatSecret = flag.String("wechat_app_secret", "your miniapp secrat", "wechat app secret")

//service端
func main() {

	flag.Parse()

	fmt.Println("mongo_url:", *mongoURI)

	//使用zap包，打印日志
	logger, err := zap.NewDevelopment()
	if err != nil {
		log.Fatalf("cannot creat logger: %v", err)
	}

	logger.Sugar().Info("addr at:", *addr)

	//连接Mongo数据库
	c := context.Background()
	mongoClient, err := mongo.Connect(c, options.Client().ApplyURI(*mongoURI))
	if err != nil {
		logger.Fatal("不能连接Mongo数据库: %v", zap.Error(err))
	}

	//打开读取文件
	pkfile, err := os.Open(*privateKeyFile)
	if err != nil {
		logger.Fatal("打开文件失败: %v", zap.Error(err))
	}
	pkByte, err := ioutil.ReadAll(pkfile)
	if err != nil {
		logger.Fatal("读取失败: %v", zap.Error(err))
	}
	privateKey, err := jwt.ParseRSAPrivateKeyFromPEM(pkByte)
	if err != nil {
		logger.Fatal("解析失败: %v", zap.Error(err))
	}

	logger.Sugar().Fatal(server.RunGRPCServer(&server.GRPCConfig{
		Name:   "auth",
		Addr:   *addr,
		Logger: logger,
		RegisterFunc: func(s *grpc.Server) {

			authpb.RegisterAuthServiceServer(s, &auth.Service{ //注册服务
				OpenIDResolver: &wechat.Service{
					AppId:     *wechatAppId,
					Appsecret: *wechatSecret,
				},
				Mongo:         dao.NewMongo((mongoClient.Database("coolcar"))),
				Logger:        logger,
				TokenExpire:   1 * time.Hour,
				TokenGenerate: token.NewJWTTokenGen("coolcar/auth", privateKey),
			})

		},
	}))
}

package auth

import (
	"fmt"
	"time"

	authpb "coolcar/auth/api/gen/v1"
	"coolcar/auth/dao"

	"go.uber.org/zap"
	"golang.org/x/net/context"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

//authService接口

// AuthServiceServer is the server API for AuthService service.
// type AuthServiceServer interface {
// 	Login(context.Context, *LoginRequest) (*LoginResponse, error)
// }

type Service struct {
	OpenIDResolver OpenIDResolver
	TokenGenerate  TokenGenerate
	TokenExpire    time.Duration
	Mongo          *dao.Mongo
	Logger         *zap.Logger
}

type OpenIDResolver interface {
	Resolve(code string) (string, error)
}

//生成token接口
type TokenGenerate interface {
	GeneratorToken(accountID string, expire time.Duration) (string, error)
}

//后台事件处理方法
func (s *Service) Login(c context.Context, req *authpb.LoginRequest) (*authpb.LoginResponse, error) {
	s.Logger.Info("received code",
		zap.String("code", req.Code))
	openID, err := s.OpenIDResolver.Resolve(req.Code)
	if err != nil {
		return nil, status.Errorf(codes.Unavailable, "获取不到openID")
	}
	//将openID存入数据库，返回对应_id
	accountID, err := s.Mongo.ResolveAccountID(c, openID)
	if err != nil {
		s.Logger.Error("不能解析到accountID", zap.Error(err))
		return nil, status.Error(codes.Internal, "")
	}
	//使用accountID生成token
	token, err := s.TokenGenerate.GeneratorToken(accountID.String(), s.TokenExpire)
	if err != nil {
		s.Logger.Error("不能生成token")
		return nil, status.Errorf(codes.Internal, "")
	}

	fmt.Printf("openID: %v", openID)
	return &authpb.LoginResponse{
		AccssToken: token,
		ExpiresIn:  int32(s.TokenExpire.Seconds()),
	}, nil
}

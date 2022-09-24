package auth

import (
	"context"
	"fmt"
	"io/ioutil"
	"os"
	"strings"

	"coolcar/shared/auth/token"
	"coolcar/shared/id"

	"github.com/dgrijalva/jwt-go"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

const (
	//ImpersonateAccountHeader为accountID定义了一个头部信息
	ImpersonateAccountHeader = "impersonate-account-id"
	authorizationHandle      = "authorization"
	BearerProfix             = "Bearer "
)

// Intercetor创建一个auth的拦截器
func Interceptor(publicKeyFile string) (grpc.UnaryServerInterceptor, error) {
	f, err := os.Open(publicKeyFile)
	if err != nil {
		return nil, fmt.Errorf("不能打开文件: %v", err)
	}

	rea, err := ioutil.ReadAll(f)
	if err != nil {
		return nil, fmt.Errorf("不能读取到文件: %v", f)
	}

	key, err := jwt.ParseRSAPublicKeyFromPEM(rea)
	if err != nil {
		return nil, fmt.Errorf("不能解析key: %v", err)
	}

	i := &interceptor{
		Verifier: &token.JWTTokenVerifier{
			PublicKey: key,
		},
	}

	return i.HandleReq, nil
}

//声明接口
type toekenVerifier interface {
	Verify(token string) (string, error)
}

type interceptor struct {
	Verifier toekenVerifier
}

//ctx请求，req请求内容， info帮助文档，handle接下来要做的
func (i *interceptor) HandleReq(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp interface{}, err error) {
	aid := impersonateFromContext(ctx)
	if aid != "" {
		fmt.Printf("impersonte: %q\n", aid)
		return handler(ContextWithAccountID(ctx, id.AccountID(aid)), req)
	}

	tkn, err := tokenFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "token已经过期: %v", err)
	}
	aid, err = i.Verifier.Verify(tkn)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "token已经过期: %v", err)
	}
	//把accountID放入ctx中

	fmt.Printf("HandleReq结束:\n")

	return handler(ContextWithAccountID(ctx, id.AccountID(aid)), req)
}

//impersonateFromContext将数据拿出，用于更新行程的token
func impersonateFromContext(c context.Context) string {
	m, ok := metadata.FromIncomingContext(c) //todo
	if !ok {
		return ""
	}

	imp := m[ImpersonateAccountHeader]
	if len(imp) == 0 {
		return ""
	}
	return imp[0]

}

//解析数据
func tokenFromContext(c context.Context) (string, error) {
	//使用 metadata.FromIncomingContext 方法进行读取,创建写入ctx的数据类似m
	m, ok := metadata.FromIncomingContext(c)
	if !ok {
		return "", status.Errorf(codes.Unauthenticated, "解析数据失败")
	}
	tkn := ""
	//将token分离出来
	for _, v := range m[authorizationHandle] {
		if strings.HasPrefix(v, BearerProfix) {
			tkn = v[len(BearerProfix):]
		}
	}
	if tkn == "" {
		return "", status.Errorf(codes.Unauthenticated, "tkn仍为空串")
	}
	return tkn, nil
}

type accountKeyID struct{}

//ContextWithAccountID将数据放入context中
func ContextWithAccountID(c context.Context, aid id.AccountID) context.Context {
	return context.WithValue(c, accountKeyID{}, aid)
}

//AccountIDWithContext将context中的数据aid拿出
func AccountIDFromContext(c context.Context) (id.AccountID, error) {
	v := c.Value(accountKeyID{})
	aid, ok := v.(id.AccountID)
	if !ok {
		return "", status.Errorf(codes.Unauthenticated, "不能获取aid")
	}
	return aid, nil
}

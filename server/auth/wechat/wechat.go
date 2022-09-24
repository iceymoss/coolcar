package wechat

import (
	"fmt"

	"github.com/medivhzhan/weapp/v2"
)

//Service is a wechat auth service
type Service struct {
	AppId     string
	Appsecret string
}

//将客户端上传的code，和小程序ID和秘钥上传至微信api换取openID
func (s *Service) Resolve(code string) (string, error) {
	resp, err := weapp.Login(s.AppId, s.Appsecret, code)
	if err != nil {
		return "", fmt.Errorf("weapp login: %v", err)
	}
	if err = resp.GetResponseError(); err != nil {
		return "", fmt.Errorf("weapp response error: %v", err)
	}
	return resp.OpenID, nil
}

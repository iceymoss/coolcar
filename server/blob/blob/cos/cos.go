package cos

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/tencentyun/cos-go-sdk-v5"
)

type Service struct {
	client *cos.Client
	secID  string
	secKey string
}

//NewService创建一个cos service
func NewService(addr, secID, secKey string) (*Service, error) {
	u, err := url.Parse(addr)
	if err != nil {
		return nil, fmt.Errorf("cannot parse addr:%v", err)
	}
	b := &cos.BaseURL{BucketURL: u}

	return &Service{
		client: cos.NewClient(b, &http.Client{
			Transport: &cos.AuthorizationTransport{
				SecretID:  secID,
				SecretKey: secKey,
			},
		}),
		secID:  secID,
		secKey: secKey,
	}, nil
}

//SignURL标记一个URL
func (s *Service) SignURL(c context.Context, method, Path string, timeout time.Duration) (string, error) {
	//GetPresignedURL get the object presigned to down or upload file by url
	//这里是将
	url, err := s.client.Object.GetPresignedURL(c, method, Path, s.secID, s.secKey, timeout, nil)
	if err != nil {
		return "", err
	}
	return url.String(), nil
}

//Get获取贮存目录
func (s *Service) Get(c context.Context, path string) (io.ReadCloser, error) {
	res, err := s.client.Object.Get(c, path, nil)
	var b io.ReadCloser
	if res != nil {
		b = res.Body
	}
	if err != nil {
		return b, err
	}
	if res.StatusCode >= 400 {
		return b, fmt.Errorf("got err response:%+v", res)
	}
	return b, nil

}

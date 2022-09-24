package blob

import (
	"context"
	"io"
	"io/ioutil"
	"net/http"
	"time"

	blobpb "coolcar/blob/api/gen/v1"
	"coolcar/blob/blob/dao"
	"coolcar/shared/id"

	"go.mongodb.org/mongo-driver/mongo"
	"go.uber.org/zap"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Storage interface {
	SignURL(c context.Context, method, Path string, timeout time.Duration) (string, error)
	Get(c context.Context, path string) (io.ReadCloser, error)
}

type Service struct {
	Storage Storage
	Mongo   *dao.Mongo
	Logger  *zap.Logger
}

// CreateBlob为用户创建blobID, 返回Id和URL，
func (s *Service) CreateBlob(c context.Context, req *blobpb.CreateBlobRequest) (*blobpb.CreateBlobResponse, error) {
	aid := id.AccountID(req.Account)
	br, err := s.Mongo.CreateBlob(c, aid)
	if err != nil {
		s.Logger.Error("不能创建blob: %v", zap.Error(err))
		return nil, status.Error(codes.Internal, "")
	}

	url, err := s.Storage.SignURL(c, http.MethodPut, br.Path, secToDuration(req.UploadUrlTimeoutSec))
	if err != nil {
		return nil, status.Errorf(codes.Aborted, "ccannot sign url:%v", err)
	}
	return &blobpb.CreateBlobResponse{
		Id:        br.ID.Hex(),
		UploadUrl: url,
	}, nil
}

//使用blobID，调取对应path,读出path的内容(从腾讯云返回出图片)返回出
func (s *Service) GetBlob(c context.Context, req *blobpb.GetBlobRequest) (*blobpb.GetBlobResponse, error) {
	bid := id.BlobID(req.Id)
	br, err := s.GetBlobRecord(c, bid)
	if err != nil {
		return nil, err
	}

	r, err := s.Storage.Get(c, br.Path)
	if r != nil {
		defer r.Close()
	}
	if err != nil {
		return nil, status.Errorf(codes.Aborted, "cannot get: %v", err)
	}

	bt, err := ioutil.ReadAll(r)
	if err != nil {
		return nil, status.Errorf(codes.Aborted, "cannot read from response: %v", err)
	}

	return &blobpb.GetBlobResponse{
		Data: bt,
	}, nil
}

//获取云端图片URL
func (s *Service) GetBlobURL(c context.Context, req *blobpb.GetBlobURLRequest) (*blobpb.GetBlobURLResponse, error) {
	bid := id.BlobID(req.Id)
	br, err := s.GetBlobRecord(c, bid)
	if err != nil {
		return nil, err
	}

	url, err := s.Storage.SignURL(c, http.MethodGet, br.Path, secToDuration(req.TimeoutSec))
	if err != nil {
		return nil, status.Errorf(codes.Aborted, "cannot sign url: %v", err)
	}
	return &blobpb.GetBlobURLResponse{
		Url: url,
	}, nil
}

//向数据库回去信息，再错误处理
func (s *Service) GetBlobRecord(c context.Context, bid id.BlobID) (*dao.BlobRecord, error) {
	br, err := s.Mongo.GetBlob(c, bid)
	if err == mongo.ErrNoDocuments {
		return nil, status.Error(codes.NotFound, "")
	}
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "")
	}

	return br, nil
}

//设置有效时间
func secToDuration(sec int32) time.Duration {
	return time.Duration(sec) * time.Second
}

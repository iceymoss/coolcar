package profile

import (
	"context"
	"fmt"
	"time"

	blobpb "coolcar/blob/api/gen/v1"
	rentalpb "coolcar/rental/api/gen/v1"
	"coolcar/rental/profile/dao"
	"coolcar/shared/auth"
	"coolcar/shared/id"

	"go.mongodb.org/mongo-driver/mongo"
	"go.uber.org/zap"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

//
type Service struct {
	BlobClient           blobpb.BlobServiceClient
	PhotoGetExprie       time.Duration
	PhotoGetUploadExprie time.Duration
	Mongo                *dao.Mongo
	Logger               *zap.Logger
}

//GetProfile为当前用户获取用户信息
func (s *Service) GetProfile(c context.Context, req *rentalpb.GetProfileRequest) (*rentalpb.Profile, error) {
	aid, err := auth.AccountIDFromContext(c)
	if err != nil {
		return nil, err
	}
	pr, err := s.Mongo.GetProfile(c, aid)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return &rentalpb.Profile{}, nil
		}
		s.Logger.Error("不能获取profile: %v", zap.Error(err))
		return nil, status.Error(codes.Internal, "")
	}
	if pr.Profile == nil {
		return &rentalpb.Profile{}, nil
	}
	return pr.Profile, nil
}

//SubmitProfile提交用户信息
func (s *Service) SubmitProfile(c context.Context, req *rentalpb.Identity) (*rentalpb.Profile, error) {
	aid, err := auth.AccountIDFromContext(c)
	if err != nil {
		return nil, err
	}
	p := &rentalpb.Profile{
		Identity:       req,
		IdentityStatus: rentalpb.IdentityStatus_PENDING,
	}

	err = s.Mongo.UpdateProfile(c, aid, rentalpb.IdentityStatus_UNSUBMITTED, p)
	if err != nil {
		s.Logger.Error("不能更新profile: %v", zap.Error(err))
		return nil, status.Error(codes.Internal, "")
	}

	//模拟后台审核
	go func() {
		time.Sleep(1 * time.Second)
		err := s.Mongo.UpdateProfile(context.Background(), aid, rentalpb.IdentityStatus_PENDING, &rentalpb.Profile{
			Identity:       req,
			IdentityStatus: rentalpb.IdentityStatus_VERIFIED,
		})
		if err != nil {
			s.Logger.Error("不能审核身份:%v", zap.Error(err))
		}
	}()

	return p, nil
}

//ClearProfile清理用户信息
func (s *Service) ClearProfile(c context.Context, req *rentalpb.ClearProfileRequest) (*rentalpb.Profile, error) {
	aid, err := auth.AccountIDFromContext(c)
	if err != nil {
		return nil, err
	}
	//将数据库清空，更新为空数据即可
	p := &rentalpb.Profile{}
	err = s.Mongo.UpdateProfile(c, aid, rentalpb.IdentityStatus_VERIFIED, p)
	if err != nil {
		s.Logger.Error("不能更新profile: %v", zap.Error(err))
		return nil, status.Error(codes.Internal, "")
	}

	return p, nil
}

//GetProfilePhoto获取身份验证照片URL
func (s *Service) GetProfilePhoto(c context.Context, req *rentalpb.GetProfilePhotoRequest) (*rentalpb.GetProfilePhotoResponse, error) {
	aid, err := auth.AccountIDFromContext(c)
	if err != nil {
		return nil, err
	}
	pr, err := s.Mongo.GetProfile(c, aid)
	if err != nil {
		return nil, status.Error(s.logAndConvertProfileErr(err), "")
	}

	if pr.PhotoBlobID == "" {
		return nil, status.Error(codes.NotFound, "")
	}

	br, err := s.BlobClient.GetBlobURL(c, &blobpb.GetBlobURLRequest{
		Id:         pr.PhotoBlobID,
		TimeoutSec: int32(s.PhotoGetExprie.Seconds()),
	})
	if err != nil {
		s.Logger.Error("cannot gots blob: %v", zap.Error(err))
		return nil, status.Error(codes.Internal, "")
	}

	return &rentalpb.GetProfilePhotoResponse{
		Url: br.Url,
	}, nil
}

//CreateProfilePhoto创建身份图片返回上传URL
func (s *Service) CreateProfilePhoto(c context.Context, req *rentalpb.CreateProfilePhotoRequest) (*rentalpb.CreateProfilePhotoResponse, error) {
	aid, err := auth.AccountIDFromContext(c)
	if err != nil {
		return nil, err
	}

	br, err := s.BlobClient.CreateBlob(c, &blobpb.CreateBlobRequest{
		Account:             aid.String(),
		UploadUrlTimeoutSec: int32(s.PhotoGetUploadExprie.Seconds()),
	})
	if err != nil {
		s.Logger.Error("cannot create blob: %v", zap.Error(err))
		return nil, status.Error(codes.Internal, "")
	}

	//将blodID存入数据库profile数据库
	err = s.Mongo.UpdateProfilePhoto(c, aid, id.BlobID(br.Id))
	if err != nil {
		s.Logger.Error("cannot update profile photo: %v", zap.Error(err))
		return nil, status.Error(codes.Aborted, "")
	}

	fmt.Printf("上传URL: %v", br.UploadUrl)
	return &rentalpb.CreateProfilePhotoResponse{
		UploadUrl: br.UploadUrl,
	}, nil
}

//CompleteProfilePhoto 完成上传头像，返回 AI 识别结果。
func (s *Service) CompleteProfilePhoto(c context.Context, req *rentalpb.CompleteProfilePhotoRequest) (*rentalpb.Identity, error) {
	aid, err := auth.AccountIDFromContext(c)
	if err != nil {
		return nil, err
	}

	pr, err := s.Mongo.GetProfile(c, aid)
	if err != nil {
		return nil, status.Error(s.logAndConvertProfileErr(err), "")
	}

	if pr.PhotoBlobID == "" {
		return nil, status.Error(codes.NotFound, "")
	}

	br, err := s.BlobClient.GetBlob(c, &blobpb.GetBlobRequest{
		Id: pr.PhotoBlobID,
	})
	if err != nil {
		s.Logger.Error("cannot gots blob: %v", zap.Error(err))
		return nil, status.Error(codes.Internal, "")
	}

	s.Logger.Info("got profile photo:%v", zap.Int("size: %v", len(br.Data)))
	//TODO 未接入ai识别
	return &rentalpb.Identity{
		LicNumber:       "8888888",
		Name:            "ice_moss",
		Gender:          0,
		BirthDataMillis: 20220409,
	}, nil
}

//ClearProfilePhoto清除身份验证图片
func (s *Service) ClearProfilePhoto(c context.Context, req *rentalpb.ClearProfilePhotoRequest) (*rentalpb.ClearProfilePhotoResponse, error) {
	aid, err := auth.AccountIDFromContext(c)
	if err != nil {
		return nil, err
	}
	blobId := id.BlobID("")
	err = s.Mongo.UpdateProfilePhoto(c, aid, blobId)
	if err != nil {
		return nil, status.Error(codes.Internal, "")
	}
	return &rentalpb.ClearProfilePhotoResponse{}, nil
}

//错误处理帮助
func (s *Service) logAndConvertProfileErr(err error) codes.Code {
	if err == mongo.ErrNoDocuments {
		return codes.NotFound
	}
	s.Logger.Error("cannot get profile", zap.Error(err))
	return codes.Internal
}

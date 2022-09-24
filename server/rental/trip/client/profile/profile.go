package profile

import (
	"context"
	"encoding/base64"
	"fmt"

	rentalpb "coolcar/rental/api/gen/v1"
	"coolcar/shared/id"

	"google.golang.org/protobuf/proto"
)

//Fetcher接口获取profile
type Fetcher interface {
	GetProfile(c context.Context, req *rentalpb.GetProfileRequest) (*rentalpb.Profile, error)
}

//对用户身份进行验证
type Manager struct {
	Fetcher Fetcher
}

//身份审核
func (m *Manager) Verify(c context.Context, aid id.AccountID) (id.IdentityID, error) {
	nilID := id.IdentityID("")
	p, err := m.Fetcher.GetProfile(c, &rentalpb.GetProfileRequest{})
	if err != nil {
		return nilID, fmt.Errorf("不能获取身份信息: %v", err)

	}
	//核心
	if p.IdentityStatus != rentalpb.IdentityStatus_VERIFIED {
		return nilID, fmt.Errorf("identity status invalid 身份状态已过期")
	}

	//追溯用户身份
	bt, err := proto.Marshal(p.Identity)
	if err != nil {
		return nilID, fmt.Errorf("cannot marshal identity: %v", err)
	}

	return id.IdentityID(base64.StdEncoding.EncodeToString(bt)), nil
}

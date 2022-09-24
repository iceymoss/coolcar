package poi

import (
	"context"
	rentalpb "coolcar/rental/api/gen/v1"
	"hash/fnv"

	"github.com/golang/protobuf/proto"
)

var poi = []string{
	"无锡",
	"苏州",
	"南京",
}

//将经纬度找出地名
type Manager struct {
}

func (p *Manager) Resolve(c context.Context, req *rentalpb.Location) (string, error) {
	//将req转换为[]byt
	bt, err := proto.Marshal(req)
	if err != nil {
		return "", err
	}
	//使用哈希随机算法
	h := fnv.New32()
	h.Write(bt)
	return poi[int(h.Sum32())%len(poi)], nil
}

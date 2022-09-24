package dao

import (
	"context"
	"coolcar/shared/id"
	mgo "coolcar/shared/mongo"
	"coolcar/shared/mongo/objid"
	mongotesting "coolcar/shared/mongo/testing"
	"log"
	"os"
	"testing"

	"go.mongodb.org/mongo-driver/bson"
)

var mongoURL string

func TestResolveAccountID(t *testing.T) {
	c := context.Background()
	//连接数据库端口
	mc, err := mongotesting.NewClient(c)
	if err != nil {
		t.Errorf("连接数据库失败: %v", err)
	}

	//连接coolcar
	m := NewMongo(mc.Database("my_db"))

	_, err = m.col.InsertMany(c, []interface{}{
		bson.M{
			mgo.IDFieldName: objid.MustFromID(id.AccountID("6232e859238127d00926c249")),
			openidfield:     "open_id1",
		}, bson.M{
			mgo.IDFieldName: objid.MustFromID(id.AccountID("6232e859238127d00926c250")),
			openidfield:     "open_id2",
		},
	})
	if err != nil {
		log.Fatalf("不能插入值: %v", err)
	}

	mgo.NewObjIDWithValue(id.AccountID("6232e859238127d00926c260"))

	//表格驱动测试
	cases := []struct {
		name   string
		openID string
		want   string
	}{
		{
			name:   "用户1",
			openID: "open_id1",
			want:   "6232e859238127d00926c249",
		},
		{
			name:   "用户2",
			openID: "open_id2",
			want:   "6232e859238127d00926c250",
		},
		{
			name:   "用户3",
			openID: "open_id3",
			want:   "6232e859238127d00926c260",
		},
	}

	for _, cc := range cases {
		t.Run(cc.name, func(t *testing.T) {
			id, err := m.ResolveAccountID(context.Background(), cc.openID)
			if err != nil {
				t.Errorf("flie resolve account id for %q, %q", cc.openID, err)
			}
			if id.String() != cc.want {
				t.Errorf("resolve account id: want:%q, got: %q", cc.want, id)
			}
		})
	}
}

func TestMain(m *testing.M) {
	os.Exit(mongotesting.RunWithMongoInDocker(m))
}

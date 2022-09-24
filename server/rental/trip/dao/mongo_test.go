package dao

import (
	"context"
	rentalpb "coolcar/rental/api/gen/v1"
	"coolcar/shared/id"
	mgo "coolcar/shared/mongo"
	"coolcar/shared/mongo/objid"
	mongotesting "coolcar/shared/mongo/testing"
	"fmt"
	"os"
	"testing"

	"github.com/google/go-cmp/cmp"
	"go.mongodb.org/mongo-driver/bson/primitive"

	//"go.mongodb.org/mongo-driver/mongo"
	//"go.mongodb.org/mongo-driver/mongo/options"
	"google.golang.org/protobuf/testing/protocmp"
)

var mongoURL string

func TestGreateTrip(t *testing.T) {
	mongoURL = "mongodb://localhost:27017"
	c := context.Background()
	//连接数据库端口
	mc, err := mongotesting.NewClient(c)
	if err != nil {
		t.Errorf("连接数据库失败: %v", err)
	}
	db := mc.Database("coolcar")
	err = mongotesting.SetupIndex(c, db)
	if err != nil {
		t.Fatalf("不能设置index: %v", err)
	}
	//连接coolcar
	m := NewMongo(db)

	cases := []struct {
		name       string
		tripID     string
		accountID  string
		tripstatus rentalpb.TripStatus
		wantErr    bool
	}{
		{
			name:       "第一完成行程",
			tripID:     "624167f82c034875487f6178",
			accountID:  "account1",
			tripstatus: rentalpb.TripStatus_FINISHED,
		},
		{
			name:       "第二完成行程",
			tripID:     "623eed47978701a74d8c2db9",
			accountID:  "account1",
			tripstatus: rentalpb.TripStatus_FINISHED,
		},
		{
			name:       "第一进行行程",
			tripID:     "623eed47978701a74d8c2db0",
			accountID:  "account1",
			tripstatus: rentalpb.TripStatus_IN_PROGRESS,
		},
		{
			name:       "第二进行行程",
			tripID:     "623eed47978701a74d8c2d11",
			accountID:  "account1",
			tripstatus: rentalpb.TripStatus_IN_PROGRESS,
			wantErr:    true,
		},
		{
			name:       "另外进行行程",
			tripID:     "623eed47978701a74d8c2db2",
			accountID:  "account2",
			tripstatus: rentalpb.TripStatus_IN_PROGRESS,
		},
	}
	for _, cc := range cases {

		mgo.NewObjIDWithValue(id.TripID(cc.tripID))

		tr, err := m.CreateTrip(c, &rentalpb.Trip{
			AccountId: cc.accountID,
			Status:    cc.tripstatus,
		})
		if cc.wantErr {
			if err != nil {
				t.Errorf("%s, error 预期; got none", cc.name)
			}
			continue
		}
		if err != nil {
			t.Errorf("%s, 创建行程失败: %v", cc.name, err)
			continue
		}
		if tr.ID.Hex() != cc.tripID {
			t.Errorf("%s, 不正确的Trip id; want: %q; got:  %q", cc.name, cc.tripID, tr.ID.Hex())

		}

	}

}
func TestGetTrip(t *testing.T) {
	mongoURL = "mongodb://localhost:27017"
	c := context.Background()
	//连接数据库端口
	mc, err := mongotesting.NewClient(c)
	if err != nil {
		t.Errorf("连接数据库失败: %v", err)
	}

	//连接coolcar数据库
	m := NewMongo(mc.Database("coolcar"))
	acct := id.AccountID("account4")
	mgo.NewObjID = primitive.NewObjectID
	trip, err := m.CreateTrip(c, &rentalpb.Trip{
		AccountId: acct.String(),
		CarId:     "car01",
		Start: &rentalpb.LocationStatus{
			Location: &rentalpb.Location{
				Latitude:  31,
				Longitude: 120,
			},
			FeeCent:  0,
			KmDriven: 24.5,
			PoiName:  "无锡学院",
		},
		Current: &rentalpb.LocationStatus{
			Location: &rentalpb.Location{
				Latitude:  32,
				Longitude: 122,
			},
			FeeCent:  11,
			KmDriven: 3,
			PoiName:  "映月湖公园",
		},
		End: &rentalpb.LocationStatus{
			Location: &rentalpb.Location{
				Latitude:  33,
				Longitude: 123,
			},
			FeeCent:  11,
			KmDriven: 5.6,
			PoiName:  "荟聚",
		},
		Status: rentalpb.TripStatus_IN_PROGRESS,
	})

	if err != nil {
		t.Fatal("不能创建行程:", err)
	}
	got, err := m.GetTrip(c, objid.ToTripID(trip.ID), acct)
	if err != nil {
		fmt.Errorf("不能获取到Trip: %v", err)
	}

	if diff := cmp.Diff(trip, got, protocmp.Transform()); diff != "" {
		t.Errorf("result differs; -want, +got: %s", diff)
	}

}

func TestGetTrips(t *testing.T) {
	mongoURL = "mongodb://localhost:27017"
	c := context.Background()
	//连接MongoDB端口
	mc, err := mongotesting.NewClient(c)
	if err != nil {
		t.Fatalf("连接MongoDB端口失败: %v", err)
	}
	m := NewMongo(mc.Database("coolcar"))

	//表格驱动测试， 先创建5个行程
	rows := []struct {
		id        string
		accountID string
		status    rentalpb.TripStatus
	}{
		{
			id:        "5f8132eb10714bf629489051",
			accountID: "account_id_for_get_trips",
			status:    rentalpb.TripStatus_FINISHED,
		},
		{
			id:        "5f8132eb10714bf629489052",
			accountID: "account_id_for_get_trips",
			status:    rentalpb.TripStatus_FINISHED,
		},
		{
			id:        "5f8132eb10714bf629489053",
			accountID: "account_id_for_get_trips",
			status:    rentalpb.TripStatus_FINISHED,
		},
		{
			id:        "5f8132eb10714bf629489054",
			accountID: "account_id_for_get_trips",
			status:    rentalpb.TripStatus_IN_PROGRESS,
		},
		{
			id:        "5f8132eb10714bf629489055",
			accountID: "account_id_for_get_trips_1",
			status:    rentalpb.TripStatus_IN_PROGRESS,
		},
	}

	for _, r := range rows {
		mgo.NewObjIDWithValue(id.TripID(r.id))
		_, err := m.CreateTrip(c, &rentalpb.Trip{
			AccountId: r.accountID,
			Status:    r.status,
		})
		if err != nil {
			t.Fatalf("创建行程失败:%v", err)
		}
	}

	//根据我们的条件批量查询行程数据
	cases := []struct {
		name       string
		accountID  string
		status     rentalpb.TripStatus
		wantCount  int
		wantOnlyID string
	}{
		{
			name:      "get_all",
			accountID: "account_id_for_get_trips",
			status:    rentalpb.TripStatus_TS_NOT_SPECIFIED,
			wantCount: 4,
		},
		{
			name:       "get_in_progress",
			accountID:  "account_id_for_get_trips",
			status:     rentalpb.TripStatus_IN_PROGRESS,
			wantCount:  1,
			wantOnlyID: "5f8132eb10714bf629489054",
		},
	}

	for _, cc := range cases {
		t.Run(cc.name, func(t *testing.T) {
			res, err := m.GetTrips(context.Background(), id.AccountID(cc.accountID), cc.status)
			if err != nil {
				t.Errorf("get Trips error: %v", err)
			}

			if cc.wantCount != len(res) {
				t.Errorf("不正确的结果: want: %d ; got: %d", cc.wantCount, len(res))
			}

			if cc.wantOnlyID != "" && len(res) > 0 {
				if cc.wantOnlyID != res[0].ID.Hex() {
					t.Errorf("only_id 不正确: want: %q ; got: %q", cc.wantOnlyID, res[0].ID.Hex())
				}

			}
		})
	}

}

func TestUpdateTrip(t *testing.T) {
	c := context.Background()
	mc, err := mongotesting.NewClient(c)
	if err != nil {
		t.Fatalf("cannot connect mongodb: %v", err)
	}

	m := NewMongo(mc.Database("coolcar"))
	tid := id.TripID("5f8132eb12714bf629489054")
	aid := id.AccountID("account_for_update")

	var now int64 = 10000
	mgo.NewObjIDWithValue(tid)
	mgo.UpdatedAt = func() int64 {
		return now
	}

	tr, err := m.CreateTrip(c, &rentalpb.Trip{
		AccountId: aid.String(),
		Status:    rentalpb.TripStatus_IN_PROGRESS,
		Start: &rentalpb.LocationStatus{
			PoiName:  "start_poi",
			FeeCent:  10,
			KmDriven: 50,
		},
	})

	if err != nil {
		t.Fatalf("cannot create trip: %v", err)
	}

	if tr.UpdatedAt != 10000 {
		t.Fatalf("wrong updatedat; want: 10000, got: %d", tr.UpdatedAt)
	}

	update := &rentalpb.Trip{
		AccountId: aid.String(),
		Status:    rentalpb.TripStatus_IN_PROGRESS,
		Start: &rentalpb.LocationStatus{
			PoiName: "start_poi_updated",
		},
	}
	cases := []struct {
		name          string
		now           int64
		withUpdatedAt int64
		wantErr       bool
	}{
		{
			name:          "normal_update",
			now:           20000,
			withUpdatedAt: 10000,
		},
		{
			name:          "update_with_stale_timestamp",
			now:           30000,
			withUpdatedAt: 10000,
			wantErr:       true,
		},
		{
			name:          "update_with_refetch",
			now:           40000,
			withUpdatedAt: 20000,
		},
	}

	for _, cc := range cases {
		now = cc.now
		err := m.UpdateTrip(c, tid, aid, cc.withUpdatedAt, update)
		if cc.wantErr {
			if err == nil {
				t.Errorf("%s: want error; got none", cc.name)
			} else {
				continue
			}
		} else {
			if err != nil {
				t.Errorf("%s: cannot update: %v", cc.name, err)
			}
		}
		updatedTrip, err := m.GetTrip(c, tid, aid)
		if err != nil {
			t.Errorf("%s: cannot get trip after udpate: %v", cc.name, err)
		}
		if cc.now != updatedTrip.UpdatedAt {
			t.Errorf("%s: incorrect updatedat: want %d, got %d",
				cc.name, cc.now, updatedTrip.UpdatedAt)
		}
	}
}

func TestUpdateTrips(t *testing.T) {

	c := context.Background()
	mc, err := mongotesting.NewClient(c)
	if err != nil {
		t.Fatalf("cannot connect mongodb: %v", err)
	}

	m := NewMongo(mc.Database("coolcar"))
	tid := id.TripID("5f8132eb12714bf629489054")
	aid := id.AccountID("account5")

	var now int64 = 10000
	mgo.NewObjIDWithValue(tid)
	mgo.UpdatedAt = func() int64 {
		return now
	}

	tr, err := m.CreateTrip(c, &rentalpb.Trip{
		AccountId: aid.String(),
		Status:    rentalpb.TripStatus_IN_PROGRESS,
		Start: &rentalpb.LocationStatus{
			PoiName: "start_poi",
		},
	})
	fmt.Printf("创建的行程:%+v\n", tr)

	if err != nil {
		t.Fatalf("cannot create trip: %v", err)
	}

	if tr.UpdatedAt != 10000 {
		t.Fatalf("wrong updatedat; want: 10000, got: %d", tr.UpdatedAt)
	}

	update := &rentalpb.Trip{
		AccountId: aid.String(),
		// Status:    rentalpb.TripStatus_IN_PROGRESS,
		// Start: &rentalpb.LocationStatus{
		// 	PoiName: "start",
		// 	FeeCent: 100,
		// },
	}
	// cases := []struct {
	// 	name          string
	// 	now           int64
	// 	withUpdatedAt int64
	// 	wantErr       bool
	// }{
	cases := []struct {
		name          string
		now           int64
		withUpdatedAt int64
		wantErr       bool
	}{
		{
			name:          "normal_update",
			now:           20000,
			withUpdatedAt: 10000,
		},
		{
			name:          "update_with_stale_timestamp",
			now:           30000,
			withUpdatedAt: 10000,
			wantErr:       true,
		},
		{
			name:          "update_with_refetch",
			now:           40000,
			withUpdatedAt: 20000,
		},
	}

	for _, cc := range cases {
		now = cc.now
		err := m.UpdateTrip(c, tid, aid, cc.withUpdatedAt, update)

		fmt.Printf("更新的行程:%+v\n", err)

		if cc.wantErr {
			if err == nil {
				t.Errorf("%s: want error; got none", cc.name)
			} else {
				continue
			}
		} else {
			if err != nil {
				t.Errorf("%s: cannot update :%v", cc.name, err)
			}
		}
		updateTrip, err := m.GetTrip(c, tid, aid)

		fmt.Printf("获取的行程:%+v\n", updateTrip)

		if err != nil {
			t.Errorf("%s:获取行程失败:%v", cc.name, err)
		}

		if cc.now != updateTrip.UpdatedAt {
			t.Errorf("%s :更新数据不正确 want:%d; got: %d ", cc.name, cc.now, updateTrip.UpdatedAt)
		}
	}
}
func TestMain(m *testing.M) {
	os.Exit(mongotesting.RunWithMongoInDocker(m))
}

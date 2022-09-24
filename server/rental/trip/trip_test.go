package trip

import (
	"context"
	rentalpb "coolcar/rental/api/gen/v1"
	"coolcar/rental/trip/client/poi"
	"coolcar/rental/trip/dao"
	"coolcar/shared/auth"
	"coolcar/shared/id"
	mgo "coolcar/shared/mongo"
	mongotesting "coolcar/shared/mongo/testing"
	"encoding/json"
	"fmt"
	"os"
	"testing"

	"go.uber.org/zap"
)

func TestCreateTrip(t *testing.T) {
	c := auth.ContextWithAccountID(context.Background(), id.AccountID("ice_moss"))
	mc, err := mongotesting.NewClient(c)
	if err != nil {
		t.Errorf("连接MongoDB端口失败: %v", err)
	}
	logger, err := zap.NewDevelopment()
	if err != nil {
		t.Fatalf("不能创建logger: %v", err)
	}
	pm := &profileManager{}
	cm := &carManager{}
	s := &Service{
		ProfileManager: pm,
		CarManger:      cm,
		POIManager:     &poi.Manager{},
		Mongo:          dao.NewMongo(mc.Database("coolcar")),
		Logger:         logger,
	}
	pm.iID = "杨旷"
	geden := `{"account_id":"ice_moss","car_id":"江苏无锡001号","start":{"location":{"latitude":120,"longitude":32},"poi_name":"无锡"},"current":{"location":{"latitude":120,"longitude":32},"poi_name":"无锡"},"status":1,"identity_id":"杨旷"}`
	cases := []struct {
		name         string
		tripID       string
		profileErr   error
		carVerifyErr error
		carUnlockErr error
		want         string
		wantErr      bool
	}{
		{
			name:   "normal_create",
			tripID: "5f8132eb12714bf629489054",
			want:   geden,
		},
		{
			name:       "profile_err",
			tripID:     "5f8132eb12714bf629489055",
			profileErr: fmt.Errorf("profile"),
			wantErr:    true,
		},
		{
			name:         "car_verify_err",
			tripID:       "5f8132eb12714bf629489056",
			carVerifyErr: fmt.Errorf("verify"),
			wantErr:      true,
		},
		{
			name:         "car_unlock_err",
			tripID:       "5f8132eb12714bf629489057",
			carUnlockErr: fmt.Errorf("unlock"),
			want:         geden,
		},
	}

	for _, cc := range cases {
		t.Run(cc.name, func(t *testing.T) {
			mgo.NewObjIDWithValue(id.TripID(cc.tripID))
			pm.err = cc.profileErr
			cm.unlockErr = cc.carUnlockErr
			cm.verifyErr = cc.carVerifyErr

			res, err := s.CreateTrip(c, &rentalpb.CreateTripRequest{
				Start: &rentalpb.Location{
					Latitude:  120,
					Longitude: 32,
				},
				CarId: "江苏无锡001号",
			})
			if cc.wantErr {
				if err == nil {
					t.Errorf("want err: got none")
				} else {
					return
				}
			}

			if err != nil {
				t.Errorf("创建行程失败: %v", err)
				return
			}

			if res.Id != cc.tripID {
				t.Errorf("%s: 不正确的id want: %q ; got: %q", cc.name, cc.tripID, res.Id)
			}

			bt, err := json.Marshal(res.Trip)
			if err != nil {
				t.Errorf("Marshal fial: %v", err)
			}
			tirpStr := string(bt)

			if cc.want != tirpStr {
				t.Errorf("%s:不正确的相应want: %s; got: %s", cc.name, cc.want, tirpStr)
			}
			fmt.Printf("行程信息:%s\n", res)

		})
	}

}

func TestGetTrip(t *testing.T) {
	//连接数据库端口
	c := auth.ContextWithAccountID(context.Background(), id.AccountID("ice_moss"))
	mc, err := mongotesting.NewClient(c)
	if err != nil {
		t.Errorf("连接MongoDB端口失败: %v", err)
	}
	logger, err := zap.NewDevelopment()
	if err != nil {
		t.Fatalf("不能创建logger: %v", err)
	}

	//对象实例化
	pm := &profileManager{}
	cm := &carManager{}
	s := &Service{
		ProfileManager: pm,
		CarManger:      cm,
		POIManager:     &poi.Manager{},
		Mongo:          dao.NewMongo(mc.Database("coolcar")),
		Logger:         logger,
	}

	tirp := []struct {
		name  string
		Start *rentalpb.Location
		carID string
	}{
		{
			name: "yk",
			Start: &rentalpb.Location{
				Latitude:  100,
				Longitude: 200,
			},
			carID: "奔驰1",
		},
		{
			name: "ykk",
			Start: &rentalpb.Location{
				Latitude:  110,
				Longitude: 210,
			},
			carID: "宝马2",
		},
		{
			name: "ykkk",
			Start: &rentalpb.Location{
				Latitude:  120,
				Longitude: 220,
			},
			carID: "法拉利3",
		},
		{
			name: "ykkkk",
			Start: &rentalpb.Location{
				Latitude:  130,
				Longitude: 230,
			},
			carID: "奥迪4",
		},
	}

	for _, cc := range tirp {
		t.Run(cc.name, func(t *testing.T) {
			res, err := s.CreateTrip(c, &rentalpb.CreateTripRequest{
				Start: cc.Start,
				CarId: cc.carID,
			})
			if err != nil {
				t.Errorf("创建行程失败:%v", err)
			}
			var trip_id []string
			trip_id = append(trip_id, res.Id)
			fmt.Printf("%s: tripID: %s\n", cc.name, trip_id)
		})
	}

	//表格驱动数据
	cases := []struct {
		name      string
		tripID    string
		accountID string
		want      string
		wantErr   bool
	}{
		{
			name:      "test_1",
			tripID:    "6245596694e545c056320487",
			accountID: "account_1",
			want:      "",
		},
		{
			name:      "test_2",
			tripID:    "6245596794e545c056320488",
			accountID: "account_2",
			want:      "",
		},
		{
			name:      "test_3",
			tripID:    "6245596794e545c056320489",
			accountID: "account_4",
			want:      "",
		},
		{
			name:      "test_4",
			tripID:    "6245596794e545c05632048a",
			accountID: "account_4",
			want:      "",
		},
	}

	for _, cc := range cases {
		t.Run(cc.name, func(t *testing.T) {
			mgo.NewObjIDWithValue(id.TripID(cc.tripID))

			resp, err := s.GetTrip(c, &rentalpb.GetTripRequest{
				Id: cc.tripID,
			})
			if cc.wantErr {
				if err == nil {
					t.Errorf("want err: got none")
				} else {
					return
				}
			}

			if err != nil {
				t.Errorf("get行程失败: %v", err)
				return
			}

			bt, err := json.Marshal(resp)
			if err != nil {
				t.Errorf("类型转换失败:%s", err)
			}

			trips := string(bt)

			fmt.Printf("trips:%+v\n", trips)

		})

	}
}

//对用户身份进行验证
type profileManager struct {
	iID id.IdentityID
	err error
}

func (p *profileManager) Verify(c context.Context, id id.AccountID) (id.IdentityID, error) {
	return p.iID, p.err
}

//车辆管理，车辆状态，解锁等
type carManager struct {
	verifyErr error
	unlockErr error
	lockErr   error
}

func (m *carManager) Verify(c context.Context, id id.CarID, start *rentalpb.Location) error {
	return m.verifyErr
}

func (m *carManager) Unlock(c context.Context, cid id.CarID, aid id.AccountID, tid id.TripID, AvatarUrl string) error {
	return m.unlockErr
}

func (m *carManager) Lock(c context.Context, cid id.CarID) error {
	return nil
}

func TestMain(m *testing.M) {
	os.Exit(mongotesting.RunWithMongoInDocker(m))
}

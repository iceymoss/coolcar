package car

import (
	"context"
	"fmt"

	carpb "coolcar/car/api/gen/v1"
	rentalpb "coolcar/rental/api/gen/v1"
	"coolcar/shared/id"
)

//车辆管理，车辆状态，解锁等
type Manager struct {
	CarService carpb.CarServiceClient
}

//Verify检查车辆状态
func (m *Manager) Verify(ctx context.Context, id id.CarID, start *rentalpb.Location) error {
	car, err := m.CarService.GetCar(ctx, &carpb.GetCarRequest{
		Id: id.String(),
	})
	if err != nil {
		return fmt.Errorf("cannot get car :%v", err)
	}
	if car.Status != carpb.CarStatus_LOCKED {
		return fmt.Errorf("cannot unlock car carStatus is :%v", car.Status)
	}
	return nil
}

//Unlock对车辆进行开锁
func (m *Manager) Unlock(ctx context.Context, cid id.CarID, aid id.AccountID, tid id.TripID, AvatarUrl string) error {
	_, err := m.CarService.UnlockCar(ctx, &carpb.UnlockCarRequest{
		Id: cid.String(),
		Driver: &carpb.Driver{
			Id:        aid.String(),
			AvatarUrl: AvatarUrl,
		},
		TripId: tid.String(),
	})
	if err != nil {
		return fmt.Errorf("cannot unlock car :%v", err)

	}
	return nil
}

//Lock对车辆进行关锁
func (m *Manager) Lock(ctx context.Context, cid id.CarID) error {
	_, err := m.CarService.LockCar(ctx, &carpb.LockCarRequest{
		Id: cid.String(),
	})
	if err != nil {
		return fmt.Errorf("cannot lock car :%v", err)
	}
	return nil
}

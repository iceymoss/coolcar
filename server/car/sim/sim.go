package sim

import (
	"context"
	"fmt"
	"time"

	carpb "coolcar/car/api/gen/v1"
	"coolcar/car/mq"
	coolenvpb "coolcar/shared/coolenv"

	"go.uber.org/zap"
)

//Subscriber接收中间件rabbitMQ发送来的消息
// type Subscriber interface {
// 	Subscribe(context.Context) (ch chan *carpb.CarEntity, cleanUp func(), err error)
// }

//PosSubcriber接收实时车辆位置信息
type PosSubcriber interface {
	PosSubscribe(context.Context) (ch chan *coolenvpb.CarPosUpdate, cleanUp func(), err error)
}

//车辆管理者，对车辆进行数据绑定，交互
type Controller struct {
	CarService    carpb.CarServiceClient
	AIService     coolenvpb.AIServiceClient
	CarSubscriber mq.Subscriber
	PosSubscriber PosSubcriber
	Logger        *zap.Logger
}

//用id绑定车辆，对车辆进行分发
func (c *Controller) RunSimulations(ctx context.Context) {
	var cars []*carpb.CarEntity
	for {
		time.Sleep(3 * time.Second)
		res, err := c.CarService.GetCars(ctx, &carpb.GetCarsRequest{})
		if err != nil {
			c.Logger.Error("cannot get cars", zap.Error(err))
			continue
		}
		cars = res.Cars
		break
	}

	c.Logger.Info("Running car simulations.", zap.Int("car_count", len(cars)))

	//将队列中的消息取出
	carCh, carCleanUp, err := c.CarSubscriber.Subscribe(ctx)
	defer carCleanUp()
	if err != nil {
		c.Logger.Error("不能接收中间件的消息", zap.Error(err))
		return
	}

	//从车辆获取信息
	posCh, posClearUp, err := c.PosSubscriber.PosSubscribe(ctx)
	if err != nil {
		c.Logger.Error("不能接收车辆的消息", zap.Error(err))
		return
	}
	defer posClearUp()

	//对每一辆车并发绑定，建立映射关系
	carChans := make(map[string]chan *carpb.Car)
	posChans := make(map[string]chan *carpb.Location)
	for _, car := range cars {
		carFanoutch := make(chan *carpb.Car)
		carChans[car.Id] = carFanoutch

		posFanoutch := make(chan *carpb.Location)
		posChans[car.Id] = posFanoutch
		go c.SimlateCar(context.Background(), car, carFanoutch, posFanoutch)
	}

	for {
		select {
		case CarUpdata := <-carCh:
			ch := carChans[CarUpdata.Id]
			if ch != nil {
				ch <- CarUpdata.Car
			}
		case PosUpdata := <-posCh:
			ch := posChans[PosUpdata.CarId]
			if ch != nil {
				ch <- &carpb.Location{
					Latitude:  PosUpdata.Pos.Latitude,
					Longitude: PosUpdata.Pos.Longitude,
				}
			}
		}
	}
}

//SimlateCar模拟车辆实时状态
func (c *Controller) SimlateCar(ctx context.Context, initial *carpb.CarEntity, carCh chan *carpb.Car, posCh chan *carpb.Location) {
	car := initial
	for {
		select {
		case carUpdata := <-carCh: //从channel中接收车辆状态
			if carUpdata.Status == carpb.CarStatus_UNLOCKING {
				Updata, err := c.unlockCar(ctx, car)
				if err != nil {
					c.Logger.Error("cannot unlock car: %v", zap.Error(err))
					break
				}
				car = Updata

			} else if carUpdata.Status == carpb.CarStatus_LOCKING {
				Updata, err := c.lockCar(ctx, car)
				if err != nil {
					c.Logger.Error("cannot lock car: %v", zap.Error(err))
					break
				}
				car = Updata

			}
		case posUpata := <-posCh: //从channle中接收车辆实时位置
			Updata, err := c.moveCar(ctx, car, posUpata)
			if err != nil {
				c.Logger.Error("cannot move car", zap.Error(err))
				break
			}
			car = Updata
		}
	}
}

//开锁
func (c *Controller) unlockCar(ctx context.Context, car *carpb.CarEntity) (*carpb.CarEntity, error) {
	car.Car.Status = carpb.CarStatus_UNLOCKED
	_, err := c.CarService.UpdataCar(ctx, &carpb.UpdataCarRequest{
		Id:     car.Id,
		Status: carpb.CarStatus_UNLOCKED,
	})
	if err != nil {
		return nil, fmt.Errorf("cannot updata car status: %v", err)
	}

	_, err = c.AIService.SimulateCarPos(ctx, &coolenvpb.SimulateCarPosRequest{
		CarId: car.Id,
		Type:  coolenvpb.PosType_RANDOM,
		InitialPos: &coolenvpb.Location{
			Latitude:  car.Car.Position.Latitude,
			Longitude: car.Car.Position.Longitude,
		},
	})
	if err != nil {
		return nil, fmt.Errorf("cannot Simulate Car Position: %v", err)
	}

	return car, nil
}

//关锁
func (c *Controller) lockCar(ctx context.Context, car *carpb.CarEntity) (*carpb.CarEntity, error) {
	car.Car.Status = carpb.CarStatus_LOCKED
	_, err := c.CarService.UpdataCar(ctx, &carpb.UpdataCarRequest{
		Id:     car.Id,
		Status: carpb.CarStatus_LOCKED,
	})
	if err != nil {
		return nil, fmt.Errorf("cannot updata car status: %v", err)
	}

	_, err = c.AIService.EndSimulateCarPos(ctx, &coolenvpb.EndSimulateCarPosRequest{
		CarId: car.Id,
	})
	if err != nil {
		c.Logger.Error("cannot EndSimulate car: %v", zap.Error(err))
	}

	return car, nil
}

//车辆移动
func (c *Controller) moveCar(ctx context.Context, car *carpb.CarEntity, pos *carpb.Location) (*carpb.CarEntity, error) {
	car.Car.Position = pos
	// fmt.Printf("位置变化:%s, carID: %s\n", pos, car.Id)
	_, err := c.CarService.UpdataCar(ctx, &carpb.UpdataCarRequest{
		Id:       car.Id,
		Position: pos,
	})
	if err != nil {
		return nil, fmt.Errorf("cannot updata car: %v", err)
	}
	return car, nil
}

package pos

import (
	"context"
	"encoding/json"
	"fmt"

	"coolcar/car/amqpclt"
	coolenvpb "coolcar/shared/coolenv"

	"go.uber.org/zap"
)

//Subscriber实现了一个位置订阅
type Subscriber struct {
	Sub    *amqpclt.Subscriber
	Logger *zap.Logger
}

//PosSubscribe订阅位置更新，将信息从"位置"中间间中拿出处理
func (s *Subscriber) PosSubscribe(c context.Context) (ch chan *coolenvpb.CarPosUpdate, clearUp func(), err error) {
	msgCh, clearUp, err := s.Sub.SubscribeRaw(c)
	if err != nil {
		return nil, clearUp, fmt.Errorf("cannot SubscribeRaw: %v", err)
	}
	posCh := make(chan *coolenvpb.CarPosUpdate)
	go func() {
		for msg := range msgCh {
			var pos coolenvpb.CarPosUpdate
			err := json.Unmarshal(msg.Body, &pos)
			if err != nil {
				s.Logger.Error("cannot unmarshal", zap.Error(err))
			}
			posCh <- &pos
		}
		close(posCh)
	}()
	return posCh, clearUp, nil

}

package amqpclt

import (
	"context"
	"encoding/json"
	"fmt"

	carpb "coolcar/car/api/gen/v1"

	"github.com/streadway/amqp"
	"go.uber.org/zap"
)

//Publisher实现了一个 ampq 发布者
type Publisher struct {
	ch       *amqp.Channel
	exchange string
}

// NewPublisher构造函数 creates an amqp publisher
func NewPublisher(conn *amqp.Connection, exchange string) (*Publisher, error) {
	ch, err := conn.Channel()
	if err != nil {
		return nil, fmt.Errorf("cannot allocate channel: %v", err)
	}

	err = declareExchange(ch, exchange)
	if err != nil {
		return nil, fmt.Errorf("cannot declare exchange: %v", err)
	}

	return &Publisher{
		ch:       ch,
		exchange: exchange,
	}, nil
}

//Publish 发布消息
func (p *Publisher) Publish(c context.Context, car *carpb.CarEntity) error {
	b, err := json.Marshal(car)
	if err != nil {
		return fmt.Errorf("cannot marshal: %v", err)
	}
	return p.ch.Publish(
		p.exchange,
		"",    // key
		false, // mandatory
		false, // immediate
		amqp.Publishing{
			Body: b,
		},
	)
}

//Subscriber 实现了一个 amqp 订阅者
type Subscriber struct {
	conn     *amqp.Connection
	exchange string
	logger   *zap.Logger
}

// NewSubscriber creates an amqp subscriber.
func NewSubscriber(conn *amqp.Connection, exchange string, logger *zap.Logger) (*Subscriber, error) {
	ch, err := conn.Channel()
	if err != nil {
		return nil, fmt.Errorf("cannot allocate channel: %v", err)
	}
	defer ch.Close()

	err = declareExchange(ch, exchange)
	if err != nil {
		return nil, fmt.Errorf("cannot declare exchange: %v", err)
	}

	return &Subscriber{
		conn:     conn,
		exchange: exchange,
		logger:   logger,
	}, nil
}

// SubscribeRaw 订阅并返回带有原始 amqp 交付的channel
func (s *Subscriber) SubscribeRaw(context.Context) (<-chan amqp.Delivery, func(), error) {
	ch, err := s.conn.Channel()
	if err != nil {
		return nil, func() {}, fmt.Errorf("cannot allocate channel: %v", err)
	}
	closeCh := func() {
		err := ch.Close()
		if err != nil {
			s.logger.Error("cannot close channel", zap.Error(err))
		}
	}

	//QueueDeclare 声明一个队列来保存消息并传递给消费者
	q, err := ch.QueueDeclare(
		"",    // name
		false, // durable
		true,  // autoDelete
		false, // exlusive
		false, // noWait
		nil,   // args
	)
	if err != nil {
		return nil, closeCh, fmt.Errorf("cannot declare queue: %v", err)
	}

	//QueueDelete 从服务器中删除队列，包括所有绑定，然后根据服务器配置清除消息，返回清除的消息数。
	cleanUp := func() {
		_, err := ch.QueueDelete(
			q.Name,
			false, // ifUnused
			false, // ifEmpty
			false, // noWait
		)
		if err != nil {
			s.logger.Error("cannot delete queue", zap.String("name", q.Name), zap.Error(err))
		}
		closeCh()
	}

	////将交换绑定到队列
	err = ch.QueueBind(
		q.Name,
		"", // key
		s.exchange,
		false, // noWait
		nil,   // args
	)
	if err != nil {
		return nil, cleanUp, fmt.Errorf("cannot bind: %v", err)
	}
	//发消息
	msgs, err := ch.Consume(
		q.Name,
		"",    // consumer
		true,  // autoAck
		false, // exclusive
		false, // noLocal
		false, // noWait
		nil,   // args
	)
	if err != nil {
		return nil, cleanUp, fmt.Errorf("cannot consume queue: %v", err)
	}
	return msgs, cleanUp, nil
}

//Subscribe订阅并返回带有 CarEntity 数据的channel。
func (s *Subscriber) Subscribe(c context.Context) (chan *carpb.CarEntity, func(), error) {
	msgCh, cleanUp, err := s.SubscribeRaw(c)
	if err != nil {
		return nil, cleanUp, err
	}

	carCh := make(chan *carpb.CarEntity)
	go func() {
		for msg := range msgCh {
			var car carpb.CarEntity
			err := json.Unmarshal(msg.Body, &car)
			if err != nil {
				s.logger.Error("cannot unmarshal", zap.Error(err))
			}
			carCh <- &car
		}
		close(carCh)
	}()
	return carCh, cleanUp, nil
}

//对数据进行封装
func declareExchange(ch *amqp.Channel, exchange string) error {
	return ch.ExchangeDeclare(
		exchange,
		"fanout",
		true,  // durable
		false, // autoDelete
		false, // internal
		false, // noWait
		nil,   // args
	)
}

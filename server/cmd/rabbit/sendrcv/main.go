package main

import (
	"fmt"
	"time"

	"github.com/streadway/amqp"
)

func main() {
	//建立连接
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		panic(err)
	}
	//非golang的channel
	ch, err := conn.Channel()
	if err != nil {
		panic(err)
	}
	//构建队列
	qu, err := ch.QueueDeclare(
		"go_q1",
		true,  //durable
		false, //autoDelete
		false, //wxclusive
		true,  //noWait
		nil,   //args
	)
	if err != nil {
		panic(err)
	}

	go consum("c1", conn, qu.Name)
	go consum("c2", conn, qu.Name)
	//发送数据
	i := 0
	for {
		i++
		err = ch.Publish(
			"", //exchange
			qu.Name,
			false, //mandatory
			false, //immediate
			amqp.Publishing{
				Body: []byte(fmt.Sprintf("message %d", i)),
			},
		)
		if err != nil {
			fmt.Println(err.Error())
		}
		time.Sleep(200 * time.Millisecond)
	}
}

//收消息
func consum(name string, conn *amqp.Connection, q string) {
	ch, err := conn.Channel()
	if err != nil {
		panic(err)
	}
	defer ch.Close()

	mssage, err := ch.Consume(
		q,
		name,
		true,  //autoAck
		false, //exclusice
		false, //nolocal
		false, //noWait
		nil,
	)
	if err != nil {
		panic(err)
	}
	for msg := range mssage {
		fmt.Printf("%s:%s\n", name, msg.Body)
	}
}

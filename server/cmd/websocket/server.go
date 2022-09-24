package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/websocket"
)

func main() {
	//1. 开服务
	http.HandleFunc("/ws", HandlWebesoket)
	//2. 监听端口
	log.Fatal(http.ListenAndServe("localhost:9090", nil))
}

func HandlWebesoket(w http.ResponseWriter, r *http.Request) {
	//Upgrader提供将http升级为websocket的一些参数
	u := &websocket.Upgrader{
		//检查同源
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	conn, err := u.Upgrade(w, r, nil) //Upgrade将 HTTP 服务器连接升级到 WebSocket 协议
	if err != nil {
		fmt.Printf("cannot upgrad %v\n", err)
		return
	}
	defer conn.Close()

	//对client的数据的读取
	done := make(chan struct{})
	go func() {
		for {
			m := make(map[string]interface{})
			err := conn.ReadJSON(&m)
			if err != nil {
				if !websocket.IsCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
					fmt.Printf("unexpected read error : %v\n", err)
				}
				done <- struct{}{} //struct{}初始化结构体,{}发送空字段
				break
			}
			fmt.Printf("message: %v\n", m)
		}
	}()
	id := 0
	//发消息
	for {
		id++
		err := conn.WriteJSON(map[string]string{
			"hello":   "websocket",
			"welcome": "ice_moss",
			"msg":     strconv.Itoa(id),
		})

		if err != nil {
			fmt.Printf("write fail :%v", err)
		}
		select {
		case <-time.After(200 * time.Millisecond):
		case <-done:
			return
		}
	}

}

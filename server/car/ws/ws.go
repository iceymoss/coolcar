package ws

import (
	"context"
	"net/http"

	"coolcar/car/mq"

	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

//Handle调用websocket的通讯方式连接,让client和server连接
func Handler(u *websocket.Upgrader, sub mq.Subscriber, logger *zap.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := u.Upgrade(w, r, nil) //Upgrade将 HTTP 服务器连接升级到 WebSocket 协议
		if err != nil {
			logger.Warn("canot upgrad %v", zap.Error(err))
			return
		}
		defer conn.Close()
		//从RabibiyMQ拿数据
		msgs, clearUp, err := sub.Subscribe(context.Background())
		defer clearUp()
		if err != nil {
			logger.Error("cannot subsciber,", zap.Error(err))
			//给用户输出日志
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		//对client的数据的读取
		done := make(chan struct{})
		go func() {
			for {
				_, _, err := conn.ReadMessage()
				if err != nil {
					if !websocket.IsCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
						logger.Warn("unexpected read error : %v", zap.Error(err))
					}
					done <- struct{}{} //struct{}初始化结构体,{}发送空字段
					break
				}
			}
		}()

		//发消息
		for {
			select {
			case msg := <-msgs:
				err := conn.WriteJSON(msg)
				if err != nil {
					logger.Warn("unexpected writer JSON", zap.Error(err))
				}
			case <-done:
				return
			}
		}
	}
}

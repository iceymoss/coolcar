# coolcar
### 介绍
###### 酷车出行微信小程序 实战共享出行-汽车分时租赁小程序。使用typescript进行小程序前端开 发。后端采用go微服务架构，使用k8s+docker在云端进行 部署。
* 使用Grpc微服务框架实现用户模块、驾照审核模块、Oss云存储模块、车辆解锁模块、行程模块。
* 使用Grpc-gateway将服务对外暴露restful接口。
* 使用非对称加密现实用户鉴权。
* 基于NoSQL数据库MongoDB做数据存储。
* 使用RabbitMQ消息收发完成车辆的开锁/关锁保证车辆状态一致性。
* 使用Websocket处理车辆实习信息，提高车辆实时位置上传性能。


### 如何使用
```git clone https://github.com/iceymoss/coolcar.git```

### 如何编译以及运行小程序
###### cd wx/miniprogram npm install 打开小程序开发工具 确保在详情->本地设置中勾选启用自定义处理命令 点击工具->构建npm 点击编译

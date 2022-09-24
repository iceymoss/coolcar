import camelcaseKeys = require("camelcase-keys");
import { car } from "./proto_gen/car/car_pb";
import { Coolcar } from "./request";

export namespace CarService{
    //使用websocket进行连接通讯
    export function subscribe(onMsg:(c: car.v1.CarEntity) =>void){
        const socket = wx.connectSocket({
            url: Coolcar.wsAddr + '/ws'
        })
        socket.onMessage(msg => {
            //类型转换
            const obj = JSON.parse(msg.data as string)
            onMsg(car.v1.CarEntity.fromObject(
                camelcaseKeys(obj,{
                    deep:true
                })
            ))

        })
        return socket
    }

    //获取车辆信息
    export function getcar(id: string):Promise<car.v1.ICar>{
        return Coolcar.sendRequestWithAuthRetry({
            method:'GET',
            path: `/v1/car/${encodeURIComponent(id)}`,
            respMarshaller: car.v1.Car.fromObject,
        })
    }
}
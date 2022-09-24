import { rental } from "./proto_gen/rental/rental_pb";
import { Coolcar } from "./request";

//请求后端方法，入口
export namespace TripService{
    //请求创建行程 
    export function createTrip(req: rental.v1.ICreateTripRequest): Promise<rental.v1.ITripEntity>{
        console.log("创建行程")
        return Coolcar.sendRequestWithAuthRetry({
            method: 'POST',
            path: '/v1/trip',
            data: req,
            respMarshaller: rental.v1.TripEntity.fromObject
        })
    }
    //请求获取行程
    export function getTrip(id: string): Promise<rental.v1.ITrip>{
        return Coolcar.sendRequestWithAuthRetry({
            method: 'GET',
            path: `/v1/trip/${encodeURIComponent(id)}`,
            respMarshaller: rental.v1.Trip.fromObject,
        })
    }
    //请求批量获取行程
    export function getTrips(s?: rental.v1.TripStatus): Promise<rental.v1.IGetTripsResponse> {
        let path = '/v1/trips'
        if (s) {
            path += `?status=${s}`
        }
        return Coolcar.sendRequestWithAuthRetry({
            method: 'GET',
            path: path,
            respMarshaller: rental.v1.GetTripsResponse.fromObject,
        })
    }
    
    //请求更新当前位置
    export function updateTripPos(id: string, loc?: rental.v1.ILocation){
        return updateTrip({id, current: loc})
    }
    //请求结束行程
    export function finishTrip(id: string){
        return updateTrip({
            id, 
            endTrip:true,
        })
    }
    //请求更新数据库
    export function updateTrip(r: rental.v1.IUpdateTripRequest): Promise<rental.v1.ITrip>{
        if (!r.id) {
            return Promise.reject("必须有id")
        }
        return Coolcar.sendRequestWithAuthRetry({
            method: 'PUT',
            path: `/v1/trip/${encodeURIComponent(r.id)}`,
            data: r,
            respMarshaller: rental.v1.Trip.fromObject,
        })
    }
  
}


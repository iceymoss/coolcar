import { rental } from "../../service/proto_gen/rental/rental_pb"
import { TripService } from "../../service/trip"
import { formatDurtion, formatfee } from "../../utils/format"
import { routing } from "../../utils/routing"

const updateIntervalSec = 5
function DurationStr(sec: number){
    const dur = formatDurtion(sec)
    return `${dur.hh}:${dur.mm}:${dur.ss}`


}

Page({
    timer: undefined as number|undefined,
    tripID: '',

    data: {
        location: {
            latitude: 40.756825521115363,
            longitude: 121.67222114786053,
        },
        scale: 10,
        elapsed: '00:00:00',
        fee: '00.00',
    },

    //页面起始，opt为上个页面传送数据
    onLoad(opt: Record<'trip_id', string>){  //Record<'trip_id', string>表示rip_id为string类型
        const o: routing.DrivingOpt = opt
        //o.trip_id = "6245729ad6ba9454bd0931d3"
        this.tripID = o.trip_id
        console.log("记录行程", o.trip_id)
        TripService.getTrip(o.trip_id).then(console.log)
        console.log("gettrip sussesful")
        this.setupLocationUpdator()
        this.setupTimer(this.tripID)
    },

    onUnload(){
        wx.stopLocationUpdate()
        if(this.timer){
            clearInterval(this.timer)
        }
    },

    onEndTripTap(){
        TripService.finishTrip(this.tripID).then(() => {
            wx.showLoading({
                title: "加载中",
                mask: true,   //保护按钮
            }),
            setTimeout(() => {
                wx.redirectTo({
                    url: routing.mytrips(),
                    complete: () =>{
                        wx.hideLoading()
                    }
                })
            }, 3000); 
        }).catch(err =>{
            console.error(err)
            wx.showToast({
                title: "结束行程失败",
                icon: "none",
            })
        })
    },

    setupLocationUpdator(){
        //起始位置
        wx.startLocationUpdate({
            fail: console.error,
        })
        //实时更新位置
        wx.onLocationChange(loc =>{
            console.log("location:", loc)
            this.setData({
                location:{
                    latitude: loc.latitude,
                    longitude:loc.longitude,
                },
            })
        })
    },
    //定期向执行该函数
    async setupTimer(tripID: string){
        const trip = await TripService.getTrip(tripID)
        //对行程状态进行保护
        if (trip.status !== rental.v1.TripStatus.IN_PROGRESS){
            console.log("该行程不在进行中")
            return
        }
        let secSinceLastUp = 0                      //更新时间
        let latUpdateDurationSec = trip.current!.timestampSec! - trip.start!.timestampSec!   //上一次更新的数据
 
        this.setData({
            elapsed: DurationStr(latUpdateDurationSec),
            fee: formatfee(trip.current!.feeCent!)
        })

        this.timer = setInterval(() =>{
            secSinceLastUp++
            if (secSinceLastUp % 5 === 0){
                TripService.getTrip(tripID).then(trip =>{
                    console.log(trip.current?.feeCent)
                    latUpdateDurationSec = trip.current?.timestampSec! - trip.start?.timestampSec!
                    secSinceLastUp = 0
                    this.setData({
                        fee: formatfee(trip.current?.feeCent!),
                        location: this.data.location
                    })
                }).catch(console.error)

            }
            this.setData({
                elapsed: DurationStr(latUpdateDurationSec + updateIntervalSec),
            })
        }, 1000)
    }
})



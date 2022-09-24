
import { IAppOption } from "../../appoption"
import { CarService } from "../../service/car"
import { ProfileService } from "../../service/prifile"
import { rental } from "../../service/proto_gen/rental/rental_pb"
import { TripService } from "../../service/trip"
import { routing } from "../../utils/routing"

//地图图片展示参数
interface Marker {
  iconPath: string
  id: number
  latitude: number
  longitude: number
  width: number
  height: number
}

//地图图片url
const defaultAvtat = "/resources/car.png"
const initialLat = 30
const initialLgt = 120

Page({
  isPageShowing:false,
  socket: undefined as WechatMiniprogram.SocketTask | undefined,

  data: {
    avatarURL: '',
   setting: {
    skew: 0,  
    rotate: 0,
    showLocation: true,   //展示位置
    showScale: true,   //展示比例尺
    subKey: '',
    layerStyle: -1,
    enableZoom: true,
    enableScroll: true,
    enableRotate: false,
    showCompass: false,
    enable3D: false,
    enableOverlooking: false,
    enableSatellite: false,
    enableTraffic: false,
  },

  location: {   //当前位置
    latitude:initialLat,
    longitude: initialLgt,
  },

  scale: 10,   //当前比例尺
  //小车位置
  markers:[
    {
    iconPath: "../resources/car.png",
    id:0,
    latitude: 23,
    longitude: 113,
    width: 15,
    height: 20,
  },
  {
    iconPath: "../resources/car.png",
    id: 1,
    latitude: 23.0032,
    longitude: 113.005,
    width: 15,
    height: 20,
  },
 ]
},


async onLoad() {
  const userInfo = await getApp<IAppOption>().globalData.userInfo
  this.setData({
    avatarURL: userInfo.avatarUrl,
  })
},

//获取初始位置/当前位置
onMylocationTap(){
  wx.getLocation({
    type: 'gcj02',
    success: res =>{
      this.setData({
        //location为一个对象类型，在
        location: {
          latitude: res.latitude,
          longitude: res.longitude,
        },
      })
    },
    fail: () =>{
      wx.showToast({
        icon:"none",  //用于加长位置摆放
        title:'请前往设置页面授权'
      })
    }
  })
},

//扫描点击
async onScanClicked(){
  const trips = await TripService.getTrips(rental.v1.TripStatus.IN_PROGRESS)
  if ((trips.trips?.length  || 0) > 0){  //有进行的行程
     wx.showModal({
      title: '行程提示',
      content: '您有一个正在进行的行程',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.navigateTo({
            url: routing.driving({
              trip_id: trips.trips![0].id!,
            }),
          })
          return
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
        return
      }
    })

  }else{  //没有进行的行程
    const carID = "60af01e5a21ead3dccbcd1d8"
    const redirectURL = routing.Lock({car_id: carID})  //类型强化替代：`/pages/lock/lock?car_id=${carID}` 
    const profil = await ProfileService.getProfile()

    //驾驶者身份已认证
    if (profil.identityStatus === rental.v1.IdentityStatus.VERIFIED){
      wx.showModal({
        title: '认证提示',
        content: '您的身份已认证',
        success (res) {
          //用户确定后进行扫码，跳转至开锁页面
          if (res.confirm) {
            console.log('用户点击确定')
            wx.scanCode({
              success: async () =>{
                // const redirectURL = routing.Lock({car_id: carID})  //类型强化替代：`/pages/lock/lock?car_id=${carID}` 
                wx.navigateTo({
                  url: redirectURL,
                })
              },
              fail:console.error,
            })
            return
          //用户点击取消
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
          return
        }
      })
    }

    //用户身份未认证
    else{
      //保留当前页面，跳转到应用内的register页面
      wx.scanCode({
        success: async () =>{
          wx.navigateTo({
            //跳转至lock页面前向跳转至register页面，并将carID放在redirectURL中传至register页面
            //最后将carID传至lock页面
            //类型强化替代：`/pages/register/register?redirect=${encodeURIComponent(redirectURL)}` 
            url: routing.register({redirectURL:redirectURL})
          })
        },
        fail:console.error,
      })
  }
}
},


onShow(){
  this.isPageShowing = true;
  if (!this.socket){
    this.setData({
      markers: []
    },()=>{
      this.setupCarPosUpdater()
    })
  }
},

onHide(){
  this.isPageShowing = false;
  if (this.socket){
    this.socket.close({
      success: () => {
        this.socket = undefined
      }
    })
  }

},

onMyTripsTap(){
  wx.navigateTo({
    url: routing.mytrips(),
  })
},

//车辆位置在地图上实时更新
setupCarPosUpdater() {
  const map = wx.createMapContext("map")
  const markersByCarID = new Map<string, Marker>()
  let translationInProgress = false
  const endTranslation = () => {
    translationInProgress = false
  }
  //使用websocket长连，将车辆位置信息实时交互
  this.socket = CarService.subscribe(car => {
    console.log("车辆实时信息:", car.car)
    if (!car.id || translationInProgress || !this.isPageShowing) {
      console.log('dropped')
      return
    }
    const marker = markersByCarID.get(car.id)
    if (!marker) {
      // Insert new marker.
      const newMarker: Marker = {
        id: this.data.markers.length,
        iconPath: car.car?.driver?.avatarUrl || defaultAvtat,
        latitude: car.car?.position?.latitude || initialLat,
        longitude: car.car?.position?.longitude || initialLgt,
        height: 20,
        width: 20,
      }
      markersByCarID.set(car.id, newMarker)
      this.data.markers.push(newMarker)
      translationInProgress = true
      this.setData({
        markers: this.data.markers,
      }, endTranslation)
      return
    }

    const newAvatar = car.car?.driver?.avatarUrl || defaultAvtat
    const newLat = car.car?.position?.latitude || initialLat
    const newLng = car.car?.position?.longitude || initialLgt
    if (marker.iconPath !== newAvatar) {
      // Change iconPath and possibly position.
      marker.iconPath = newAvatar
      marker.latitude = newLat
      marker.longitude = newLng
      translationInProgress = true
      this.setData({
        markers: this.data.markers,
      }, endTranslation)
      return
    }

    if (marker.latitude !== newLat || marker.longitude !== newLng) {
      // Move marker.
      translationInProgress = true
      map.translateMarker({
        markerId: marker.id,
        destination: {
          latitude: newLat,
          longitude: newLng,
        },
        autoRotate: false,
        rotate: 0,
        duration: 80,
        animationEnd: endTranslation,
      })
    }
  })
},
})


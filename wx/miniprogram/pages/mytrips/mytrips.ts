import { IAppOption } from "../../appoption"
import { ProfileService } from "../../service/prifile"
import { rental } from "../../service/proto_gen/rental/rental_pb"
import { TripService } from "../../service/trip"
import { formatDurtion, formatfee } from "../../utils/format"
import { routing } from "../../utils/routing"

interface Trip{
    id: string,
    shortId: string,
    statar: string,
    end:string,
    duration: string,
    fee: string,
    distance: string,
    stutar:string,
    inProgress: boolean,
}

const TripsStatusMap = new Map([
    [rental.v1.TripStatus.IN_PROGRESS, '进行中'],
    [rental.v1.TripStatus.FINISHED, '已完成'],
])

const ProfileStatusMap = new Map([
    [rental.v1.IdentityStatus.UNSUBMITTED, '未认证'],
    [rental.v1.IdentityStatus.PENDING, '认证中'],
    [rental.v1.IdentityStatus.VERIFIED, '已认证'],
])

interface MainItem{
    id: string,
    navId: string,
    navScrollId: string,
    data: Trip,
}

interface NavItme{
    id: string,
    mainId: string,
    label: string,
}

interface MainItemQueryResults{
    id: string,
    top: number,
    dataset:{
        navId: string,
        navScrollId: string,
    }
}

Page({
    scrollStates:{
        mainItem: [] as MainItemQueryResults[],
    },
    layoutResolver:undefined as ((value: unknown)=>void)|undefined,
    //layoutResolver:(value: unknown) =>void,

    data:{
        licStatus: ProfileStatusMap.get(rental.v1.IdentityStatus.UNSUBMITTED),
        tripsHeight:0,
        avatarURL:'',
        trips:[] as Trip[],
        mainitem: [] as MainItem[],
        navitem: [] as NavItme[],
        mainscroll: '',
        navCount:0,
        navSelect: '',
        navScroll:"x",
        promotionItems: [
            {
            img: 'https://img1.baidu.com/it/u=590110346,433709782&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=222',
            promotionId:0,
            },
            {
            img: 'http://img.mp.itc.cn/upload/20160421/facaa82b67c342a78dc2e2f1f20c6381_th.jpg',
            promotionId: 1,
            },
            {
            img: 'https://m1.auto.itc.cn/c_zoom,w_270/29762096.JPG',
            promotionId: 3,
            },
            {
            img: 'http://t13.baidu.com/it/u=2792884273,1681992034&fm=224&app=112&f=JPEG?w=500&h=253',
            promotionId: 4,
            },
            {
            img: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fdefaxingzheng.com%2FPublic%2Fuploads%2F5bea893335400.jpg&refer=http%3A%2F%2Fdefaxingzheng.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1651671705&t=2cd5538942becbf53365b23807300bdc',
            promotionId: 5,
            }
        ]
        
    },
     onLoad(){

        const layoutReady = new Promise((resolve) => {
            this.layoutResolver = resolve
        })
        Promise.all([TripService.getTrips(), layoutReady]).then(([trips]) => {
            console.log("trips:",trips)
            this.populateTrips(trips.trips!)
        })
        getApp<IAppOption>().globalData.userInfo.then(userInfo => {
            this.setData({
                avatarURL: userInfo.avatarUrl,
            })
        })
    },

    //展示该页面执行
    onShow(){
        ProfileService.getProfile().then(p =>{
            this.setData({
                licStatus: ProfileStatusMap.get(p.identityStatus||0),
            })
        })
    },

    onReady() {
        wx.createSelectorQuery().select('#heading')
            .boundingClientRect(rect => {
                const height = wx.getSystemInfoSync().windowHeight - rect.height
                this.setData({
                    tripsHeight: height,
                    navCount: Math.round(height/50),
                }, () => {
                    if (this.layoutResolver) {
                        this.layoutResolver(rect)
                    }
                })
            }).exec()
    },

    //     let trips = await TripService.getTrips()
    //     console.log("行程信息",trips.trips)
    //     this.populateTrip(trips.trips!)
    //     const userInfo = await getApp<IAppOption>().globalData.userInfo
    //      this.setData({
    //         avatarURL: userInfo.avatarUrl,
    //     })
    // },

    populateTrips(trips: rental.v1.ITripEntity[]){
        const mainItem: MainItem[] = []
        const navItem: NavItme[] = []
        let navSelect = ''
        let prevNav = ''
        for(let i = 0; i < trips.length; i++){
            const trip = trips[i]
            const mainId = 'main-' + i 
            const navId = 'nav-' + i
            const shortId =  trip.id?.substring(trip.id.length - 6)  //显示后6位
            if(!prevNav){
                prevNav = navId
            }

            // duration: trip.trip?.current?.timestampSec,
            //     fee: '200元',
            //     distance: '200KM',
            //     stutar: '进行中',

            //向将数据拿出包装
            const tripDate: Trip =  {
                id: trip.id!,
                shortId: '*****'+ shortId,
                statar: trip.trip?.start?.poiName || '未知',
                end: '',
                duration: '',
                fee: '',
                distance: '',
                stutar: TripsStatusMap.get(trip.trip?.status!)||'未知',
                inProgress: trip.trip?.status === rental.v1.TripStatus.IN_PROGRESS,
            }

            //结束行程
            const end = trip.trip?.end
            if (end){
                tripDate.end = end.poiName||'未知'
                tripDate.distance = end.kmDriven?.toFixed(1)+ '公里'
                tripDate.fee = formatfee(end.feeCent||0)
                const dur = formatDurtion((end.timestampSec||0) - (trip.trip?.start?.timestampSec||0))
                tripDate.duration = `${dur.hh}时:${dur.mm}分:${dur.ss}秒`
            }
            //放入UI
            mainItem.push({
                id: mainId,
                navId: navId,
                navScrollId:prevNav,
                data: tripDate,
            })

            navItem.push({
                id:navId,
                mainId: mainId,
                label: shortId||'',
            })
            if(i === 0){
                navSelect = navId
            }
            prevNav = navId

            for (let i = 0; i < this.data.navCount-8; i++) {
                navItem.push({
                    id: '',
                    mainId: '',
                    label: '',
                })
            }
        }
        this.setData({
            mainItem,
            navItem,
            navSelect

        }, () =>{
            this.prepareScroll()
        })
    },
    //不是很懂
    // onReady(){
    //     wx.createSelectorQuery().select('#heading')
    //         .boundingClientRect(rect =>{
    //             const height = wx.getSystemInfoSync().windowHeight - rect.height
    //             this.setData({
    //                 tripsHeight:height,
    //                 navCount: Math.round(height/50),
    //             })
    //         }).exec()
            
    // },

    getchangePage(){
        wx.navigateTo({
            url:routing.register(), //register()为可选参数
        })
    },
    onGetUserInfo(e: any){
        console.log(e)
        const userInfo: WechatMiniprogram.UserInfo = e.detail.userInfo
        getApp<IAppOption>().resolveUserInfo(userInfo)
    },

    prepareScroll(){
        wx.createSelectorQuery().selectAll('.main-item').fields({
            id: true,
            dataset: true,
            rect: true,
        }).exec(res =>{
            this.scrollStates.mainItem = res[0]
        })

    },

    onPromotionItemTap(e: any) {
        const promotionID:number = e.currentTarget.dataset.promotionId
        if (promotionID) {
            console.log('claiming promotion', promotionID)
        }
    },

    onnavitemTap(e: any){
        //数据绑定
        const mainId: string = e.currentTarget?.dataset.mainId
        //const navSelect:string = e.currentTarget?.id
        const navId: string = e.currentTarget?.id
        if(mainId && navId){
            this.setData({
                mainscroll: mainId,
                navSelect: navId,
    
            })
        }
    },

    onMainScroll(e: any){
        console.log(e)
        const top: number = e.currentTarget?.offsetTop + e.detail?.scrollTop
        if(top === undefined){
            return
        }
        const selItem = this.scrollStates.mainItem.find(Item => Item.top >= top)
        if(!selItem){
            return 
        }
        this.setData({
            navSelect: selItem.dataset.navId,
            navScroll: selItem.dataset.navScrollId,

            
        })
        
    },

    onMianItemTap(e: any) {
        if(!e.currentTarget.dataset.tripInProgress){
            console.log("拿不到:",e)
            return
        }
        const tripId = e.currentTarget.dataset.tripId
        if(tripId){
            console.log(tripId)
            wx.navigateTo({
                url: routing.driving({
                    trip_id: tripId,
                }),
            })
        }
    }
})

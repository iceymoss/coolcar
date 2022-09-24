
import { ProfileService } from "../../service/prifile"
import { rental } from "../../service/proto_gen/rental/rental_pb"
import { Coolcar } from "../../service/request"
import { padString } from "../../utils/format"
import { routing } from "../../utils/routing"

//日期格式
function formatDate(millis: number){
    const dt = new Date(millis)
    const y = dt.getFullYear()
    const m = dt.getMonth() + 1
    const d = dt.getDay()
    return `${padString(y)}-${padString(m)}-${padString(d)}`
}

Page({
     redirectURL: '',
     ProfileRefresher: 0,
    data:{
        birthDate: '2022-04-11',
        gendersIndex:0,
        genders:["未知", "男", "女"],
        licImgURL: '',
        licNo: '',
        name: '',
        state: rental.v1.IdentityStatus[rental.v1.IdentityStatus.UNSUBMITTED],
    },

    //逻辑层发送数据至渲染层
    renderProfile(p: rental.v1.IProfile){
        this.renderIdentity(p.identity!)
        this.setData({
            state: rental.v1.IdentityStatus[p.identityStatus||0],
        })
    },

    //逻辑层发送数据至渲染层
    renderIdentity(i?: rental.v1.IIdentity){
        this.setData({
            licNo: i?.licNumber||'',
            name: i?.name||'',
            gendersIndex: i?.gender||0,
            birthDate: formatDate(i?.birthDataMillis||0),
        })
    },

    onLoad(opt: Record<"redirect", string>){
        const o: routing.RegisterOpt = opt
        console.log("o的值:",o)
        if(o.redirect){
            this.redirectURL = decodeURIComponent(o.redirect)
            console.log("需要的RUL:",this.redirectURL)
        }
        ProfileService.getProfile().then(p => {
            this.renderProfile(p)
        })
        ProfileService.getProfilePhoto().then(p =>{
            this.setData({
               licImgURL: p.url || '',
            })
        })
        
    },

    //页面结束执行
    onUnload(){
        this.clearProfileRefresher()
    },
    
    //上传图片
    onUploadLic(){
        //从本地相册选择图片或使用相机拍照。
        wx.chooseImage({
            success: async res => {
                if(res.tempFilePaths.length === 0){
                    return 
                }
                    this.setData({
                        licImgURL: res.tempFilePaths[0],
                    })
                    //获取上传url
                    const photoRes = await ProfileService.createProfilePhoto()
                    console.log("上传图片地址:",photoRes.uploadUrl)
                    if (!photoRes.uploadUrl){
                        return
                    }
                    //上传
                    await Coolcar.uploadfile({
                        localPath: res.tempFilePaths[0],
                        url: photoRes.uploadUrl||'',
                    })

                    //通知服务器上传成功
                    const Identity = await ProfileService.completeProfilePhoto()
                    this.renderIdentity(Identity)
                    
                    // const photo = await ProfileService.getProfilePhoto()
                    // if (!photo){
                    //     return
                    // }
                    // this.setData({
                    //     licImgURL: photo.url||'',
                    // })
            }
        })
    },

    //驾驶证号
    onLicnoChange(e: any){
        this.setData({
            licNo: e.detail.value
        })
    },

    //填写姓名
    onNameChange(e: any){
        this.setData({
            name: e.detail.value,
        })
    },

    //选择性别
    onGenderChange(e:any){
        this.setData({
            gendersIndex: parseInt(e.detail.value),
        })
    },

    //选择出生日期
    onBirthDateChange(e:any){
        this.setData({
            birthDate: e.detail.value,
        })
    },

    //递交审核
    onSubmit(){
        ProfileService.submitProfile({
            licNumber: this.data.licNo,
            name: this.data.name,
            gender: this.data.gendersIndex,
            birthDataMillis: Date.parse(this.data.birthDate),
        }).then(p =>{
            this.renderProfile(p)
            this.scheduleProfileRefresher()
        })
    },

    //判断身份审核状态
    scheduleProfileRefresher(){
        this.ProfileRefresher = setInterval(() => {
            ProfileService.getProfile().then(p => {
                this.renderProfile(p)
                console.log("status:",p.identityStatus)
                if (p.identityStatus !== rental.v1.IdentityStatus.PENDING){
                    this.clearProfileRefresher
                }
                if (p.identityStatus === rental.v1.IdentityStatus.VERIFIED){
                    this.onlicVerified()
                    
                }
            })
        }, 1000)
    },

    //清理setInterval()定时器
    clearProfileRefresher(){
        if (this.ProfileRefresher){
            clearInterval(this.ProfileRefresher)
            this.ProfileRefresher = 0
        }
    },
       
    //重新递交
    onResubmit(){
        ProfileService.clearProfile().then(p => this.renderProfile(p))
        ProfileService.clearProfilePhoto().then(() =>{
            this.setData({
                licImgURL: '',
            })
        })
    },

    //携带参数跳转页面
    onlicVerified(){
        if(this.redirectURL){
            wx.redirectTo({
                url: this.redirectURL,
        
            })
        }
    }
})



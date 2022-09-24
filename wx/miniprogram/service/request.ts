import camelcaseKeys = require("camelcase-keys")
import { auth } from "./proto_gen/auth/auth_pb"

export namespace Coolcar{
    export const serverAddr = 'http://42.192.177.202'
    export const wsAddr = 'ws://81.69.182.24:8080'
    const AUTH_ERR = 'AUTH_ERR'
    const authData = {
        token: '',
        expiryMs: 0,
    }

    //声明接口，requestOption请求内容选项
    interface requestOption<REQ, RES>{
        method: 'GET'|'PUT'|'POST'|'DELETE',
        path: string,
        data?: REQ,
        respMarshaller: (r: object)=>RES,
    }
    //声明接口
    export interface AuthOption {
        attachAuthHeader: boolean
        renteyOnAuthERR: boolean
    }
    
    //行程业务入口
    export async function sendRequestWithAuthRetry<REQ, RES>(o: requestOption<REQ, RES>, a?: AuthOption):Promise<RES>{
        const authOpt = a || {
            attachAuthHeader: true,
            renteyOnAuthERR: true,
        }
        try{
            console.log("try:调用login")
            await login()
            return sendRequest(o, authOpt)
        } catch(err){
            console.log("catch")
            if(err === AUTH_ERR && authOpt.renteyOnAuthERR){
                authData.token = ''
                authData.expiryMs = 0
                console.log("再次调用sendRequestWithAuthRetry")
                return sendRequestWithAuthRetry(o, {
                    attachAuthHeader: authOpt.attachAuthHeader,
                    renteyOnAuthERR: false,
                })
            }else{
                throw err
            }
        }
        
    }

    //登录请求业务
    export async function login(){
        //判断token是否有效，无效需要登录请求
        console.log("判断token是否有效")
        if (authData.token && authData.expiryMs >= Date.now()) {
            return 
        }
        console.log("调用wxLoging")
        const wxResp = await wxLoging()  //login
        const reqTimeMs = Date.now()     //getnewtime
        //调用业务方法
        console.log("调用sendRequest方法")
        const resp = await sendRequest<auth.v1.ILoginRequest, auth.v1.ILoginResponse> ({
            method:'POST',
            path: '/v1/auth/login',
            data: {
                code: wxResp.code,
            },
            respMarshaller: auth.v1.LoginResponse.fromObject,
        }, {
            attachAuthHeader: false,
            renteyOnAuthERR: false,
        })
        console.log("code:",wxResp.code)
        console.log("resp:",resp)
        console.log("重置token")
        authData.token = resp.accssToken!
        //设置token有效时间
        authData.expiryMs = reqTimeMs + resp.expiresIn! * 1000
        console.log("login结束")
    }

    //内部请求业务方法，登录请求上传相应数据到后台，后台返回token和expiryMs
    function sendRequest<REQ, RES>(o: requestOption<REQ, RES>, a: AuthOption): Promise<RES> {
        return new Promise((resolve, reject) => {
            const header: Record<string, any> = {}  //声明header的一种方式
            if(a.attachAuthHeader) {
                if (authData.token && authData.expiryMs >= Date.now()) {
                    //header.authorization = 'Bearer ' + authData.token
                    header.authorization = "Bearer " + authData.token
                    console.log("token有效: ", header.token)
                } else{
                    reject(AUTH_ERR)
                    console.log("token无效")
                    return 
                }
            }
            wx.request({
                url: serverAddr + o.path,
                method: o.method,
                data: o.data,
                header,
                success: res =>{
                    console.log("data:",o.data)
                    if (res.statusCode === 401){
                        reject(AUTH_ERR)
                        console.log("401的状态")
                    }else if(res.statusCode >= 400){
                        reject(res)
                    }else{
                        resolve(o.respMarshaller(camelcaseKeys(res.data as object, {
                            deep: true,
                        })))
                    }
                },
                fail: reject
            })
        })
    }
    
    //调用微信api登录业务
    function wxLoging():Promise<WechatMiniprogram.LoginSuccessCallbackResult>{
        return new Promise((resolve, reject) =>{
            wx.login({
                success: resolve,
                fail: reject,
            })
        })
    }

    export interface UploadFileOpts {
        localPath: string
        url: string
    }
    export function uploadfile(o: UploadFileOpts): Promise<void> {
        const data = wx.getFileSystemManager().readFileSync(o.localPath)
        return new Promise((resolve, reject) => {
            wx.request({
                method: 'PUT',
                url: o.url,
                data,
                success: res => {
                    if (res.statusCode >= 400) {
                        reject(res)
                    } else {
                        resolve()
                    }
                },
                fail: reject,
            })
        })
    }
   
    
}

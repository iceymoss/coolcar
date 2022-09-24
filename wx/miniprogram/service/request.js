"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coolcar = void 0;
const camelcaseKeys = require("camelcase-keys");
const auth_pb_1 = require("./proto_gen/auth/auth_pb");
var Coolcar;
(function (Coolcar) {
    Coolcar.serverAddr = 'http://42.192.177.202';
    Coolcar.wsAddr = 'ws://81.69.182.24:8080';
    const AUTH_ERR = 'AUTH_ERR';
    const authData = {
        token: '',
        expiryMs: 0,
    };
    function sendRequestWithAuthRetry(o, a) {
        return __awaiter(this, void 0, void 0, function* () {
            const authOpt = a || {
                attachAuthHeader: true,
                renteyOnAuthERR: true,
            };
            try {
                console.log("try:调用login");
                yield login();
                return sendRequest(o, authOpt);
            }
            catch (err) {
                console.log("catch");
                if (err === AUTH_ERR && authOpt.renteyOnAuthERR) {
                    authData.token = '';
                    authData.expiryMs = 0;
                    console.log("再次调用sendRequestWithAuthRetry");
                    return sendRequestWithAuthRetry(o, {
                        attachAuthHeader: authOpt.attachAuthHeader,
                        renteyOnAuthERR: false,
                    });
                }
                else {
                    throw err;
                }
            }
        });
    }
    Coolcar.sendRequestWithAuthRetry = sendRequestWithAuthRetry;
    function login() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("判断token是否有效");
            if (authData.token && authData.expiryMs >= Date.now()) {
                return;
            }
            console.log("调用wxLoging");
            const wxResp = yield wxLoging();
            const reqTimeMs = Date.now();
            console.log("调用sendRequest方法");
            const resp = yield sendRequest({
                method: 'POST',
                path: '/v1/auth/login',
                data: {
                    code: wxResp.code,
                },
                respMarshaller: auth_pb_1.auth.v1.LoginResponse.fromObject,
            }, {
                attachAuthHeader: false,
                renteyOnAuthERR: false,
            });
            console.log("code:", wxResp.code);
            console.log("resp:", resp);
            console.log("重置token");
            authData.token = resp.accssToken;
            authData.expiryMs = reqTimeMs + resp.expiresIn * 1000;
            console.log("login结束");
        });
    }
    Coolcar.login = login;
    function sendRequest(o, a) {
        return new Promise((resolve, reject) => {
            const header = {};
            if (a.attachAuthHeader) {
                if (authData.token && authData.expiryMs >= Date.now()) {
                    header.authorization = "Bearer " + authData.token;
                    console.log("token有效: ", header.token);
                }
                else {
                    reject(AUTH_ERR);
                    console.log("token无效");
                    return;
                }
            }
            wx.request({
                url: Coolcar.serverAddr + o.path,
                method: o.method,
                data: o.data,
                header,
                success: res => {
                    console.log("data:", o.data);
                    if (res.statusCode === 401) {
                        reject(AUTH_ERR);
                        console.log("401的状态");
                    }
                    else if (res.statusCode >= 400) {
                        reject(res);
                    }
                    else {
                        resolve(o.respMarshaller(camelcaseKeys(res.data, {
                            deep: true,
                        })));
                    }
                },
                fail: reject
            });
        });
    }
    function wxLoging() {
        return new Promise((resolve, reject) => {
            wx.login({
                success: resolve,
                fail: reject,
            });
        });
    }
    function uploadfile(o) {
        const data = wx.getFileSystemManager().readFileSync(o.localPath);
        return new Promise((resolve, reject) => {
            wx.request({
                method: 'PUT',
                url: o.url,
                data,
                success: res => {
                    if (res.statusCode >= 400) {
                        reject(res);
                    }
                    else {
                        resolve();
                    }
                },
                fail: reject,
            });
        });
    }
    Coolcar.uploadfile = uploadfile;
})(Coolcar = exports.Coolcar || (exports.Coolcar = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsZ0RBQWdEO0FBQ2hELHNEQUErQztBQUUvQyxJQUFpQixPQUFPLENBeUp2QjtBQXpKRCxXQUFpQixPQUFPO0lBQ1Asa0JBQVUsR0FBRyx1QkFBdUIsQ0FBQTtJQUNwQyxjQUFNLEdBQUcsd0JBQXdCLENBQUE7SUFDOUMsTUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFBO0lBQzNCLE1BQU0sUUFBUSxHQUFHO1FBQ2IsS0FBSyxFQUFFLEVBQUU7UUFDVCxRQUFRLEVBQUUsQ0FBQztLQUNkLENBQUE7SUFnQkQsU0FBc0Isd0JBQXdCLENBQVcsQ0FBMEIsRUFBRSxDQUFjOztZQUMvRixNQUFNLE9BQU8sR0FBRyxDQUFDLElBQUk7Z0JBQ2pCLGdCQUFnQixFQUFFLElBQUk7Z0JBQ3RCLGVBQWUsRUFBRSxJQUFJO2FBQ3hCLENBQUE7WUFDRCxJQUFHO2dCQUNDLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUE7Z0JBQzFCLE1BQU0sS0FBSyxFQUFFLENBQUE7Z0JBQ2IsT0FBTyxXQUFXLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFBO2FBQ2pDO1lBQUMsT0FBTSxHQUFHLEVBQUM7Z0JBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtnQkFDcEIsSUFBRyxHQUFHLEtBQUssUUFBUSxJQUFJLE9BQU8sQ0FBQyxlQUFlLEVBQUM7b0JBQzNDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFBO29CQUNuQixRQUFRLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQTtvQkFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO29CQUMzQyxPQUFPLHdCQUF3QixDQUFDLENBQUMsRUFBRTt3QkFDL0IsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLGdCQUFnQjt3QkFDMUMs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QUFNO3dCQUNILE9BQU8sRUFBRSxDQUFBO3FCQUNaO2dCQUNMLENBQUM7Z0JBQ0QsSUFBSSxFQUFFLE1BQU07YUFDZixDQUFDLENBQUE7UUFDTixDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUM7SUFqQmUsa0JBQVUsYUFpQnpCLENBQUE7QUFHTCxDQUFDLEVBekpnQixPQUFPLEdBQVAsZUFBTyxLQUFQLGVBQU8sUUF5SnZCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNhbWVsY2FzZUtleXMgPSByZXF1aXJlKFwiY2FtZWxjYXNlLWtleXNcIilcbmltcG9ydCB7IGF1dGggfSBmcm9tIFwiLi9wcm90b19nZW4vYXV0aC9hdXRoX3BiXCJcblxuZXhwb3J0IG5hbWVzcGFjZSBDb29sY2Fye1xuICAgIGV4cG9ydCBjb25zdCBzZXJ2ZXJBZGRyID0gJ2h0dHA6Ly80Mi4xOTIuMTc3LjIwMidcbiAgICBleHBvcnQgY29uc3Qgd3NBZGRyID0gJ3dzOi8vODEuNjkuMTgyLjI0OjgwODAnXG4gICAgY29uc3QgQVVUSF9FUlIgPSAnQVVUSF9FUlInXG4gICAgY29uc3QgYXV0aERhdGEgPSB7XG4gICAgICAgIHRva2VuOiAnJyxcbiAgICAgICAgZXhwaXJ5TXM6IDAsXG4gICAgfVxuXG4gICAgLy/lo7DmmI7mjqXlj6PvvIxyZXF1ZXN0T3B0aW9u6K+35rGC5YaF5a656YCJ6aG5XG4gICAgaW50ZXJmYWNlIHJlcXVlc3RPcHRpb248UkVRLCBSRVM+e1xuICAgICAgICBtZXRob2Q6ICdHRVQnfCdQVVQnfCdQT1NUJ3wnREVMRVRFJyxcbiAgICAgICAgcGF0aDogc3RyaW5nLFxuICAgICAgICBkYXRhPzogUkVRLFxuICAgICAgICByZXNwTWFyc2hhbGxlcjogKHI6IG9iamVjdCk9PlJFUyxcbiAgICB9XG4gICAgLy/lo7DmmI7mjqXlj6NcbiAgICBleHBvcnQgaW50ZXJmYWNlIEF1dGhPcHRpb24ge1xuICAgICAgICBhdHRhY2hBdXRoSGVhZGVyOiBib29sZWFuXG4gICAgICAgIHJlbnRleU9uQXV0aEVSUjogYm9vbGVhblxuICAgIH1cbiAgICBcbiAgICAvL+ihjOeoi+S4muWKoeWFpeWPo1xuICAgIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kUmVxdWVzdFdpdGhBdXRoUmV0cnk8UkVRLCBSRVM+KG86IHJlcXVlc3RPcHRpb248UkVRLCBSRVM+LCBhPzogQXV0aE9wdGlvbik6UHJvbWlzZTxSRVM+e1xuICAgICAgICBjb25zdCBhdXRoT3B0ID0gYSB8fCB7XG4gICAgICAgICAgICBhdHRhY2hBdXRoSGVhZGVyOiB0cnVlLFxuICAgICAgICAgICAgcmVudGV5T25BdXRoRVJSOiB0cnVlLFxuICAgICAgICB9XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidHJ5Ouiwg+eUqGxvZ2luXCIpXG4gICAgICAgICAgICBhd2FpdCBsb2dpbigpXG4gICAgICAgICAgICByZXR1cm4gc2VuZFJlcXVlc3QobywgYXV0aE9wdClcbiAgICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJjYXRjaFwiKVxuICAgICAgICAgICAgaWYoZXJyID09PSBBVVRIX0VSUiAmJiBhdXRoT3B0LnJlbnRleU9uQXV0aEVSUil7XG4gICAgICAgICAgICAgICAgYXV0aERhdGEudG9rZW4gPSAnJ1xuICAgICAgICAgICAgICAgIGF1dGhEYXRhLmV4cGlyeU1zID0gMFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5YaN5qyh6LCD55Soc2VuZFJlcXVlc3RXaXRoQXV0aFJldHJ5XCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbmRSZXF1ZXN0V2l0aEF1dGhSZXRyeShvLCB7XG4gICAgICAgICAgICAgICAgICAgIGF0dGFjaEF1dGhIZWFkZXI6IGF1dGhPcHQuYXR0YWNoQXV0aEhlYWRlcixcbiAgICAgICAgICAgICAgICAgICAgcmVudGV5T25BdXRoRVJSOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuXG4gICAgLy/nmbvlvZXor7fmsYLkuJrliqFcbiAgICBleHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9naW4oKXtcbiAgICAgICAgLy/liKTmlq10b2tlbuaYr+WQpuacieaViO+8jOaXoOaViOmcgOimgeeZu+W9leivt+axglxuICAgICAgICBjb25zb2xlLmxvZyhcIuWIpOaWrXRva2Vu5piv5ZCm5pyJ5pWIXCIpXG4gICAgICAgIGlmIChhdXRoRGF0YS50b2tlbiAmJiBhdXRoRGF0YS5leHBpcnlNcyA+PSBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICByZXR1cm4gXG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coXCLosIPnlKh3eExvZ2luZ1wiKVxuICAgICAgICBjb25zdCB3eFJlc3AgPSBhd2FpdCB3eExvZ2luZygpICAvL2xvZ2luXG4gICAgICAgIGNvbnN0IHJlcVRpbWVNcyA9IERhdGUubm93KCkgICAgIC8vZ2V0bmV3dGltZVxuICAgICAgICAvL+iwg+eUqOS4muWKoeaWueazlVxuICAgICAgICBjb25zb2xlLmxvZyhcIuiwg+eUqHNlbmRSZXF1ZXN05pa55rOVXCIpXG4gICAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBzZW5kUmVxdWVzdDxhdXRoLnYxLklMb2dpblJlcXVlc3QsIGF1dGgudjEuSUxvZ2luUmVzcG9uc2U+ICh7XG4gICAgICAgICAgICBtZXRob2Q6J1BPU1QnLFxuICAgICAgICAgICAgcGF0aDogJy92MS9hdXRoL2xvZ2luJyxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBjb2RlOiB3eFJlc3AuY29kZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXNwTWFyc2hhbGxlcjogYXV0aC52MS5Mb2dpblJlc3BvbnNlLmZyb21PYmplY3QsXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGF0dGFjaEF1dGhIZWFkZXI6IGZhbHNlLFxuICAgICAgICAgICAgcmVudGV5T25BdXRoRVJSOiBmYWxzZSxcbiAgICAgICAgfSlcbiAgICAgICAgY29uc29sZS5sb2coXCJjb2RlOlwiLHd4UmVzcC5jb2RlKVxuICAgICAgICBjb25zb2xlLmxvZyhcInJlc3A6XCIscmVzcClcbiAgICAgICAgY29uc29sZS5sb2coXCLph43nva50b2tlblwiKVxuICAgICAgICBhdXRoRGF0YS50b2tlbiA9IHJlc3AuYWNjc3NUb2tlbiFcbiAgICAgICAgLy/orr7nva50b2tlbuacieaViOaXtumXtFxuICAgICAgICBhdXRoRGF0YS5leHBpcnlNcyA9IHJlcVRpbWVNcyArIHJlc3AuZXhwaXJlc0luISAqIDEwMDBcbiAgICAgICAgY29uc29sZS5sb2coXCJsb2dpbue7k+adn1wiKVxuICAgIH1cblxuICAgIC8v5YaF6YOo6K+35rGC5Lia5Yqh5pa55rOV77yM55m75b2V6K+35rGC5LiK5Lyg55u45bqU5pWw5o2u5Yiw5ZCO5Y+w77yM5ZCO5Y+w6L+U5ZuedG9rZW7lkoxleHBpcnlNc1xuICAgIGZ1bmN0aW9uIHNlbmRSZXF1ZXN0PFJFUSwgUkVTPihvOiByZXF1ZXN0T3B0aW9uPFJFUSwgUkVTPiwgYTogQXV0aE9wdGlvbik6IFByb21pc2U8UkVTPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXI6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fSAgLy/lo7DmmI5oZWFkZXLnmoTkuIDnp43mlrnlvI9cbiAgICAgICAgICAgIGlmKGEuYXR0YWNoQXV0aEhlYWRlcikge1xuICAgICAgICAgICAgICAgIGlmIChhdXRoRGF0YS50b2tlbiAmJiBhdXRoRGF0YS5leHBpcnlNcyA+PSBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vaGVhZGVyLmF1dGhvcml6YXRpb24gPSAnQmVhcmVyICcgKyBhdXRoRGF0YS50b2tlblxuICAgICAgICAgICAgICAgICAgICBoZWFkZXIuYXV0aG9yaXphdGlvbiA9IFwiQmVhcmVyIFwiICsgYXV0aERhdGEudG9rZW5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0b2tlbuacieaViDogXCIsIGhlYWRlci50b2tlbilcbiAgICAgICAgICAgICAgICB9IGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChBVVRIX0VSUilcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0b2tlbuaXoOaViFwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd3gucmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgdXJsOiBzZXJ2ZXJBZGRyICsgby5wYXRoLFxuICAgICAgICAgICAgICAgIG1ldGhvZDogby5tZXRob2QsXG4gICAgICAgICAgICAgICAgZGF0YTogby5kYXRhLFxuICAgICAgICAgICAgICAgIGhlYWRlcixcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiByZXMgPT57XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGF0YTpcIixvLmRhdGEpXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXMuc3RhdHVzQ29kZSA9PT0gNDAxKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChBVVRIX0VSUilcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiNDAx55qE54q25oCBXCIpXG4gICAgICAgICAgICAgICAgICAgIH1lbHNlIGlmKHJlcy5zdGF0dXNDb2RlID49IDQwMCl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QocmVzKVxuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoby5yZXNwTWFyc2hhbGxlcihjYW1lbGNhc2VLZXlzKHJlcy5kYXRhIGFzIG9iamVjdCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSkpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZhaWw6IHJlamVjdFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG4gICAgXG4gICAgLy/osIPnlKjlvq7kv6FhcGnnmbvlvZXkuJrliqFcbiAgICBmdW5jdGlvbiB3eExvZ2luZygpOlByb21pc2U8V2VjaGF0TWluaXByb2dyYW0uTG9naW5TdWNjZXNzQ2FsbGJhY2tSZXN1bHQ+e1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT57XG4gICAgICAgICAgICB3eC5sb2dpbih7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogcmVzb2x2ZSxcbiAgICAgICAgICAgICAgICBmYWlsOiByZWplY3QsXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgVXBsb2FkRmlsZU9wdHMge1xuICAgICAgICBsb2NhbFBhdGg6IHN0cmluZ1xuICAgICAgICB1cmw6IHN0cmluZ1xuICAgIH1cbiAgICBleHBvcnQgZnVuY3Rpb24gdXBsb2FkZmlsZShvOiBVcGxvYWRGaWxlT3B0cyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBkYXRhID0gd3guZ2V0RmlsZVN5c3RlbU1hbmFnZXIoKS5yZWFkRmlsZVN5bmMoby5sb2NhbFBhdGgpXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB3eC5yZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgICAgICAgICAgIHVybDogby51cmwsXG4gICAgICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiByZXMgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzLnN0YXR1c0NvZGUgPj0gNDAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QocmVzKVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZhaWw6IHJlamVjdCxcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuICAgXG4gICAgXG59XG4iXX0=
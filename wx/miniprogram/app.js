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
const request_1 = require("./service/request");
const util_1 = require("./utils/util");
let resolveUserInfo;
let rejectUserInfo;
App({
    globalData: {
        userInfo: new Promise((resolve, reject) => {
            resolveUserInfo = resolve;
            rejectUserInfo = reject;
        })
    },
    onLaunch() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("登录请求开始");
            request_1.Coolcar.login();
            try {
                const setting = yield util_1.getSetting();
                if (setting.authSetting['scope.userInfo']) {
                    const userInfoRes = yield util_1.getUserInfo();
                    resolveUserInfo(userInfoRes.userInfo);
                }
            }
            catch (err) {
                rejectUserInfo(err);
            }
        });
    },
    resolveUserInfo(userInfo) {
        resolveUserInfo(userInfo);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBR0EsK0NBQTJDO0FBQzNDLHVDQUFzRDtBQUV0RCxJQUFJLGVBQXNHLENBQUE7QUFDMUcsSUFBSSxjQUFzQyxDQUFBO0FBRzFDLEdBQUcsQ0FBYTtJQUNkLFVBQVUsRUFBRTtRQUNWLFFBQVEsRUFBRSxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUN4QyxlQUFlLEdBQUcsT0FBTyxDQUFBO1lBQ3pCLGNBQWMsR0FBRyxNQUFNLENBQUE7UUFDekIsQ0FBQyxDQUFDO0tBQ0g7SUFFSyxRQUFROztZQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDckIsaUJBQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtZQTBDZixJQUFJO2dCQUNGLE1BQU0sT0FBTyxHQUFHLE1BQU0saUJBQVUsRUFBRSxDQUFBO2dCQUNsQyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtvQkFDekMsTUFBTSxXQUFXLEdBQUcsTUFBTSxrQkFBVyxFQUFFLENBQUE7b0JBQ3ZDLGVBQWUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUE7aUJBQ3RDO2FBQ0Y7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDWixjQUFjLENBQUMsR0FBRyxDQUFDLENBQUE7YUFDcEI7UUFDSCxDQUFDO0tBQUE7SUFDRCxlQUFlLENBQUMsUUFBb0M7UUFDbEQsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQzNCLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBhcHAudHNcbi8vaW1wb3J0IGNhbWVsY2FzZUtleXMgPSByZXF1aXJlKFwiY2FtZWxjYXNlLWtleXNcIilcbmltcG9ydCB7IElBcHBPcHRpb24gfSBmcm9tIFwiLi9hcHBvcHRpb25cIlxuaW1wb3J0IHsgQ29vbGNhciB9IGZyb20gXCIuL3NlcnZpY2UvcmVxdWVzdFwiXG5pbXBvcnQgeyBnZXRTZXR0aW5nLCBnZXRVc2VySW5mbyB9IGZyb20gXCIuL3V0aWxzL3V0aWxcIlxuXG5sZXQgcmVzb2x2ZVVzZXJJbmZvOiAodmFsdWU6IFdlY2hhdE1pbmlwcm9ncmFtLlVzZXJJbmZvIHwgUHJvbWlzZUxpa2U8V2VjaGF0TWluaXByb2dyYW0uVXNlckluZm8+KSA9PiB2b2lkXG5sZXQgcmVqZWN0VXNlckluZm86IChyZWFzb24/OiBhbnkpID0+IHZvaWRcblxuLy8gYXBwLnRzXG5BcHA8SUFwcE9wdGlvbj4oe1xuICBnbG9iYWxEYXRhOiB7XG4gICAgdXNlckluZm86IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHJlc29sdmVVc2VySW5mbyA9IHJlc29sdmVcbiAgICAgIHJlamVjdFVzZXJJbmZvID0gcmVqZWN0XG4gICAgfSlcbiAgfSxcbiAgXG4gIGFzeW5jIG9uTGF1bmNoKCkge1xuICAgIGNvbnNvbGUubG9nKFwi55m75b2V6K+35rGC5byA5aeLXCIpXG4gICAgQ29vbGNhci5sb2dpbigpXG5cblxuICAgIC8vIHd4LmxvZ2luKHtcbiAgICAvLyAgIHN1Y2Nlc3M6IHJlcyA9PiB7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKHJlcy5jb2RlKVxuICAgIC8vICAgICAvL+WQkeWQjuWPsOWPkemAgXJlcy5jb2Rl5o2i5Y+Wb3BlbklkLCBzZXNzaW9ua2V5cywgdW5pb25JZFxuICAgIC8vICAgICB3eC5yZXF1ZXN0KHtcbiAgICAvLyAgICAgICB1cmw6ICdodHRwOi8vbG9jYWxob3N0OjgwODAvdjEvYXV0aC9sb2dpbicsXG4gICAgLy8gICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgLy8gICAgICAgZGF0YTp7XG4gICAgLy8gICAgICAgICBjb2RlOiByZXMuY29kZVxuICAgIC8vICAgICAgIH0gYXMgYXV0aC52MS5JTG9naW5SZXF1ZXN0LFxuICAgIC8vICAgICAgIHN1Y2Nlc3M6IHJlcyA9PntcbiAgICAvLyAgICAgICAgIC8vY29uc29sZS5sb2cocmVzLmRhdGEpXG4gICAgLy8gICAgICAgICBjb25zdCBsb2dpblJlc3A6IGF1dGgudjEuTG9naW5SZXNwb25zZSA9IGF1dGgudjEuTG9naW5SZXNwb25zZS5mcm9tT2JqZWN0KFxuICAgIC8vICAgICAgICAgICBjYW1lbGNhc2VLZXlzKHJlcy5kYXRhIGFzIG9iamVjdCkpXG4gICAgLy8gICAgICAgICBjb25zb2xlLmxvZyhsb2dpblJlc3ApXG4gICAgLy8gICAgICAgICB3eC5yZXF1ZXN0KHtcbiAgICAvLyAgICAgICAgICAgdXJsOidodHRwOi8vbG9jYWxob3N0OjgwODAvdjEvdHJpcCcsXG4gICAgLy8gICAgICAgICAgIG1ldGhvZDpcIlBPU1RcIixcbiAgICAvLyAgICAgICAgICAgZGF0YTp7XG4gICAgLy8gICAgICAgICAgICAgc3RhcnQ6XCLmiJHnmoTnmoTlsI/nqIvluo9cIlxuICAgIC8vICAgICAgICAgICB9IGFzIHJlbnRhbC52MS5JQ3JlYXRlVHJpcFJlcXVlc3QsXG4gICAgLy8gICAgICAgICAgIGhlYWRlcjp7XG4gICAgLy8gICAgICAgICAgICAgYXV0aG9yaXphdGlvbjogXCJCZWFyZXIgXCIgKyBsb2dpblJlc3AuYWNjc3NUb2tlbixcbiAgICAvLyAgICAgICAgICAgfSxcbiAgICAvLyAgICAgICAgICAgc3VjY2VzczogcmVzID0+e1xuICAgIC8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcylcbiAgICAvLyAgICAgICAgICAgfSxcbiAgICAvLyAgICAgICAgICAgZmFpbDogcmVzID0+e1xuICAgIC8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi6K+35rGC6ZSZ6K+vOiV2XCIsIHJlcylcbiAgICAvLyAgICAgICAgICAgfVxuICAgIC8vICAgICAgICAgfSlcbiAgICAvLyAgICAgICB9LFxuICAgIC8vICAgICAgIGZhaWw6IGNvbnNvbGUuZXJyb3IsXG4gICAgLy8gICAgIH0pXG4gICAgLy8gICB9LFxuICAgIC8vICAgZmFpbDogY29uc29sZS5lcnJvclxuICAgIC8vIH0pXG5cbiAgICAvL+iOt+WPlueUqOaIt+S/oeaBr1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzZXR0aW5nID0gYXdhaXQgZ2V0U2V0dGluZygpXG4gICAgICBpZiAoc2V0dGluZy5hdXRoU2V0dGluZ1snc2NvcGUudXNlckluZm8nXSkge1xuICAgICAgICBjb25zdCB1c2VySW5mb1JlcyA9IGF3YWl0IGdldFVzZXJJbmZvKClcbiAgICAgICAgcmVzb2x2ZVVzZXJJbmZvKHVzZXJJbmZvUmVzLnVzZXJJbmZvKVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmVqZWN0VXNlckluZm8oZXJyKVxuICAgIH1cbiAgfSxcbiAgcmVzb2x2ZVVzZXJJbmZvKHVzZXJJbmZvOiBXZWNoYXRNaW5pcHJvZ3JhbS5Vc2VySW5mbykge1xuICAgIHJlc29sdmVVc2VySW5mbyh1c2VySW5mbylcbiAgfVxufSlcbiJdfQ==
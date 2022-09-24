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
const car_1 = require("../../service/car");
const car_pb_1 = require("../../service/proto_gen/car/car_pb");
const trip_1 = require("../../service/trip");
const routing_1 = require("../../utils/routing");
const shareLocationKey = "share_location";
Page({
    carID: '',
    carRefresher: 0,
    data: {
        shareLocation: '',
        avatarURL: '',
    },
    onLoad(opt) {
        return __awaiter(this, void 0, void 0, function* () {
            const o = opt;
            this.carID = o.car_id;
            console.log("您需要开锁车辆的ID:", o.car_id);
            const userInfo = yield getApp().globalData.userInfo;
            this.setData({
                avatarURL: userInfo.avatarUrl,
            });
        });
    },
    onGetUserInfo(e) {
        console.log(e);
        const userInfo = e.detail.userInfo;
        getApp().resolveUserInfo(userInfo);
    },
    onShareLocation(e) {
        this.data.shareLocation = e.detail.value;
        wx.setStorageSync(shareLocationKey, this.data.shareLocation);
    },
    onUnlockTap() {
        wx.getLocation({
            type: 'gcj02',
            success: (loc) => __awaiter(this, void 0, void 0, function* () {
                if (!this.carID) {
                    console.error("没有carID");
                    return;
                }
                let trip;
                try {
                    trip = yield trip_1.TripService.createTrip({
                        start: loc,
                        carId: this.carID,
                        avatarUrl: this.data.shareLocation
                            ? this.data.avatarURL : '',
                    });
                    if (!trip.id) {
                        console.error("没有返回tripID:", trip);
                        return;
                    }
                }
                catch (err) {
                    wx.showToast({
                        title: "创建行程失败",
                        icon: "none"
                    });
                    return;
                }
                wx.showLoading({
                    title: "加载中",
                    mask: true,
                }),
                    this.carRefresher = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                        const c = yield car_1.CarService.getcar(this.carID);
                        if (c.status === car_pb_1.car.v1.CarStatus.UNLOCKED) {
                            this.clearCarRefresher();
                            setTimeout(() => {
                                wx.redirectTo({
                                    url: routing_1.routing.driving({
                                        trip_id: trip.id,
                                    }),
                                    complete: () => {
                                        wx.hideLoading();
                                    }
                                });
                            }, 3000);
                        }
                    }), 2000);
            }),
            fail: () => {
                wx.showToast({
                    icon: "none",
                    title: '请前往设置页授权位置信息',
                });
            },
        });
    },
    onUnload() {
        this.clearCarRefresher();
        wx.hideLoading;
    },
    clearCarRefresher() {
        if (this.carRefresher) {
            clearInterval(this.carRefresher);
            this.carRefresher = 0;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxvY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFDQSwyQ0FBOEM7QUFDOUMsK0RBQXdEO0FBRXhELDZDQUFnRDtBQUNoRCxpREFBNkM7QUFFN0MsTUFBTSxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQTtBQUV6QyxJQUFJLENBQUM7SUFDRCxLQUFLLEVBQUUsRUFBRTtJQUNULFlBQVksRUFBRSxDQUFDO0lBQ2YsSUFBSSxFQUFDO1FBQ0QsYUFBYSxFQUFFLEVBQUU7UUFDakIsU0FBUyxFQUFFLEVBQUU7S0FDaEI7SUFFSyxNQUFNLENBQUMsR0FBNkI7O1lBQ3RDLE1BQU0sQ0FBQyxHQUFvQixHQUFHLENBQUE7WUFDOUIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFBO1lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUNwQyxNQUFNLFFBQVEsR0FBRyxNQUFNLE1BQU0sRUFBYyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUE7WUFDOUQsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFDVixTQUFTLEVBQUUsUUFBUSxDQUFDLFNBQVM7YUFDaEMsQ0FBQyxDQUFBO1FBQ04sQ0FBQztLQUFBO0lBRUQsYUFBYSxDQUFDLENBQU07UUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLE1BQU0sUUFBUSxHQUErQixDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQTtRQUM5RCxNQUFNLEVBQWMsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDbEQsQ0FBQztJQUlELGVBQWUsQ0FBQyxDQUFNO1FBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFBO1FBQ3hDLEVBQUUsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUNoRSxDQUFDO0lBRUQsV0FBVztRQUVQLEVBQUUsQ0FBQyxXQUFXLENBQUM7WUFDWCxJQUFJLEVBQUMsT0FBTztZQUNaLE9BQU8sRUFBRSxDQUFNLEdBQUcsRUFBQyxFQUFFO2dCQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO29CQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUE7b0JBQ3hCLE9BQU07aUJBQ1Q7Z0JBRUQsSUFBSSxJQUEyQixDQUFBO2dCQUMvQixJQUFHO29CQUNFLElBQUksR0FBRyxNQUFNLGtCQUFXLENBQUMsVUFBVSxDQUFDO3dCQUNqQyxLQUFLLEVBQUUsR0FBRzt3QkFDVixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7d0JBQ2pCLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWE7NEJBQ3pCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQSxDQUFDLENBQUMsRUFBRTtxQkFDckMsQ0FBQyxDQUFBO29CQUNGLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFDO3dCQUNULE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFBO3dCQUNsQyxPQUFNO3FCQUNUO2lCQUNKO2dCQUFBLE9BQU0sR0FBRyxFQUFFO29CQUNSLEVBQUUsQ0FBQyxTQUFTLENBQUM7d0JBQ1QsS0FBSyxFQUFFLFFBQVE7d0JBQ2YsSUFBSSxFQUFFLE1BQU07cUJBQ2YsQ0FBQyxDQUFBO29CQUNGLE9BQU07aUJBQ1Q7Z0JBRUQsRUFBRSxDQUFDLFdBQVcsQ0FBQztvQkFDWCxLQUFLLEVBQUUsS0FBSztvQkFDWixJQUFJLEVBQUUsSUFBSTtpQkFDYixDQUFDO29CQUVGLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDLEdBQVEsRUFBRTt3QkFDdEMsTUFBTSxDQUFDLEdBQUcsTUFBTSxnQkFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7d0JBQzdDLElBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxZQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUM7NEJBQ3RDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBOzRCQUN4QixVQUFVLENBQUMsR0FBRyxFQUFFO2dDQUNaLEVBQUUsQ0FBQyxVQUFVLENBQUM7b0NBSVYsR0FBRyxFQUFFLGlCQUFPLENBQUMsT0FBTyxDQUFDO3dDQUNqQixPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUc7cUNBQ3BCLENBQUM7b0NBQ0YsUUFBUSxFQUFFLEdBQUcsRUFBRTt3Q0FDWCxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUE7b0NBQ3BCLENBQUM7aUNBQ0osQ0FBQyxDQUFBOzRCQUNOLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzt5QkFDWjtvQkFFTCxDQUFDLENBQUEsRUFBRSxJQUFJLENBQUMsQ0FBQTtZQUNoQixDQUFDLENBQUE7WUFDRCxJQUFJLEVBQUUsR0FBRyxFQUFFO2dCQUNQLEVBQUUsQ0FBQyxTQUFTLENBQUM7b0JBQ1QsSUFBSSxFQUFDLE1BQU07b0JBQ1gsS0FBSyxFQUFDLGNBQWM7aUJBQ3JCLENBQUMsQ0FBQTtZQUNSLENBQUM7U0FDSixDQUFDLENBQUE7SUFDTixDQUFDO0lBQ0QsUUFBUTtRQUNKLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO1FBQ3hCLEVBQUUsQ0FBQyxXQUFXLENBQUE7SUFDbEIsQ0FBQztJQUdELGlCQUFpQjtRQUNiLElBQUksSUFBSSxDQUFDLFlBQVksRUFBQztZQUNsQixhQUFhLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO1lBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFBO1NBQ3hCO0lBQ0wsQ0FBQztDQUNKLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElBcHBPcHRpb24gfSBmcm9tIFwiLi4vLi4vYXBwb3B0aW9uXCJcbmltcG9ydCB7IENhclNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vc2VydmljZS9jYXJcIlxuaW1wb3J0IHsgY2FyIH0gZnJvbSBcIi4uLy4uL3NlcnZpY2UvcHJvdG9fZ2VuL2Nhci9jYXJfcGJcIlxuaW1wb3J0IHsgcmVudGFsIH0gZnJvbSBcIi4uLy4uL3NlcnZpY2UvcHJvdG9fZ2VuL3JlbnRhbC9yZW50YWxfcGJcIlxuaW1wb3J0IHsgVHJpcFNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vc2VydmljZS90cmlwXCJcbmltcG9ydCB7IHJvdXRpbmcgfSBmcm9tIFwiLi4vLi4vdXRpbHMvcm91dGluZ1wiXG5cbmNvbnN0IHNoYXJlTG9jYXRpb25LZXkgPSBcInNoYXJlX2xvY2F0aW9uXCJcblxuUGFnZSh7XG4gICAgY2FySUQ6ICcnLFxuICAgIGNhclJlZnJlc2hlcjogMCxcbiAgICBkYXRhOntcbiAgICAgICAgc2hhcmVMb2NhdGlvbjogJycsXG4gICAgICAgIGF2YXRhclVSTDogJycsICAvL+WktOWDj1xuICAgIH0sXG4gICAgXG4gICAgYXN5bmMgb25Mb2FkKG9wdDogUmVjb3JkPFwiY2FyX2lkXCIsIHN0cmluZz4pe1xuICAgICAgICBjb25zdCBvOiByb3V0aW5nLkxvY2tPcHQgPSBvcHRcbiAgICAgICAgdGhpcy5jYXJJRCA9IG8uY2FyX2lkXG4gICAgICAgIGNvbnNvbGUubG9nKFwi5oKo6ZyA6KaB5byA6ZSB6L2m6L6G55qESUQ6XCIsIG8uY2FyX2lkKVxuICAgICAgICBjb25zdCB1c2VySW5mbyA9IGF3YWl0IGdldEFwcDxJQXBwT3B0aW9uPigpLmdsb2JhbERhdGEudXNlckluZm9cbiAgICAgICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICAgICAgICBhdmF0YXJVUkw6IHVzZXJJbmZvLmF2YXRhclVybCxcbiAgICAgICAgfSlcbiAgICB9LFxuXG4gICAgb25HZXRVc2VySW5mbyhlOiBhbnkpe1xuICAgICAgICBjb25zb2xlLmxvZyhlKVxuICAgICAgICBjb25zdCB1c2VySW5mbzogV2VjaGF0TWluaXByb2dyYW0uVXNlckluZm8gPSBlLmRldGFpbC51c2VySW5mb1xuICAgICAgICBnZXRBcHA8SUFwcE9wdGlvbj4oKS5yZXNvbHZlVXNlckluZm8odXNlckluZm8pXG4gICAgfSxcblxuXG5cbiAgICBvblNoYXJlTG9jYXRpb24oZTogYW55KSB7XG4gICAgICAgIHRoaXMuZGF0YS5zaGFyZUxvY2F0aW9uID0gZS5kZXRhaWwudmFsdWVcbiAgICAgICAgd3guc2V0U3RvcmFnZVN5bmMoc2hhcmVMb2NhdGlvbktleSwgdGhpcy5kYXRhLnNoYXJlTG9jYXRpb24pXG4gICAgfSxcbiAgICBcbiAgICBvblVubG9ja1RhcCgpe1xuICAgICAgICAvL+W8gOmUgeWJje+8jOiOt+WPluW9k+WJjeS9jee9ru+8jOWwhuaVsOaNruS4iuS8oOacjeWKoeWZqFxuICAgICAgICB3eC5nZXRMb2NhdGlvbih7XG4gICAgICAgICAgICB0eXBlOidnY2owMicsXG4gICAgICAgICAgICBzdWNjZXNzOiBhc3luYyBsb2MgPT57XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5jYXJJRCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIuayoeaciWNhcklEXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRyaXA6IHJlbnRhbC52MS5JVHJpcEVudGl0eVxuICAgICAgICAgICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgdHJpcCA9IGF3YWl0IFRyaXBTZXJ2aWNlLmNyZWF0ZVRyaXAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBsb2MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FySWQ6IHRoaXMuY2FySUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhdGFyVXJsOiB0aGlzLmRhdGEuc2hhcmVMb2NhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy5kYXRhLmF2YXRhclVSTDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0cmlwLmlkKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5rKh5pyJ6L+U5ZuedHJpcElEOlwiLCB0cmlwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9Y2F0Y2goZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3eC5zaG93VG9hc3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBcIuWIm+W7uuihjOeoi+Wksei0pVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb246IFwibm9uZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHd4LnNob3dMb2FkaW5nKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBcIuWKoOi9veS4rVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFzazogdHJ1ZSwgICAvL+S/neaKpOaMiemSrlxuICAgICAgICAgICAgICAgICAgICB9KSxcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhclJlZnJlc2hlciA9IHNldEludGVydmFsKGFzeW5jKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYyA9IGF3YWl0IENhclNlcnZpY2UuZ2V0Y2FyKHRoaXMuY2FySUQpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihjLnN0YXR1cyA9PT0gY2FyLnYxLkNhclN0YXR1cy5VTkxPQ0tFRCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhckNhclJlZnJlc2hlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHd4LnJlZGlyZWN0VG8oe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8v6Lez6L2s6IezZHJpdmluZ++8jOW5tuWwhnRyaXBfaWTkvKDoh7Nkcml2aW5n6aG16Z2iXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy91cmw6IGAvcGFnZXMvZHJpdmluZy9kcml2aW5nP3RyaXBfaWQ9JHt0cmlwSUR9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8v5L2/55So5by657G75Z6LXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHJvdXRpbmcuZHJpdmluZyh7ICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmlwX2lkOiB0cmlwLmlkISxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6ICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHd4LmhpZGVMb2FkaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAzMDAwKTsgXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwMClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYWlsOiAoKSA9PntcbiAgICAgICAgICAgICAgICB3eC5zaG93VG9hc3Qoe1xuICAgICAgICAgICAgICAgICAgICBpY29uOlwibm9uZVwiLCAgLy/nlKjkuo7liqDplb/kvY3nva7mkYbmlL5cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6J+ivt+WJjeW+gOiuvue9rumhteaOiOadg+S9jee9ruS/oeaBrycsXG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIG9uVW5sb2FkKCl7XG4gICAgICAgIHRoaXMuY2xlYXJDYXJSZWZyZXNoZXIoKVxuICAgICAgICB3eC5oaWRlTG9hZGluZ1xuICAgIH0sXG5cbiAgICAvL+a4heeQhuaVsOaNrlxuICAgIGNsZWFyQ2FyUmVmcmVzaGVyKCl7XG4gICAgICAgIGlmICh0aGlzLmNhclJlZnJlc2hlcil7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMuY2FyUmVmcmVzaGVyKVxuICAgICAgICAgICAgdGhpcy5jYXJSZWZyZXNoZXIgPSAwXG4gICAgICAgIH1cbiAgICB9XG59KVxuXG4iXX0=
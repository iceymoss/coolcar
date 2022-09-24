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
const prifile_1 = require("../../service/prifile");
const rental_pb_1 = require("../../service/proto_gen/rental/rental_pb");
const trip_1 = require("../../service/trip");
const routing_1 = require("../../utils/routing");
const defaultAvtat = "/resources/car.png";
const initialLat = 30;
const initialLgt = 120;
Page({
    isPageShowing: false,
    socket: undefined,
    data: {
        avatarURL: '',
        setting: {
            skew: 0,
            rotate: 0,
            showLocation: true,
            showScale: true,
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
        location: {
            latitude: initialLat,
            longitude: initialLgt,
        },
        scale: 10,
        markers: [
            {
                iconPath: "../resources/car.png",
                id: 0,
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
    onLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            const userInfo = yield getApp().globalData.userInfo;
            this.setData({
                avatarURL: userInfo.avatarUrl,
            });
        });
    },
    onMylocationTap() {
        wx.getLocation({
            type: 'gcj02',
            success: res => {
                this.setData({
                    location: {
                        latitude: res.latitude,
                        longitude: res.longitude,
                    },
                });
            },
            fail: () => {
                wx.showToast({
                    icon: "none",
                    title: '请前往设置页面授权'
                });
            }
        });
    },
    onScanClicked() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const trips = yield trip_1.TripService.getTrips(rental_pb_1.rental.v1.TripStatus.IN_PROGRESS);
            if ((((_a = trips.trips) === null || _a === void 0 ? void 0 : _a.length) || 0) > 0) {
                wx.showModal({
                    title: '行程提示',
                    content: '您有一个正在进行的行程',
                    success(res) {
                        if (res.confirm) {
                            console.log('用户点击确定');
                            wx.navigateTo({
                                url: routing_1.routing.driving({
                                    trip_id: trips.trips[0].id,
                                }),
                            });
                            return;
                        }
                        else if (res.cancel) {
                            console.log('用户点击取消');
                        }
                        return;
                    }
                });
            }
            else {
                const carID = "60af01e5a21ead3dccbcd1d8";
                const redirectURL = routing_1.routing.Lock({ car_id: carID });
                const profil = yield prifile_1.ProfileService.getProfile();
                if (profil.identityStatus === rental_pb_1.rental.v1.IdentityStatus.VERIFIED) {
                    wx.showModal({
                        title: '认证提示',
                        content: '您的身份已认证',
                        success(res) {
                            if (res.confirm) {
                                console.log('用户点击确定');
                                wx.scanCode({
                                    success: () => __awaiter(this, void 0, void 0, function* () {
                                        wx.navigateTo({
                                            url: redirectURL,
                                        });
                                    }),
                                    fail: console.error,
                                });
                                return;
                            }
                            else if (res.cancel) {
                                console.log('用户点击取消');
                            }
                            return;
                        }
                    });
                }
                else {
                    wx.scanCode({
                        success: () => __awaiter(this, void 0, void 0, function* () {
                            wx.navigateTo({
                                url: routing_1.routing.register({ redirectURL: redirectURL })
                            });
                        }),
                        fail: console.error,
                    });
                }
            }
        });
    },
    onShow() {
        this.isPageShowing = true;
        if (!this.socket) {
            this.setData({
                markers: []
            }, () => {
                this.setupCarPosUpdater();
            });
        }
    },
    onHide() {
        this.isPageShowing = false;
        if (this.socket) {
            this.socket.close({
                success: () => {
                    this.socket = undefined;
                }
            });
        }
    },
    onMyTripsTap() {
        wx.navigateTo({
            url: routing_1.routing.mytrips(),
        });
    },
    setupCarPosUpdater() {
        const map = wx.createMapContext("map");
        const markersByCarID = new Map();
        let translationInProgress = false;
        const endTranslation = () => {
            translationInProgress = false;
        };
        this.socket = car_1.CarService.subscribe(car => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            console.log("车辆实时信息:", car.car);
            if (!car.id || translationInProgress || !this.isPageShowing) {
                console.log('dropped');
                return;
            }
            const marker = markersByCarID.get(car.id);
            if (!marker) {
                const newMarker = {
                    id: this.data.markers.length,
                    iconPath: ((_b = (_a = car.car) === null || _a === void 0 ? void 0 : _a.driver) === null || _b === void 0 ? void 0 : _b.avatarUrl) || defaultAvtat,
                    latitude: ((_d = (_c = car.car) === null || _c === void 0 ? void 0 : _c.position) === null || _d === void 0 ? void 0 : _d.latitude) || initialLat,
                    longitude: ((_f = (_e = car.car) === null || _e === void 0 ? void 0 : _e.position) === null || _f === void 0 ? void 0 : _f.longitude) || initialLgt,
                    height: 20,
                    width: 20,
                };
                markersByCarID.set(car.id, newMarker);
                this.data.markers.push(newMarker);
                translationInProgress = true;
                this.setData({
                    markers: this.data.markers,
                }, endTranslation);
                return;
            }
            const newAvatar = ((_h = (_g = car.car) === null || _g === void 0 ? void 0 : _g.driver) === null || _h === void 0 ? void 0 : _h.avatarUrl) || defaultAvtat;
            const newLat = ((_k = (_j = car.car) === null || _j === void 0 ? void 0 : _j.position) === null || _k === void 0 ? void 0 : _k.latitude) || initialLat;
            const newLng = ((_m = (_l = car.car) === null || _l === void 0 ? void 0 : _l.position) === null || _m === void 0 ? void 0 : _m.longitude) || initialLgt;
            if (marker.iconPath !== newAvatar) {
                marker.iconPath = newAvatar;
                marker.latitude = newLat;
                marker.longitude = newLng;
                translationInProgress = true;
                this.setData({
                    markers: this.data.markers,
                }, endTranslation);
                return;
            }
            if (marker.latitude !== newLat || marker.longitude !== newLng) {
                translationInProgress = true;
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
                });
            }
        });
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUVBLDJDQUE4QztBQUM5QyxtREFBc0Q7QUFDdEQsd0VBQWlFO0FBQ2pFLDZDQUFnRDtBQUNoRCxpREFBNkM7QUFhN0MsTUFBTSxZQUFZLEdBQUcsb0JBQW9CLENBQUE7QUFDekMsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFBO0FBQ3JCLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQTtBQUV0QixJQUFJLENBQUM7SUFDSCxhQUFhLEVBQUMsS0FBSztJQUNuQixNQUFNLEVBQUUsU0FBcUQ7SUFFN0QsSUFBSSxFQUFFO1FBQ0osU0FBUyxFQUFFLEVBQUU7UUFDZCxPQUFPLEVBQUU7WUFDUixJQUFJLEVBQUUsQ0FBQztZQUNQLE1BQU0sRUFBRSxDQUFDO1lBQ1QsWUFBWSxFQUFFLElBQUk7WUFDbEIsU0FBUyxFQUFFLElBQUk7WUFDZixNQUFNLEVBQUUsRUFBRTtZQUNWLFVBQVUsRUFBRSxDQUFDLENBQUM7WUFDZCxVQUFVLEVBQUUsSUFBSTtZQUNoQixZQUFZLEVBQUUsSUFBSTtZQUNsQixZQUFZLEVBQUUsS0FBSztZQUNuQixXQUFXLEVBQUUsS0FBSztZQUNsQixRQUFRLEVBQUUsS0FBSztZQUNmLGlCQUFpQixFQUFFLEtBQUs7WUFDeEIsZUFBZSxFQUFFLEtBQUs7WUFDdEIsYUFBYSxFQUFFLEtBQUs7U0FDckI7UUFFRCxRQUFRLEVBQUU7WUFDUixRQUFRLEVBQUMsVUFBVTtZQUNuQixTQUFTLEVBQUUsVUFBVTtTQUN0QjtRQUVELEtBQUssRUFBRSxFQUFFO1FBRVQsT0FBTyxFQUFDO1lBQ047Z0JBQ0EsUUFBUSxFQUFFLHNCQUFzQjtnQkFDaEMsRUFBRSxFQUFDLENBQUM7Z0JBQ0osUUFBUSxFQUFFLEVBQUU7Z0JBQ1osU0FBUyxFQUFFLEdBQUc7Z0JBQ2QsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsTUFBTSxFQUFFLEVB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O2dCQUNsQixPQUFNO2FBQ1A7WUFFRCxJQUFJLE1BQU0sQ0FBQyxRQUFRLEtBQUssTUFBTSxJQUFJLE1BQU0sQ0FBQyxTQUFTLEtBQUssTUFBTSxFQUFFO2dCQUU3RCxxQkFBcUIsR0FBRyxJQUFJLENBQUE7Z0JBQzVCLEdBQUcsQ0FBQyxlQUFlLENBQUM7b0JBQ2xCLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtvQkFDbkIsV0FBVyxFQUFFO3dCQUNYLFFBQVEsRUFBRSxNQUFNO3dCQUNoQixTQUFTLEVBQUUsTUFBTTtxQkFDbEI7b0JBQ0QsVUFBVSxFQUFFLEtBQUs7b0JBQ2pCLE1BQU0sRUFBRSxDQUFDO29CQUNULFFBQVEsRUFBRSxFQUFFO29CQUNaLFlBQVksRUFBRSxjQUFjO2lCQUM3QixDQUFDLENBQUE7YUFDSDtRQUNILENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNBLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgSUFwcE9wdGlvbiB9IGZyb20gXCIuLi8uLi9hcHBvcHRpb25cIlxuaW1wb3J0IHsgQ2FyU2VydmljZSB9IGZyb20gXCIuLi8uLi9zZXJ2aWNlL2NhclwiXG5pbXBvcnQgeyBQcm9maWxlU2VydmljZSB9IGZyb20gXCIuLi8uLi9zZXJ2aWNlL3ByaWZpbGVcIlxuaW1wb3J0IHsgcmVudGFsIH0gZnJvbSBcIi4uLy4uL3NlcnZpY2UvcHJvdG9fZ2VuL3JlbnRhbC9yZW50YWxfcGJcIlxuaW1wb3J0IHsgVHJpcFNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vc2VydmljZS90cmlwXCJcbmltcG9ydCB7IHJvdXRpbmcgfSBmcm9tIFwiLi4vLi4vdXRpbHMvcm91dGluZ1wiXG5cbi8v5Zyw5Zu+5Zu+54mH5bGV56S65Y+C5pWwXG5pbnRlcmZhY2UgTWFya2VyIHtcbiAgaWNvblBhdGg6IHN0cmluZ1xuICBpZDogbnVtYmVyXG4gIGxhdGl0dWRlOiBudW1iZXJcbiAgbG9uZ2l0dWRlOiBudW1iZXJcbiAgd2lkdGg6IG51bWJlclxuICBoZWlnaHQ6IG51bWJlclxufVxuXG4vL+WcsOWbvuWbvueJh3VybFxuY29uc3QgZGVmYXVsdEF2dGF0ID0gXCIvcmVzb3VyY2VzL2Nhci5wbmdcIlxuY29uc3QgaW5pdGlhbExhdCA9IDMwXG5jb25zdCBpbml0aWFsTGd0ID0gMTIwXG5cblBhZ2Uoe1xuICBpc1BhZ2VTaG93aW5nOmZhbHNlLFxuICBzb2NrZXQ6IHVuZGVmaW5lZCBhcyBXZWNoYXRNaW5pcHJvZ3JhbS5Tb2NrZXRUYXNrIHwgdW5kZWZpbmVkLFxuXG4gIGRhdGE6IHtcbiAgICBhdmF0YXJVUkw6ICcnLFxuICAgc2V0dGluZzoge1xuICAgIHNrZXc6IDAsICBcbiAgICByb3RhdGU6IDAsXG4gICAgc2hvd0xvY2F0aW9uOiB0cnVlLCAgIC8v5bGV56S65L2N572uXG4gICAgc2hvd1NjYWxlOiB0cnVlLCAgIC8v5bGV56S65q+U5L6L5bC6XG4gICAgc3ViS2V5OiAnJyxcbiAgICBsYXllclN0eWxlOiAtMSxcbiAgICBlbmFibGVab29tOiB0cnVlLFxuICAgIGVuYWJsZVNjcm9sbDogdHJ1ZSxcbiAgICBlbmFibGVSb3RhdGU6IGZhbHNlLFxuICAgIHNob3dDb21wYXNzOiBmYWxzZSxcbiAgICBlbmFibGUzRDogZmFsc2UsXG4gICAgZW5hYmxlT3Zlcmxvb2tpbmc6IGZhbHNlLFxuICAgIGVuYWJsZVNhdGVsbGl0ZTogZmFsc2UsXG4gICAgZW5hYmxlVHJhZmZpYzogZmFsc2UsXG4gIH0sXG5cbiAgbG9jYXRpb246IHsgICAvL+W9k+WJjeS9jee9rlxuICAgIGxhdGl0dWRlOmluaXRpYWxMYXQsXG4gICAgbG9uZ2l0dWRlOiBpbml0aWFsTGd0LFxuICB9LFxuXG4gIHNjYWxlOiAxMCwgICAvL+W9k+WJjeavlOS+i+WwulxuICAvL+Wwj+i9puS9jee9rlxuICBtYXJrZXJzOltcbiAgICB7XG4gICAgaWNvblBhdGg6IFwiLi4vcmVzb3VyY2VzL2Nhci5wbmdcIixcbiAgICBpZDowLFxuICAgIGxhdGl0dWRlOiAyMyxcbiAgICBsb25naXR1ZGU6IDExMyxcbiAgICB3aWR0aDogMTUsXG4gICAgaGVpZ2h0OiAyMCxcbiAgfSxcbiAge1xuICAgIGljb25QYXRoOiBcIi4uL3Jlc291cmNlcy9jYXIucG5nXCIsXG4gICAgaWQ6IDEsXG4gICAgbGF0aXR1ZGU6IDIzLjAwMzIsXG4gICAgbG9uZ2l0dWRlOiAxMTMuMDA1LFxuICAgIHdpZHRoOiAxNSxcbiAgICBoZWlnaHQ6IDIwLFxuICB9LFxuIF1cbn0sXG5cblxuYXN5bmMgb25Mb2FkKCkge1xuICBjb25zdCB1c2VySW5mbyA9IGF3YWl0IGdldEFwcDxJQXBwT3B0aW9uPigpLmdsb2JhbERhdGEudXNlckluZm9cbiAgdGhpcy5zZXREYXRhKHtcbiAgICBhdmF0YXJVUkw6IHVzZXJJbmZvLmF2YXRhclVybCxcbiAgfSlcbn0sXG5cbi8v6I635Y+W5Yid5aeL5L2N572uL+W9k+WJjeS9jee9rlxub25NeWxvY2F0aW9uVGFwKCl7XG4gIHd4LmdldExvY2F0aW9uKHtcbiAgICB0eXBlOiAnZ2NqMDInLFxuICAgIHN1Y2Nlc3M6IHJlcyA9PntcbiAgICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICAgIC8vbG9jYXRpb27kuLrkuIDkuKrlr7nosaHnsbvlnovvvIzlnKhcbiAgICAgICAgbG9jYXRpb246IHtcbiAgICAgICAgICBsYXRpdHVkZTogcmVzLmxhdGl0dWRlLFxuICAgICAgICAgIGxvbmdpdHVkZTogcmVzLmxvbmdpdHVkZSxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfSxcbiAgICBmYWlsOiAoKSA9PntcbiAgICAgIHd4LnNob3dUb2FzdCh7XG4gICAgICAgIGljb246XCJub25lXCIsICAvL+eUqOS6juWKoOmVv+S9jee9ruaRhuaUvlxuICAgICAgICB0aXRsZTon6K+35YmN5b6A6K6+572u6aG16Z2i5o6I5p2DJ1xuICAgICAgfSlcbiAgICB9XG4gIH0pXG59LFxuXG4vL+aJq+aPj+eCueWHu1xuYXN5bmMgb25TY2FuQ2xpY2tlZCgpe1xuICBjb25zdCB0cmlwcyA9IGF3YWl0IFRyaXBTZXJ2aWNlLmdldFRyaXBzKHJlbnRhbC52MS5UcmlwU3RhdHVzLklOX1BST0dSRVNTKVxuICBpZiAoKHRyaXBzLnRyaXBzPy5sZW5ndGggIHx8IDApID4gMCl7ICAvL+aciei/m+ihjOeahOihjOeoi1xuICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgdGl0bGU6ICfooYznqIvmj5DnpLonLFxuICAgICAgY29udGVudDogJ+aCqOacieS4gOS4quato+WcqOi/m+ihjOeahOihjOeoiycsXG4gICAgICBzdWNjZXNzIChyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5jb25maXJtKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ+eUqOaIt+eCueWHu+ehruWumicpXG4gICAgICAgICAgd3gubmF2aWdhdGVUbyh7XG4gICAgICAgICAgICB1cmw6IHJvdXRpbmcuZHJpdmluZyh7XG4gICAgICAgICAgICAgIHRyaXBfaWQ6IHRyaXBzLnRyaXBzIVswXS5pZCEsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9IGVsc2UgaWYgKHJlcy5jYW5jZWwpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygn55So5oi354K55Ye75Y+W5raIJylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICB9KVxuXG4gIH1lbHNleyAgLy/msqHmnInov5vooYznmoTooYznqItcbiAgICBjb25zdCBjYXJJRCA9IFwiNjBhZjAxZTVhMjFlYWQzZGNjYmNkMWQ4XCJcbiAgICBjb25zdCByZWRpcmVjdFVSTCA9IHJvdXRpbmcuTG9jayh7Y2FyX2lkOiBjYXJJRH0pICAvL+exu+Wei+W8uuWMluabv+S7o++8mmAvcGFnZXMvbG9jay9sb2NrP2Nhcl9pZD0ke2NhcklEfWAgXG4gICAgY29uc3QgcHJvZmlsID0gYXdhaXQgUHJvZmlsZVNlcnZpY2UuZ2V0UHJvZmlsZSgpXG5cbiAgICAvL+mpvumptuiAhei6q+S7veW3suiupOivgVxuICAgIGlmIChwcm9maWwuaWRlbnRpdHlTdGF0dXMgPT09IHJlbnRhbC52MS5JZGVudGl0eVN0YXR1cy5WRVJJRklFRCl7XG4gICAgICB3eC5zaG93TW9kYWwoe1xuICAgICAgICB0aXRsZTogJ+iupOivgeaPkOekuicsXG4gICAgICAgIGNvbnRlbnQ6ICfmgqjnmoTouqvku73lt7LorqTor4EnLFxuICAgICAgICBzdWNjZXNzIChyZXMpIHtcbiAgICAgICAgICAvL+eUqOaIt+ehruWumuWQjui/m+ihjOaJq+egge+8jOi3s+i9rOiHs+W8gOmUgemhtemdolxuICAgICAgICAgIGlmIChyZXMuY29uZmlybSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+eUqOaIt+eCueWHu+ehruWumicpXG4gICAgICAgICAgICB3eC5zY2FuQ29kZSh7XG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IGFzeW5jICgpID0+e1xuICAgICAgICAgICAgICAgIC8vIGNvbnN0IHJlZGlyZWN0VVJMID0gcm91dGluZy5Mb2NrKHtjYXJfaWQ6IGNhcklEfSkgIC8v57G75Z6L5by65YyW5pu/5Luj77yaYC9wYWdlcy9sb2NrL2xvY2s/Y2FyX2lkPSR7Y2FySUR9YCBcbiAgICAgICAgICAgICAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgICAgICAgICAgICAgIHVybDogcmVkaXJlY3RVUkwsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZmFpbDpjb25zb2xlLmVycm9yLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIC8v55So5oi354K55Ye75Y+W5raIXG4gICAgICAgICAgfSBlbHNlIGlmIChyZXMuY2FuY2VsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn55So5oi354K55Ye75Y+W5raIJylcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgLy/nlKjmiLfouqvku73mnKrorqTor4FcbiAgICBlbHNle1xuICAgICAgLy/kv53nlZnlvZPliY3pobXpnaLvvIzot7PovazliLDlupTnlKjlhoXnmoRyZWdpc3RlcumhtemdolxuICAgICAgd3guc2NhbkNvZGUoe1xuICAgICAgICBzdWNjZXNzOiBhc3luYyAoKSA9PntcbiAgICAgICAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgICAgICAgIC8v6Lez6L2s6IezbG9ja+mhtemdouWJjeWQkei3s+i9rOiHs3JlZ2lzdGVy6aG16Z2i77yM5bm25bCGY2FySUTmlL7lnKhyZWRpcmVjdFVSTOS4reS8oOiHs3JlZ2lzdGVy6aG16Z2iXG4gICAgICAgICAgICAvL+acgOWQjuWwhmNhcklE5Lyg6IezbG9ja+mhtemdolxuICAgICAgICAgICAgLy/nsbvlnovlvLrljJbmm7/ku6PvvJpgL3BhZ2VzL3JlZ2lzdGVyL3JlZ2lzdGVyP3JlZGlyZWN0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHJlZGlyZWN0VVJMKX1gIFxuICAgICAgICAgICAgdXJsOiByb3V0aW5nLnJlZ2lzdGVyKHtyZWRpcmVjdFVSTDpyZWRpcmVjdFVSTH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgICAgZmFpbDpjb25zb2xlLmVycm9yLFxuICAgICAgfSlcbiAgfVxufVxufSxcblxuXG5vblNob3coKXtcbiAgdGhpcy5pc1BhZ2VTaG93aW5nID0gdHJ1ZTtcbiAgaWYgKCF0aGlzLnNvY2tldCl7XG4gICAgdGhpcy5zZXREYXRhKHtcbiAgICAgIG1hcmtlcnM6IFtdXG4gICAgfSwoKT0+e1xuICAgICAgdGhpcy5zZXR1cENhclBvc1VwZGF0ZXIoKVxuICAgIH0pXG4gIH1cbn0sXG5cbm9uSGlkZSgpe1xuICB0aGlzLmlzUGFnZVNob3dpbmcgPSBmYWxzZTtcbiAgaWYgKHRoaXMuc29ja2V0KXtcbiAgICB0aGlzLnNvY2tldC5jbG9zZSh7XG4gICAgICBzdWNjZXNzOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuc29ja2V0ID0gdW5kZWZpbmVkXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG59LFxuXG5vbk15VHJpcHNUYXAoKXtcbiAgd3gubmF2aWdhdGVUbyh7XG4gICAgdXJsOiByb3V0aW5nLm15dHJpcHMoKSxcbiAgfSlcbn0sXG5cbi8v6L2m6L6G5L2N572u5Zyo5Zyw5Zu+5LiK5a6e5pe25pu05pawXG5zZXR1cENhclBvc1VwZGF0ZXIoKSB7XG4gIGNvbnN0IG1hcCA9IHd4LmNyZWF0ZU1hcENvbnRleHQoXCJtYXBcIilcbiAgY29uc3QgbWFya2Vyc0J5Q2FySUQgPSBuZXcgTWFwPHN0cmluZywgTWFya2VyPigpXG4gIGxldCB0cmFuc2xhdGlvbkluUHJvZ3Jlc3MgPSBmYWxzZVxuICBjb25zdCBlbmRUcmFuc2xhdGlvbiA9ICgpID0+IHtcbiAgICB0cmFuc2xhdGlvbkluUHJvZ3Jlc3MgPSBmYWxzZVxuICB9XG4gIC8v5L2/55Sod2Vic29ja2V06ZW/6L+e77yM5bCG6L2m6L6G5L2N572u5L+h5oGv5a6e5pe25Lqk5LqSXG4gIHRoaXMuc29ja2V0ID0gQ2FyU2VydmljZS5zdWJzY3JpYmUoY2FyID0+IHtcbiAgICBjb25zb2xlLmxvZyhcIui9pui+huWunuaXtuS/oeaBrzpcIiwgY2FyLmNhcilcbiAgICBpZiAoIWNhci5pZCB8fCB0cmFuc2xhdGlvbkluUHJvZ3Jlc3MgfHwgIXRoaXMuaXNQYWdlU2hvd2luZykge1xuICAgICAgY29uc29sZS5sb2coJ2Ryb3BwZWQnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IG1hcmtlciA9IG1hcmtlcnNCeUNhcklELmdldChjYXIuaWQpXG4gICAgaWYgKCFtYXJrZXIpIHtcbiAgICAgIC8vIEluc2VydCBuZXcgbWFya2VyLlxuICAgICAgY29uc3QgbmV3TWFya2VyOiBNYXJrZXIgPSB7XG4gICAgICAgIGlkOiB0aGlzLmRhdGEubWFya2Vycy5sZW5ndGgsXG4gICAgICAgIGljb25QYXRoOiBjYXIuY2FyPy5kcml2ZXI/LmF2YXRhclVybCB8fCBkZWZhdWx0QXZ0YXQsXG4gICAgICAgIGxhdGl0dWRlOiBjYXIuY2FyPy5wb3NpdGlvbj8ubGF0aXR1ZGUgfHwgaW5pdGlhbExhdCxcbiAgICAgICAgbG9uZ2l0dWRlOiBjYXIuY2FyPy5wb3NpdGlvbj8ubG9uZ2l0dWRlIHx8IGluaXRpYWxMZ3QsXG4gICAgICAgIGhlaWdodDogMjAsXG4gICAgICAgIHdpZHRoOiAyMCxcbiAgICAgIH1cbiAgICAgIG1hcmtlcnNCeUNhcklELnNldChjYXIuaWQsIG5ld01hcmtlcilcbiAgICAgIHRoaXMuZGF0YS5tYXJrZXJzLnB1c2gobmV3TWFya2VyKVxuICAgICAgdHJhbnNsYXRpb25JblByb2dyZXNzID0gdHJ1ZVxuICAgICAgdGhpcy5zZXREYXRhKHtcbiAgICAgICAgbWFya2VyczogdGhpcy5kYXRhLm1hcmtlcnMsXG4gICAgICB9LCBlbmRUcmFuc2xhdGlvbilcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IG5ld0F2YXRhciA9IGNhci5jYXI/LmRyaXZlcj8uYXZhdGFyVXJsIHx8IGRlZmF1bHRBdnRhdFxuICAgIGNvbnN0IG5ld0xhdCA9IGNhci5jYXI/LnBvc2l0aW9uPy5sYXRpdHVkZSB8fCBpbml0aWFsTGF0XG4gICAgY29uc3QgbmV3TG5nID0gY2FyLmNhcj8ucG9zaXRpb24/LmxvbmdpdHVkZSB8fCBpbml0aWFsTGd0XG4gICAgaWYgKG1hcmtlci5pY29uUGF0aCAhPT0gbmV3QXZhdGFyKSB7XG4gICAgICAvLyBDaGFuZ2UgaWNvblBhdGggYW5kIHBvc3NpYmx5IHBvc2l0aW9uLlxuICAgICAgbWFya2VyLmljb25QYXRoID0gbmV3QXZhdGFyXG4gICAgICBtYXJrZXIubGF0aXR1ZGUgPSBuZXdMYXRcbiAgICAgIG1hcmtlci5sb25naXR1ZGUgPSBuZXdMbmdcbiAgICAgIHRyYW5zbGF0aW9uSW5Qcm9ncmVzcyA9IHRydWVcbiAgICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICAgIG1hcmtlcnM6IHRoaXMuZGF0YS5tYXJrZXJzLFxuICAgICAgfSwgZW5kVHJhbnNsYXRpb24pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAobWFya2VyLmxhdGl0dWRlICE9PSBuZXdMYXQgfHwgbWFya2VyLmxvbmdpdHVkZSAhPT0gbmV3TG5nKSB7XG4gICAgICAvLyBNb3ZlIG1hcmtlci5cbiAgICAgIHRyYW5zbGF0aW9uSW5Qcm9ncmVzcyA9IHRydWVcbiAgICAgIG1hcC50cmFuc2xhdGVNYXJrZXIoe1xuICAgICAgICBtYXJrZXJJZDogbWFya2VyLmlkLFxuICAgICAgICBkZXN0aW5hdGlvbjoge1xuICAgICAgICAgIGxhdGl0dWRlOiBuZXdMYXQsXG4gICAgICAgICAgbG9uZ2l0dWRlOiBuZXdMbmcsXG4gICAgICAgIH0sXG4gICAgICAgIGF1dG9Sb3RhdGU6IGZhbHNlLFxuICAgICAgICByb3RhdGU6IDAsXG4gICAgICAgIGR1cmF0aW9uOiA4MCxcbiAgICAgICAgYW5pbWF0aW9uRW5kOiBlbmRUcmFuc2xhdGlvbixcbiAgICAgIH0pXG4gICAgfVxuICB9KVxufSxcbn0pXG5cbiJdfQ==
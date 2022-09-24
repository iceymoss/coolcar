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
const rental_pb_1 = require("../../service/proto_gen/rental/rental_pb");
const trip_1 = require("../../service/trip");
const format_1 = require("../../utils/format");
const routing_1 = require("../../utils/routing");
const updateIntervalSec = 5;
function DurationStr(sec) {
    const dur = format_1.formatDurtion(sec);
    return `${dur.hh}:${dur.mm}:${dur.ss}`;
}
Page({
    timer: undefined,
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
    onLoad(opt) {
        const o = opt;
        this.tripID = o.trip_id;
        console.log("记录行程", o.trip_id);
        trip_1.TripService.getTrip(o.trip_id).then(console.log);
        console.log("gettrip sussesful");
        this.setupLocationUpdator();
        this.setupTimer(this.tripID);
    },
    onUnload() {
        wx.stopLocationUpdate();
        if (this.timer) {
            clearInterval(this.timer);
        }
    },
    onEndTripTap() {
        trip_1.TripService.finishTrip(this.tripID).then(() => {
            wx.showLoading({
                title: "加载中",
                mask: true,
            }),
                setTimeout(() => {
                    wx.redirectTo({
                        url: routing_1.routing.mytrips(),
                        complete: () => {
                            wx.hideLoading();
                        }
                    });
                }, 3000);
        }).catch(err => {
            console.error(err);
            wx.showToast({
                title: "结束行程失败",
                icon: "none",
            });
        });
    },
    setupLocationUpdator() {
        wx.startLocationUpdate({
            fail: console.error,
        });
        wx.onLocationChange(loc => {
            console.log("location:", loc);
            this.setData({
                location: {
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                },
            });
        });
    },
    setupTimer(tripID) {
        return __awaiter(this, void 0, void 0, function* () {
            const trip = yield trip_1.TripService.getTrip(tripID);
            if (trip.status !== rental_pb_1.rental.v1.TripStatus.IN_PROGRESS) {
                console.log("该行程不在进行中");
                return;
            }
            let secSinceLastUp = 0;
            let latUpdateDurationSec = trip.current.timestampSec - trip.start.timestampSec;
            this.setData({
                elapsed: DurationStr(latUpdateDurationSec),
                fee: format_1.formatfee(trip.current.feeCent)
            });
            this.timer = setInterval(() => {
                secSinceLastUp++;
                if (secSinceLastUp % 5 === 0) {
                    trip_1.TripService.getTrip(tripID).then(trip => {
                        var _a, _b, _c, _d;
                        console.log((_a = trip.current) === null || _a === void 0 ? void 0 : _a.feeCent);
                        latUpdateDurationSec = ((_b = trip.current) === null || _b === void 0 ? void 0 : _b.timestampSec) - ((_c = trip.start) === null || _c === void 0 ? void 0 : _c.timestampSec);
                        secSinceLastUp = 0;
                        this.setData({
                            fee: format_1.formatfee((_d = trip.current) === null || _d === void 0 ? void 0 : _d.feeCent),
                            location: this.data.location
                        });
                    }).catch(console.error);
                }
                this.setData({
                    elapsed: DurationStr(latUpdateDurationSec + updateIntervalSec),
                });
            }, 1000);
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJpdmluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRyaXZpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx3RUFBaUU7QUFDakUsNkNBQWdEO0FBQ2hELCtDQUE2RDtBQUM3RCxpREFBNkM7QUFFN0MsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLENBQUE7QUFDM0IsU0FBUyxXQUFXLENBQUMsR0FBVztJQUM1QixNQUFNLEdBQUcsR0FBRyxzQkFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzlCLE9BQU8sR0FBRyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFBO0FBRzFDLENBQUM7QUFFRCxJQUFJLENBQUM7SUFDRCxLQUFLLEVBQUUsU0FBNkI7SUFDcEMsTUFBTSxFQUFFLEVBQUU7SUFFVixJQUFJLEVBQUU7UUFDRixRQUFRLEVBQUU7WUFDTixRQUFRLEVBQUUsa0JBQWtCO1lBQzVCLFNBQVMsRUFBRSxrQkFBa0I7U0FDaEM7UUFDRCxLQUFLLEVBQUUsRUFBRTtRQUNULE9BQU8sRUFBRSxVQUFVO1FBQ25CLEdBQUcsRUFBRSxPQUFPO0tBQ2Y7SUFHRCxNQUFNLENBQUMsR0FBOEI7UUFDakMsTUFBTSxDQUFDLEdBQXVCLEdBQUcsQ0FBQTtRQUVqQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUE7UUFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQzlCLGtCQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUNoQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQTtRQUMzQixJQUFJLENBQUMs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Q0FBQSxNQUFBLElBQUksQ0FBQyxPQUFPLDBDQUFFLFlBQWEsS0FBRyxNQUFBLElBQUksQ0FBQyxLQUFLLDBDQUFFLFlBQWEsQ0FBQSxDQUFBO3dCQUM5RSxjQUFjLEdBQUcsQ0FBQyxDQUFBO3dCQUNsQixJQUFJLENBQUMsT0FBTyxDQUFDOzRCQUNULEdBQUcsRUFBRSxrQkFBUyxDQUFDLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsT0FBUSxDQUFDOzRCQUN0QyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRO3lCQUMvQixDQUFDLENBQUE7b0JBQ04sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtpQkFFMUI7Z0JBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQztvQkFDVCxPQUFPLEVBQUUsV0FBVyxDQUFDLG9CQUFvQixHQUFHLGlCQUFpQixDQUFDO2lCQUNqRSxDQUFDLENBQUE7WUFDTixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFDWixDQUFDO0tBQUE7Q0FDSixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZW50YWwgfSBmcm9tIFwiLi4vLi4vc2VydmljZS9wcm90b19nZW4vcmVudGFsL3JlbnRhbF9wYlwiXG5pbXBvcnQgeyBUcmlwU2VydmljZSB9IGZyb20gXCIuLi8uLi9zZXJ2aWNlL3RyaXBcIlxuaW1wb3J0IHsgZm9ybWF0RHVydGlvbiwgZm9ybWF0ZmVlIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2Zvcm1hdFwiXG5pbXBvcnQgeyByb3V0aW5nIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3JvdXRpbmdcIlxuXG5jb25zdCB1cGRhdGVJbnRlcnZhbFNlYyA9IDVcbmZ1bmN0aW9uIER1cmF0aW9uU3RyKHNlYzogbnVtYmVyKXtcbiAgICBjb25zdCBkdXIgPSBmb3JtYXREdXJ0aW9uKHNlYylcbiAgICByZXR1cm4gYCR7ZHVyLmhofToke2R1ci5tbX06JHtkdXIuc3N9YFxuXG5cbn1cblxuUGFnZSh7XG4gICAgdGltZXI6IHVuZGVmaW5lZCBhcyBudW1iZXJ8dW5kZWZpbmVkLFxuICAgIHRyaXBJRDogJycsXG5cbiAgICBkYXRhOiB7XG4gICAgICAgIGxvY2F0aW9uOiB7XG4gICAgICAgICAgICBsYXRpdHVkZTogNDAuNzU2ODI1NTIxMTE1MzYzLFxuICAgICAgICAgICAgbG9uZ2l0dWRlOiAxMjEuNjcyMjIxMTQ3ODYwNTMsXG4gICAgICAgIH0sXG4gICAgICAgIHNjYWxlOiAxMCxcbiAgICAgICAgZWxhcHNlZDogJzAwOjAwOjAwJyxcbiAgICAgICAgZmVlOiAnMDAuMDAnLFxuICAgIH0sXG5cbiAgICAvL+mhtemdoui1t+Wni++8jG9wdOS4uuS4iuS4qumhtemdouS8oOmAgeaVsOaNrlxuICAgIG9uTG9hZChvcHQ6IFJlY29yZDwndHJpcF9pZCcsIHN0cmluZz4peyAgLy9SZWNvcmQ8J3RyaXBfaWQnLCBzdHJpbmc+6KGo56S6cmlwX2lk5Li6c3RyaW5n57G75Z6LXG4gICAgICAgIGNvbnN0IG86IHJvdXRpbmcuRHJpdmluZ09wdCA9IG9wdFxuICAgICAgICAvL28udHJpcF9pZCA9IFwiNjI0NTcyOWFkNmJhOTQ1NGJkMDkzMWQzXCJcbiAgICAgICAgdGhpcy50cmlwSUQgPSBvLnRyaXBfaWRcbiAgICAgICAgY29uc29sZS5sb2coXCLorrDlvZXooYznqItcIiwgby50cmlwX2lkKVxuICAgICAgICBUcmlwU2VydmljZS5nZXRUcmlwKG8udHJpcF9pZCkudGhlbihjb25zb2xlLmxvZylcbiAgICAgICAgY29uc29sZS5sb2coXCJnZXR0cmlwIHN1c3Nlc2Z1bFwiKVxuICAgICAgICB0aGlzLnNldHVwTG9jYXRpb25VcGRhdG9yKClcbiAgICAgICAgdGhpcy5zZXR1cFRpbWVyKHRoaXMudHJpcElEKVxuICAgIH0sXG5cbiAgICBvblVubG9hZCgpe1xuICAgICAgICB3eC5zdG9wTG9jYXRpb25VcGRhdGUoKVxuICAgICAgICBpZih0aGlzLnRpbWVyKXtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy50aW1lcilcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkVuZFRyaXBUYXAoKXtcbiAgICAgICAgVHJpcFNlcnZpY2UuZmluaXNoVHJpcCh0aGlzLnRyaXBJRCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB3eC5zaG93TG9hZGluZyh7XG4gICAgICAgICAgICAgICAgdGl0bGU6IFwi5Yqg6L295LitXCIsXG4gICAgICAgICAgICAgICAgbWFzazogdHJ1ZSwgICAvL+S/neaKpOaMiemSrlxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB3eC5yZWRpcmVjdFRvKHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiByb3V0aW5nLm15dHJpcHMoKSxcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6ICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgd3guaGlkZUxvYWRpbmcoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sIDMwMDApOyBcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+e1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpXG4gICAgICAgICAgICB3eC5zaG93VG9hc3Qoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiBcIue7k+adn+ihjOeoi+Wksei0pVwiLFxuICAgICAgICAgICAgICAgIGljb246IFwibm9uZVwiLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9LFxuXG4gICAgc2V0dXBMb2NhdGlvblVwZGF0b3IoKXtcbiAgICAgICAgLy/otbflp4vkvY3nva5cbiAgICAgICAgd3guc3RhcnRMb2NhdGlvblVwZGF0ZSh7XG4gICAgICAgICAgICBmYWlsOiBjb25zb2xlLmVycm9yLFxuICAgICAgICB9KVxuICAgICAgICAvL+WunuaXtuabtOaWsOS9jee9rlxuICAgICAgICB3eC5vbkxvY2F0aW9uQ2hhbmdlKGxvYyA9PntcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibG9jYXRpb246XCIsIGxvYylcbiAgICAgICAgICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICAgICAgICAgICAgbG9jYXRpb246e1xuICAgICAgICAgICAgICAgICAgICBsYXRpdHVkZTogbG9jLmxhdGl0dWRlLFxuICAgICAgICAgICAgICAgICAgICBsb25naXR1ZGU6bG9jLmxvbmdpdHVkZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIC8v5a6a5pyf5ZCR5omn6KGM6K+l5Ye95pWwXG4gICAgYXN5bmMgc2V0dXBUaW1lcih0cmlwSUQ6IHN0cmluZyl7XG4gICAgICAgIGNvbnN0IHRyaXAgPSBhd2FpdCBUcmlwU2VydmljZS5nZXRUcmlwKHRyaXBJRClcbiAgICAgICAgLy/lr7nooYznqIvnirbmgIHov5vooYzkv53miqRcbiAgICAgICAgaWYgKHRyaXAuc3RhdHVzICE9PSByZW50YWwudjEuVHJpcFN0YXR1cy5JTl9QUk9HUkVTUyl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIuivpeihjOeoi+S4jeWcqOi/m+ihjOS4rVwiKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgbGV0IHNlY1NpbmNlTGFzdFVwID0gMCAgICAgICAgICAgICAgICAgICAgICAvL+abtOaWsOaXtumXtFxuICAgICAgICBsZXQgbGF0VXBkYXRlRHVyYXRpb25TZWMgPSB0cmlwLmN1cnJlbnQhLnRpbWVzdGFtcFNlYyEgLSB0cmlwLnN0YXJ0IS50aW1lc3RhbXBTZWMhICAgLy/kuIrkuIDmrKHmm7TmlrDnmoTmlbDmja5cbiBcbiAgICAgICAgdGhpcy5zZXREYXRhKHtcbiAgICAgICAgICAgIGVsYXBzZWQ6IER1cmF0aW9uU3RyKGxhdFVwZGF0ZUR1cmF0aW9uU2VjKSxcbiAgICAgICAgICAgIGZlZTogZm9ybWF0ZmVlKHRyaXAuY3VycmVudCEuZmVlQ2VudCEpXG4gICAgICAgIH0pXG5cbiAgICAgICAgdGhpcy50aW1lciA9IHNldEludGVydmFsKCgpID0+e1xuICAgICAgICAgICAgc2VjU2luY2VMYXN0VXArK1xuICAgICAgICAgICAgaWYgKHNlY1NpbmNlTGFzdFVwICUgNSA9PT0gMCl7XG4gICAgICAgICAgICAgICAgVHJpcFNlcnZpY2UuZ2V0VHJpcCh0cmlwSUQpLnRoZW4odHJpcCA9PntcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codHJpcC5jdXJyZW50Py5mZWVDZW50KVxuICAgICAgICAgICAgICAgICAgICBsYXRVcGRhdGVEdXJhdGlvblNlYyA9IHRyaXAuY3VycmVudD8udGltZXN0YW1wU2VjISAtIHRyaXAuc3RhcnQ/LnRpbWVzdGFtcFNlYyFcbiAgICAgICAgICAgICAgICAgICAgc2VjU2luY2VMYXN0VXAgPSAwXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBmZWU6IGZvcm1hdGZlZSh0cmlwLmN1cnJlbnQ/LmZlZUNlbnQhKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uOiB0aGlzLmRhdGEubG9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KS5jYXRjaChjb25zb2xlLmVycm9yKVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldERhdGEoe1xuICAgICAgICAgICAgICAgIGVsYXBzZWQ6IER1cmF0aW9uU3RyKGxhdFVwZGF0ZUR1cmF0aW9uU2VjICsgdXBkYXRlSW50ZXJ2YWxTZWMpLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSwgMTAwMClcbiAgICB9XG59KVxuXG5cbiJdfQ==
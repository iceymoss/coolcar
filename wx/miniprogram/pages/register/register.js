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
const prifile_1 = require("../../service/prifile");
const rental_pb_1 = require("../../service/proto_gen/rental/rental_pb");
const request_1 = require("../../service/request");
const format_1 = require("../../utils/format");
function formatDate(millis) {
    const dt = new Date(millis);
    const y = dt.getFullYear();
    const m = dt.getMonth() + 1;
    const d = dt.getDay();
    return `${format_1.padString(y)}-${format_1.padString(m)}-${format_1.padString(d)}`;
}
Page({
    redirectURL: '',
    ProfileRefresher: 0,
    data: {
        birthDate: '2022-04-11',
        gendersIndex: 0,
        genders: ["未知", "男", "女"],
        licImgURL: '',
        licNo: '',
        name: '',
        state: rental_pb_1.rental.v1.IdentityStatus[rental_pb_1.rental.v1.IdentityStatus.UNSUBMITTED],
    },
    renderProfile(p) {
        this.renderIdentity(p.identity);
        this.setData({
            state: rental_pb_1.rental.v1.IdentityStatus[p.identityStatus || 0],
        });
    },
    renderIdentity(i) {
        this.setData({
            licNo: (i === null || i === void 0 ? void 0 : i.licNumber) || '',
            name: (i === null || i === void 0 ? void 0 : i.name) || '',
            gendersIndex: (i === null || i === void 0 ? void 0 : i.gender) || 0,
            birthDate: formatDate((i === null || i === void 0 ? void 0 : i.birthDataMillis) || 0),
        });
    },
    onLoad(opt) {
        const o = opt;
        console.log("o的值:", o);
        if (o.redirect) {
            this.redirectURL = decodeURIComponent(o.redirect);
            console.log("需要的RUL:", this.redirectURL);
        }
        prifile_1.ProfileService.getProfile().then(p => {
            this.renderProfile(p);
        });
        prifile_1.ProfileService.getProfilePhoto().then(p => {
            this.setData({
                licImgURL: p.url || '',
            });
        });
    },
    onUnload() {
        this.clearProfileRefresher();
    },
    onUploadLic() {
        wx.chooseImage({
            success: (res) => __awaiter(this, void 0, void 0, function* () {
                if (res.tempFilePaths.length === 0) {
                    return;
                }
                this.setData({
                    licImgURL: res.tempFilePaths[0],
                });
                const photoRes = yield prifile_1.ProfileService.createProfilePhoto();
                console.log("上传图片地址:", photoRes.uploadUrl);
                if (!photoRes.uploadUrl) {
                    return;
                }
                yield request_1.Coolcar.uploadfile({
                    localPath: res.tempFilePaths[0],
                    url: photoRes.uploadUrl || '',
                });
                const Identity = yield prifile_1.ProfileService.completeProfilePhoto();
                this.renderIdentity(Identity);
            })
        });
    },
    onLicnoChange(e) {
        this.setData({
            licNo: e.detail.value
        });
    },
    onNameChange(e) {
        this.setData({
            name: e.detail.value,
        });
    },
    onGenderChange(e) {
        this.setData({
            gendersIndex: parseInt(e.detail.value),
        });
    },
    onBirthDateChange(e) {
        this.setData({
            birthDate: e.detail.value,
        });
    },
    onSubmit() {
        prifile_1.ProfileService.submitProfile({
            licNumber: this.data.licNo,
            name: this.data.name,
            gender: this.data.gendersIndex,
            birthDataMillis: Date.parse(this.data.birthDate),
        }).then(p => {
            this.renderProfile(p);
            this.scheduleProfileRefresher();
        });
    },
    scheduleProfileRefresher() {
        this.ProfileRefresher = setInterval(() => {
            prifile_1.ProfileService.getProfile().then(p => {
                this.renderProfile(p);
                console.log("status:", p.identityStatus);
                if (p.identityStatus !== rental_pb_1.rental.v1.IdentityStatus.PENDING) {
                    this.clearProfileRefresher;
                }
                if (p.identityStatus === rental_pb_1.rental.v1.IdentityStatus.VERIFIED) {
                    this.onlicVerified();
                }
            });
        }, 1000);
    },
    clearProfileRefresher() {
        if (this.ProfileRefresher) {
            clearInterval(this.ProfileRefresher);
            this.ProfileRefresher = 0;
        }
    },
    onResubmit() {
        prifile_1.ProfileService.clearProfile().then(p => this.renderProfile(p));
        prifile_1.ProfileService.clearProfilePhoto().then(() => {
            this.setData({
                licImgURL: '',
            });
        });
    },
    onlicVerified() {
        if (this.redirectURL) {
            wx.redirectTo({
                url: this.redirectURL,
            });
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZWdpc3Rlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUNBLG1EQUFzRDtBQUN0RCx3RUFBaUU7QUFDakUsbURBQStDO0FBQy9DLCtDQUE4QztBQUk5QyxTQUFTLFVBQVUsQ0FBQyxNQUFjO0lBQzlCLE1BQU0sRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUMxQixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQzNCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtJQUNyQixPQUFPLEdBQUcsa0JBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxrQkFBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLGtCQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUM1RCxDQUFDO0FBRUQsSUFBSSxDQUFDO0lBQ0EsV0FBVyxFQUFFLEVBQUU7SUFDZixnQkFBZ0IsRUFBRSxDQUFDO0lBQ3BCLElBQUksRUFBQztRQUNELFNBQVMsRUFBRSxZQUFZO1FBQ3ZCLFlBQVksRUFBQyxDQUFDO1FBQ2QsT0FBTyxFQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7UUFDeEIsU0FBUyxFQUFFLEVBQUU7UUFDYixLQUFLLEVBQUUsRUFBRTtRQUNULElBQUksRUFBRSxFQUFFO1FBQ1IsS0FBSyxFQUFFLGtCQUFNLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxrQkFBTSxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDO0tBQ3hFO0lBR0QsYUFBYSxDQUFDLENBQXFCO1FBQy9CLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLFFBQVMsQ0FBQyxDQUFBO1FBQ2hDLElBQUksQ0FB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O0lBQ0wsQ0FBQztDQUNKLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgUHJvZmlsZVNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vc2VydmljZS9wcmlmaWxlXCJcbmltcG9ydCB7IHJlbnRhbCB9IGZyb20gXCIuLi8uLi9zZXJ2aWNlL3Byb3RvX2dlbi9yZW50YWwvcmVudGFsX3BiXCJcbmltcG9ydCB7IENvb2xjYXIgfSBmcm9tIFwiLi4vLi4vc2VydmljZS9yZXF1ZXN0XCJcbmltcG9ydCB7IHBhZFN0cmluZyB9IGZyb20gXCIuLi8uLi91dGlscy9mb3JtYXRcIlxuaW1wb3J0IHsgcm91dGluZyB9IGZyb20gXCIuLi8uLi91dGlscy9yb3V0aW5nXCJcblxuLy/ml6XmnJ/moLzlvI9cbmZ1bmN0aW9uIGZvcm1hdERhdGUobWlsbGlzOiBudW1iZXIpe1xuICAgIGNvbnN0IGR0ID0gbmV3IERhdGUobWlsbGlzKVxuICAgIGNvbnN0IHkgPSBkdC5nZXRGdWxsWWVhcigpXG4gICAgY29uc3QgbSA9IGR0LmdldE1vbnRoKCkgKyAxXG4gICAgY29uc3QgZCA9IGR0LmdldERheSgpXG4gICAgcmV0dXJuIGAke3BhZFN0cmluZyh5KX0tJHtwYWRTdHJpbmcobSl9LSR7cGFkU3RyaW5nKGQpfWBcbn1cblxuUGFnZSh7XG4gICAgIHJlZGlyZWN0VVJMOiAnJyxcbiAgICAgUHJvZmlsZVJlZnJlc2hlcjogMCxcbiAgICBkYXRhOntcbiAgICAgICAgYmlydGhEYXRlOiAnMjAyMi0wNC0xMScsXG4gICAgICAgIGdlbmRlcnNJbmRleDowLFxuICAgICAgICBnZW5kZXJzOltcIuacquefpVwiLCBcIueUt1wiLCBcIuWls1wiXSxcbiAgICAgICAgbGljSW1nVVJMOiAnJyxcbiAgICAgICAgbGljTm86ICcnLFxuICAgICAgICBuYW1lOiAnJyxcbiAgICAgICAgc3RhdGU6IHJlbnRhbC52MS5JZGVudGl0eVN0YXR1c1tyZW50YWwudjEuSWRlbnRpdHlTdGF0dXMuVU5TVUJNSVRURURdLFxuICAgIH0sXG5cbiAgICAvL+mAu+i+keWxguWPkemAgeaVsOaNruiHs+a4suafk+WxglxuICAgIHJlbmRlclByb2ZpbGUocDogcmVudGFsLnYxLklQcm9maWxlKXtcbiAgICAgICAgdGhpcy5yZW5kZXJJZGVudGl0eShwLmlkZW50aXR5ISlcbiAgICAgICAgdGhpcy5zZXREYXRhKHtcbiAgICAgICAgICAgIHN0YXRlOiByZW50YWwudjEuSWRlbnRpdHlTdGF0dXNbcC5pZGVudGl0eVN0YXR1c3x8MF0sXG4gICAgICAgIH0pXG4gICAgfSxcblxuICAgIC8v6YC76L6R5bGC5Y+R6YCB5pWw5o2u6Iez5riy5p+T5bGCXG4gICAgcmVuZGVySWRlbnRpdHkoaT86IHJlbnRhbC52MS5JSWRlbnRpdHkpe1xuICAgICAgICB0aGlzLnNldERhdGEoe1xuICAgICAgICAgICAgbGljTm86IGk/LmxpY051bWJlcnx8JycsXG4gICAgICAgICAgICBuYW1lOiBpPy5uYW1lfHwnJyxcbiAgICAgICAgICAgIGdlbmRlcnNJbmRleDogaT8uZ2VuZGVyfHwwLFxuICAgICAgICAgICAgYmlydGhEYXRlOiBmb3JtYXREYXRlKGk/LmJpcnRoRGF0YU1pbGxpc3x8MCksXG4gICAgICAgIH0pXG4gICAgfSxcblxuICAgIG9uTG9hZChvcHQ6IFJlY29yZDxcInJlZGlyZWN0XCIsIHN0cmluZz4pe1xuICAgICAgICBjb25zdCBvOiByb3V0aW5nLlJlZ2lzdGVyT3B0ID0gb3B0XG4gICAgICAgIGNvbnNvbGUubG9nKFwib+eahOWAvDpcIixvKVxuICAgICAgICBpZihvLnJlZGlyZWN0KXtcbiAgICAgICAgICAgIHRoaXMucmVkaXJlY3RVUkwgPSBkZWNvZGVVUklDb21wb25lbnQoby5yZWRpcmVjdClcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi6ZyA6KaB55qEUlVMOlwiLHRoaXMucmVkaXJlY3RVUkwpXG4gICAgICAgIH1cbiAgICAgICAgUHJvZmlsZVNlcnZpY2UuZ2V0UHJvZmlsZSgpLnRoZW4ocCA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlclByb2ZpbGUocClcbiAgICAgICAgfSlcbiAgICAgICAgUHJvZmlsZVNlcnZpY2UuZ2V0UHJvZmlsZVBob3RvKCkudGhlbihwID0+e1xuICAgICAgICAgICAgdGhpcy5zZXREYXRhKHtcbiAgICAgICAgICAgICAgIGxpY0ltZ1VSTDogcC51cmwgfHwgJycsXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgICBcbiAgICB9LFxuXG4gICAgLy/pobXpnaLnu5PmnZ/miafooYxcbiAgICBvblVubG9hZCgpe1xuICAgICAgICB0aGlzLmNsZWFyUHJvZmlsZVJlZnJlc2hlcigpXG4gICAgfSxcbiAgICBcbiAgICAvL+S4iuS8oOWbvueJh1xuICAgIG9uVXBsb2FkTGljKCl7XG4gICAgICAgIC8v5LuO5pys5Zyw55u45YaM6YCJ5oup5Zu+54mH5oiW5L2/55So55u45py65ouN54Wn44CCXG4gICAgICAgIHd4LmNob29zZUltYWdlKHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGFzeW5jIHJlcyA9PiB7XG4gICAgICAgICAgICAgICAgaWYocmVzLnRlbXBGaWxlUGF0aHMubGVuZ3RoID09PSAwKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXREYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpY0ltZ1VSTDogcmVzLnRlbXBGaWxlUGF0aHNbMF0sXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC8v6I635Y+W5LiK5LygdXJsXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBob3RvUmVzID0gYXdhaXQgUHJvZmlsZVNlcnZpY2UuY3JlYXRlUHJvZmlsZVBob3RvKClcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLkuIrkvKDlm77niYflnLDlnYA6XCIscGhvdG9SZXMudXBsb2FkVXJsKVxuICAgICAgICAgICAgICAgICAgICBpZiAoIXBob3RvUmVzLnVwbG9hZFVybCl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvL+S4iuS8oFxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBDb29sY2FyLnVwbG9hZGZpbGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxQYXRoOiByZXMudGVtcEZpbGVQYXRoc1swXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogcGhvdG9SZXMudXBsb2FkVXJsfHwnJyxcbiAgICAgICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgICAgICAvL+mAmuefpeacjeWKoeWZqOS4iuS8oOaIkOWKn1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBJZGVudGl0eSA9IGF3YWl0IFByb2ZpbGVTZXJ2aWNlLmNvbXBsZXRlUHJvZmlsZVBob3RvKClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJJZGVudGl0eShJZGVudGl0eSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IHBob3RvID0gYXdhaXQgUHJvZmlsZVNlcnZpY2UuZ2V0UHJvZmlsZVBob3RvKClcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgKCFwaG90byl7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLnNldERhdGEoe1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgbGljSW1nVVJMOiBwaG90by51cmx8fCcnLFxuICAgICAgICAgICAgICAgICAgICAvLyB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICAvL+mpvumptuivgeWPt1xuICAgIG9uTGljbm9DaGFuZ2UoZTogYW55KXtcbiAgICAgICAgdGhpcy5zZXREYXRhKHtcbiAgICAgICAgICAgIGxpY05vOiBlLmRldGFpbC52YWx1ZVxuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICAvL+Whq+WGmeWnk+WQjVxuICAgIG9uTmFtZUNoYW5nZShlOiBhbnkpe1xuICAgICAgICB0aGlzLnNldERhdGEoe1xuICAgICAgICAgICAgbmFtZTogZS5kZXRhaWwudmFsdWUsXG4gICAgICAgIH0pXG4gICAgfSxcblxuICAgIC8v6YCJ5oup5oCn5YirXG4gICAgb25HZW5kZXJDaGFuZ2UoZTphbnkpe1xuICAgICAgICB0aGlzLnNldERhdGEoe1xuICAgICAgICAgICAgZ2VuZGVyc0luZGV4OiBwYXJzZUludChlLmRldGFpbC52YWx1ZSksXG4gICAgICAgIH0pXG4gICAgfSxcblxuICAgIC8v6YCJ5oup5Ye655Sf5pel5pyfXG4gICAgb25CaXJ0aERhdGVDaGFuZ2UoZTphbnkpe1xuICAgICAgICB0aGlzLnNldERhdGEoe1xuICAgICAgICAgICAgYmlydGhEYXRlOiBlLmRldGFpbC52YWx1ZSxcbiAgICAgICAgfSlcbiAgICB9LFxuXG4gICAgLy/pgJLkuqTlrqHmoLhcbiAgICBvblN1Ym1pdCgpe1xuICAgICAgICBQcm9maWxlU2VydmljZS5zdWJtaXRQcm9maWxlKHtcbiAgICAgICAgICAgIGxpY051bWJlcjogdGhpcy5kYXRhLmxpY05vLFxuICAgICAgICAgICAgbmFtZTogdGhpcy5kYXRhLm5hbWUsXG4gICAgICAgICAgICBnZW5kZXI6IHRoaXMuZGF0YS5nZW5kZXJzSW5kZXgsXG4gICAgICAgICAgICBiaXJ0aERhdGFNaWxsaXM6IERhdGUucGFyc2UodGhpcy5kYXRhLmJpcnRoRGF0ZSksXG4gICAgICAgIH0pLnRoZW4ocCA9PntcbiAgICAgICAgICAgIHRoaXMucmVuZGVyUHJvZmlsZShwKVxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZVByb2ZpbGVSZWZyZXNoZXIoKVxuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICAvL+WIpOaWrei6q+S7veWuoeaguOeKtuaAgVxuICAgIHNjaGVkdWxlUHJvZmlsZVJlZnJlc2hlcigpe1xuICAgICAgICB0aGlzLlByb2ZpbGVSZWZyZXNoZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBQcm9maWxlU2VydmljZS5nZXRQcm9maWxlKCkudGhlbihwID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclByb2ZpbGUocClcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInN0YXR1czpcIixwLmlkZW50aXR5U3RhdHVzKVxuICAgICAgICAgICAgICAgIGlmIChwLmlkZW50aXR5U3RhdHVzICE9PSByZW50YWwudjEuSWRlbnRpdHlTdGF0dXMuUEVORElORyl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJQcm9maWxlUmVmcmVzaGVyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwLmlkZW50aXR5U3RhdHVzID09PSByZW50YWwudjEuSWRlbnRpdHlTdGF0dXMuVkVSSUZJRUQpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9ubGljVmVyaWZpZWQoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9LCAxMDAwKVxuICAgIH0sXG5cbiAgICAvL+a4heeQhnNldEludGVydmFsKCnlrprml7blmahcbiAgICBjbGVhclByb2ZpbGVSZWZyZXNoZXIoKXtcbiAgICAgICAgaWYgKHRoaXMuUHJvZmlsZVJlZnJlc2hlcil7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMuUHJvZmlsZVJlZnJlc2hlcilcbiAgICAgICAgICAgIHRoaXMuUHJvZmlsZVJlZnJlc2hlciA9IDBcbiAgICAgICAgfVxuICAgIH0sXG4gICAgICAgXG4gICAgLy/ph43mlrDpgJLkuqRcbiAgICBvblJlc3VibWl0KCl7XG4gICAgICAgIFByb2ZpbGVTZXJ2aWNlLmNsZWFyUHJvZmlsZSgpLnRoZW4ocCA9PiB0aGlzLnJlbmRlclByb2ZpbGUocCkpXG4gICAgICAgIFByb2ZpbGVTZXJ2aWNlLmNsZWFyUHJvZmlsZVBob3RvKCkudGhlbigoKSA9PntcbiAgICAgICAgICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICAgICAgICAgICAgbGljSW1nVVJMOiAnJyxcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfSxcblxuICAgIC8v5pC65bim5Y+C5pWw6Lez6L2s6aG16Z2iXG4gICAgb25saWNWZXJpZmllZCgpe1xuICAgICAgICBpZih0aGlzLnJlZGlyZWN0VVJMKXtcbiAgICAgICAgICAgIHd4LnJlZGlyZWN0VG8oe1xuICAgICAgICAgICAgICAgIHVybDogdGhpcy5yZWRpcmVjdFVSTCxcbiAgICAgICAgXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxufSlcblxuXG4iXX0=
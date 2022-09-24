"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routing = void 0;
var routing;
(function (routing) {
    function driving(o) {
        return `/pages/driving/driving?trip_id=${o.trip_id}`;
    }
    routing.driving = driving;
    function Lock(o) {
        return `/pages/lock/lock?car_id=${o.car_id}`;
    }
    routing.Lock = Lock;
    function register(p) {
        const Page = `/pages/register/register`;
        if (!p) {
            return Page;
        }
        return `${Page}?redirect=${encodeURIComponent(p.redirectURL)}`;
    }
    routing.register = register;
    function mytrips() {
        return '/pages/mytrips/mytrips';
    }
    routing.mytrips = mytrips;
})(routing = exports.routing || (exports.routing = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJvdXRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsSUFBaUIsT0FBTyxDQXFDdkI7QUFyQ0QsV0FBaUIsT0FBTztJQUtwQixTQUFnQixPQUFPLENBQUMsQ0FBYTtRQUNqQyxPQUFPLGtDQUFrQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDeEQsQ0FBQztJQUZlLGVBQU8sVUFFdEIsQ0FBQTtJQUtELFNBQWdCLElBQUksQ0FBQyxDQUFVO1FBQzNCLE9BQU8sMkJBQTJCLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtJQUNoRCxDQUFDO0lBRmUsWUFBSSxPQUVuQixDQUFBO0lBV0QsU0FBZ0IsUUFBUSxDQUFDLENBQWtCO1FBQ3ZDLE1BQU0sSUFBSSxHQUFHLDBCQUEwQixDQUFBO1FBQ3ZDLElBQUcsQ0FBQyxDQUFDLEVBQUM7WUFDRixPQUFPLElBQUksQ0FBQTtTQUNkO1FBQ0QsT0FBTyxHQUFHLElBQUksYUFBYSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQTtJQUNsRSxDQUFDO0lBTmUsZ0JBQVEsV0FNdkIsQ0FBQTtJQUdELFNBQWdCLE9BQU87UUFDbkIsT0FBTyx3QkFBd0IsQ0FBQTtJQUNuQyxDQUFDO0lBRmUsZUFBTyxVQUV0QixDQUFBO0FBQ0wsQ0FBQyxFQXJDZ0IsT0FBTyxHQUFQLGVBQU8sS0FBUCxlQUFPLFFBcUN2QiIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBuYW1lc3BhY2Ugcm91dGluZ3tcbiAgICBleHBvcnQgaW50ZXJmYWNlIERyaXZpbmdPcHR7XG4gICAgICAgIHRyaXBfaWQ6IHN0cmluZ1xuXG4gICAgfVxuICAgIGV4cG9ydCBmdW5jdGlvbiBkcml2aW5nKG86IERyaXZpbmdPcHQpe1xuICAgICAgICByZXR1cm4gYC9wYWdlcy9kcml2aW5nL2RyaXZpbmc/dHJpcF9pZD0ke28udHJpcF9pZH1gXG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBMb2NrT3B0IHtcbiAgICAgICAgY2FyX2lkOiBzdHJpbmdcbiAgICB9XG4gICAgZXhwb3J0IGZ1bmN0aW9uIExvY2sobzogTG9ja09wdCl7XG4gICAgICAgIHJldHVybiBgL3BhZ2VzL2xvY2svbG9jaz9jYXJfaWQ9JHtvLmNhcl9pZH1gXG4gICAgfVxuICAgIC8vZXhwb3J0IGludGVyZmFjZSBSZWdpc3Rlck9wdFxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBSZWdpc3Rlck9wdHtcbiAgICAgICAgcmVkaXJlY3Q/OiBzdHJpbmdcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIFJlZ2lzdGVyUGFyYW1ze1xuICAgICAgICByZWRpcmVjdFVSTDogc3RyaW5nXG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyKHA/OiBSZWdpc3RlclBhcmFtcyl7XG4gICAgICAgIGNvbnN0IFBhZ2UgPSBgL3BhZ2VzL3JlZ2lzdGVyL3JlZ2lzdGVyYFxuICAgICAgICBpZighcCl7XG4gICAgICAgICAgICByZXR1cm4gUGFnZVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBgJHtQYWdlfT9yZWRpcmVjdD0ke2VuY29kZVVSSUNvbXBvbmVudChwLnJlZGlyZWN0VVJMKX1gIFxuICAgIH1cblxuICAgIFxuICAgIGV4cG9ydCBmdW5jdGlvbiBteXRyaXBzKCl7XG4gICAgICAgIHJldHVybiAnL3BhZ2VzL215dHJpcHMvbXl0cmlwcydcbiAgICB9XG59Il19
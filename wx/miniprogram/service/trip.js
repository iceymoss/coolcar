"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripService = void 0;
const rental_pb_1 = require("./proto_gen/rental/rental_pb");
const request_1 = require("./request");
var TripService;
(function (TripService) {
    function createTrip(req) {
        console.log("创建行程");
        return request_1.Coolcar.sendRequestWithAuthRetry({
            method: 'POST',
            path: '/v1/trip',
            data: req,
            respMarshaller: rental_pb_1.rental.v1.TripEntity.fromObject
        });
    }
    TripService.createTrip = createTrip;
    function getTrip(id) {
        return request_1.Coolcar.sendRequestWithAuthRetry({
            method: 'GET',
            path: `/v1/trip/${encodeURIComponent(id)}`,
            respMarshaller: rental_pb_1.rental.v1.Trip.fromObject,
        });
    }
    TripService.getTrip = getTrip;
    function getTrips(s) {
        let path = '/v1/trips';
        if (s) {
            path += `?status=${s}`;
        }
        return request_1.Coolcar.sendRequestWithAuthRetry({
            method: 'GET',
            path: path,
            respMarshaller: rental_pb_1.rental.v1.GetTripsResponse.fromObject,
        });
    }
    TripService.getTrips = getTrips;
    function updateTripPos(id, loc) {
        return updateTrip({ id, current: loc });
    }
    TripService.updateTripPos = updateTripPos;
    function finishTrip(id) {
        return updateTrip({
            id,
            endTrip: true,
        });
    }
    TripService.finishTrip = finishTrip;
    function updateTrip(r) {
        if (!r.id) {
            return Promise.reject("必须有id");
        }
        return request_1.Coolcar.sendRequestWithAuthRetry({
            method: 'PUT',
            path: `/v1/trip/${encodeURIComponent(r.id)}`,
            data: r,
            respMarshaller: rental_pb_1.rental.v1.Trip.fromObject,
        });
    }
    TripService.updateTrip = updateTrip;
})(TripService = exports.TripService || (exports.TripService = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJpcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRyaXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNERBQXNEO0FBQ3RELHVDQUFvQztBQUdwQyxJQUFpQixXQUFXLENBd0QzQjtBQXhERCxXQUFpQixXQUFXO0lBRXhCLFNBQWdCLFVBQVUsQ0FBQyxHQUFpQztRQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ25CLE9BQU8saUJBQU8sQ0FBQyx3QkFBd0IsQ0FBQztZQUNwQyxNQUFNLEVBQUUsTUFBTTtZQUNkLElBQUksRUFBRSxVQUFVO1lBQ2hCLElBQUksRUFBRSxHQUFHO1lBQ1QsY0FBYyxFQUFFLGtCQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVO1NBQ2xELENBQUMsQ0FBQTtJQUNOLENBQUM7SUFSZSxzQkFBVSxhQVF6QixDQUFBO0lBRUQsU0FBZ0IsT0FBTyxDQUFDLEVBQVU7UUFDOUIsT0FBTyxpQkFBTyxDQUFDLHdCQUF3QixDQUFDO1lBQ3BDLE1BQU0sRUFBRSxLQUFLO1lBQ2IsSUFBSSxFQUFFLFlBQVksa0JBQWtCLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDMUMsY0FBYyxFQUFFLGtCQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVO1NBQzVDLENBQUMsQ0FBQTtJQUNOLENBQUM7SUFOZSxtQkFBTyxVQU10QixDQUFBO0lBRUQsU0FBZ0IsUUFBUSxDQUFDLENBQXdCO1FBQzdDLElBQUksSUFBSSxHQUFHLFdBQVcsQ0FBQTtRQUN0QixJQUFJLENBQUMsRUFBRTtZQUNILElBQUksSUFBSSxXQUFXLENBQUMsRUFBRSxDQUFBO1NBQ3pCO1FBQ0QsT0FBTyxpQkFBTyxDQUFDLHdCQUF3QixDQUFDO1lBQ3BDLE1BQU0sRUFBRSxLQUFLO1lBQ2IsSUFBSSxFQUFFLElBQUk7WUFDVixjQUFjLEVBQUUsa0JBQU0sQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsVUFBVTtTQUN4RCxDQUFDLENBQUE7SUFDTixDQUFDO0lBVmUsb0JBQVEsV0FVdkIsQ0FBQTtJQUdELFNBQWdCLGFBQWEsQ0FBQyxFQUFVLEVBQUUsR0FBeUI7UUFDL0QsT0FBTyxVQUFVLENBQUMsRUFBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBQyxDQUFDLENBQUE7SUFDekMsQ0FBQztJQUZlLHlCQUFhLGdCQUU1QixDQUFBO0lBRUQsU0FBZ0IsVUFBVSxDQUFDLEVBQVU7UUFDakMsT0FBTyxVQUFVLENBQUM7WUFDZCxFQUFFO1lBQ0YsT0FBTyxFQUFDLElBQUk7U0FDZixDQUFDLENBQUE7SUFDTixDQUFDO0lBTGUsc0JBQVUsYUFLekIsQ0FBQTtJQUVELFNBQWdCLFVBQVUsQ0FBQyxDQUErQjtRQUN0RCxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNQLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQTtTQUNqQztRQUNELE9BQU8saUJBQU8sQ0FBQyx3QkFBd0IsQ0FBQztZQUNwQyxNQUFNLEVBQUUsS0FBSztZQUNiLElBQUksRUFBRSxZQUFZLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUM1QyxJQUFJLEVBQUUsQ0FBQztZQUNQLGNBQWMsRUFBRSxrQkFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVTtTQUM1QyxDQUFDLENBQUE7SUFDTixDQUFDO0lBVmUsc0JBQVUsYUFVekIsQ0FBQTtBQUVMLENBQUMsRUF4RGdCLFdBQVcsR0FBWCxtQkFBVyxLQUFYLG1CQUFXLFFBd0QzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJlbnRhbCB9IGZyb20gXCIuL3Byb3RvX2dlbi9yZW50YWwvcmVudGFsX3BiXCI7XG5pbXBvcnQgeyBDb29sY2FyIH0gZnJvbSBcIi4vcmVxdWVzdFwiO1xuXG4vL+ivt+axguWQjuerr+aWueazle+8jOWFpeWPo1xuZXhwb3J0IG5hbWVzcGFjZSBUcmlwU2VydmljZXtcbiAgICAvL+ivt+axguWIm+W7uuihjOeoiyBcbiAgICBleHBvcnQgZnVuY3Rpb24gY3JlYXRlVHJpcChyZXE6IHJlbnRhbC52MS5JQ3JlYXRlVHJpcFJlcXVlc3QpOiBQcm9taXNlPHJlbnRhbC52MS5JVHJpcEVudGl0eT57XG4gICAgICAgIGNvbnNvbGUubG9nKFwi5Yib5bu66KGM56iLXCIpXG4gICAgICAgIHJldHVybiBDb29sY2FyLnNlbmRSZXF1ZXN0V2l0aEF1dGhSZXRyeSh7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIHBhdGg6ICcvdjEvdHJpcCcsXG4gICAgICAgICAgICBkYXRhOiByZXEsXG4gICAgICAgICAgICByZXNwTWFyc2hhbGxlcjogcmVudGFsLnYxLlRyaXBFbnRpdHkuZnJvbU9iamVjdFxuICAgICAgICB9KVxuICAgIH1cbiAgICAvL+ivt+axguiOt+WPluihjOeoi1xuICAgIGV4cG9ydCBmdW5jdGlvbiBnZXRUcmlwKGlkOiBzdHJpbmcpOiBQcm9taXNlPHJlbnRhbC52MS5JVHJpcD57XG4gICAgICAgIHJldHVybiBDb29sY2FyLnNlbmRSZXF1ZXN0V2l0aEF1dGhSZXRyeSh7XG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgcGF0aDogYC92MS90cmlwLyR7ZW5jb2RlVVJJQ29tcG9uZW50KGlkKX1gLFxuICAgICAgICAgICAgcmVzcE1hcnNoYWxsZXI6IHJlbnRhbC52MS5UcmlwLmZyb21PYmplY3QsXG4gICAgICAgIH0pXG4gICAgfVxuICAgIC8v6K+35rGC5om56YeP6I635Y+W6KGM56iLXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGdldFRyaXBzKHM/OiByZW50YWwudjEuVHJpcFN0YXR1cyk6IFByb21pc2U8cmVudGFsLnYxLklHZXRUcmlwc1Jlc3BvbnNlPiB7XG4gICAgICAgIGxldCBwYXRoID0gJy92MS90cmlwcydcbiAgICAgICAgaWYgKHMpIHtcbiAgICAgICAgICAgIHBhdGggKz0gYD9zdGF0dXM9JHtzfWBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQ29vbGNhci5zZW5kUmVxdWVzdFdpdGhBdXRoUmV0cnkoe1xuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgIHBhdGg6IHBhdGgsXG4gICAgICAgICAgICByZXNwTWFyc2hhbGxlcjogcmVudGFsLnYxLkdldFRyaXBzUmVzcG9uc2UuZnJvbU9iamVjdCxcbiAgICAgICAgfSlcbiAgICB9XG4gICAgXG4gICAgLy/or7fmsYLmm7TmlrDlvZPliY3kvY3nva5cbiAgICBleHBvcnQgZnVuY3Rpb24gdXBkYXRlVHJpcFBvcyhpZDogc3RyaW5nLCBsb2M/OiByZW50YWwudjEuSUxvY2F0aW9uKXtcbiAgICAgICAgcmV0dXJuIHVwZGF0ZVRyaXAoe2lkLCBjdXJyZW50OiBsb2N9KVxuICAgIH1cbiAgICAvL+ivt+axgue7k+adn+ihjOeoi1xuICAgIGV4cG9ydCBmdW5jdGlvbiBmaW5pc2hUcmlwKGlkOiBzdHJpbmcpe1xuICAgICAgICByZXR1cm4gdXBkYXRlVHJpcCh7XG4gICAgICAgICAgICBpZCwgXG4gICAgICAgICAgICBlbmRUcmlwOnRydWUsXG4gICAgICAgIH0pXG4gICAgfVxuICAgIC8v6K+35rGC5pu05paw5pWw5o2u5bqTXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVRyaXAocjogcmVudGFsLnYxLklVcGRhdGVUcmlwUmVxdWVzdCk6IFByb21pc2U8cmVudGFsLnYxLklUcmlwPntcbiAgICAgICAgaWYgKCFyLmlkKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoXCLlv4XpobvmnIlpZFwiKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBDb29sY2FyLnNlbmRSZXF1ZXN0V2l0aEF1dGhSZXRyeSh7XG4gICAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgICAgICAgcGF0aDogYC92MS90cmlwLyR7ZW5jb2RlVVJJQ29tcG9uZW50KHIuaWQpfWAsXG4gICAgICAgICAgICBkYXRhOiByLFxuICAgICAgICAgICAgcmVzcE1hcnNoYWxsZXI6IHJlbnRhbC52MS5UcmlwLmZyb21PYmplY3QsXG4gICAgICAgIH0pXG4gICAgfVxuICBcbn1cblxuIl19
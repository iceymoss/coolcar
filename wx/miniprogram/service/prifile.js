"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const rental_pb_1 = require("./proto_gen/rental/rental_pb");
const request_1 = require("./request");
var ProfileService;
(function (ProfileService) {
    function getProfile() {
        return request_1.Coolcar.sendRequestWithAuthRetry({
            method: 'GET',
            path: '/v1/profile',
            respMarshaller: rental_pb_1.rental.v1.Profile.fromObject,
        });
    }
    ProfileService.getProfile = getProfile;
    function submitProfile(req) {
        return request_1.Coolcar.sendRequestWithAuthRetry({
            method: 'POST',
            path: '/v1/profile',
            data: req,
            respMarshaller: rental_pb_1.rental.v1.Profile.fromObject,
        });
    }
    ProfileService.submitProfile = submitProfile;
    function clearProfile() {
        return request_1.Coolcar.sendRequestWithAuthRetry({
            method: 'DELETE',
            path: '/v1/profile',
            respMarshaller: rental_pb_1.rental.v1.Profile.fromObject,
        });
    }
    ProfileService.clearProfile = clearProfile;
    function getProfilePhoto() {
        return request_1.Coolcar.sendRequestWithAuthRetry({
            method: 'GET',
            path: '/v1/profile/photo',
            respMarshaller: rental_pb_1.rental.v1.GetProfilePhotoResponse.fromObject,
        });
    }
    ProfileService.getProfilePhoto = getProfilePhoto;
    function createProfilePhoto() {
        return request_1.Coolcar.sendRequestWithAuthRetry({
            method: 'POST',
            path: '/v1/profile/photo',
            respMarshaller: rental_pb_1.rental.v1.CreateProfilePhotoResponse.fromObject,
        });
    }
    ProfileService.createProfilePhoto = createProfilePhoto;
    function completeProfilePhoto() {
        return request_1.Coolcar.sendRequestWithAuthRetry({
            method: 'POST',
            path: '/v1/profile/photo/complete',
            respMarshaller: rental_pb_1.rental.v1.Identity.fromObject,
        });
    }
    ProfileService.completeProfilePhoto = completeProfilePhoto;
    function clearProfilePhoto() {
        return request_1.Coolcar.sendRequestWithAuthRetry({
            method: 'DELETE',
            path: '/v1/profile/photo',
            respMarshaller: rental_pb_1.rental.v1.ClearProfilePhotoResponse.fromObject,
        });
    }
    ProfileService.clearProfilePhoto = clearProfilePhoto;
})(ProfileService = exports.ProfileService || (exports.ProfileService = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInByaWZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNERBQXNEO0FBQ3RELHVDQUFvQztBQUVwQyxJQUFpQixjQUFjLENBeUQ5QjtBQXpERCxXQUFpQixjQUFjO0lBQzNCLFNBQWdCLFVBQVU7UUFDdEIsT0FBTyxpQkFBTyxDQUFDLHdCQUF3QixDQUFDO1lBQ3BDLE1BQU0sRUFBRSxLQUFLO1lBQ2IsSUFBSSxFQUFFLGFBQWE7WUFDbkIsY0FBYyxFQUFFLGtCQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVO1NBQy9DLENBQUMsQ0FBQTtJQUNOLENBQUM7SUFOZSx5QkFBVSxhQU16QixDQUFBO0lBRUQsU0FBZ0IsYUFBYSxDQUFDLEdBQXdCO1FBQ2xELE9BQU8saUJBQU8sQ0FBQyx3QkFBd0IsQ0FBQztZQUNwQyxNQUFNLEVBQUUsTUFBTTtZQUNkLElBQUksRUFBRSxhQUFhO1lBQ25CLElBQUksRUFBRSxHQUFHO1lBQ1QsY0FBYyxFQUFFLGtCQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVO1NBQy9DLENBQUMsQ0FBQTtJQUNOLENBQUM7SUFQZSw0QkFBYSxnQkFPNUIsQ0FBQTtJQUVELFNBQWdCLFlBQVk7UUFDeEIsT0FBTyxpQkFBTyxDQUFDLHdCQUF3QixDQUFDO1lBQ3BDLE1BQU0sRUFBRSxRQUFRO1lBQ2hCLElBQUksRUFBRSxhQUFhO1lBQ25CLGNBQWMsRUFBRSxrQkFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVTtTQUMvQyxDQUFDLENBQUE7SUFDTixDQUFDO0lBTmUsMkJBQVksZUFNM0IsQ0FBQTtJQUVELFNBQWdCLGVBQWU7UUFDM0IsT0FBTyxpQkFBTyxDQUFDLHdCQUF3QixDQUFDO1lBQ3BDLE1BQU0sRUFBRSxLQUFLO1lBQ2IsSUFBSSxFQUFFLG1CQUFtQjtZQUN6QixjQUFjLEVBQUUsa0JBQU0sQ0FBQyxFQUFFLENBQUMsdUJBQXVCLENBQUMsVUFBVTtTQUMvRCxDQUFDLENBQUE7SUFDTixDQUFDO0lBTmUsOEJBQWUsa0JBTTlCLENBQUE7SUFFRCxTQUFnQixrQkFBa0I7UUFDOUIsT0FBTyxpQkFBTyxDQUFDLHdCQUF3QixDQUFDO1lBQ3BDLE1BQU0sRUFBRSxNQUFNO1lBQ2QsSUFBSSxFQUFFLG1CQUFtQjtZQUN6QixjQUFjLEVBQUUsa0JBQU0sQ0FBQyxFQUFFLENBQUMsMEJBQTBCLENBQUMsVUFBVTtTQUNsRSxDQUFDLENBQUE7SUFDTixDQUFDO0lBTmUsaUNBQWtCLHFCQU1qQyxDQUFBO0lBRUQsU0FBZ0Isb0JBQW9CO1FBQ2hDLE9BQU8saUJBQU8sQ0FBQyx3QkFBd0IsQ0FBQztZQUNwQyxNQUFNLEVBQUUsTUFBTTtZQUNkLElBQUksRUFBRSw0QkFBNEI7WUFDbEMsY0FBYyxFQUFFLGtCQUFNLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxVQUFVO1NBQ2hELENBQUMsQ0FBQTtJQUNOLENBQUM7SUFOZSxtQ0FBb0IsdUJBTW5DLENBQUE7SUFFRCxTQUFnQixpQkFBaUI7UUFDN0IsT0FBTyxpQkFBTyxDQUFDLHdCQUF3QixDQUFDO1lBQ3BDLE1BQU0sRUFBRSxRQUFRO1lBQ2hCLElBQUksRUFBRSxtQkFBbUI7WUFDekIsY0FBYyxFQUFFLGtCQUFNLENBQUMsRUFBRSxDQUFDLHlCQUF5QixDQUFDLFVBQVU7U0FDakUsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQU5lLGdDQUFpQixvQkFNaEMsQ0FBQTtBQUNMLENBQUMsRUF6RGdCLGNBQWMsR0FBZCxzQkFBYyxLQUFkLHNCQUFjLFFBeUQ5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJlbnRhbCB9IGZyb20gXCIuL3Byb3RvX2dlbi9yZW50YWwvcmVudGFsX3BiXCI7XG5pbXBvcnQgeyBDb29sY2FyIH0gZnJvbSBcIi4vcmVxdWVzdFwiO1xuXG5leHBvcnQgbmFtZXNwYWNlIFByb2ZpbGVTZXJ2aWNlIHtcbiAgICBleHBvcnQgZnVuY3Rpb24gZ2V0UHJvZmlsZSgpOiBQcm9taXNlPHJlbnRhbC52MS5JUHJvZmlsZT4ge1xuICAgICAgICByZXR1cm4gQ29vbGNhci5zZW5kUmVxdWVzdFdpdGhBdXRoUmV0cnkoe1xuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgIHBhdGg6ICcvdjEvcHJvZmlsZScsXG4gICAgICAgICAgICByZXNwTWFyc2hhbGxlcjogcmVudGFsLnYxLlByb2ZpbGUuZnJvbU9iamVjdCxcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gc3VibWl0UHJvZmlsZShyZXE6IHJlbnRhbC52MS5JSWRlbnRpdHkpOiBQcm9taXNlPHJlbnRhbC52MS5JUHJvZmlsZT4ge1xuICAgICAgICByZXR1cm4gQ29vbGNhci5zZW5kUmVxdWVzdFdpdGhBdXRoUmV0cnkoe1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBwYXRoOiAnL3YxL3Byb2ZpbGUnLFxuICAgICAgICAgICAgZGF0YTogcmVxLFxuICAgICAgICAgICAgcmVzcE1hcnNoYWxsZXI6IHJlbnRhbC52MS5Qcm9maWxlLmZyb21PYmplY3QsXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGNsZWFyUHJvZmlsZSgpOiBQcm9taXNlPHJlbnRhbC52MS5JUHJvZmlsZT4ge1xuICAgICAgICByZXR1cm4gQ29vbGNhci5zZW5kUmVxdWVzdFdpdGhBdXRoUmV0cnkoe1xuICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgICAgIHBhdGg6ICcvdjEvcHJvZmlsZScsXG4gICAgICAgICAgICByZXNwTWFyc2hhbGxlcjogcmVudGFsLnYxLlByb2ZpbGUuZnJvbU9iamVjdCxcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gZ2V0UHJvZmlsZVBob3RvKCk6IFByb21pc2U8cmVudGFsLnYxLklHZXRQcm9maWxlUGhvdG9SZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gQ29vbGNhci5zZW5kUmVxdWVzdFdpdGhBdXRoUmV0cnkoe1xuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgIHBhdGg6ICcvdjEvcHJvZmlsZS9waG90bycsXG4gICAgICAgICAgICByZXNwTWFyc2hhbGxlcjogcmVudGFsLnYxLkdldFByb2ZpbGVQaG90b1Jlc3BvbnNlLmZyb21PYmplY3QsXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVByb2ZpbGVQaG90bygpOiBQcm9taXNlPHJlbnRhbC52MS5JQ3JlYXRlUHJvZmlsZVBob3RvUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIENvb2xjYXIuc2VuZFJlcXVlc3RXaXRoQXV0aFJldHJ5KHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgcGF0aDogJy92MS9wcm9maWxlL3Bob3RvJyxcbiAgICAgICAgICAgIHJlc3BNYXJzaGFsbGVyOiByZW50YWwudjEuQ3JlYXRlUHJvZmlsZVBob3RvUmVzcG9uc2UuZnJvbU9iamVjdCxcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBleHBvcnQgZnVuY3Rpb24gY29tcGxldGVQcm9maWxlUGhvdG8oKTogUHJvbWlzZTxyZW50YWwudjEuSUlkZW50aXR5PiB7XG4gICAgICAgIHJldHVybiBDb29sY2FyLnNlbmRSZXF1ZXN0V2l0aEF1dGhSZXRyeSh7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIHBhdGg6ICcvdjEvcHJvZmlsZS9waG90by9jb21wbGV0ZScsXG4gICAgICAgICAgICByZXNwTWFyc2hhbGxlcjogcmVudGFsLnYxLklkZW50aXR5LmZyb21PYmplY3QsXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGNsZWFyUHJvZmlsZVBob3RvKCk6IFByb21pc2U8cmVudGFsLnYxLklDbGVhclByb2ZpbGVQaG90b1Jlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBDb29sY2FyLnNlbmRSZXF1ZXN0V2l0aEF1dGhSZXRyeSh7XG4gICAgICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICAgICAgcGF0aDogJy92MS9wcm9maWxlL3Bob3RvJyxcbiAgICAgICAgICAgIHJlc3BNYXJzaGFsbGVyOiByZW50YWwudjEuQ2xlYXJQcm9maWxlUGhvdG9SZXNwb25zZS5mcm9tT2JqZWN0LFxuICAgICAgICB9KVxuICAgIH1cbn0iXX0=
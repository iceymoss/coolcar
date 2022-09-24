"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarService = void 0;
const camelcaseKeys = require("camelcase-keys");
const car_pb_1 = require("./proto_gen/car/car_pb");
const request_1 = require("./request");
var CarService;
(function (CarService) {
    function subscribe(onMsg) {
        const socket = wx.connectSocket({
            url: request_1.Coolcar.wsAddr + '/ws'
        });
        socket.onMessage(msg => {
            const obj = JSON.parse(msg.data);
            onMsg(car_pb_1.car.v1.CarEntity.fromObject(camelcaseKeys(obj, {
                deep: true
            })));
        });
        return socket;
    }
    CarService.subscribe = subscribe;
    function getcar(id) {
        return request_1.Coolcar.sendRequestWithAuthRetry({
            method: 'GET',
            path: `/v1/car/${encodeURIComponent(id)}`,
            respMarshaller: car_pb_1.car.v1.Car.fromObject,
        });
    }
    CarService.getcar = getcar;
})(CarService = exports.CarService || (exports.CarService = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2FyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGdEQUFpRDtBQUNqRCxtREFBNkM7QUFDN0MsdUNBQW9DO0FBRXBDLElBQWlCLFVBQVUsQ0EyQjFCO0FBM0JELFdBQWlCLFVBQVU7SUFFdkIsU0FBZ0IsU0FBUyxDQUFDLEtBQWtDO1FBQ3hELE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUM7WUFDNUIsR0FBRyxFQUFFLGlCQUFPLENBQUMsTUFBTSxHQUFHLEtBQUs7U0FDOUIsQ0FBQyxDQUFBO1FBQ0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUVuQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFjLENBQUMsQ0FBQTtZQUMxQyxLQUFLLENBQUMsWUFBRyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUM3QixhQUFhLENBQUMsR0FBRyxFQUFDO2dCQUNkLElBQUksRUFBQyxJQUFJO2FBQ1osQ0FBQyxDQUNMLENBQUMsQ0FBQTtRQUVOLENBQUMsQ0FBQyxDQUFBO1FBQ0YsT0FBTyxNQUFNLENBQUE7SUFDakIsQ0FBQztJQWZlLG9CQUFTLFlBZXhCLENBQUE7SUFHRCxTQUFnQixNQUFNLENBQUMsRUFBVTtRQUM3QixPQUFPLGlCQUFPLENBQUMsd0JBQXdCLENBQUM7WUFDcEMsTUFBTSxFQUFDLEtBQUs7WUFDWixJQUFJLEVBQUUsV0FBVyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUN6QyxjQUFjLEVBQUUsWUFBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVTtTQUN4QyxDQUFDLENBQUE7SUFDTixDQUFDO0lBTmUsaUJBQU0sU0FNckIsQ0FBQTtBQUNMLENBQUMsRUEzQmdCLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBMkIxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjYW1lbGNhc2VLZXlzID0gcmVxdWlyZShcImNhbWVsY2FzZS1rZXlzXCIpO1xuaW1wb3J0IHsgY2FyIH0gZnJvbSBcIi4vcHJvdG9fZ2VuL2Nhci9jYXJfcGJcIjtcbmltcG9ydCB7IENvb2xjYXIgfSBmcm9tIFwiLi9yZXF1ZXN0XCI7XG5cbmV4cG9ydCBuYW1lc3BhY2UgQ2FyU2VydmljZXtcbiAgICAvL+S9v+eUqHdlYnNvY2tldOi/m+ihjOi/nuaOpemAmuiur1xuICAgIGV4cG9ydCBmdW5jdGlvbiBzdWJzY3JpYmUob25Nc2c6KGM6IGNhci52MS5DYXJFbnRpdHkpID0+dm9pZCl7XG4gICAgICAgIGNvbnN0IHNvY2tldCA9IHd4LmNvbm5lY3RTb2NrZXQoe1xuICAgICAgICAgICAgdXJsOiBDb29sY2FyLndzQWRkciArICcvd3MnXG4gICAgICAgIH0pXG4gICAgICAgIHNvY2tldC5vbk1lc3NhZ2UobXNnID0+IHtcbiAgICAgICAgICAgIC8v57G75Z6L6L2s5o2iXG4gICAgICAgICAgICBjb25zdCBvYmogPSBKU09OLnBhcnNlKG1zZy5kYXRhIGFzIHN0cmluZylcbiAgICAgICAgICAgIG9uTXNnKGNhci52MS5DYXJFbnRpdHkuZnJvbU9iamVjdChcbiAgICAgICAgICAgICAgICBjYW1lbGNhc2VLZXlzKG9iaix7XG4gICAgICAgICAgICAgICAgICAgIGRlZXA6dHJ1ZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApKVxuXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBzb2NrZXRcbiAgICB9XG5cbiAgICAvL+iOt+WPlui9pui+huS/oeaBr1xuICAgIGV4cG9ydCBmdW5jdGlvbiBnZXRjYXIoaWQ6IHN0cmluZyk6UHJvbWlzZTxjYXIudjEuSUNhcj57XG4gICAgICAgIHJldHVybiBDb29sY2FyLnNlbmRSZXF1ZXN0V2l0aEF1dGhSZXRyeSh7XG4gICAgICAgICAgICBtZXRob2Q6J0dFVCcsXG4gICAgICAgICAgICBwYXRoOiBgL3YxL2Nhci8ke2VuY29kZVVSSUNvbXBvbmVudChpZCl9YCxcbiAgICAgICAgICAgIHJlc3BNYXJzaGFsbGVyOiBjYXIudjEuQ2FyLmZyb21PYmplY3QsXG4gICAgICAgIH0pXG4gICAgfVxufSJdfQ==
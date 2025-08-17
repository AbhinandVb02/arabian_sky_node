const orderController = require("../controllers/order/order.controller");

module.exports = (app) => {
  app.post("/order/add", orderController.saveOrderData);
  app.post("/order/get", orderController.getOrderData);
  app.get("/order/:order_id", orderController.getOrderByOrderId);
  app.post("/order/update", orderController.updateOrderData);
  app.post("/order/delete", orderController.deleteOrderData);
};

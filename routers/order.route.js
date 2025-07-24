const orderController = require("../controllers/order/order.controller");

module.exports = (app) => {
  app.post("/order/add", orderController.saveOrderData);
  app.post("/order/get", orderController.getOrderData);
  app.post("/order/update", orderController.updateOrderData);
  app.post("/order/delete", orderController.deleteOrderData);
};

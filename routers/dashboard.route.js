const dashboardController = require("../controllers/dashboard/dashboard.controller");

module.exports = (app) => {
  app.post("/dashboard/get", dashboardController.getDashBoardData);
};

const employeeController = require("../controllers/employee/employee.controller");

module.exports = (app) => {
  app.post("/employee/add", upload.single("image"), employeeController.addEmployee);
  app.post("/employee/list", employeeController.listEmployees);
};

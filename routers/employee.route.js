const employeeController = require("../controllers/employee/employee.controller");
const upload = require("../middlewares/upload");

module.exports = (app) => {
  app.post("/employee/add", upload.single("image"), employeeController.addEmployee);
  app.post("/employee/list", employeeController.listEmployees);
};

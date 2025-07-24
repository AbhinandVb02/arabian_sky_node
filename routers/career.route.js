const careerController = require("../controllers/career/career.controller");

module.exports = (app) => {
  app.post("/career/add", careerController.saveCareerData);
  app.post("/career/get", careerController.getCareerData);
  app.post("/career/update", careerController.updateCareerData);
  app.post("/career/delete", careerController.deleteCareerData);
};

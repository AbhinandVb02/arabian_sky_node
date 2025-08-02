const careerController = require("../controllers/career/career.controller");
const upload = require("../middlewares/upload");

module.exports = (app) => {
  app.post("/career/add", careerController.saveCareerData);
  app.post("/career/get", careerController.getCareerData);
  app.post("/career/update", careerController.updateCareerData);
  app.post("/career/delete", careerController.deleteCareerData);

  app.post("/career/job/apply", upload.single("resume_path"), careerController.saveJobApplication);
  app.post("/career/job/list", careerController.listJobApplications);
};
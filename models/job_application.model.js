const mongoose = require("mongoose");

const JobApplication = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    location: String,
    experience: String,
    resume_path: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("job_application", JobApplication);

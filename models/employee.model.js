const mongoose = require("mongoose");

const employeeScheema = new mongoose.Schema({
  name: String,
  image: String,
  designation: String,
  is_employee: Boolean,
  number: Number,
});

module.exports = mongoose.model("employee", employeeScheema);

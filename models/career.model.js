const mongoose = require("mongoose");

const CareerSchema = new mongoose.Schema(
  {
    post: { type: String },
    place: { type: String },
    type: { type: String },
    responsibility: { type: String },
    requirment: { type: String },
    qualification: { type: String },
    experience: { type: String },
    salary: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Career", CareerSchema);

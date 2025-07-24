const mongoose = require("mongoose");

const CareerSchema = new mongoose.Schema(
  {
    post: { type: String },
    place: { type: String },
    type: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Career", CareerSchema);

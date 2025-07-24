const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    title: String,
    department: String,
    location: String,
    status: String,
    locationHistory: [
      {
        value: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);

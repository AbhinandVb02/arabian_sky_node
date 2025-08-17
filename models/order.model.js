const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    order_id: String,
    title: String,
    department: String,
    location: String,
    status: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);

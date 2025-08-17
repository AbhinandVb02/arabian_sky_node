const mongoose = require("mongoose");

const OrderStatusSchema = new mongoose.Schema(
  {
    order_id: String,
    status: String,
    location: String,
    added_on: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order_Status", OrderStatusSchema);

const Order = require("../../models/order.model");

exports.saveOrderData = async function (req, res) {
  try {
    const { title, department, location, status, userId } = req.body;

    if (!title || !department || !location || !status) {
      return res.status(400).json({
        message:
          "All fields (title, department, location, status, description) are required.",
      });
    }

    const order = new Order({
      title,
      department,
      location,
      status,
      locationHistory: [
        {
          value: location,
          changedAt: new Date(),
          changedBy: userId,
        },
      ],
    });

    await order.save();

    res.status(201).json({ message: "Order added successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      error: error.message,
    });
  }
};

exports.getOrderData = async function (req, res) {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const total = await Order.countDocuments();
    const orders = await Order.find()
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("locationHistory.changedBy", "name");

    res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      error: error.message,
    });
  }
};

exports.updateOrderData = async function (req, res) {
  try {
    const { id, title, department, location, status, userId } = req.body;

    // if (!title || !department || !location || !status || !userId) {
    //   return res.status(400).json({
    //     message:
    //       "All fields (title, department, location, status, userId) are required.",
    //   });
    // }

    const existingOrder = await Order.findById(id);

    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (existingOrder.location !== location) {
      existingOrder.locationHistory.push({
        value: location,
        changedAt: new Date(),
        changedBy: userId,
      });
    }

    existingOrder.title = title;
    existingOrder.department = department;
    existingOrder.location = location;
    existingOrder.status = status;

    await existingOrder.save();

    res.status(200).json({ message: "Order updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong while updating.",
      error: error.message,
    });
  }
};

exports.deleteOrderData = async function (req, res) {
  try {
    const { id } = req.body;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({ message: "Order deleted successfully." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      message: "Something went wrong while deleting.",
      error: error.message,
    });
  }
};

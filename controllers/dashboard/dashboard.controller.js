const Order = require("../../models/order.model");

exports.getDashBoardData = async function (req, res) {
  try {
    const totalOrdercount = await Order.countDocuments();

    res.status(201).json({
      data: {
        total_count: totalOrdercount,
        service_click: 0,
      },
      message: "Dasboard data.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      error: error.message,
    });
  }
};

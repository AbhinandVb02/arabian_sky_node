const Order = require("../../models/order.model");
const ServiceClick = require("../../models/service_click.model");

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

exports.addServiceClick = async function (req, res) {
  try {
    const { serviceName, userIdentifier } = req.body;

    if (!serviceName || !userIdentifier) {
      return res.status(400).json({ message: "serviceName and userIdentifier are required." });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingClick = await ServiceClick.findOne({
      serviceName,
      userIdentifier,
      clickedAt: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingClick) {
      return;
    }

    const newClick = await ServiceClick.create({
      serviceName,
      userIdentifier
    });

    res.status(201).json({ message: "Service click recorded.", data: newClick });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};
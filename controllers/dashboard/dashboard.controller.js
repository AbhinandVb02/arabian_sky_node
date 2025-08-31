const Order = require("../../models/order.model");
const ServiceClick = require("../../models/service_click.model");

exports.getDashBoardData = async function (req, res) {
  try {
    // Define all possible statuses for the pie chart
    const statusOptions = [
      "Order Confirmed",
      "In Progress",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    // Group orders by status and count them
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Initialize all statuses with 0
    const orderStatusData = {};
    statusOptions.forEach((status) => {
      orderStatusData[status] = 0;
    });

    // Fill in the counts from the aggregation
    ordersByStatus.forEach((item) => {
      if (orderStatusData.hasOwnProperty(item._id)) {
        orderStatusData[item._id] = item.count;
      }
    });

    // Calculate total order count
    const totalOrdercount = Object.values(orderStatusData).reduce(
      (a, b) => a + b,
      0
    );

    // Get total service click count
    const serviceClickCount = await ServiceClick.countDocuments();

    // Get click count for each service
    const serviceClicksByService = await ServiceClick.aggregate([
      {
        $group: {
          _id: "$serviceName",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          serviceName: "$_id",
          count: 1,
        },
      },
    ]);

    // Get the latest 5 orders
    const latestOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      data: {
        total_count: totalOrdercount,
        orders_by_status: orderStatusData,
        service_click: serviceClickCount,
        service_clicks_by_service: serviceClicksByService,
        latest_orders: latestOrders,
      },
      message: "Dashboard data.",
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
      return res
        .status(400)
        .json({ message: "serviceName and userIdentifier are required." });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingClick = await ServiceClick.findOne({
      serviceName,
      userIdentifier,
      clickedAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existingClick) {
      return res
        .status(200)
        .json({ message: "Click already recorded for today." });
    }

    const newClick = await ServiceClick.create({
      serviceName,
      userIdentifier,
    });

    res
      .status(201)
      .json({ message: "Service click recorded.", data: newClick });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong.", error: error.message });
  }
};

const Order = require("../../models/order.model");
const OrderStatusSchema = require("../../models/order_status.model");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASS,
  },
});

exports.saveOrderData = async function (req, res) {
  try {
    const { title, department, location, status, email } = req.body;

    // if (!title || !department || !location || !status) {
    //   return res.status(400).json({
    //     message:
    //       "All fields (title, department, location, status) are required.",
    //   });
    // }

    const lastOrder = await Order.findOne({}, {}, { sort: { createdAt: -1 } });
    let nextId = 1;
    if (lastOrder && lastOrder.order_id) {
      const match = lastOrder.order_id.match(/ODR(\d+)/);
      if (match) {
        nextId = parseInt(match[1], 10) + 1;
      }
    }
    const order_id = `ODR${nextId.toString().padStart(5, "0")}`;

    const order = new Order({
      order_id,
      title,
      department,
      location,
      status,
      email,
    });

    const newOrder = await order.save();

    await OrderStatusSchema.create({
      order_id: newOrder._id,
      status,
      location,
      added_on: new Date(),
    });

    if (email) {
      const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: "Order Confirmed",
        text: `Your order has been confirmed!\n\nOrder ID: ${order_id}\n\nYou can track your order using this Order ID.\n\nThank you for your order!`,
        html: `<p>Your order has been <b>confirmed</b>!</p>
               <p><b>Order ID:</b> ${order_id}</p>
               <p>You can track your order using this Order ID.</p>
               <p>
                 <a href="${
                   process.env.CLIENT_URL + "/ordertracking"
                 }" target="_blank" style="color: #1a73e8; text-decoration: underline;">
                   Click here to track your order
                 </a>
               </p>
               <p>Thank you for your order!</p>`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Error sending confirmation email:", err);
        } else {
          console.log("Order confirmation email sent:", info.response);
        }
      });
    }

    res.status(201).json({ message: "Order added successfully.", order_id });
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
    let { page = 1, limit = 10, searchKey = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    // Build search query for order_id
    let query = {};
    if (searchKey && searchKey.trim() !== "") {
      const regex = new RegExp(searchKey.trim(), "i");
      query.order_id = regex;
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

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
    const { id, title, department, location, status, email } = req.body;

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

    existingOrder.title = title;
    existingOrder.department = department;
    existingOrder.location = location;
    existingOrder.status = status;
    existingOrder.email = email;

    await existingOrder.save();

    await OrderStatusSchema.create({
      order_id: existingOrder._id,
      status,
      location,
      added_on: new Date(),
    });

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

exports.getOrderByOrderId = async function (req, res) {
  try {
    const { order_id } = req.params;
    if (!order_id) {
      return res
        .status(400)
        .json({ message: "order_id is required in params." });
    }

    const order = await Order.findOne({ order_id: order_id });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const statusHistory = await OrderStatusSchema.find({
      order_id: order._id,
    }).sort({
      added_on: 1,
    });

    res.status(200).json(statusHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong while fetching order.",
      error: error.message,
    });
  }
};

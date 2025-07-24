const Career = require("../../models/career.model");

exports.saveCareerData = async function (req, res) {
  try {
    const { post, place, type, description } = req.body;

    if (!post || !place || !type || !description) {
      return res.status(400).json({
        message: "All fields (post, place, type, description) are required.",
      });
    }

    const career = new Career({ post, place, type, description });
    await career.save();
    res.status(201).json({ message: "Career added successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      error: error.message,
    });
  }
};

exports.getCareerData = async function (req, res) {
  try {
    let { page = 1, limit = 10 } = req.body;
    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const total = await Career.countDocuments();
    const careers = await Career.find()
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      careers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      error: error.message,
    });
  }
};

exports.updateCareerData = async function (req, res) {
  try {
    const { id, post, place, type, description } = req.body;

    if (!id || !post || !place || !type || !description) {
      return res.status(400).json({
        message:
          "All fields (id, post, place, type, description) are required.",
      });
    }

    const career = await Career.findByIdAndUpdate(
      id,
      { post, place, type, description },
      { new: true }
    );

    if (!career) {
      return res.status(404).json({ message: "Career not found." });
    }

    res.status(200).json({ message: "Career updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      error: error.message,
    });
  }
};

exports.deleteCareerData = async function (req, res) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID is required." });
    }

    const career = await Career.findByIdAndDelete(id);

    if (!career) {
      return res.status(404).json({ message: "Career not found." });
    }

    res.status(200).json({ message: "Career deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      error: error.message,
    });
  }
};

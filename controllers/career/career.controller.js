const s3 = require("../../config/aws");
const Career = require("../../models/career.model");
const JobApplication = require("../../models/job_application.model");

const { Upload } = require("@aws-sdk/lib-storage");

exports.saveCareerData = async function (req, res) {
  try {
    const {
      post,
      place,
      type,
      responsibility,
      requirment,
      qualification,
      experience,
      salary,
    } = req.body;

    if (
      !post ||
      !place ||
      !type ||
      !responsibility ||
      !requirment ||
      !qualification ||
      !experience ||
      !salary
    ) {
      return res.status(400).json({
        message:
          "All fields (post, place, type, responsibility, requirment, qualification, experience, salary) are required.",
      });
    }

    const career = new Career({
      post,
      place,
      type,
      responsibility,
      requirment,
      qualification,
      experience,
      salary,
    });
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
      careers,
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
    const {
      id,
      post,
      place,
      type,
      responsibility,
      requirment,
      qualification,
      experience,
      salary,
    } = req.body;

    if (
      !id ||
      !post ||
      !place ||
      !type ||
      !responsibility ||
      !requirment ||
      !qualification ||
      !experience ||
      !salary
    ) {
      return res.status(400).json({
        message:
          "All fields (id, post, place, type, responsibility, requirment, qualification, experience, salary) are required.",
      });
    }

    const career = await Career.findByIdAndUpdate(
      id,
      {
        post,
        place,
        type,
        responsibility,
        requirment,
        qualification,
        experience,
        salary,
      },
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

exports.saveJobApplication = async function (req, res) {
  try {
    const { name, email, phone, location, experience, resume_path } = req.body;

    // if (!name || !email || !phone || !location || !experience || !resume_path) {
    //   return res.status(400).json({
    //     message: "All fields are required for job application.",
    //   });
    // }

    const file = req.file;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `resume/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const uploader = new Upload({
      client: s3,
      params: uploadParams,
    });

    const result = await uploader.done();

    // console.log(result);

    const newApplication = await JobApplication.create({
      name,
      email,
      phone,
      location,
      experience,
      resume_path: result.Key,
    });
    res.status(200).json({ message: "Application sent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      error: error.message,
    });
  }
};

exports.listJobApplications = async function (req, res) {
  try {
    let { page = 1, limit = 10 } = req.body;
    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const total = await JobApplication.countDocuments();
    const applications = await JobApplication.find()
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      applications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      error: error.message,
    });
  }
};

exports.updateJobApplicationStatus = async function (req, res) {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res
        .status(400)
        .json({ message: "ID and status are required." });
    }

    const application = await JobApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    res.status(200).json({ message: "Application status updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      error: error.message,
    });
  }
};
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

    // if (
    //   !post ||
    //   !place ||
    //   !type ||
    //   !responsibility ||
    //   !requirment ||
    //   !qualification ||
    //   !experience ||
    //   !salary
    // ) {
    //   return res.status(400).json({
    //     message:
    //       "All fields (post, place, type, responsibility, requirment, qualification, experience, salary) are required.",
    //   });
    // }

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
    let { page = 1, limit = 10, searchKey = "" } = req.body;
    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    // Build search query
    let query = {};
    if (searchKey && searchKey.trim() !== "") {
      const regex = new RegExp(searchKey, "i");
      query = {
        $or: [{ post: regex }],
      };
    }

    const total = await Career.countDocuments(query);
    const careers = await Career.find(query)
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

    // if (
    //   !id ||
    //   !post ||
    //   !place ||
    //   !type ||
    //   !responsibility ||
    //   !requirment ||
    //   !qualification ||
    //   !experience ||
    //   !salary
    // ) {
    //   return res.status(400).json({
    //     message:
    //       "All fields (id, post, place, type, responsibility, requirment, qualification, experience, salary) are required.",
    //   });
    // }

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
    const { name, email, phone, location, experience, resume_path, job_id } =
      req.body;

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
      job_id: job_id || null,
      status: "Pending",
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
    let { page = 1, limit = 10, searchKey = "" } = req.body;
    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    // Only search by job name
    let jobQuery = {};
    if (searchKey && searchKey.trim() !== "") {
      const regex = new RegExp(searchKey.trim(), "i");
      jobQuery = { name: regex };
    }

    // Find all careers matching the job name (if searchKey provided)
    let jobIds = [];
    if (searchKey && searchKey.trim() !== "") {
      const careers = await Career.find(jobQuery).select("_id").lean();
      jobIds = careers.map(career => career._id);
      if (jobIds.length === 0) {
        // No jobs match, so return empty result
        return res.status(200).json({
          total: 0,
          page,
          limit,
          totalPages: 0,
          applications: [],
        });
      }
    }

    // Build application query
    let appQuery = {};
    if (jobIds.length > 0) {
      appQuery.job_id = { $in: jobIds };
    }

    const total = await JobApplication.countDocuments(appQuery);

    // Fetch applications and populate job details from Career model using job_id
    const applications = await JobApplication.find(appQuery)
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // For each application, fetch the job details from Career model
    const applicationJobIds = applications.map(app => app.job_id).filter(Boolean);
    const careers = await Career.find({ _id: { $in: applicationJobIds } }).lean();
    const careerMap = {};
    careers.forEach(career => {
      careerMap[career._id.toString()] = career;
    });

    const applicationsWithJob = applications.map(app => ({
      ...app,
      job: app.job_id ? careerMap[app.job_id] || null : null,
    }));

    res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      applications: applicationsWithJob,
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
      return res.status(400).json({ message: "ID and status are required." });
    }

    const application = await JobApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    res
      .status(200)
      .json({ message: "Application status updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      error: error.message,
    });
  }
};

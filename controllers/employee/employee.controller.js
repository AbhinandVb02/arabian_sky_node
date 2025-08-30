const { Upload } = require("@aws-sdk/lib-storage");
const Employee = require("../../models/employee.model");
const s3 = require("../../config/aws");

// Add a new employee
exports.addEmployee = async function (req, res) {
  try {
    const { name, image, designation, is_employee, number } = req.body;
    if (!name || !designation) {
      return res
        .status(400)
        .json({ message: "Name, designation, and is_employee are required." });
    }
    if (is_employee && !number) {
      return res
        .status(400)
        .json({ message: "Mobile number is required for employees." });
    }

    const file = req.file;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `employee/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const uploader = new Upload({
      client: s3,
      params: uploadParams,
    });

    const result = await uploader.done();

    const employee = new Employee({
      name,
      image: result.Key,
      designation,
      is_employee,
      number: is_employee ? number : undefined,
    });
    await employee.save();
    res.status(201).json({ message: "Employee added successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong.", error: error.message });
  }
};

// List all employees with is_employee filter
exports.listEmployees = async function (req, res) {
  try {
    const filter = { is_employee: req.body.is_employee };

    const employees = await Employee.find(filter);
    res.status(200).json({ data: employees });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong.", error: error.message });
  }
};

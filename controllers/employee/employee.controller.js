const { Upload } = require("@aws-sdk/lib-storage");
const Employee = require("../../models/employee.model");
const s3 = require("../../config/aws");

exports.addEmployee = async function (req, res) {
  try {
    const { name, designation, is_employee, number } = req.body;
    if (!name || !designation) {
      return res
        .status(400)
        .json({ message: "Name, designation, and is_employee are required." });
    }
    if (is_employee == true && !number) {
      return res
        .status(400)
        .json({ message: "Mobile number is required for employees." });
    }
    let imageKey;
    if (req.file) {
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
      imageKey = result.Key;
    }

    const employee = new Employee({
      name,
      image: imageKey,
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

exports.updateEmployee = async function (req, res) {
  try {
    const { id, name, designation, is_employee, number } = req.body;
    let updateData = { name, designation, is_employee, number };

    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );
    if (req.file) {
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
      updateData.image = result.Key;
    }

    const employee = await Employee.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    res
      .status(200)
      .json({ message: "Employee updated successfully.", data: employee });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong.", error: error.message });
  }
};

exports.deleteEmployee = async function (req, res) {
  try {
    const { id } = req.body;
    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    res.status(200).json({ message: "Employee deleted successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong.", error: error.message });
  }
};

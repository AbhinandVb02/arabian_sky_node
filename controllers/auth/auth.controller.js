const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/user.model");

exports.signUp = async function (req, res) {
  try {
    const { email, name, password, confirm_pass } = req.body;

    const isExisit = await User.findOne({ email });

    if (isExisit) {
      return res
        .status(400)
        .json({ message: "Email already in use. Please try another." });
    }

    if (password !== confirm_pass) {
      return res
        .status(400)
        .json({ message: "Passwords do not match. Please try again." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};

exports.login = async function (req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    res
      .status(200)
      .json({ message: "Login successful", token, user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};

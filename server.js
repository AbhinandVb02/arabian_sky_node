const express = require("express");
const cors = require("cors");

const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3033;

app.get("/", (req, res) => {
  res.json({ message: "Welcome to application." });
});

require("./config/db.config")();

require("./routers/index.route")(app);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}.`);
});

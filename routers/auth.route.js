const authController = require("../controllers/auth/auth.controller");

module.exports = (app) => {
  app.post("/signup", authController.signUp);
  app.post("/login", authController.login);
};

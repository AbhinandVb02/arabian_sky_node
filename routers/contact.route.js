const contactController = require("../controllers/contact_us/contact.service");

module.exports = (app) => {
  app.post("/contact", contactController.sendContactMail);
};

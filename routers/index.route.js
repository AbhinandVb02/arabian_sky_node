module.exports = (app) => {
  require("./auth.route")(app);
  require("./career.route")(app);
  require("./order.route")(app);
  require("./dashboard.route")(app);
  require("./contact.route")(app);
  require("./employee.route")(app);
};

module.exports = (app) => {
  require("./auth.route")(app);
  require("./career.route")(app);
  require("./order.route")(app);
};

var counter = 1;
var c = require('./c.js');

module.exports = {
  fn: function () {
    return counter++;
  },
  c_fn: function () {
    return c.fn();
  }
};
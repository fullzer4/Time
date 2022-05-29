var counter = 1;
var b = require('./b.js');

module.exports = {
  fn: function () {
    return counter++;
  },
  b_fn: function(){
    return b.fn();
  },
  c_fn: function(){
  return b.c_fn();
}
};
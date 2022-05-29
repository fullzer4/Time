var path = require('path'),
  wipe = require("../index");


/** proxyquire-compatible resolver **/

function resolver(stubs, fileName, module) {
  var dirname = module ? path.dirname(module) : '';
  var requireName = fileName;
  if (dirname) {
    requireName = fileName.charAt(0) == '.' ? path.normalize(dirname + '/' + fileName) : fileName;
  }

  for (var i in stubs) {
    if (requireName.indexOf(i) > 0) {
      return stubs[i];
    }
  }
}

// wipe anything from helpers, and app.js.
// but keep hands off node_modules and core during bubbling.
wipe({
  'helpers/*': true,
  'App.js': true
}, resolver, function (moduleName) {
  return !(moduleName.indexOf('node_modules') > 0) && !(moduleName.indexOf('core') > 0)
});
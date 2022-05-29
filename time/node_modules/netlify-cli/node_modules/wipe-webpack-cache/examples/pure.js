var path = require('path'),
  wipe = require("../index");


/** proxyquire-compatible resolver **/

function resolver(stubs, fileName, module) {
  return !fileName.indexOf('node_modules') > 0
}

// wipe everything, except node_modules
wipe(null, resolver, function (moduleName) {
  return !resolver(null, moduleName);
});
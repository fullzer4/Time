"use strict";
const {burn, removeFromCache} = require('wipe-node-cache');

function waveCallback_default() {
  return true;
}

function check() {
  if (!module.hot) {
    const error = new Error("wipeWebpackCache: HRM must be enabled, please add HotModuleReplacementPlugin or specify --hot");
    console.error(error.message);
    throw error;
  }

  if (typeof __webpack_modules__ === 'undefined') {
    console.error('wipeWebpackCache:');
    throw new Error("wipeWebpackCache: requires webpack environment. Use wipeNodeCacheInstead");
  }

  if (Object.keys(__webpack_modules__)[0] === '0' &&
    module.id.indexOf('wipe-webpack-cache') < 0
  ) {
    const error = new Error("wipeWebpackCache: you have to provide modulesNames, please add NamedModulesPlugin to your webpack configuration");
    console.error(error.message);
    throw error;
  }
  check = function () {
  };
}

/**
 * Wipes webpack module cache.
 * First it look for modules to wipe, and wipe them.
 * Second it looks for users of that modules and wipe them to. Repeat.
 * Use waveCallback to control secondary wave.
 * @param {Object} stubs Any objects, which will just be passed as first parameter to resolver.
 * @param {Function} resolver function(stubs, moduleName) which shall return true, if module must be wiped out.
 * @param {Function} [waveCallback] function(moduleName) which shall return false, if parent module must not be wiped.
 */
function wipeCache(stubs, resolver, waveCallback = waveCallback_default) {
  check();
  var wipeList = [];

  var cache = require.cache;

  // First wave
  Object.keys(cache).forEach(function (moduleName) {
    var test = resolver(stubs, moduleName);
    if (test) {
      wipeList.push.apply(wipeList, cache[moduleName].parents);
      removeFromCache(moduleName);
    }
  });

  burn(cache, wipeList, cache, waveCallback, removeFromCache);
}

module.exports = wipeCache;
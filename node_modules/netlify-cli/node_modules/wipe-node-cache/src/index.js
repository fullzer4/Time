function waveCallback_default() {
  return true;
}

function removeFromCache_nodejs(moduleName) {
  delete require.cache[moduleName];
}

function assignParents(modules) {
  const result = {};
  Object.keys(modules).forEach(function (moduleName) {
    const parent = modules[moduleName];
    const line = parent.children || [];
    line.forEach(({id: childName}) => {
      result[childName] = result[childName] || {parents: []};
      result[childName].parents.push(moduleName)
    });
  });
  return result;
}

function removeModuleFromParent(parent, removedChild) {
  if(parent && parent.children && removedChild) {
    parent.children = parent.children.filter(child => child !== removedChild);
  }
}

function burn(cache, wipeList, lookup, callback, removeFromCache = removeFromCache_nodejs) {
  const parentReference = {};

  const remove = (moduleName) => {
    const lookupcache = lookup[moduleName];
    const module = cache[moduleName];
    delete parentReference[moduleName];
    if (lookupcache) {
      lookupcache.parents.forEach(parent => {
        if (!parentReference[parent]) {
          parentReference[parent]=[]
        }
        // set a flag to remove this module from a parent record
        parentReference[parent].push(module);
        wipeList.push(parent);
      });
      delete lookup[moduleName];
    }
    removeFromCache(moduleName);
  }

  // primary wave
  // execute what was set to be removed
  let removeList = wipeList;
  wipeList = [];
  removeList.forEach(remove);

  // Secondary wave
  // remove parents of evicted modules while possible
  while (wipeList.length) {
    removeList = wipeList;
    wipeList = [];

    removeList.forEach(function (moduleName) {
      if (callback(moduleName)) {
        remove(moduleName);
      }
    });
  }

  // post cleanup - remove references from parent
  Object.keys(parentReference).forEach(
    (parent) => parentReference[parent].forEach(child => removeModuleFromParent(cache[parent], child))
  );
}

function purge(cache, wipeList, callback, removeFromCache, parents) {
  burn(cache, wipeList, parents || assignParents(cache), callback, removeFromCache);
}

function buildIndexForward(cache) {
  return Object.keys(cache);
}

function getCache() {
  return require.cache;
}

/**
 * Wipes node.js module cache.
 * First it look for modules to wipe, and wipe them.
 * Second it looks for users of that modules and wipe them to. Repeat.
 * Use waveCallback to control secondary wave.
 * @param {Object} stubs Any objects, which will just be passed as first parameter to resolver.
 * @param {Function} resolver function(stubs, moduleName) which shall return true, if module must be wiped out.
 * @param {Function} [waveCallback] function(moduleName) which shall return false, if parent module must not be wiped.
 */
function wipeCache(stubs, resolver, waveCallback, removeFromCache = removeFromCache_nodejs) {
  waveCallback = waveCallback || waveCallback_default;
  const cache = require.cache;

  wipeMap(
    cache,
    (cache, callback) => cache.forEach(
      moduleName => resolver(stubs, moduleName) && callback(moduleName)
    ),
    waveCallback,
    removeFromCache
  );
}

function wipeMap(cache, callback, waveCallback, removeFromCache) {
  const wipeList = [];
  const parents = assignParents(cache);
  const simpleIndex = buildIndexForward(cache);
  const compositeIndex = [...new Set([...simpleIndex, ...Object.keys(parents)])];
  callback(compositeIndex, name => {
    wipeList.push(name);
  });
  return purge(cache, wipeList, waveCallback, undefined, parents);
}

exports.buildIndexForward = buildIndexForward;
exports.getCache = getCache;
exports.removeFromCache = removeFromCache_nodejs;
exports.purge = purge;
exports.burn = burn;

exports.wipeCache = wipeCache;
exports.wipeMap = wipeMap;


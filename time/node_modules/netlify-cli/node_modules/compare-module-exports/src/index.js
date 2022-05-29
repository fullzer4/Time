function generate(libraryName) {

  let hasError = false;
  let errors = [];
  const pushError = (err) => errors.push(err);

  function testFunction(a, b, file, name) {
    if (a.length !== b.length) {
      if (a.toString().indexOf('_could_be_any_') < 0) {
        pushError(name + ': in' + file + '\n\t\t' + a.toString() + '\n\tdoes not match\n\t\t' + b.toString());
        throw new Error(libraryName + ': function argument mismatch: ' + file + ': ' + name);
      }
    }
  }

  function test(a, b, file, name, options) {
    if (!b) {
      throw new Error(libraryName + ': mocked export "' + name + '" does not exists in ' + file);
    }
    const typeOfA = typeof a;
    const typeOfB = typeof b;
    if (typeOfA !== typeOfB) {
      throw new Error(libraryName + ': exported type mismatch: ' + file + ':' + name + '. Expected ' + typeOfB + ', got ' + typeOfA + '');
    }
    if (typeOfA === 'function') {
      if (!options.noFunctionCompare) {
        return testFunction(a, b, file, name);
      }
    }
  }

  function matchExports(realExports, mockedExports, realFile, mockFile, options = {}) {
    hasError = false;
    const typeOfA = typeof mockedExports;
    const typeOfB = typeof realExports
    if (typeOfA !== typeOfB) {
      pushError(
        libraryName + ': mock ' + mockFile + ' exports does not match a real file.' +
        ' Expected ' + typeOfB + ', got ' + typeOfA + ''
      );
      return true;
    }
    if (typeof mockedExports === 'function') {
      try {
        test(mockedExports, realExports, realFile, 'exports', options);
      } catch (e) {
        pushError(e.message);
        hasError = true;
      }
    } else if (typeof mockedExports === 'object') {
      Object.keys(mockedExports).forEach(key => {
        try {
          test(mockedExports[key], realExports[key], realFile, key, options)
        } catch (e) {
          pushError(e.message);
          hasError = true;
        }
      });
    }
    return hasError ? errors : false;
  }

  function tryMatchExports(realExports, mockedExports, realFile, mockFile, options = {}) {
    errors = [];
    const exports = matchExports(realExports, mockedExports, realFile, mockFile, options);
    if (exports) {
      errors = [];
      if (realExports.default) {
        const defaultExport = matchExports(realExports, {default: mockedExports}, realFile, mockFile, options)
        return defaultExport ? defaultExport.concat(exports) : false;
      }
      return exports;
    }
    return false;
  }

  return tryMatchExports;
}

module.exports = generate;
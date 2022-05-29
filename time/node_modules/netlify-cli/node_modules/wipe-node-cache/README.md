**Keep your cache clear** – as my mom always says.

wipeNodeCache – cleans, clears and wipes all old dirty modules from node.js internal require.cache. 

Useful for testing purposes when you need to freshly require a module. Or two.
Or just keep all modules fresh, for example for proxyquire.

## Install

```sh
$ npm install --save wipe-node-cache
```

## Usage

```js
// foo.js
var i = 0;
module.exports = function () {
	return ++i;
};
```

```js
var wipe = require('wipe-node-cache');

require('./foo')();
//=> 1

require('./foo')();
//=> 2

wipe(null, function(){return true;})

require('./foo')();
//=> 1 . Module is fresh now
```

But this is simply, and stupid way. We can do it better!

## API

### wipe(object1, filterCallback, bubbleCallback)

Foreach module in system wipe will call _filterCallback_ with 2 arguments – object1 and moduleName(absolute))
And you shall return true, if you want to wipe this module.

After first pass wipe will enter bubbling stage, and will wipe all modules, which use first ones.
Each time _bubbleCallback_ will be called with 1 argument - moduleName.
And you can decide - purge it, or not. 

## Examples

(see examples in source)
```js
function resolver(stubs, fileName, module) {
  return !fileName.indexOf('node_modules') > 0
}

// wipe everything, except node_modules
wipe(null, resolver, function (moduleName) {
  return !resolver(null, moduleName);
});
```

```js
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
```

## Related

- [proxyquire](https://github.com/thlorenz/proxyquire) - Usefull testing tool, but with bad caching politics.

/*jshint asi:true*/
/*global describe, before, beforeEach, it */
'use strict';

var assert = require('assert');
const {wipeCache:wipe} = require('../src');

var stubs = {
  'samples/bar': {
    rab: function () {
      return 'resolved'
    }
  },
  '/sub.js': {
    subFn: function () {
      return 'override';
    },
    '@deep': true
  }
};

function collectModules() {
  const modules = require.cache;
  var result = {};
  Object.keys(modules).forEach(function (moduleName) {
    const parent = modules[moduleName];
    const line = parent.children || [];
    line.forEach(({id: childName}) => {
      result[childName] = true;
    });
  });
  return Object.keys(result);
}

describe('cache wipe', function () {
  describe('standart flow', function () {
    it('should cache modules', function () {
      var a = require('./src/a.js');
      assert.equal(a.fn(), 1);
      assert.equal(a.c_fn(), 1);
      var a1 = require('./src/a.js');
      assert.equal(a1.fn(), 2);
      assert.equal(a.b_fn(), 1);
      var b = require('./src/b.js');
      assert.equal(b.fn(), 2);
      assert.equal(b.c_fn(), 2);
      var c = require('./src/c.js');
      assert.equal(c.fn(), 3);
    });
  });

  describe('override flow', function () {
    it('should reset module', function () {
      //wipe all
      wipe(null, function () {
        return true
      });

      var a = require('./src/a.js');
      assert.equal(a.fn(), 1);
      var a1 = require('./src/a.js');
      assert.equal(a1.fn(), 2);
      assert.equal(a.b_fn(), 1);

      wipe(null, function (stub, fileName) {
        return fileName.indexOf('test/src') > 0
      });

      assert.equal(a.b_fn(), 2);

      var b = require('./src/b.js');
      assert.equal(b.fn(), 1);
    });


    it('should reset deep module module', function () {
      wipe(null, function () {
        return true
      });
      var a = require('./src/a.js');
      assert.equal(a.fn(), 1);
      assert.equal(a.c_fn(), 1);

      // A and B are in the cache
      assert.notEqual(collectModules().indexOf(require.resolve('./src/c.js')), -1);
      assert.notEqual(collectModules().indexOf(require.resolve('./src/b.js')), -1);

      wipe(null, function (stub, fileName) {
        return fileName.indexOf('test/src/c') > 0
      });

      // A and B are in no longer the cache
      assert.equal(collectModules().indexOf(require.resolve('./src/c.js')), -1);
      assert.equal(collectModules().indexOf(require.resolve('./src/b.js')), -1);

      var c = require('./src/c.js');
      assert.equal(c.fn(), 1);

      var a2 = require('./src/a.js');
      assert.equal(a2.fn(), 1);
    });

    it('should reset only deep module module', function () {
      wipe(null, function () {
        return true
      });
      var a = require('./src/a.js');
      assert.equal(a.fn(), 1);
      assert.equal(a.c_fn(), 1);

      // A and B are in the cache
      assert.notEqual(collectModules().indexOf(require.resolve('./src/c.js')), -1);
      assert.notEqual(collectModules().indexOf(require.resolve('./src/b.js')), -1);

      wipe(null, function (stub, fileName) {
        return fileName.indexOf('test/src/c') > 0
      }, function () {
        return false;
      });

      // C not in
      assert.equal(collectModules().indexOf(require.resolve('./src/c.js')), -1);
      // B is in
      assert.notEqual(collectModules().indexOf(require.resolve('./src/b.js')), -1);

      var c = require('./src/c.js');
      assert.equal(c.fn(), 1);

      var a2 = require('./src/a.js');
      assert.equal(a2.fn(), 2);
    });

  });

});

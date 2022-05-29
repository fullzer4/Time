/*jshint asi:true*/
/*global describe, before, beforeEach, it */
'use strict';

var assert = require('assert');
var wipe = require('../lib/index.js');

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

    it('should reset module in test/src', function () {
      // wipe all
      wipe(null, function () {
        return true
      });

      var a = require('./src/a.js');
      assert.equal(a.fn(), 1);
      var a1 = require('./src/a.js');
      assert.equal(a1.fn(), 2);
      assert.equal(a.b_fn(), 1);

      wipe(null, function deleteFromTest(stub, fileName) {
        return fileName.indexOf('test/src') > 0;
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

      wipe(null, function (stub, fileName) {
        return fileName.indexOf('test/src/c') > 0
      });

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

      wipe(null, function (stub, fileName) {
        return fileName.indexOf('test/src/c') > 0
      }, function () {
        return false;
      });

      var c = require('./src/c.js');
      assert.equal(c.fn(), 1);

      var a2 = require('./src/a.js');
      assert.equal(a2.fn(), 2);
    });

  });

});

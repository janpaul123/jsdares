/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true newcap: true undef: true es5: true node: true devel: true
         forin: true */
/*global define: true */

(typeof define === "undefined" ? function ($) { $(require, exports, module) } : define)(function (require, exports, module, undefined) {

'use strict';

var _assert = require('assert')
var run = require('../test').run
var Logger = require('./utils/logger').Logger



exports['test that passes'] = function (assert) {
    run({
      'test fixture': function () {
        _assert.equal(1, 1, 'Must be equal')
      }
    }, Logger(function (passes, fails, errors) {
      assert.equal(passes.length, 1, 'Must pass one test')
      assert.equal(fails.length, 0, 'Must not fail any test')
      assert.equal(errors.length, 0, 'Must not contain any errors')
    }))
}

exports['test that fails'] = function (assert) {
  run({
    'test fixture': function () {
      _assert.equal(1, 2, 'Must be two')
    }
  }, Logger(function (passes, fails, errors) {
    assert.equal(passes.length, 0, 'Must not pass any test')
    assert.equal(fails.length, 1, 'Must fail one test')
    assert.equal(errors.length, 0, 'Must not contain any errors')
  }))
}

exports['test that throws error'] = function (assert) {
  run({
    'test fixture': function () {
      throw new Error('Boom!!')
    }
  }, Logger(function (passes, fails, errors) {
    assert.equal(passes.length, 0, 'Must not pass any test')
    assert.equal(fails.length, 0, 'Must not fail any test')
    assert.equal(errors.length, 1, 'Must contain one error')
  }))
}

exports['test that passes one assert and fails fast'] = function (assert) {
  run({
    'test fixture': function (assert) {
      assert.equal(1, 1, 'Must be equal')
      _assert.equal(1, 2, 'Must fail test')
    }
  }, Logger(function (passes, fails, errors) {
    assert.equal(passes.length, 1, 'Must pass one test')
    assert.equal(fails.length, 1, 'Must fail one test')
    assert.equal(errors.length, 0, 'Must not contain any errors')
  }))
}

exports['test async with fast fail'] = function (assert) {
  run({
    'test:must throw': function (assert, done) {
      throw new Error('Boom!!')
    }
  }, Logger(function (passes, fails, errors) {
    assert.equal(passes.length, 0, 'Must not pass any test')
    assert.equal(fails.length, 0, 'Must not fail any test')
    assert.equal(errors.length, 1, 'Must contain one error')
  }))
}

})

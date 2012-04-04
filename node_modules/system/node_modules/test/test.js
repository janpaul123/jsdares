/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true devel: true
         forin: true */
/*global define: true */
(typeof define === "undefined" ? function ($) { $(require, exports, module) } : define)(function (require, exports, module, undefined) {

'use strict';

var Assert = require('./assert').Assert

var ERR_COMPLETED_ASSERT = 'Assert in completed test'
var ERR_COMPLETED_COMPLETE = 'Attemt to complete test more then one times'
var ERR_EXPECT = 'AssertionError'


/**
 * Creates a test function.
 */
function Test(name, unit, logger, Assert) {
  var isSync = unit.length <= 1
  var isFailFast = !unit.length
  var isDone = false
  return function test(next) {
    logger = logger.section(name)
    var assert = Assert(logger)
    function done() {
      if (isDone) return logger.error(new Error(ERR_COMPLETED_COMPLETE))
      isDone = true
      next()
    }
    try {
      var result = unit(assert, done)
      // If it's async test that returns a promise.
      if (result && typeof(result.then) === 'function') {
        result.then(function passed() {
          logger.pass('passed')
          done()
        }, function failed(reason) {
          logger.fail(reason)
          done()
        })
      } else {
        if (isFailFast) logger.pass('passed')
        if (isSync) done()
      }
    } catch (exception) {
      if (ERR_EXPECT === exception.name) assert.fail(exception)
      else logger.error(exception)
      done()
    }
  }
}


/**
 * Creates a test suite / group. Calling returned function will execute
 * all test in the given suite.
 */
function Suite(name, units, logger, Assert) {
  // Collecting properties that represent test functions or suits.
  var names = Object.keys(units).filter(function isTest(name) {
    return 0 === name.indexOf('test')
  })
  // Returning a function that executes all test in this suite and all it's
  // sub-suits.
  return function suite(done) {
    // Chaining test / suits so that each is executed after last is done.
    (function next() {
      var name = names.shift()
      if (name) Unit(name, units[name], logger, units.Assert || Assert)(next)
      else done()
    })(logger = logger.section(name))
  }
}
function Unit(name, units, logger, Assert) {
  return typeof(units) === 'function' ? Test(name, units, logger, Assert)
                                      : Suite(name, units, logger, Assert)
}


/**
 * Test runner function.
 */
exports.run = function run(units, logger) {
  Unit('Running all tests:', units, logger, Assert)(function done() {
    logger.report()
  })
}


});

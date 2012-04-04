/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true newcap: true undef: true es5: true node: true devel: true
         forin: true */
/*global define: true */

(typeof define === "undefined" ? function ($) { $(require, exports, module) } : define)(function (require, exports, module, undefined) {

'use strict';

exports.Logger = function Logger(callback) {
  if (!(this instanceof Logger)) return new Logger(callback)
  this.passes = []
  this.fails = []
  this.errors = []
  this.pass = function (message) {
    this.passes.push(message)
  }
  this.fail = function fail(assertion) {
    this.fails.push(assertion)
  }
  this.error = function error(exception) {
    this.errors.push(exception)
  }
  this.section = function section() {
    return this
  }
  this.report = function report() {
    if (callback)
      callback(this.passes, this.fails, this.errors)
  }
  return this
}

})

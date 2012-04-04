/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true newcap: true undef: true es5: true node: true devel: true
         forin: false */
/*global define: true */

(typeof define === "undefined" ? function ($) { $(require, exports, module) } : define)(function (require, exports, module, undefined) {


var Logger = require('./logger').Logger
var test = require('../../test')

exports.Assert = require('../../assert').Assert
exports.run = function run(units, logger) {
  test.run(units, logger || new Logger())
}

});

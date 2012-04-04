/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true newcap: true undef: true es5: true node: true devel: true
         forin: false */
/*global define: true */


(typeof define === "undefined" ? function ($) { $(require, exports, module) } : define)(function (require, exports, module, undefined) {

"use strict";

var font = require('./ansi-font/index')
var toSource = require('../../utils').source

var INDENT = '  '

function passed(message) {
  return font.green('✓ ' + message)
}
function failed(message) {
  return font.red('✗ ' + message)
}
function errored(message) {
  return font.magenta('⚡ ' + message)
}

function indent(message, indentation) {
  indentation = undefined === indentation ? INDENT : indentation
  message = message || ''
  return message.replace(/^/gm, indentation)
}

function report(message) {
  process.stdout.write(message + '\n')
}

function Logger(options) {
  if (!(this instanceof Logger)) return new Logger(options)

  options = options || {}
  var print = options.print || report
  var indentation = options.indentation || ''
  var results = options.results || { passes: [], fails: [], errors: [] }

  this.pass = function pass(message) {
    results.passes.push(message)
    print(indent(passed(message), indentation))
  }

  this.fail = function fail(error) {
    results.fails.push(error)
    var message = error.message
    if ('expected' in error)
      message += '\n  Expected: \n' + toSource(error.expected, INDENT)
    if ('actual' in error)
      message += '\n  Actual: \n' + toSource(error.actual, INDENT)
    if ('operator' in error)
      message += '\n  Operator: ' + toSource(error.operator, INDENT)
    print(indent(failed(message), indentation))
  }

  this.error = function error(exception) {
    results.errors.push(exception)
    print(indent(errored(exception.stack || exception), indentation))
  }

  this.section = function section(title) {
    print(indent(title, indentation))
    return new Logger({
      print: print,
      indentation: indent(indentation),
      results: results
    })
  }

  this.report = function report() {
    print('Passed:' + results.passes.length +
          ' Failed:' + results.fails.length +
          ' Errors:' + results.errors.length)
  }
}
exports.Logger = Logger

});

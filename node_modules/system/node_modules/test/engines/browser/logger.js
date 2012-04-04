/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true newcap: true undef: true es5: true node: true devel: true
         forin: false */
/*global define: true, document: true */


(typeof define === "undefined" ? function ($) { $(require, exports, module) } : define)(function (require, exports, module, undefined) {

"use strict";

var toSource = require('../../utils').source

var INDENT = '  '

function color(name, message) {
  return '<span' + (name ? ' style="color:' + name + '"': '') + '>' +
            message +
         '</span>'
}
function passed(message) {
  return color('green', '✓ ' + message)
}
function failed(message) {
  return color('red', '✗ ' + message)
}
function errored(message) {
  return color('magenta', '⚡ ' + message)
}

function indent(message, indentation) {
  indentation = undefined === indentation ? INDENT : indentation
  message = message || ''
  return message.replace(/^/gm, indentation)
}

function Output(parent) {
  var output = document.createElement('pre')
  if (!parent) {
    parent = document.documentElement
    output.style.padding = '20px'
    output.style.color = 'white'
    output.style.background = 'rgba(0,0,0,0.8)'
    output.style.position = 'absolute'
    output.style.top = 0
    output.style.left = 0
    output.style.heigth = '100%'
    output.style.overflow = 'auto'
  }
  parent.appendChild(output)
  return output
}
function Logger(options) {
  if (!(this instanceof Logger)) return new Logger(options)

  options = options || {}
  var output = Output(options.output)
  function print(text) {
    var message = document.createElement('pre')
    message.innerHTML = text
    output.appendChild(message)
  }

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
    print(indent(errored(toSource(exception)), indentation))
  }

  this.section = function section(title) {
    print(indent(title, indentation))
    return new Logger({
      output: output,
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

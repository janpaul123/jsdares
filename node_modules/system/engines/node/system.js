'use strict'

var print, stdin

try { // node >= 0.3.0
  print = require('util').puts
} catch (e) { // node <= 0.3.0
  print = require('sys').puts
}

Object.defineProperties(exports, {
  stdout: {
    value: process.stdout,
    enumerable: true
  },
  stdin: {
    get: function() {
      return stdin || (stdin = process.openStdin())
    },
    enumerable: true
  },
  stderr: {
    get: function() {
      return stdin || (stdin = process.openStdin())
    },
    enumerable: true
  },
  env: {
    value: process.env,
    enumerable: true
  },
  args: {
    value: process.argv,
    enumerable: true
  },
  print: {
    value: print,
    enumerable: true
  },
  engine: {
    value: 'node',
    enumerable: true
  }
})

/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true newcap: true undef: true es5: true node: true devel: true
         forin: true */
/*global define: true */

(typeof define === "undefined" ? function ($) { $(require, exports, module) } : define)(function (require, exports, module, undefined) {

'use strict';

exports['test fail fast'] = require('../../fail-fast')
exports['test async'] = require('../../async')
exports['test assertions'] = require('../../assert')
exports['test custom `Assert`\'s'] = require('../../custom-asserts')

if (module == require.main)
  require('../../../engines/node/test').run(exports)

});

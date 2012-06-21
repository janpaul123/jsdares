/*jshint node:true*/
"use strict";

var jsmm = {};
jsmm.debug = true;

require('./jsmm.nodes')(jsmm);
require('./jsmm.parser')(jsmm);
require('./jsmm.tree')(jsmm);
require('./jsmm.msg')(jsmm);
require('./jsmm.context')(jsmm);
require('./jsmm.run')(jsmm);
require('./jsmm.func')(jsmm);
require('./jsmm.dot')(jsmm);
require('./jsmm.simple.runner')(jsmm);
require('./jsmm.static.runner')(jsmm);
require('./jsmm.test')(jsmm);
require('./jsmm.editor')(jsmm);

module.exports = jsmm;
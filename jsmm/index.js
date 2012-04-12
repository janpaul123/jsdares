/*jshint node:true*/
"use strict";

var jsmm = {};
jsmm.verbose = false;

require('./jsmm.base')(jsmm);
require('./jsmm.parser')(jsmm);
require('./jsmm.safe')(jsmm);
require('./jsmm.step')(jsmm);
require('./jsmm.browser')(jsmm);
require('./jsmm.test')(jsmm);
require('./jsmm.static.runner')(jsmm);
require('./jsmm.editor')(jsmm);

module.exports = jsmm;
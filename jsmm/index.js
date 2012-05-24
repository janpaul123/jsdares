/*jshint node:true*/
"use strict";

var jsmm = {};
jsmm.verbose = false;

require('./jsmm.base')(jsmm);
require('./jsmm.parser')(jsmm);
require('./jsmm.run')(jsmm);
// require('./jsmm.safe')(jsmm);
// require('./jsmm.step')(jsmm);
require('./jsmm.dot')(jsmm);
require('./jsmm.simple.runner')(jsmm);
require('./jsmm.static.runner')(jsmm);
require('./jsmm.test')(jsmm);
require('./jsmm.editor')(jsmm);
require('./jsmm.info')(jsmm);

module.exports = jsmm;
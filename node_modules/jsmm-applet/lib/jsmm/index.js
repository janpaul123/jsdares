/*jshint node:true*/
"use strict";

var jsmm = {};
jsmm.debug = true;
jsmm.maxWidth = 60;
jsmm.defaultLimits = {
	history: 30,
	base: {
		callStackDepth: 100,
		executionCounter: 4000,
		costCounter: 1000
	},
	event: {
		callStackDepth: 100,
		executionCounter: 400,
		costCounter: 100
	}
};

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
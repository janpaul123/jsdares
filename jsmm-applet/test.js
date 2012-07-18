/*jshint node:true*/
"use strict";

var jsmm = require('./jsmm');
var result = jsmm.test.runAll();
console.log(jsmm.test.output);

if (!result) {
	throw new Error("Testing was unsuccessful...");
}

/*jshint node:true*/
"use strict";

var output = {};

require('./output.console')(output);
require('./output.canvas')(output);

module.exports = output;
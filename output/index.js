/*jshint node:true*/
"use strict";

var output = {};

require('./output.console')(output);
require('./output.canvas')(output);
require('./output.robot')(output);
require('./output.ui')(output);

module.exports = output;
/*jshint node:true*/
"use strict";

var output = {};

require('./output.robot')(output);
require('./output.console')(output);
require('./output.canvas')(output);
require('./output.events')(output);
require('./output.math')(output);
require('./output.performance')(output);
require('./output.config')(output);

var window;
if (window) window.henk = output;

module.exports = output;

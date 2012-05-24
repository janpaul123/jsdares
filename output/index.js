/*jshint node:true*/
"use strict";

var output = {};

require('./output.console')(output);
require('./output.console.info')(output);
require('./output.canvas')(output);
require('./output.canvas.info')(output);
require('./output.robot')(output);
require('./output.robot.info')(output);
require('./output.info')(output);
require('./output.ui')(output);

module.exports = output;
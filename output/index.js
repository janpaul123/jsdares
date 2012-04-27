/*jshint node:true*/
"use strict";

var output = {};

require('./output.console')(output);
require('./output.canvas')(output);
require('./output.robot')(output);
require('./output.dares')(output);
require('./output.imagedare')(output);

module.exports = output;
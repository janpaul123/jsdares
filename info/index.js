/*jshint node:true*/
"use strict";

var info = {};

require('./info.info')(info);
require('./info.console')(info);
require('./info.canvas')(info);
require('./info.robot')(info);
require('./info.jsmm')(info);

module.exports = info;
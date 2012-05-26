/*jshint node:true*/
"use strict";

var info = {};

require('./info.info')(info);
require('./info.jsmm')(info);
require('./info.robot')(info);
require('./info.console')(info);
require('./info.canvas')(info);

module.exports = info;
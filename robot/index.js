/*jshint node:true*/
"use strict";

var robot = {};

require('./robot.animation')(robot);
require('./robot.manager')(robot);
require('./robot.robot')(robot);

module.exports = robot;
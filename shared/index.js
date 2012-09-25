/*jshint node:true*/
"use strict";

var shared = {};
require('./shared.validation')(shared);
require('./shared.dares')(shared);

module.exports = shared;
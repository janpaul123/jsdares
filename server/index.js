/*jshint node:true*/
"use strict";

var server = {};
require('./server.init')(server);
require('./server.api')(server);

module.exports = server;
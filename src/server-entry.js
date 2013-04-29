/*jshint node:true*/
"use strict";

process.env.JSDARES_PORT = process.env.JSDARES_PORT || 3000;

require('./server-connect').listen(process.env.JSDARES_PORT);

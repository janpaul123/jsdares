/*jshint node:true*/
"use strict";

// Use PORT for Heroku
process.env.PORT = process.env.PORT || 3000;

require('./server-connect-grunt').listen(process.env.PORT);

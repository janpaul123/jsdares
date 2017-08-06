/*jshint node:true*/
"use strict";

var dares = {};

require('./dares.collection')(dares);
require('./dares.content')(dares);
require('./dares.common')(dares);
require('./dares.consolematch')(dares);
require('./dares.imagematch')(dares);
require('./dares.robotgoal')(dares);
require('./dares.editor')(dares);

module.exports = dares;
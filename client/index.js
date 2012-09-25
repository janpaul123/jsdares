/*jshint node:true*/
"use strict";

var client = {};

require('./client.init')(client);
require('./client.login')(client);
require('./client.menu.header')(client);
require('./client.sync')(client);
require('./client.manager')(client);
require('./client.page.home')(client);
require('./client.page.create')(client);

module.exports = client;
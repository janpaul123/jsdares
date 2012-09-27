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
require('./client.page.learn')(client);
require('./client.page.users.list')(client);
require('./client.page.users.single')(client);

module.exports = client;
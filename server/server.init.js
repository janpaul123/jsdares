/*jshint node:true*/
"use strict";

var connect = require('connect');
var mongo = require('mongoskin');
var uuid = require('node-uuid');
var lessMiddleware = require('less-middleware');
var browserify = require('browserify');

module.exports = function(server) {
	server.init = function(options) {
		console.log('mongo' , options.mongodb);
		var db = mongo.db(options.mongodb);
		var api = new server.API(db);
		db.bind('users');
		db.bind('collections');
		db.bind('dares');
		db.bind('instances');

		db.open(function(err, db) {
			if (err) {
				console.log('MongoDB error:', err);
				return;
			}

			var app = connect()
				.use(connect.logger('tiny'))
				.use('/api', api.getMiddleware())
				.use(lessMiddleware(options.less))
				.use(browserify(options.browserify))
				.use(connect['static'](options.assets))
				.listen(options.port);
		});
	};
};

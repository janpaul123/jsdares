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
		var database = mongo.db(options.mongodb);
		var api = new server.API(database);
		database.bind('users');
		database.bind('collections');
		database.bind('dares');
		database.bind('instances');

		database.open(function(err, db) {
			if (err) {
				console.log('MongoDB error:', err);
				return;
			}

			server.dares(database);

			var app = connect()
				.use(connect.logger('tiny'))
				.use('/api', api.getMiddleware())
				.use(lessMiddleware(options.less))
				.use(browserify(options.browserify))
				.use('', function(req, res, next) {
					if(req.url.indexOf('/home') === 0) req.url = '/';
					next();
				})
				.use(connect['static'](options.assets))
				.listen(options.port);
		});
	};
};

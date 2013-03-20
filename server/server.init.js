/*jshint node:true*/
"use strict";

var connect = require('connect');
var mongo = require('mongoskin');
var uuid = require('node-uuid');
var lessMiddleware = require('less-middleware');
var browserify = require('browserify');
var fs = require('fs');
var mainUrls = ['intro', 'dare', 'edit', 'full', 'learn', 'create', 'superheroes', 'about', 'blindfold'];

module.exports = function(server) {
	server.init = function(options) {
		var objects = {
			database: mongo.db(options.mongodb),
			mailer: new server.Mailer(options.mailer)
		};
		
		objects.common = new server.Common(options.api, objects);
		objects.api = new server.API(options.api, objects);
		
		objects.database.bind('users');
		objects.database.bind('collections');
		objects.database.bind('dares');
		objects.database.bind('instances');

		var noCache = function(req, res, next) {
			res.on('header', function(header) {
				res.setHeader('Cache-Control', 'private, max-age=0');
				res.setHeader('Expires', 'Thu, 01 Jan 1970 00:00:00 GMT');
				res.setHeader('Pragma', 'no-cache');
			});
			next();
		};

		var indexFile = fs.readFileSync('assets-dev/index.html').toString();

		objects.database.open(function(err, db) {
			if (err) {
				console.log('MongoDB error:', err);
				return;
			}

			server.dares(objects.database);

			var app = connect();
			if (options.logs.requests) app.use(connect.logger('tiny'));

			app.use(noCache)
				.use(objects.common.getMiddleware())
				.use('/api', objects.api.getMiddleware())
				.use(lessMiddleware(options.less))
				.use(browserify(options.browserify))
				.use('', function(req, res, next) {
					if (mainUrls.indexOf(req.url.split('/')[1] || 'intro') >= 0 || req.url === '/') req.url = '/index.html';
					next();
				})
				.use('/index.html', function(req, res, next) {
					var loginData = {};
					if (req.session && req.session.loginData) loginData = req.session.loginData;
					res.end(indexFile.replace('{/*AUTOFILL in server.init.js*/}', JSON.stringify(loginData)));
				})
				.use(connect['static'](options.assets))
				.listen(options.port);
		});
	};
};

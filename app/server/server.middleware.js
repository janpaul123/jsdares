/*jshint node:true*/
"use strict";

var mongo = require('mongodb');
var uuid = require('node-uuid');
var fs = require('fs');
var mainUrls = ['intro', 'dare', 'edit', 'full', 'learn', 'create', 'superheroes', 'about', 'blindfold'];

var client = {};
require('../client/client.page.home')(client);

module.exports = function(server) {
	server.middleware = function(connect, options) {
		var app = connect();
		if (options.logs.requests) app.use(connect.logger('tiny'));

		mongo.connect(options.mongodb, function(err, db) {
			if (err) return console.error("Mongo connect error: " + err);

			var objects = {
				database: db,
				mailer: new server.Mailer(options.mailer)
			};

			objects.common = new server.Common(options.api, objects);
			objects.api = new server.API(options.api, objects);

			var noCache = function(req, res, next) {
				res.on('header', function(header) {
					res.setHeader('Cache-Control', 'private, max-age=0');
					res.setHeader('Expires', 'Thu, 01 Jan 1970 00:00:00 GMT');
					res.setHeader('Pragma', 'no-cache');
				});
				next();
			};

			server.dares(objects.database);

			var indexFile = fs.readFileSync(options.assets + '/index.html').toString();
			app.use(noCache)
				.use(objects.common.getMiddleware())
				.use('/api', objects.api.getMiddleware())
				.use('', function(req, res, next) {
					if (mainUrls.indexOf(req.url.split('/')[1] || 'intro') >= 0 || req.url === '/') req.url = '/index.html';
					next();
				})
				.use('/index.html', function(req, res, next) {
					var loginData = {};
					if (req.session && req.session.loginData) loginData = req.session.loginData;

					var output = indexFile;
					output = output.replace('{/*AUTOFILL jsdaresLoginData in server.middleware.js*/}', JSON.stringify(loginData));
					output = output.replace('<!--AUTOFILL html content in server.middleware.js-->', client.getPageHomeHtml());
					res.write(output);
					res.end();
				})
				.use(connect['static'](options.assets));
		});

		return app;
	};
};

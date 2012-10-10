/*jshint node:true*/
"use strict";

var connect = require('connect');
var uuid = require('node-uuid');
var crypto = require('crypto');
var _ = require('underscore');

var localAuth = {
	iterations: 30000,
	keyLen: 128
};

module.exports = function(server) {
	server.Common = function() { return this.init.apply(this, arguments); };
	server.Common.prototype = {
		init: function(options, objects) {
			this.options = options;
			this.db = objects.database;
		},

		getMiddleware: function() {
			return connect()
				.use(connect.cookieParser('i love banana bread!'))
				.use(connect.cookieSession())
				.use(this.setUserId.bind(this));
		},

		setUserId: function(req, res, next) {
			var that = this;
			try {
				var pause = connect.utils.pause(req);

				var newUserId = function() {
					req.session.userId = uuid.v4();
					that.db.users.insert({_id: req.session.userId, createdTime: new Date(), ips: {initial : that.getIP(req)}}, {safe:true}, function(error, users) {
						if (error) {
							that.error(req, res, 500, 'setUserId error: ' + error);
							pause.resume();
						} else {
							console.log('New session: ' + req.session.userId);
							req.session.loginData = {userId: req.session.userId, admin: false};
							next();
							pause.resume();
						}
					});
				};

				if (req.session.userId) {
					that.db.users.findById(req.session.userId, function(error, user) {
						if (error) {
							that.error(req, res, 500, 'setUserId error: ' + error);
							pause.resume();
						} else if (!user) {
							newUserId();
						} else {
							if (user.auth && user.auth.local) {
								req.session.loginData = {userId: req.session.userId, loggedIn: true, screenname: user.screenname, points: 0, link: user.link};
							} else {
								req.session.loginData = {userId: req.session.userId};
							}
							req.session.loginData.admin = user.admin || false;
							next();
							pause.resume();
						}
					});
				} else {
					newUserId();
				}
			} catch (error) {
				that.error(req, res, 500, 'setUserId error: ' + error);
				pause.resume();
			}
		},

		getIP: function(req) {
			return req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		},

		error: function(req, res, code, error) {
			error = JSON.stringify(error);
			var body = JSON.stringify(req.body);
			if (this.options.errors[code]) {
				console.error(code + ' @ ' + req.method + ': ' + req.originalUrl + ' @ BODY: ' + body + ' USER: ' + req.session.userId + (error ? (' @ ERROR: ' + error) : ''));
			}
			res.statusCode = code;
			if (code === 400) {
				res.end('Input error: ' + error);
			} else if (code === 401) {
				res.end('Not authorized');
			} else if (code === 404) {
				res.end('Not found');
			} else if (code === 500) {
				res.end('Server error: ' + error);
			}
		}
	};
};

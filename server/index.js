/*jshint node:true*/
"use strict";

module.exports = function(options) {
	var connect = require('connect');
	var mongo = require('mongoskin');
	var uuid = require('node-uuid');
	var lessMiddleware = require('less-middleware');
	var browserify = require('browserify');

	var Server = mongo.Server;
	var Db = mongo.Db;

	var db = mongo.db(options.mongodb);
	db.bind('users');
	db.bind('instances');

	var api = connect()
		.use(connect.cookieParser('i love banana bread'))
		.use(connect.cookieSession())
		.use(function(req, res, next) {
			var pause = connect.utils.pause(req);

			var newUserId = function() {
				req.session.userId = uuid.v4();
				db.users.insert({_id: req.session.userId}, {safe:true}, function(err) {
					console.log('made new user: ' + req.session.userId);
					next();
					pause.resume();
				});
			};

			if (req.session.userId) {
				db.users.findById(req.session.userId, function(err, user) {
					if (!user) {
						newUserId();
					} else {
						next();
						pause.resume();
					}
				});
			} else {
				newUserId();
			}
		})
		.use('/get', connect.query())
		.use('/get/instances', function(req, res, next) {
			db.instances.findItems({userId: req.session.userId}, function(err, array) {
				res.end(JSON.stringify(array));
			});
		})
		.use('/post', connect.json())
		.use('/post/program', function(req, res, next) {
			db.instances.update({userId: req.session.userId, dareId: req.body.dareId}, {$set: {text: req.body.text}}, {upsert: true});
			res.end('"ok"');
		})
		.use('/post/highscore', function(req, res, next) {
			db.instances.update(
				{userId: req.session.userId, dareId: req.body.dareId},
				{$set: {text: req.body.text, completed: req.body.completed, highscore: req.body.highscore}},
				{upsert: true, safe: true}, function(error) {
					if (!error) {
						res.end('"ok"');
					}
				}
			);
		})
		.use(function(req, res, next) {
			res.end('nice!!' + JSON.stringify(req.url));
		});


	db.open(function(err, db) {
		if (err) {
			console.log('MongoDB error:', err);
			return;
		}

		var app = connect()
			.use(connect.logger('tiny'))
			.use('/api', api)
			.use(lessMiddleware(options.less))
			.use(browserify(options.browserify))
			.use(connect['static'](options.assets))
			.listen(options.port);
	});
};
/*jshint node:true*/
"use strict";

var connect = require('connect');
var uuid = require('node-uuid');

module.exports = function(server) {
	server.API = function() { return this.init.apply(this, arguments); };

	server.API.prototype = {
		init: function(db) {
			this.db = db;
		},

		getMiddleware: function() {
			return connect()
				.use(connect.cookieParser('i love banana bread!'))
				.use(connect.cookieSession())
				.use(this.setUserId.bind(this))
				.use('/get', connect.query())
				.use('/get/collection', this.getCollection.bind(this))
				.use('/get/collectionAndDaresAndInstances', this.getCollectionAndDaresAndInstances.bind(this))
				.use('/get/dare', this.getDare.bind(this))
				.use('/get/dareAndInstance', this.getDareAndInstance.bind(this))
				.use('/post', connect.json())
				.use('/post/program', this.postProgram.bind(this))
				.use('/post/instance', this.postInstance.bind(this));
		},

		getCollection: function(req, res, next) {
			this.createObjectId(req, res, req.query._id, function(id) {
				this.db.collections.findById(id, this.getResponseCallback(req, res));
			});
		},

		getCollectionAndDaresAndInstances: function(req, res, next) {
			this.createObjectId(req, res, req.query._id, function(id) {
				this.db.collections.findById(id, this.wrapCallback(req, res, function(collection) {
					if (!collection) this.throw404(req, res);
					else this.db.dares.findItems({collectionId: collection._id}, {sort: 'order'}, this.wrapCallback(req, res, function(dares) {
						collection.dares = dares;
						var dareIds = [];
						for (var i=0; i<collection.dares.length; i++) {
							dareIds.push(collection.dares[i]._id);
							collection.dares[i].instance = {};
						}
						this.db.instances.findItems({dareId: {$in: dareIds}, userId: req.session.userId}, this.wrapCallback(req, res, function(instances) {
							for (var i=0; i<instances.length; i++) {
								for (var j=0; j<collection.dares.length; j++) {
									if (instances[i].dareId.toHexString() === collection.dares[j]._id.toHexString()) {
										collection.dares[j].instance = instances[i];
										break;
									}
								}
							}
							res.end(JSON.stringify(collection));
						}));
					}));
				}));
			});
		},

		getDare: function(req, res, next) {
			this.createObjectId(req, res, req.query._id, function(id) {
				this.db.dares.findById(id, this.getResponseCallback(req, res));
			});
		},

		getDareAndInstance: function(req, res, next) {
			this.createObjectId(req, res, req.query._id, function(id) {
				this.db.dares.findById(id, this.wrapCallback(req, res, function(dare) {
					this.db.instances.findOne({userId: req.session.userId, dareId: dare._id}, this.wrapCallback(req, res, function(instance) {
						if (instance) {
							dare.instance = instance;
							res.end(JSON.stringify(dare));
						} else {
							this.db.instances.insert({ userId: req.session.userId, dareId: dare._id }, {safe: true}, this.wrapCallback(req, res, function(instances) {
								dare.instance = instances[0];
								res.end(JSON.stringify(dare));
							}));
						}
					}));
				}));
			});
		},

		postProgram: function(req, res, next) {
			this.createObjectId(req, res, req.body._id, function(id) {
				this.db.instances.findItems({_id: id}, this.userIdCallback(req, res, function(array) {
					this.db.instances.update({_id: id}, {$set: {text: req.body.text}});
					res.end('"ok"');
				}));
			});
		},

		postInstance: function(req, res, next) {
			this.createObjectId(req, res, req.body._id, function(id) {
				this.db.instances.findItems({_id: id}, this.userIdCallback(req, res, function(array) {
					this.db.instances.update(
						{_id: id},
						{$set: {text: req.body.text, completed: req.body.completed, highscore: req.body.highscore}},
						{safe: true},
						this.postResponseCallback(req, res)
					);
				}));
			});
		},

		setUserId: function(req, res, next) {
			var pause = connect.utils.pause(req);

			var newUserId = (function() {
				req.session.userId = uuid.v4();
				this.db.users.insert({_id: req.session.userId}, {safe:true}, this.wrapCallback(req, res, function(users) {
					console.log('New user: ' + req.session.userId);
					next();
					pause.resume();
				}));
			}).bind(this);

			if (req.session.userId) {
				this.db.users.findById(req.session.userId, function(err, user) {
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
		},

		userIdCallback: function(req, res, callback) {
			return this.wrapCallback(req, res, function(array) {
				for (var i=0; i<array.length; i++) {
					if (array[i].userId && array[i].userId !== req.session.userId) {
						console.warn('401 @ ' + req.method + ': ' + req.originalUrl + ' @ BODY: ' + JSON.stringify(req.body) + ' USER: ' + req.session.userId);
						res.statusCode = 401;
						res.end('"Not authorized"');
						return;
					}
				}
				(callback.bind(this))(array);
			});
		},

		createObjectId: function(req, res, id, callback) {
			try {
				var objectId = new this.db.ObjectID(id);
				(callback.bind(this))(objectId);
			} catch(error) {
				this.throw404(req, res);
			}
		},

		getResponseCallback: function(req, res) {
			return this.wrapCallback(req, res, function(doc) {
				if (doc) res.end(JSON.stringify(doc));
				else this.throw404();
			});
		},

		postResponseCallback: function(req, res) {
			return this.wrapCallback(req, res, function(doc) {
				res.end('"ok"');
			});
		},

		wrapCallback: function(req, res, callback) {
			return (function(error, doc) {
				if (error) this.throw500(req, res, error);
				else (callback.bind(this))(doc);
			}).bind(this);
		},

		throw500: function(req, res, error) {
			console.error('500 @ ' + req.method + ': ' + req.originalUrl + ' @ BODY: ' + JSON.stringify(req.body) + ' USER: ' + req.session.userId + ' @ ERROR: ' + error);
			res.statusCode = 500;
			res.end(JSON.stringify('Server error: ' + error));
		},

		throw404: function(req, res) {
			console.log('404 @ ' + req.method + ': ' + req.originalUrl + ' @ BODY: ' + JSON.stringify(req.body) + ' USER: ' + req.session.userId);
			res.statusCode = 404;
			res.end('"Not found"');
		}
	};
};

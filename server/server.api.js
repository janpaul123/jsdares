/*jshint node:true*/
"use strict";

var connect = require('connect');
var uuid = require('node-uuid');
var crypto = require('crypto');

var localAuth = {
	iterations: 50000,
	keyLen: 128
};

module.exports = function(server) {
	server.API = function() { return this.init.apply(this, arguments); };
	server.API.prototype = {
		init: function(options, db) {
			this.options = options;
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
				.use('/post/instance', this.postInstance.bind(this))
				.use('/post/register', this.postRegister.bind(this))
				.use('/post/login', this.postLogin.bind(this))
				.use('/post/logout', this.postLogout.bind(this));
		},

		getCollection: function(req, res, next) {
			this.createObjectId(req, res, req.query._id, function(id) {
				this.db.collections.findById(id, this.getResponseCallback(req, res));
			});
		},

		getCollectionAndDaresAndInstances: function(req, res, next) {
			this.createObjectId(req, res, req.query._id, function(id) {
				this.db.collections.findById(id, this.wrapCallback(req, res, function(collection) {
					if (!collection) this.error(req, res, 404);
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

		postRegister: function(req, res, next) {
			this.db.users.findById(req.session.userId, this.wrapCallback(req, res, function(user) {
				if (!user) {
					this.error(req, res, 404);
				} else if (req.body.password !== req.body.password2) {
					this.error(req, res, 400, 'Passwords do not match');
				} else if (!req.body.username) {
					this.error(req, res, 400, 'Empty username');
				} else if (!req.body.password) {
					this.error(req, res, 400, 'Empty password');
				} else {
					this.db.users.findOne({'auth.local.username': req.body.username}, this.wrapCallback(req, res, function(user) {
						if (user) {
							this.error(req, res, 400, 'Username already exists');
						} else {
							var salt = uuid.v4();
							console.log('making hash');
							this.getHash(req.body.password, salt, this.wrapCallback(req, res, function(hash) {
								console.log('hash made : ' + hash);
								this.db.users.update(
									{_id: req.session.userId},
									{$set: {'auth.local.username': req.body.username, 'auth.local.hash': hash, 'auth.local.salt': salt}},
									{safe: true},
									this.postResponseCallback(req, res)
								);
							}));
						}
					}));
				}
			}));
		},

		postLogin: function(req, res, next) {
			this.db.users.findOne({'auth.local.username': req.body.username}, this.wrapCallback(req, res, function(user) {
				if (user) {
					this.getHash(req.body.password, user.auth.local.salt, this.wrapCallback(req, res, function(hash) {
						if (hash === user.auth.local.hash) {
							req.session.userId = user.id; // TODO: merge with current user id
							res.end('"ok"');
						} else {
							this.error(req, res, 404);
						}
					}));
				} else {
					this.error(req, res, 404);
				}
			}));
		},

		postLogout: function(req, res, next) {
			req.session.userId = undefined;
			res.end('"ok"');
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
				this.db.users.findById(req.session.userId, this.wrapCallback(req, res, function(user) {
					if (!user) {
						newUserId();
					} else {
						next();
						pause.resume();
					}
				}));
			} else {
				newUserId();
			}
		},

		userIdCallback: function(req, res, callback) {
			return this.wrapCallback(req, res, function(array) {
				for (var i=0; i<array.length; i++) {
					if (array[i].userId && array[i].userId !== req.session.userId) {
						this.error(req, res, 401);
						return;
					}
				}
				(callback.bind(this))(array);
			});
		},

		getHash: function(password, salt, callback) {
			crypto.pbkdf2(password, salt, localAuth.iterations, localAuth.keyLen, function(error, hash) {
				if (error) callback(error);
				else callback(null, new Buffer(hash, 'binary').toString('hex'));
			});
		},

		createObjectId: function(req, res, id, callback) {
			try {
				var objectId = new this.db.ObjectID(id);
				(callback.bind(this))(objectId);
			} catch(error) {
				this.error(req, res, 404);
			}
		},

		getResponseCallback: function(req, res) {
			return this.wrapCallback(req, res, function(doc) {
				if (doc) res.end(JSON.stringify(doc));
				else this.error(req, res, 404);
			});
		},

		postResponseCallback: function(req, res) {
			return this.wrapCallback(req, res, function(doc) {
				res.end('"ok"');
			});
		},

		wrapCallback: function(req, res, callback) {
			return (function(error, doc) {
				if (error) this.error(req, res, 500, error);
				else (callback.bind(this))(doc);
			}).bind(this);
		},

		error: function(req, res, code, error) {
			if (this.options.errors[code]) {
				console.error(code + ' @ ' + req.method + ': ' + req.originalUrl + ' @ BODY: ' + JSON.stringify(req.body) + ' USER: ' + req.session.userId + (error ? (' @ ERROR: ' + error) : ''));
			}
			res.statusCode = code;
			if (code === 400) {
				res.end(JSON.stringify('Input error: ' + error));
			} else if (code === 401) {
				res.end('"Not authorized"');
			} else if (code === 404) {
				res.end('"Not found"');
			} else if (code === 500) {
				res.end(JSON.stringify('Server error: ' + error));
			}
		}
	};
};

/*jshint node:true*/
"use strict";

var connect = require('connect');
var uuid = require('node-uuid');
var crypto = require('crypto');
var _ = require('underscore');
var shared = require('../shared');

var localAuth = {
	iterations: 30000,
	keyLen: 128
};

module.exports = function(server) {
	server.API = function() { return this.init.apply(this, arguments); };
	server.API.prototype = {
		init: function(options, db, mailer) {
			this.options = options;
			this.db = db;
			this.mailer = mailer;
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
				.use('/get/dareEdit', this.getDareEdit.bind(this))
				.use('/get/checkUsername', this.getCheckUsername.bind(this))
				.use('/get/checkEmail', this.getCheckEmail.bind(this))
				.use('/get/loginData', this.getLoginData.bind(this))
				.use('/get/daresAndInstancesAll', this.getDaresAndInstancesAll.bind(this))
				.use('/get/daresAndInstancesNewest', this.getDaresAndInstancesNewest.bind(this))
				.use('/get/daresAndInstancesByUserId', this.getDaresAndInstancesByUserId.bind(this))
				.use('/get/daresAndInstancesPlayed', this.getDaresAndInstancesPlayed.bind(this))
				.use('/get/userByUsername', this.getUserByUsername.bind(this))
				.use('/get/usersAll', this.getUsersAll.bind(this))
				.use('/post', connect.json())
				.use('/post/program', this.postProgram.bind(this))
				.use('/post/instance', this.postInstance.bind(this))
				.use('/post/dareCreate', this.postDareCreate.bind(this))
				.use('/post/dareEdit', this.postDareEdit.bind(this))
				.use('/post/register', this.postRegister.bind(this))
				.use('/post/login', this.postLogin.bind(this))
				.use('/post/logout', this.postLogout.bind(this));
		},

		getCollection: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.createObjectId(req, res, req.query._id, function(id) {
					this.db.collections.findById(id, this.existsCallback(req, res, function(collection) {
						this.end(req, res, collection);
					}));
				});
			});
		},

		getCollectionAndDaresAndInstances: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.createObjectId(req, res, req.query._id, function(id) {
					this.db.collections.findById(id, this.errorCallback(req, res, function(collection) {
						if (!collection) this.error(req, res, 404);
						else this.db.dares.findItems({_id: {$in: collection.dareIds}}, this.errorCallback(req, res, function(dares) {
							collection.dares = _.sortBy(dares, function(dare) {
								for (var i=0; i<collection.dareIds.length && !collection.dareIds[i].equals(dare._id); i++) continue;
								return i;
							});
							this.addInstances(req, res, collection.dares, false, function() {
								this.end(req, res, collection);
							});
						}));
					}));
				});
			});
		},

		addInstances: function(req, res, dares, filter, callback) {
			this.db.instances.findItems({dareId: {$in: _.pluck(dares, '_id')}, userId: req.session.userId}, this.errorCallback(req, res, function(instances) {
				for (var i=0; i<dares.length; i++) {
					dares[i].instance = null;
					for (var j=0; j<instances.length; j++) {
						if (instances[j].dareId.equals(dares[i]._id)) {
							dares[i].instance = instances[j];
							break;
						}
					}
				}
				if (filter) dares = _.filter(dares, function(dare) { return dare.instance !== null; });
				(callback.bind(this))(dares);
			}));
		},

		addDares: function(req, res, items, filter, callback) {
			this.db.dares.findItems({_id: {$in: _.pluck(items, 'dareId')}, userId: req.session.userId}, this.errorCallback(req, res, function(dares) {
				for (var i=0; i<items.length; i++) {
					items[i].dare = null;
					for (var j=0; j<dares.length; j++) {
						if (items[i].dareId.equals(dares[j]._id)) {
							items[i].dare = dares[j];
							break;
						}
					}
				}
				if (filter) items = _.filter(items, function(item) { return item.dare !== null; });
				(callback.bind(this))(items);
			}));
		},

		getDare: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.createObjectId(req, res, req.query._id, function(id) {
					this.db.dares.findById(id, this.existsCallback(req, res, function(dare) {
						this.end(req, res, dare);
					}));
				});
			});
		},

		getDareAndInstance: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.createObjectId(req, res, req.query._id, function(id) {
					this.db.dares.findById(id, this.errorCallback(req, res, function(dare) {
						if (dare) {
							this.db.instances.findOne({userId: req.session.userId, dareId: dare._id}, this.errorCallback(req, res, function(instance) {
								if (instance) {
									dare.instance = instance;
									this.end(req, res, dare);
								} else {
									this.db.instances.insert({ userId: req.session.userId, dareId: dare._id, createdTime: new Date() }, {safe: true}, this.errorCallback(req, res, function(instances) {
										dare.instance = instances[0];
										this.end(req, res, dare);
									}));
								}
							}));
						} else {
							this.error(req, res, 404);
						}
					}));
				});
			});
		},

		getDareEdit: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.createObjectId(req, res, req.query._id, function(id) {
					this.db.dares.findById(id, this.userIdCallback(req, res, function(dare) {
						this.end(req, res, dare);
					}));
				});
			});
		},

		getDaresAndInstancesAll: function(req, res, next) {
			this.tryCatch(req, res, function() {
				// limit to 500 to be sure
				this.db.dares.findItems({}, {'sort': [['createdTime', 'desc']], limit: 500}, this.existsCallback(req, res, function(array) {
					this.addInstances(req, res, array, false, function(array) {
						this.end(req, res, array);
					});
				}));
			});
		},

		getDaresAndInstancesNewest: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.db.dares.findItems({}, {'sort': [['createdTime', 'desc']], limit: 10}, this.existsCallback(req, res, function(array) {
					this.addInstances(req, res, array, false, function(array) {
						this.end(req, res, array);
					});
				}));
			});
		},

		getDaresAndInstancesByUserId: function(req, res, next) {
			this.tryCatch(req, res, function() {
				// limit to 500 to be sure
				this.db.dares.findItems({userId: req.query.userId}, {'sort': [['createdTime', 'desc']], limit: 500}, this.existsCallback(req, res, function(array) {
					this.addInstances(req, res, array, false, function(array) {
						this.end(req, res, array);
					});
				}));
			});
		},

		getDaresAndInstancesPlayed: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.db.instances.findItems({userId: req.query.userId}, {'sort': [['modifiedTime', 'desc']]}, this.existsCallback(req, res, function(array) {
					this.addDares(req, res, array, true, function(array) {
						var dares = [];
						for (var i=0; i<array.length; i++) {
							var dare = array[i].dare;
							array[i].dare = undefined;
							dare.instance = array[i];
							dares.push(dare);
						}
						this.end(req, res, dares);
					});
				}));
			});
		},

		postProgram: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.createObjectId(req, res, req.body._id, function(id) {
					this.db.instances.findItems({_id: id}, this.userIdCallback(req, res, function(array) {
						this.db.instances.update({_id: id}, {$set: {text: req.body.text, modifiedTime: new Date()}});
						this.end(req, res);
					}));
				});
			});
		},

		postInstance: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.createObjectId(req, res, req.body._id, function(id) {
					this.db.instances.findItems({_id: id}, this.userIdCallback(req, res, function(array) {
						this.db.instances.update(
							{_id: id},
							{$set: {text: req.body.text, completed: req.body.completed, highscore: req.body.highscore, modifiedTime: new Date(), submittedTime: new Date()}},
							{safe: true},
							this.postResponseCallback(req, res)
						);
					}));
				});
			});
		},

		postDareCreate: function(req, res, next) {
			this.tryCatch(req, res, function() {
				var dare = shared.dares.sanitizeInput({}, shared.dares.dareOptionsEdit);
				dare.userId = req.session.userId;
				dare.createdTime = new Date();
				dare.modifiedTime = new Date();

				this.db.dares.insert(
					dare,
					{safe: true},
					this.userIdCallback(req, res, function(dares) {
						if (dares.length !== 1) {
							this.error(req, res, 'When creating a new dare, not one dare inserted: ' + dares.length);
						} else {
							this.end(req, res, {_id: dares[0]._id});
						}
					})
				);
			});
		},

		postDareEdit: function(req, res, next) {
			this.tryCatch(req, res, function() {
				var dare = shared.dares.sanitizeInput(req.body, shared.dares.dareOptionsEdit);
				dare.modifiedTime = new Date();
				this.createObjectId(req, res, dare._id, function(id) {
					delete dare._id;
					this.db.dares.findOne({_id: id}, this.userIdCallback(req, res, function(array) {
						this.db.dares.update(
							{_id: id},
							{$set: dare},
							{safe: true},
							this.postResponseCallback(req, res)
						);
					}));
				});
			});
		},

		postRegister: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.db.users.findById(req.session.userId, this.errorCallback(req, res, function(user) {
					if (!user) {
						this.error(req, res, 404);
					} else if (!req.body.username || !shared.validation.username(req.body.username)) {
						this.error(req, res, 400, 'Invalid username');
					} else if (!req.body.password || !shared.validation.password(req.body.password)) {
						this.error(req, res, 400, 'Invalid password');
					} else if (!req.body.email || !shared.validation.email(req.body.email)) {
						this.error(req, res, 400, 'Invalid email');
					} else {
						this.db.users.findOne({'auth.local.username': req.body.username.toLowerCase()}, this.errorCallback(req, res, function(user) {
							if (user) {
								this.error(req, res, 400, 'Username already exists');
							} else {
								this.db.users.findOne({'auth.local.email': req.body.email.toLowerCase()}, this.errorCallback(req, res, function(user2) {
									if (user2) {
										this.error(req, res, 400, 'Email already exists');
									} else {
										var salt = uuid.v4(), password = uuid.v4().substr(-12);
										this.getHash(req.body.password, salt, this.errorCallback(req, res, function(hash) {
											this.mailer.sendRegister(req.body.email.toLowerCase(), req.body.username);
											this.db.users.update(
												{_id: req.session.userId},
												{$set: {
													'screenname': req.body.username,
													'link': req.body.username,
													'auth.local.email': req.body.email.toLowerCase(),
													'auth.local.username': req.body.username.toLowerCase(),
													'auth.local.hash': hash,
													'auth.local.salt': salt,
													'ips.registration' : this.getIP(req),
													'registeredTime': new Date()
												}},
												{safe: true},
												this.errorCallback(req, res, function(doc) {
													console.log('NEW USER: ' + req.body.username);
													this.setUserId(req, res, (function() {
														this.end(req, res);
													}).bind(this));
												})
											);
										}));
									}
								}));
							}
						}));
					}
				}));
			});
		},

		postLogin: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.db.users.findOne({'auth.local.username': req.body.username.toLowerCase()}, this.errorCallback(req, res, function(user) {
					if (user) {
						this.getHash(req.body.password, user.auth.local.salt, this.errorCallback(req, res, function(hash) {
							if (hash === user.auth.local.hash) {
								this.db.users.update(
									{_id: user._id},
									{$set: {'ips.login' : this.getIP(req), 'loginTime': new Date()}}
								);
								req.session.userId = user._id; // TODO: merge with current user id
								this.setUserId(req, res, (function() {
									this.end(req, res);
								}).bind(this));
							} else {
								this.db.users.update(
									{_id: user._id},
									{$set: {'ips.passwordError' : this.getIP(req)}}
								);
								this.error(req, res, 404);
							}
						}));
					} else {
						this.error(req, res, 404);
					}
				}));
			});
		},

		postLogout: function(req, res, next) {
			this.tryCatch(req, res, function() {
				req.session.userId = undefined;
				this.setUserId(req, res, (function() {
					this.end(req, res);
				}).bind(this));
			});
		},

		getCheckUsername: function(req, res, next) {
			this.tryCatch(req, res, function() {
				if (req.query.username && shared.validation.username(req.query.username)) {
					this.db.users.findOne({'auth.local.username': req.query.username.toLowerCase()}, this.errorCallback(req, res, function(user) {
						if (user) {
							this.error(req, res, 400, 'Username exists already');
						} else {
							this.end(req, res);
						}
					}));
				} else {
					this.error(req, res, 400, 'Invalid username');
				}
			});
		},

		getUserByUsername: function(req, res, next) {
			this.tryCatch(req, res, function() {
				if (req.query.username && shared.validation.username(req.query.username)) {
					this.db.users.findOne({'auth.local.username': req.query.username.toLowerCase()}, this.existsCallback(req, res, function(user) {
						this.end(req, res, shared.dares.sanitizeInput(user, shared.dares.userOptions));
					}));
				} else {
					this.error(req, res, 400, 'Invalid username');
				}
			});
		},

		getUsersAll: function(req, res, next) {
			this.tryCatch(req, res, function() {
				// limit to 50 for now
				this.db.users.findItems({'link': {$exists: true}}, {'sort': [['registeredTime', 'desc']], limit: 50}, this.existsCallback(req, res, function(array) {
					var users = [];
					for (var i=0; i<array.length; i++) {
						users.push(shared.dares.sanitizeInput(array[i], shared.dares.userOptions));
					}
					this.end(req, res, users);
				}));
			});
		},

		getCheckEmail: function(req, res, next) {
			this.tryCatch(req, res, function() {
				if (req.query.email && shared.validation.email(req.query.email)) {
					this.db.users.findOne({'auth.local.email': req.query.email.toLowerCase()}, this.errorCallback(req, res, function(user) {
						if (user) {
							this.error(req, res, 400, 'Email exists already');
						} else {
							this.end(req, res);
						}
					}));
				} else {
					this.error(req, res, 400, 'Invalid email');
				}
			});
		},

		getLoginData: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.end(req, res);
			});
		},

		setUserId: function(req, res, next) {
			try {
				var pause = connect.utils.pause(req);

				var newUserId = (function() {
					req.session.userId = uuid.v4();
					this.db.users.insert({_id: req.session.userId, createdTime: new Date(), ips: {initial : this.getIP(req)}}, {safe:true}, this.errorCallback(req, res, function(users) {
						console.log('New session: ' + req.session.userId);
						req.session.loginData = {userId: req.session.userId, admin: false};
						next();
						pause.resume();
					}));
				}).bind(this);

				if (req.session.userId) {
					this.db.users.findById(req.session.userId, this.errorCallback(req, res, function(user) {
						if (!user) {
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
					}));
				} else {
					newUserId();
				}
			} catch (error) {
				this.error(req, res, 500, error);
				pause.resume();
			}
		},

		userIdCallback: function(req, res, callback) {
			return this.existsCallback(req, res, function(doc) {
				var array = doc;
				if (!_.isArray(doc)) array = [doc];

				for (var i=0; i<array.length; i++) {
					if (!array[i].userId) {
						this.error(req, res, 500, 'No user id in object');
						return;
					} else if (array[i].userId !== req.session.userId && !req.session.loginData.admin) {
						this.error(req, res, 401);
						return;
					}
				}

				(callback.bind(this))(doc);
			});
		},

		getHash: function(password, salt, callback) {
			crypto.pbkdf2(password, salt, localAuth.iterations, localAuth.keyLen, function(error, hash) {
				if (error) callback(error);
				else callback(null, new Buffer(hash, 'binary').toString('hex'));
			});
		},

		getIP: function(req) {
			return req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		},

		createObjectId: function(req, res, id, callback) {
			try {
				var objectId = new this.db.ObjectID(id);
				(callback.bind(this))(objectId);
			} catch(error) {
				this.error(req, res, 404);
			}
		},

		existsCallback: function(req, res, callback) {
			return this.errorCallback(req, res, (function(doc) {
				if (doc) (callback.bind(this))(doc);
				else this.error(req, res, 404);
			}).bind(this));
		},

		postResponseCallback: function(req, res) {
			return this.errorCallback(req, res, function(doc) {
				this.end(req, res);
			});
		},

		end: function(req, res, doc) {
			res.end(JSON.stringify(this.addLoginData(req, doc || {})));
		},

		addLoginData: function(req, output) {
			if (req.session && req.session.loginData) {
				output.loginData = req.session.loginData;
			}
			return output;
		},

		errorCallback: function(req, res, callback) {
			return (function(error, doc) {
				if (error) this.error(req, res, 500, error);
				else (callback.bind(this))(doc);
			}).bind(this);
		},

		tryCatch: function(req, res, callback) {
			try {
				(callback.bind(this))();
			} catch(error) {
				this.error(req, res, 500, 'tryCatch error: ' + error);
			}
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

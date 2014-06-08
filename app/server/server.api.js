/*jshint node:true*/
"use strict";

var connect = require('connect');
var uuid = require('node-uuid');
var crypto = require('crypto');
var _ = require('underscore');
var shared = require('../shared');
var mongo = require('mongodb');

var localAuth = {
	iterations: 30000,
	keyLen: 128
};

module.exports = function(server) {
	server.API = function() { return this.init.apply(this, arguments); };
	server.API.prototype = {
		init: function(options, objects) {
			this.options = options;
			this.db = objects.database;
			this.mailer = objects.mailer;
			this.common = objects.common;
		},

		getMiddleware: function() {
			return connect()
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
					this.db.collection('collections').findOne({_id: id}, this.existsCallback(req, res, function(collection) {
						this.end(req, res, collection);
					}));
				});
			});
		},

		getCollectionAndDaresAndInstances: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.createObjectId(req, res, req.query._id, function(id) {
					this.db.collection('collections').findOne({_id: id}, this.errorCallback(req, res, function(collection) {
						if (!collection) this.common.error(req, res, 404);
						else this.db.collection('dares').find({_id: {$in: collection.dareIds}}).toArray(this.errorCallback(req, res, function(dares) {
							collection.dares = _.sortBy(dares, function(dare) {
								for (var i=0; i<collection.dareIds.length && !collection.dareIds[i].equals(dare._id); i++) continue;
								return i;
							});
							this.addInstancesAndStatisticsAndUsers(req, res, collection.dares, function() {
								this.end(req, res, collection);
							});
						}));
					}));
				});
			});
		},

		addInstancesAndStatisticsAndUsers: function(req, res, dares, callback) {
			this.addInstances(req, res, dares, function(dares) {
				this.addStatistics(req, res, dares, function(dares) {
					this.addUsers(req, res, dares, callback);
				});
			});
		},

		addInstances: function(req, res, dares, callback) {
			this.db.collection('instances').find({dareId: {$in: _.pluck(dares, '_id')}, userId: req.session.userId}).toArray(this.errorCallback(req, res, function(instances) {
				for (var i=0; i<dares.length; i++) {
					dares[i].instance = null;
					for (var j=0; j<instances.length; j++) {
						if (instances[j].dareId.equals(dares[i]._id)) {
							dares[i].instance = instances[j];
							break;
						}
					}
				}
				(callback.bind(this))(dares);
			}));
		},

		addStatistics: function(req, res, dares, callback) {
			this.db.collection('instances').aggregate([
				{$match: {dareId: {$in: _.pluck(dares, '_id')}}},
				{$project: {
					highscore: 1,
					dareId: 1,
					numCompleted : { $cond : [ "$completed", 1, 0 ] }
				}},
				{$group: {
					_id: '$dareId',
					total: {$sum: 1},
					completed: {$sum: '$numCompleted'},
					highscore: {$max: '$highscore'}
				}}
			], this.errorCallback(req, res, function(statistics) {
				for (var i=0; i<dares.length; i++) {
					dares[i].statistics = null;
					for (var j=0; j<statistics.length; j++) {
						if (statistics[j]._id.equals(dares[i]._id)) {
							statistics[j].highscore = statistics[j].highscore || 0;
							dares[i].statistics = statistics[j];
							break;
						}
					}
				}
				(callback.bind(this))(dares);
			}));
		},

		addUsers: function(req, res, dares, callback) {
			this.db.collection('users').find({_id: {$in: _.pluck(dares, 'userId')}}).toArray(this.errorCallback(req, res, function(users) {
				for (var i=0; i<dares.length; i++) {
					dares[i].user = null;
					for (var j=0; j<users.length; j++) {
						if (users[j]._id === dares[i].userId) { // Note: not 'equals since this is a uuid'
							var user = users[j];
							dares[i].user = {link: user.link, screenname: user.screenname};
							break;
						}
					}
				}
				(callback.bind(this))(dares);
			}));
		},

		addDares: function(req, res, items, filter, callback) {
			this.db.collection('dares').find({_id: {$in: _.pluck(items, 'dareId')}, userId: req.session.userId}).toArray(this.errorCallback(req, res, function(dares) {
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
					this.db.collection('dares').findOne({_id: id}, this.existsCallback(req, res, function(dare) {
						this.end(req, res, dare);
					}));
				});
			});
		},

		getDareAndInstance: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.createObjectId(req, res, req.query._id, function(id) {
					this.db.collection('dares').findOne({_id: id}, this.errorCallback(req, res, function(dare) {
						if (dare) {
							this.db.collection('instances').findOne({userId: req.session.userId, dareId: dare._id}, this.errorCallback(req, res, function(instance) {
								if (instance) {
									dare.instance = instance;
									this.end(req, res, dare);
								} else {
									this.db.collection('instances').insert({ userId: req.session.userId, dareId: dare._id, createdTime: new Date() }, this.errorCallback(req, res, function(instances) {
										dare.instance = instances[0];
										this.end(req, res, dare);
									}));
								}
							}));
						} else {
							this.common.error(req, res, 404);
						}
					}));
				});
			});
		},

		getDareEdit: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.createObjectId(req, res, req.query._id, function(id) {
					this.db.collection('dares').findOne({_id: id}, this.userIdCallback(req, res, function(dare) {
						this.end(req, res, dare);
					}));
				});
			});
		},

		getDaresAndInstancesAll: function(req, res, next) {
			this.tryCatch(req, res, function() {
				// limit to 500 to be sure
				this.db.collection('dares').find({}, {'sort': [['createdTime', 'desc']], limit: 500}).toArray(this.existsCallback(req, res, function(array) {
					this.addInstancesAndStatisticsAndUsers(req, res, array, function(array) {
						this.end(req, res, array);
					});
				}));
			});
		},

		getDaresAndInstancesNewest: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.db.collection('dares').find({}, {'sort': [['createdTime', 'desc']], limit: 10}).toArray(this.existsCallback(req, res, function(array) {
					this.addInstancesAndStatisticsAndUsers(req, res, array, function(array) {
						this.end(req, res, array);
					});
				}));
			});
		},

		getDaresAndInstancesByUserId: function(req, res, next) {
			this.tryCatch(req, res, function() {
				// limit to 500 to be sure
				this.db.collection('dares').find({userId: req.query.userId}, {'sort': [['createdTime', 'desc']], limit: 500}).toArray(this.existsCallback(req, res, function(array) {
					this.addInstancesAndStatisticsAndUsers(req, res, array, function(array) {
						this.end(req, res, array);
					});
				}));
			});
		},

		getDaresAndInstancesPlayed: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.db.collection('instances').find({userId: req.query.userId}, {'sort': [['modifiedTime', 'desc']]}).toArray(this.existsCallback(req, res, function(array) {
					this.addDares(req, res, array, true, function(array) {
						var dares = [];
						for (var i=0; i<array.length; i++) {
							var dare = array[i].dare;
							array[i].dare = undefined;
							dare.instance = array[i];
							dares.push(dare);
						}

						this.addStatistics(req, res, dares, function(dares) {
							this.addUsers(req, res, dares, function(dares) {
								this.end(req, res, dares);
							});
						});
					});
				}));
			});
		},

		postProgram: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.createObjectId(req, res, req.body._id, function(id) {
					this.db.collection('instances').find({_id: id}).toArray(this.userIdCallback(req, res, function(array) {
						this.db.collection('instances').update(
							{_id: id},
							{$set: {text: req.body.text, modifiedTime: new Date()}},
							this.postResponseCallback(req, res)
						);
					}));
				});
			});
		},

		postInstance: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.createObjectId(req, res, req.body._id, function(id) {
					this.db.collection('instances').find({_id: id}).toArray(this.userIdCallback(req, res, function(array) {
						this.db.collection('instances').update(
							{_id: id},
							{$set: {text: req.body.text, completed: req.body.completed, highscore: parseInt(req.body.highscore, 10), modifiedTime: new Date(), submittedTime: new Date()}},
							this.postResponseCallback(req, res)
						);
					}));
				});
			});
		},

		postDareCreate: function(req, res, next) {
			this.tryCatch(req, res, function() {
				var dare = shared.dares.sanitizeInput({}, shared.dares.dareOptions);
				dare.userId = req.session.userId;
				dare.createdTime = new Date();
				dare.modifiedTime = new Date();

				this.db.collection('dares').insert(
					dare,
					this.userIdCallback(req, res, function(dares) {
						if (dares.length !== 1) {
							this.common.error(req, res, 'When creating a new dare, not one dare inserted: ' + dares.length);
						} else {
							this.end(req, res, {_id: dares[0]._id});
						}
					})
				);
			});
		},

		postDareEdit: function(req, res, next) {
			this.tryCatch(req, res, function() {
				var dare = shared.dares.sanitizeInput(req.body, shared.dares.dareOptions);
				dare.modifiedTime = new Date();
				this.createObjectId(req, res, dare._id, function(id) {
					delete dare._id;
					delete dare.userId;
					delete dare.instance;
					this.db.collection('dares').findOne({_id: id}, this.userIdCallback(req, res, function(array) {
						this.db.collection('dares').update(
							{_id: id},
							{$set: dare},
							this.postResponseCallback(req, res)
						);
					}));
				});
			});
		},

		postRegister: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.db.collection('users').findOne({_id: req.session.userId}, this.errorCallback(req, res, function(user) {
					if (!user) {
						this.common.error(req, res, 404);
					} else if (!req.body.username || !shared.validation.username(req.body.username)) {
						this.common.error(req, res, 400, 'Invalid username');
					} else if (!req.body.password || !shared.validation.password(req.body.password)) {
						this.common.error(req, res, 400, 'Invalid password');
					} else if (!req.body.email || !shared.validation.email(req.body.email)) {
						this.common.error(req, res, 400, 'Invalid email');
					} else {
						this.db.collection('users').findOne({'auth.local.username': req.body.username.toLowerCase()}, this.errorCallback(req, res, function(user) {
							if (user) {
								this.common.error(req, res, 400, 'Username already exists');
							} else {
								this.db.collection('users').findOne({'auth.local.email': req.body.email.toLowerCase()}, this.errorCallback(req, res, function(user2) {
									if (user2) {
										this.common.error(req, res, 400, 'Email already exists');
									} else {
										var salt = uuid.v4(), password = uuid.v4().substr(-12);
										this.getHash(req.body.password, salt, this.errorCallback(req, res, function(hash) {
											this.mailer.sendRegister(req.body.email.toLowerCase(), req.body.username);
											this.db.collection('users').update(
												{_id: req.session.userId},
												{$set: {
													'screenname': req.body.username,
													'link': req.body.username,
													'auth.local.email': req.body.email.toLowerCase(),
													'auth.local.username': req.body.username.toLowerCase(),
													'auth.local.hash': hash,
													'auth.local.salt': salt,
													'ips.registration' : this.common.getIP(req),
													'registeredTime': new Date()
												}},
												this.errorCallback(req, res, function(doc) {
													console.log('NEW USER: ' + req.body.username);
													this.common.setUserId(req, res, (function() {
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
				this.db.collection('users').findOne({'auth.local.username': req.body.username.toLowerCase()}, this.errorCallback(req, res, function(user) {
					if (user) {
						this.getHash(req.body.password, user.auth.local.salt, this.errorCallback(req, res, function(hash) {
							if (hash === user.auth.local.hash) {
								this.db.collection('users').update(
									{_id: user._id},
									{$set: {'ips.login' : this.common.getIP(req), 'loginTime': new Date()}},
									this.errorCallback(req, res, function() {
										req.session.userId = user._id; // TODO: merge with current user id
										this.common.setUserId(req, res, (function() {
											this.end(req, res);
										}).bind(this));
									})
								);
							} else {
								this.db.collection('users').update(
									{_id: user._id},
									{$set: {'ips.passwordError' : this.common.getIP(req)}},
									{w:0}
								);
								this.common.error(req, res, 404);
							}
						}));
					} else {
						this.common.error(req, res, 404);
					}
				}));
			});
		},

		postLogout: function(req, res, next) {
			this.tryCatch(req, res, function() {
				req.session.userId = undefined;
				this.common.setUserId(req, res, (function() {
					this.end(req, res);
				}).bind(this));
			});
		},

		getCheckUsername: function(req, res, next) {
			this.tryCatch(req, res, function() {
				if (req.query.username && shared.validation.username(req.query.username)) {
					this.db.collection('users').findOne({'auth.local.username': req.query.username.toLowerCase()}, this.errorCallback(req, res, function(user) {
						if (user) {
							this.common.error(req, res, 400, 'Username exists already');
						} else {
							this.end(req, res);
						}
					}));
				} else {
					this.common.error(req, res, 400, 'Invalid username');
				}
			});
		},

		getUserByUsername: function(req, res, next) {
			this.tryCatch(req, res, function() {
				if (req.query.username && shared.validation.username(req.query.username)) {
					this.db.collection('users').findOne({'auth.local.username': req.query.username.toLowerCase()}, this.existsCallback(req, res, function(user) {
						this.end(req, res, shared.dares.sanitizeInput(user, shared.dares.userOptions));
					}));
				} else {
					this.common.error(req, res, 400, 'Invalid username');
				}
			});
		},

		getUsersAll: function(req, res, next) {
			this.tryCatch(req, res, function() {
				// limit to 10000 for now
				this.db.collection('users').find({'link': {$exists: true}}, {'sort': [['registeredTime', 'desc']], limit: 10000}).toArray(this.existsCallback(req, res, function(array) {
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
					this.db.collection('users').findOne({'auth.local.email': req.query.email.toLowerCase()}, this.errorCallback(req, res, function(user) {
						if (user) {
							this.common.error(req, res, 400, 'Email exists already');
						} else {
							this.end(req, res);
						}
					}));
				} else {
					this.common.error(req, res, 400, 'Invalid email');
				}
			});
		},

		getLoginData: function(req, res, next) {
			this.tryCatch(req, res, function() {
				this.end(req, res);
			});
		},

		userIdCallback: function(req, res, callback) {
			return this.existsCallback(req, res, function(doc) {
				var array = doc;
				if (!_.isArray(doc)) array = [doc];

				for (var i=0; i<array.length; i++) {
					if (!array[i].userId) {
						this.common.error(req, res, 500, 'No user id in object');
						return;
					} else if (array[i].userId !== req.session.userId && !req.session.loginData.admin) {
						this.common.error(req, res, 401);
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

		createObjectId: function(req, res, id, callback) {
			try {
				var objectId = new mongo.ObjectID(id);
				(callback.bind(this))(objectId);
			} catch(error) {
				this.common.error(req, res, 404);
			}
		},

		existsCallback: function(req, res, callback) {
			return this.errorCallback(req, res, (function(doc) {
				if (doc) (callback.bind(this))(doc);
				else this.common.error(req, res, 404);
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
				if (error) this.common.error(req, res, 500, 'errorCallback error: ' + error);
				else (callback.bind(this))(doc);
			}).bind(this);
		},

		tryCatch: function(req, res, callback) {
			try {
				(callback.bind(this))();
			} catch(error) {
				this.common.error(req, res, 500, 'tryCatch error: ' + error);
			}
		}
	};
};

/*jshint node:true jquery:true*/
"use strict";

var _ = require('underscore');

module.exports = function(client) {
	client.Sync = function() { return this.init.apply(this, arguments); };
	client.Sync.prototype = {
		init: function() {
			this.postTimeout = null;
			this.delayedPostData = {};

      this.checkUsername =
        _.throttle(this.checkUsername.bind(this), 1000);
      this.checkEmail =
        _.throttle(this.checkEmail.bind(this), 1000);
		},

		remove: function() {
			this.clearPostTimeout();
		},

		getCollection: function(_id, success) {
			this.apiGet('collection', {_id: _id}, success);
		},

		getCollectionAndDaresAndInstances: function(_id, success) {
			this.apiGet('collectionAndDaresAndInstances', {_id: _id}, success);
		},

		getDare: function(_id, success) {
			this.apiGet('dare', {_id: _id}, success);
		},

		getDareAndInstance: function(_id, success) {
			this.apiGet('dareAndInstance', {_id: _id}, success);
		},

		getDareEdit: function(_id, success) {
			this.apiGet('dareEdit', {_id: _id}, success);
		},

		getDaresAndInstancesByUserId: function(userId, success) {
			this.apiGet('daresAndInstancesByUserId', {userId: userId}, success);
		},

		getDaresAndInstancesPlayed: function(userId, success) {
			this.apiGet('daresAndInstancesPlayed', {userId: userId}, success);
		},

		getDaresAndInstancesAll: function(success) {
			this.apiGet('daresAndInstancesAll', {}, success);
		},

		getUserByUsername: function(username, success) {
			this.apiGet('userByUsername', {username: username}, success);
		},

		getUsersAll: function(success) {
			this.apiGet('usersAll', {}, success);
		},

		updateProgram: function(instance) {
			this.apiPostDelayed('program', instance);
		},

		updateInstance: function(instance, success) {
			this.apiPost('instance', instance, success);
		},

		createDare: function(success, error) {
			this.apiPost('dareCreate', {}, success, error);
		},

		updateDare: function(dare, success, error) {
			this.apiPost('dareEdit', dare, success, error);
		},

		register: function(username, password, email, success, error) {
			this.apiPost('register', {username: username, password: password, email: email}, success, error);
		},

		login: function(username, password, error) {
			this.apiPost('login', {username: username, password: password}, undefined, error);
		},

		logout: function() {
			this.apiPost('logout');
		},

		checkUsername: function(username, success, error) {
			this.apiGet('checkUsername', {username: username}, success, error);
		},

		checkEmail: function(email, success, error) {
			this.apiGet('checkEmail', {email: email}, success, error);
		},

		getLoginData: function() {
			this.apiGet('loginData');
		},

		apiGet: function(name, data, success, error) {
			return $.ajax({
				url: '/api/get/' + name,
				type: 'get',
				data: data || {},
				dataType: 'json',
			});
		},

		apiPost: function(name, data, success, error) {
			return $.ajax({
				url: '/api/post/' + name,
				type: 'post',
				data: JSON.stringify(data || {}),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
			});
		},

		apiPostDelayed: function(name, data) {
			this.delayedPostData[name] = data;
			if (this.postTimeout === null) {
				this.flushPostDelayed();
				this.postTimeout = setTimeout(_(this.flushPostDelayed).bind(this), 5000);
			}
		},

		flushPostDelayed: function() {
			this.clearPostTimeout();
			for (var name in this.delayedPostData) {
				this.apiPost(name, this.delayedPostData[name]);
			}
			this.delayedPostData = {};
		},

		clearPostTimeout: function() {
			if (this.postTimeout !== null) {
				window.clearTimeout(this.postTimeout);
				this.postTimeout = null;
			}
		}
	};
};

/*jshint node:true jquery:true*/
"use strict";

module.exports = function(client) {
	client.Sync = function() { return this.init.apply(this, arguments); };
	client.Sync.prototype = {
		init: function(delegate) {
			this.delegate = delegate;
			this.postTimeout = null;
			this.delayedPostData = {};
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

		updateProgram: function(instance) {
			this.apiPostDelayed('program', instance);
		},

		updateInstance: function(instance, success) {
			this.apiPost('instance', instance, success);
		},

		apiGet: function(name, data, success) {
			this.flushPostDelayed();
			return $.ajax({
				url: 'api/get/' + name,
				type: 'get',
				data: data,
				dataType: 'json',
				success: (function(response) { this.delegate.connectionSuccess(); if (success) success(response); }).bind(this),
				error: this.delegate.connectionError.bind(this.delegate)
			});
		},

		apiPost: function(name, data, success) {
			this.flushPostDelayed();
			return $.ajax({
				url: 'api/post/' + name,
				type: 'post',
				data: JSON.stringify(data),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				success: (function(response) { this.delegate.connectionSuccess(); if (success) success(response); }).bind(this),
				error: this.delegate.connectionError.bind(this.delegate)
			});
		},

		apiPostDelayed: function(name, data) {
			this.delayedPostData[name] =  data;
			if (this.postTimeout === null) {
				this.postTimeout = setTimeout(this.flushPostDelayed.bind(this), 5000);
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
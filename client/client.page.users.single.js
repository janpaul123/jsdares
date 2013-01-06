/*jshint node:true jquery:true*/
"use strict";

var applet = require('../jsmm-applet');
var dares = require('../dares');

module.exports = function(client) {
	client.PageUsersSingle = function() { return this.init.apply(this, arguments); };
	client.PageUsersSingle.prototype = {
		type: 'PageUsersSingle',

		init: function(delegate, $div) {
			this.delegate = delegate;
			this.$div = $div;
			this.page = null;
		},

		remove: function() {
			if (this.page !== null) this.page.remove();
		},

		navigateTo: function(splitUrl) {
			if (splitUrl[1]) {
				this.username = splitUrl[1];
				this.delegate.getSync().getUserByUsername(this.username, this.userHandler.bind(this));
			}
		},

		userHandler: function(user) {
			if (this.page !== null) this.page.remove();

			if (user._id === this.delegate.getUserId()) {
				this.page = new client.PageUsersOwn(this.delegate, this.$div, user, this.username);
			} else {
				this.page = new client.PageUsersOther(this.delegate, this.$div, user, this.username);
			}
		}
	};

	client.PageUsersOwn = function() { return this.init.apply(this, arguments); };
	client.PageUsersOwn.prototype = {
		init: function(delegate, $div, user, username) {
			this.delegate = delegate;
			this.$div = $div;
			this.user = user;
			this.username = username;

			var $collectionPlayed = $('<div class="superheroes-collection-played"></div>');
			this.collectionPlayed = new dares.Collection(this, $collectionPlayed);
			this.$div.append($collectionPlayed);

			var $collectionMine = $('<div class="superheroes-collection-mine"></div>');
			this.collectionMine = new dares.Collection(this, $collectionMine);
			this.collectionMine.addButton('<i class="icon icon-plus-sign"></i> New', this.newHandler.bind(this));
			this.$div.append($collectionMine);

			this.updateCollections();
		},

		remove: function() {
			this.collectionPlayed.remove();
			this.collectionMine.remove();
			this.$div.html('');
		},

		updateCollections: function() {
			this.delegate.getSync().getDaresAndInstancesPlayed(this.delegate.getUserId(), (function(dares) {
				this.collectionPlayed.update({title: 'Played dares', dares: dares}, this.delegate.getUserId(), this.delegate.getAdmin());
			}).bind(this));

			this.delegate.getSync().getDaresAndInstancesByUserId(this.delegate.getUserId(), (function(dares) {
				this.collectionMine.update({title: 'My created dares', dares: dares}, this.delegate.getUserId(), this.delegate.getAdmin());
			}).bind(this));
		},

		newHandler: function() {
			this.delegate.getSync().createDare(this.createDareSuccessfulHandler.bind(this));
		},

		createDareSuccessfulHandler: function(content) {
			this.editDare(content._id);
		},

		viewDare: function(id) {
			this.delegate.navigateTo('/superheroes/' + this.username.toLowerCase() + '/dare/' + id);
		},

		editDare: function(id) {
			this.delegate.navigateTo('/superheroes/' + this.username.toLowerCase() + '/edit/' + id);
		}
	};

	client.PageUsersOther = function() { return this.init.apply(this, arguments); };
	client.PageUsersOther.prototype = {
		init: function(delegate, $div, user, username) {
			this.delegate = delegate;
			this.$div = $div;
			this.user = user;
			this.username = username;

			var $collectionTheirs = $('<div class="superheroes-collection-theirs"></div>');
			this.collectionTheirs = new dares.Collection(this, $collectionTheirs);
			this.$div.append($collectionTheirs);
			
			this.updateCollections();
		},

		remove: function() {
			this.collectionTheirs.remove();
			this.$div.html('');
		},

		updateCollections: function() {
			this.delegate.getSync().getDaresAndInstancesByUserId(this.user._id, (function(dares) {
				this.collectionTheirs.update({title: 'Dares by ' + this.user.screenname, dares: dares}, this.delegate.getUserId());
			}).bind(this));
		},

		viewDare: function(id) {
			this.delegate.navigateTo('/superheroes/' + this.username.toLowerCase() + '/dare/' + id);
		},

		editDare: function(id) {
			this.delegate.navigateTo('/superheroes/' + this.username.toLowerCase() + '/edit/' + id);
		}
	};
};

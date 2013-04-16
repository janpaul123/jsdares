/*jshint node:true jquery:true*/
"use strict";

var dares = require('../dares');

module.exports = function(client) {
	client.PageLearn = function() { return this.init.apply(this, arguments); };
	client.PageLearn.prototype = {
		type: 'PageLearn',

		init: function(delegate, $div) {
			this.delegate = delegate;
			this.$div = $('<div class="learn"></div>');

			$div.append(this.$div);

			var $collectionPlayed = $('<div class="learn-collection-played"></div>');
			this.collectionPlayed = new dares.Collection(this, $collectionPlayed);
			this.$div.append($collectionPlayed);

			var $collectionAll = $('<div class="learn-collection-all"></div>');
			this.collectionAll = new dares.Collection(this, $collectionAll);
			this.$div.append($collectionAll);
		},

		remove: function() {
			this.collectionPlayed.remove();
			this.collectionAll.remove();
			this.$div.remove();
		},

		navigateTo: function(splitUrl) {
			if (!this.delegate.getUserId()) {
				this.delegate.navigateTo('/');
			} else {
				this.updateCollections();
			}
		},

		updateCollections: function() {
			this.delegate.getSync().getDaresAndInstancesPlayed(this.delegate.getUserId(), _(function(dares) {
				this.collectionPlayed.update({title: 'Played dares', dares: dares}, this.delegate.getUserId(), this.delegate.getAdmin());
			}).bind(this));

			this.delegate.getSync().getDaresAndInstancesAll(_(function(dares) {
				this.collectionAll.update({title: 'All dares', dares: dares}, this.delegate.getUserId(), this.delegate.getAdmin());
			}).bind(this));
		},

		viewDare: function(id) {
			this.delegate.navigateTo('/learn/dare/' + id);
		},

		editDare: function(id) {
			this.delegate.navigateTo('/learn/edit/' + id);
		}
	};
};

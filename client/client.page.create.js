/*jshint node:true jquery:true*/
"use strict";

var dares = require('../dares');

module.exports = function(client) {
	client.PageCreate = function() { return this.init.apply(this, arguments); };
	client.PageCreate.prototype = {
		type: 'PageCreate',

		init: function(delegate, $div) {
			this.delegate = delegate;
			this.$div = $div;

			var $collectionMine = $('<div class="create-collection-mine"></div>');
			this.collectionMine = new dares.Collection(this, $collectionMine);
			this.collectionMine.addButton('<i class="icon icon-plus-sign"></i> New', _(this.newHandler).bind(this));
			this.$div.append($collectionMine);
		},

		remove: function() {
			this.collectionMine.remove();
			this.$div.html('');
		},

		navigateTo: function(splitUrl) {
			if (!this.delegate.getUserId()) {
				this.delegate.navigateTo('/');
			} else {
				this.updateCollections();
			}
		},

		updateCollections: function() {
			this.delegate.getSync().getDaresAndInstancesByUserId(this.delegate.getUserId(), _(function(dares) {
				this.collectionMine.update({title: 'My created dares', dares: dares}, this.delegate.getUserId(), this.delegate.getAdmin());
			}).bind(this));
		},

		newHandler: function() {
			this.delegate.getSync().createDare(_(this.createDareSuccessfulHandler).bind(this));
		},

		createDareSuccessfulHandler: function(content) {
			this.editDare(content._id);
		},

		viewDare: function(id) {
			this.delegate.navigateTo('/create/dare/' + id);
		},

		editDare: function(id) {
			this.delegate.navigateTo('/create/edit/' + id);
		}
	};
};

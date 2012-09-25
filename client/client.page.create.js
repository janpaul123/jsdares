/*jshint node:true jquery:true*/
"use strict";

var applet = require('../jsmm-applet');
var dares = require('../dares');

module.exports = function(client) {
	client.PageCreate = function() { return this.init.apply(this, arguments); };
	client.PageCreate.prototype = {
		type: 'PageCreate',

		init: function(delegate, $div) {
			this.delegate = delegate;
			this.$div = $div;
			
			this.modalUI = new applet.UI();
			this.modalUI.setCloseCallback(this.closeCallback.bind(this));
			this.dareId = null;

			console.log('PageCreate');
		},

		remove: function() {
			
		},

		getSync: function() {
			return this.delegate.getSync();
		},

		closeCallback: function() {
			console.log('closeCallback');
			this.delegate.navigateTo('/create'); // TODO: change to navigate back
		},

		navigateTo: function(splitUrl) {
			if (splitUrl[1] === 'edit') {
				this.navigateEdit(splitUrl[2]);
			} else {
				this.navigateCloseDare();
			}
		},

		navigateEdit: function(_id) {
			this.closeModal();
			if (this.dareId !== _id) {
				this.dareId = _id;

				this.delegate.getSync().getDare(_id, (function(dare) {
					this.instance = dare.instance;
					this.modalUI.openModal();
					new dares.Editor(this, this.modalUI, dare);
				}).bind(this));
			}
		},

		navigateCloseDare: function() {
			this.closeModal();
		},

		closeModal: function() {
			if (this.dareId !== null) {
				this.dareId = null;
				this.modalUI.closeModal();
			}
		}
	};
};

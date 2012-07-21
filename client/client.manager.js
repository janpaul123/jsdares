/*jshint node:true jquery:true*/
"use strict";

module.exports = function(client) {
	client.Manager = function() { return this.init.apply(this, arguments); };
	client.Manager.prototype = {
		init: function($div) {
			this.$div = $div;
			this.sync = new client.Sync(this);
			this.page = null;
			this.showPage();
		},

		getSync: function() {
			return this.sync;
		},

		showPage: function() {
			this.removePage();
			this.page = new client.PageHome(this, this.$div);
		},

		removePage: function() {
			if (this.page !== null) {
				this.page.remove();
				this.page = null;
			}
		},

		connectionError: function(error) {
			console.error('Connection error: ' + error);
		},

		connectionSuccess: function() {
			
		}
	};
};
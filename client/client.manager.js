/*jshint node:true jquery:true*/
"use strict";

module.exports = function(client) {
	client.Manager = function() { return this.init.apply(this, arguments); };
	client.Manager.prototype = {
		pageConstructors: {
			home: 'PageHome',
			full: 'PageHome'
		},

		init: function($div) {
			this.$div = $div;
			this.sync = new client.Sync(this);
			this.history = window.History;
			this.history.Adapter.bind(window, 'statechange', this.stateChange.bind(this));

			this.page = null;
			this.urlChange(window.location.pathname);
		},

		getSync: function() {
			return this.sync;
		},

		navigateTo: function(url) {
			this.addHistory(url);
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

		},

		addHistory: function(url) {
			this.history.pushState(null, null, url);
			/*global _gaq*/
			_gaq.push(['_trackPageview', url]); // Google Analytics
		},

		stateChange: function() {
			var state = this.history.getState();
			this.urlChange(state.hash);
		},

		urlChange: function(url) {
			var splitUrl = (url || '/').substring(1).split('/');
			if (this.pageConstructors[splitUrl[0]] === undefined) {
				splitUrl = ['home'];
			}
			var type = this.pageConstructors[splitUrl[0]];
			if (this.page === null || this.page.type !== type) {
				this.removePage();
				this.page = new client[type](this, this.$div);
			}
			this.page.navigateTo(splitUrl);
		}
	};
};
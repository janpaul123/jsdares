/*jshint node:true jquery:true*/
"use strict";

var applet = require('../jsmm-applet');
var dares = require('../dares');

var pageConstructors = [
	{regex: /^dare/, type: 'PageHome'},
	{regex: /^edit/, type: 'PageHome'},
	{regex: /^full/, type: 'PageHome'},
	{regex: /^about/, type: 'PageAbout'},
	{regex: /^learn/, type: 'PageLearn'},
	{regex: /^create/, type: 'PageCreate'},
	{regex: /^superheroes$/, type: 'PageUsersList'},
	{regex: /^superheroes/, type: 'PageUsersSingle'},
	{regex: /^blindfold/, type: 'PageBlog'}
];

module.exports = function(client) {
	client.Manager = function() { return this.init.apply(this, arguments); };
	client.Manager.prototype = {
		init: function() {
			this.$div = $('#content');
			this.menu = new client.MenuHeader(this);
			this.login = new client.Login(this);
			this.sync = new client.Sync(this);
			this.history = window.History;
			this.history.Adapter.bind(window, 'statechange', _(this.stateChange).bind(this));
			this.loginData = window.jsdaresLoginData;

			this.modalUI = new applet.UI();
			this.modalUI.setCloseCallback(_(this.closeDareCallback).bind(this));

			this.page = null;
			this.urlChange(window.location.pathname);
		},

		getSync: function() {
			return this.sync;
		},

		getLoginData: function() {
			return this.loginData;
		},

		getUserId: function() {
			return this.loginData ? this.loginData.userId : undefined;
		},

		getAdmin: function() {
			return this.loginData ? this.loginData.admin : false;
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
			this.login.showConnectionError();
			if (console) {
				console.error('Connection error: ' + error);
			}
		},

		connectionSuccess: function(response) {
			this.login.hideConnectionError();
		},

		updateLoginData: function(loginData) {
			if (this.loginData.loggedIn !== loginData.loggedIn) {
				this.loginData = loginData; // already do this here for if the page requests it
				this.refresh();
			}
			this.loginData = loginData;
			this.login.update(this.loginData);
			this.menu.showLocks(!this.loginData.loggedIn);
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

		refresh: function() {
			this.page.navigateTo(this.splitUrl);
			this.navigateDare(this.splitUrl);
		},

		urlChange: function(url) {
			this.modalUI.closeModal();

			url = (url || '/').substring(1);

			var type = null;
			for (var i=0; i<pageConstructors.length; i++) {
				if (pageConstructors[i].regex.test(url)) {
					type = pageConstructors[i].type;
					break;
				}
			}
			
			if (type === null) {
				type = 'PageHome';
				url = '';
			}
			this.splitUrl = url.split('/');

			if (this.page === null || this.page.type !== type) {
				this.removePage();
				this.page = new client[type](this, this.$div);
			}
			this.menu.navigateTo(this.splitUrl);
			this.refresh();
		},

		navigateDare: function(splitUrl) {
			if (this.splitUrl[this.splitUrl.length-2] === 'dare') {
				this.viewDare(this.splitUrl[this.splitUrl.length-1]);
			} else if (this.splitUrl[this.splitUrl.length-2] === 'edit') {
				this.editDare(this.splitUrl[this.splitUrl.length-1]);
			}
		},

		viewDare: function(id) {
			this.dareId = id;
			this.getSync().getDareAndInstance(id, _(function(dare) {
				if (dare._id === this.dareId) {
					this.instance = dare.instance;
					this.modalUI.openModal();
					dares.openDare(this, this.modalUI, dare);
				}
			}).bind(this));
		},

		editDare: function(id) {
			this.dareId = id;
			this.getSync().getDareEdit(id, _(function(dare) {
				if (dare._id === this.dareId) {
					this.instance = dare.instance;
					this.modalUI.openModal();
					new dares.Editor(this, this.modalUI, dare);
				}
			}).bind(this));
		},

		closeDareCallback: function() {
			if (['dare', 'edit'].indexOf(this.splitUrl[this.splitUrl.length-2] >= 0)) {
				this.navigateTo('/' + this.splitUrl.slice(0, -2).join('/'));
			}
		}
	};
};
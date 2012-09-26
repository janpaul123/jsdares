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
			if (this.page !== null) {
				this.page.remove();
			}
		},

		navigateTo: function(splitUrl) {
			if (splitUrl[1]) {
				if (this.delegate.getLoginData.username && splitUrl[1].toLowerCase() === this.delegate.getLoginData.username.toLowerCase()) {
					this.page = new client.PageUsersOwn(this.delegate, this.$div);
				} else {
					this.page = new client.PageUsersOther(this.delegate, this.$div);
				}
			}
		}
	};

	client.PageUsersOwn = function() { return this.init.apply(this, arguments); };
	client.PageUsersOwn.prototype = {
		init: function(delegate, $div) {
			this.delegate = delegate;
			this.$div = $div;
		},

		remove: function() {
		}
	};

	client.PageUsersOther = function() { return this.init.apply(this, arguments); };
	client.PageUsersOther.prototype = {
		init: function(delegate, $div) {
			this.delegate = delegate;
			this.$div = $div;
		},

		remove: function() {
		}
	};
};

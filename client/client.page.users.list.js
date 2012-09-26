/*jshint node:true jquery:true*/
"use strict";

var applet = require('../jsmm-applet');
var dares = require('../dares');

module.exports = function(client) {
	client.PageUsersList = function() { return this.init.apply(this, arguments); };
	client.PageUsersList.prototype = {
		type: 'PageUsersList',

		init: function(delegate, $div) {
			this.delegate = delegate;
			this.$div = $div;
		},

		remove: function() {
			
		},

		navigateTo: function(splitUrl) {
		}
	};
};

/*jshint node:true*/
"use strict";

module.exports = function(shared) {
	shared.validation = {
		username: function(input) {
			return (/^[a-zA-Z0-9_\-]+$/).test(input);
		},

		password: function(input) {
			return input.length >= 6;
		},

		email: function(input) {
			return (input.indexOf('@') > 0) && (input.lastIndexOf('.') > input.indexOf('@'));
		}
	};
};

/*jshint node:true*/
"use strict";

module.exports = function(shared) {
	shared.validation = {
		username: function(input) {
			return (/^[a-zA-Z0-9_\-\.]+$/).test(input) && this.usernameNotTooShort(input) && this.usernameNotTooLong(input);
		},

		usernameNotTooShort: function(input) {
			return input.length >= 3;
		},

		usernameNotTooLong: function(input) {
			return input.length <= 20;
		},

		password: function(input) {
			return input.length >= 6;
		},

		email: function(input) {
			return (input.indexOf('@') > 0) && (input.lastIndexOf('.') > input.indexOf('@'));
		}
	};
};

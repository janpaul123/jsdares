/*jshint node:true jquery:true*/
"use strict";

module.exports = function(client) {
	client.init = function() {
		var manager = new client.Manager();

		$('#header-title').on('click', function(event) {
			event.preventDefault();
			manager.navigateTo('/');
		});
	};
};

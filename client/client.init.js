/*jshint node:true jquery:true*/
"use strict";

module.exports = function(client) {
	client.init = function() {
		var manager = new client.Manager();

		$('.header-logo').on('click', function(event) {
			event.preventDefault();
			manager.navigateTo('/');
		});

		$('.footer-about').on('click', function(event) {
			event.preventDefault();
			manager.navigateTo('/about');
		});
	};
};

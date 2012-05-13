/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.getConsoleInfo = function() {
		return [
			{
				name: 'console.log',
				id: 'console.log',
				outputs: ['console'],
				makeContent: function($content) {
					$content.html('Use console.log to write something to the console, e.g. console.log("Hello World!");');
				}
			},
			{
				name: 'console.clear',
				id: 'console.clear',
				outputs: ['console'],
				makeContent: function($content) {
					$content.html('Used to clear the console contents');
				}
			},
			{
				name: 'console.setColor',
				id: 'console.setColor',
				outputs: ['console'],
				makeContent: function($content) {
					$content.html('Used to set the color of the console');
				}
			},
			{
				name: '++, --',
				id: '++',
				outputs: [],
				makeContent: function($content) {
					$content.html('Blah');
				}
			},
			{
				name: 'function',
				id: 'function',
				outputs: [],
				makeContent: function($content) {
					$content.html('Blah');
				}
			}
		];
	};
};

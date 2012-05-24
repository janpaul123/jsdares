/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	jsmm.info = {};
	jsmm.info.getCommands = function() {
		return [
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
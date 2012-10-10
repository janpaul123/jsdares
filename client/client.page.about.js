/*jshint node:true jquery:true*/
"use strict";

var dares = require('../dares');

module.exports = function(client) {
	client.PageAbout = function() { return this.init.apply(this, arguments); };
	client.PageAbout.prototype = {
		type: 'PageAbout',

		init: function(delegate, $div) {
			this.delegate = delegate;
			this.$div = $div;

			this.$div.html('<p><strong>jsdares</strong> is an experimental learning environment. You can learn by playing "dares" created by other users, or explore the "computational universe" on your own. If you already know programming, you can create dares and share them with the world.</p><p>All the code for jsdares was written in Javascript by Jan Paul Posma for a masters dissertation at the <a href="http://www.cs.ox.ac.uk">University of Oxford</a>. The code is available under the MIT license on <a href="https://github.com/janpaul123/jsdares">GitHub</a>. You can also view the <a href="http://thesis.jsdares.com">thesis</a> online.</p><p>Thanks to everyone who has contributed to jsdares in one way or another (see the dissertation for a complete list). Special thanks to these people for libraries and icons: jQuery (MIT license); Twitter Bootstrap (Apache license); Glyphicons, Mark James, Camila Bertoco, Nathan Driskell, Paul Robert Lloyd (CC-BY license); Olav Andreas Lindekleiv (BSD license).</p>');
		},

		remove: function() {
			this.$div.html('');
		},

		navigateTo: function(splitUrl) {
		}
	};
};

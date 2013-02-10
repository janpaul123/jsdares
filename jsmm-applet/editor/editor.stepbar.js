/*jshint node:true jquery:true*/
"use strict";

var clayer = require('../clayer');

module.exports = function(editor) {
	editor.Stepbar = function() { return this.init.apply(this, arguments); };
	editor.Stepbar.prototype = {
		init: function($div, ed) {
			this.$div = $div;
			this.editor = ed;

			this.$div.addClass('editor-stepbar');
		},

		remove: function() {
			this.$div.html('');
			this.$div.removeClass('editor-stepbar');
		},

		update: function(runner) {
			this.enabled = true;
		},

		disable: function() {
			this.enabled = false;
		}

		/// INTERNAL FUNCTIONS ///
	};
};

/*jshint node:true jquery:true*/
"use strict";

var cs = {};

cs.Console = function() { return this.init.apply(this, arguments); };

cs.Console.prototype = {
	init: function($div) {
		this.$div = $div;
		this.$div.addClass('cs-console');
		this.debugToBrowser = true;
		this.highlightNextLines = false;
		this.callback = null;
		this.clear();
	},

	getAugmentedObject: function() {
		return {
			log: {isAugmentedFunction: true, func: $.proxy(this.log, this)},
			clear: {isAugmentedFunction: true, func: $.proxy(this.log, this)}
		};
	},

	log: function(node, value) {
		var text = '' + value;
		if (typeof value === 'object') text = '[object]';
		else if (typeof value === 'function') text = '[function]';

		var $element = $('<div class="cs-line"></div>');
		if (this.highlightNextLines) $element.addClass('cs-highlight');
		$element.text(text);
		$element.data('node', node);
		$element.on('mousemove', $.proxy(this.mouseMove, this));
		this.$div.append($element);

		if (this.debugToBrowser && console && console.log) console.log(value);
	},

	startHighlighting: function() {
		this.highlightNextLines = true;
	},

	stopHighlighting: function() {
		this.highlightNextLines = false;
	},

	enableHighlighting: function() {
		this.highlighting = true;
	},

	disableHighlighting: function() {
		this.highlighting = false;
	},

	clear: function() {
		this.$div.children('.cs-line').remove(); // like this to prevent $.data memory leaks
		if (this.debugToBrowser && console && console.clear) console.clear();
	},

	setCallback: function(callback) {
		this.callback = callback;
	},

	mouseMove: function(event) {
		if (this.callback !== null) {
			this.callback($(event.target).data('node'));
		}
	}
};

module.exports = cs;

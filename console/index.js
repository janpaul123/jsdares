/*jshint node:true jquery:true*/
"use strict";

var cs = {};

cs.Console = function() { return this.init.apply(this, arguments); };

cs.Console.prototype = {
	init: function($div, editor) {
		this.$div = $div;
		this.$div.addClass('cs-console');
		//this.debugToBrowser = true;
		this.highlightNextLines = false;
		this.editor = editor;
		this.editor.addOutput(this);
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
		if (this.highlightNextLines) {
			$element.addClass('cs-highlight');
		}
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
		this.$div.children('.cs-highlight').removeClass('cs-highlight');
	},

	startRun: function() {
		this.clear();
	},

	endRun: function() {
		if (this.highlighting) {
			var $last = this.$div.children('.cs-highlight').last();
			if ($last.length > 0) {
				// the offset is weird since .position().top changes when scrolling
				this.scrollToY($last.position().top + this.$div.scrollTop());
			}
		}
	},

	clear: function() {
		this.$div.children('.cs-line').remove(); // like this to prevent $.data memory leaks
		if (this.debugToBrowser && console && console.clear) console.clear();
	},

	/// INTERNAL FUNCTIONS ///
	scrollToY: function(y) {
		y = Math.max(0, y - this.$div.height()/2);
		this.$div.stop(true).animate({scrollTop : y}, 150);
	},

	mouseMove: function(event) {
		if (this.highlighting) {
			var $target = $(event.target);
			if (!$target.hasClass('cs-highlight')) {
				this.$div.children('.cs-highlight').removeClass('cs-highlight');
				$target.addClass('cs-highlight');
				this.editor.highlightNode($target.data('node'));
			}
		}
	}
};

module.exports = cs;

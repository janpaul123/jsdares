/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.Console = function() { return this.init.apply(this, arguments); };

	output.Console.prototype = {
		init: function($div, editor) {
			this.$div = $div;
			this.$div.addClass('console');
			this.$div.on('scroll', $.proxy(this.refreshAutoScroll, this));

			this.$content = $('<div class="console-content"></div>');
			this.$div.append(this.$content);

			//this.debugToBrowser = true;
			this.highlighting = false;
			this.highlightNextLines = false;
			this.autoScroll = false;
			this.editor = editor;
			this.editor.addOutput(this);

			this.refreshAutoScroll();
			this.clear();
		},

		remove: function() {
			this.clear();
			this.$content.remove();
			this.$div.removeClass('console');
			this.$div.off('scroll mousemove mouseleave');
			this.editor.removeOutput(this);
		},

		getAugmentedObject: function() {
			return {
				log: {
					name: 'log',
					augmented: 'function',
					example: 'log("Hello World!")',
					func: $.proxy(this.log, this)
				},
				clear: {
					name: 'clear',
					augmented: 'function',
					example: 'clear()',
					func: $.proxy(this.clear, this)
				},
				setColor: {
					name: 'setColor',
					augmented: 'function',
					example: 'setColor("#a00")',
					func: $.proxy(this.setColor, this)
				}
			};
		},

		log: function(node, name, args) {
			var value = args[0];
			var text = '' + value;
			if (typeof value === 'object') text = '[object]';
			else if (typeof value === 'function') text = '[function]';

			var $element = $('<div class="console-line"></div>');
			if (this.highlightNextLines) {
				$element.addClass('console-highlight-line');
			}
			$element.text(text);
			$element.data('node', node);
			this.$content.append($element);
			this.text += text + '\n';

			if (this.color !== '') $element.css('color', this.color);

			if (this.debugToBrowser && console && console.log) console.log(value);
		},

		setColor: function(node, name, args) {
			var color = args[0];
			this.color = color;
		},

		startHighlighting: function() {
			this.highlightNextLines = true;
		},

		stopHighlighting: function() {
			this.highlightNextLines = false;
		},

		enableHighlighting: function() {
			this.highlighting = true;
			this.$div.addClass('console-highlighting');
			this.$div.on('mousemove', $.proxy(this.mouseMove, this));
			this.$div.on('mouseleave', $.proxy(this.mouseLeave, this));
			this.autoScroll = false;
			this.$div.removeClass('console-autoscroll');
		},

		disableHighlighting: function() {
			this.highlighting = false;
			this.$content.children('.console-highlight-line').removeClass('console-highlight-line');
			this.$div.removeClass('console-highlighting');
			this.$div.off('mousemove mouseleave');
			this.refreshAutoScroll();
		},

		startRun: function() {
			this.stopHighlighting();
			this.clear();
			this.$content.removeClass('console-error');
		},

		endRun: function() {
			if (this.highlighting) {
				var $last = this.$content.children('.console-highlight-line').last();
				if ($last.length > 0) {
					// the offset is weird since .position().top changes when scrolling
					this.scrollToY($last.position().top + this.$div.scrollTop());
				}
			} else if (this.autoScroll) {
				this.scrollToY(this.$content.height());
			}
		},

		endRunStepping: function() {
			this.endRun();
		},

		hasError: function() {
			this.$content.addClass('console-error');
		},

		clear: function() {
			this.color = '';
			this.text = '';
			this.$content.children('.console-line').remove(); // like this to prevent $.data memory leaks
			if (this.debugToBrowser && console && console.clear) console.clear();
		},

		getText: function() {
			return this.text;
		},

		/// INTERNAL FUNCTIONS ///
		scrollToY: function(y) {
			y = Math.max(0, y - this.$div.height()/2);
			this.$div.stop(true).animate({scrollTop : y}, 150);
		},

		mouseMove: function(event) {
			if (this.highlighting) {
				var $target = $(event.target);
				this.$content.children('.console-highlight-line').removeClass('console-highlight-line');
				if ($target.data('node') !== undefined && !$target.hasClass('console-highlight-line')) {
					$target.addClass('console-highlight-line');
					this.editor.highlightNode($target.data('node'));
				} else {
					this.editor.highlightNode(null);
				}
			}
		},

		mouseLeave: function(event) {
			if (this.highlighting) {
				this.$content.children('.console-highlight-line').removeClass('console-highlight-line');
				this.editor.highlightNode(null);
			}
		},

		refreshAutoScroll: function() {
			if (!this.highlighting) {
				if (this.$div.scrollTop() >= this.$content.outerHeight(true)-this.$div.height()-4) {
					this.$div.addClass('console-autoscroll');
					this.autoScroll = true;
				} else {
					this.$div.removeClass('console-autoscroll');
					this.autoScroll = false;
				}
			}
		}
	};
};

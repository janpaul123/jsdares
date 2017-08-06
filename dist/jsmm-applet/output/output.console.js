/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	var getScopeObjects = function() {
		return {console: this.getAugmentedObject()};
	};

	var getAugmentedObject = function() {
		return {
			type: 'object',
			string: '[object console]',
			properties: {
				log: {
					name: 'log',
					info: 'console.log',
					type: 'function',
					example: 'log("Hello world!")',
					string: '[function console.log]',
					func: _(this.log).bind(this),
					cost: 3
				},
				clear: {
					name: 'clear',
					info: 'console.clear',
					type: 'function',
					example: 'clear()',
					string: '[function console.clear]',
					func: _(this.clear).bind(this),
					cost: 4
				},
				setColor: {
					name: 'setColor',
					info: 'console.setColor',
					type: 'function',
					example: 'setColor("#a00")',
					string: '[function console.setColor]',
					func: _(this.setColor).bind(this),
					cost: 0.2
				}
			}
		};
	};

	var makeLog = function(value) {
		if (typeof value === 'object') return value.string + '\n';
		else if (value === undefined) return '\n';
		else return '' + value + '\n';
	};

	output.SimpleConsole = function() { return this.init.apply(this, arguments); };
	output.SimpleConsole.prototype = {
		getScopeObjects: getScopeObjects,
		getAugmentedObject: getAugmentedObject,

		init: function() {
			this.calls = [];
			this.color = '';
			this.text = '';
		},

		log: function(context, name, args) {
			var text = makeLog(args[0]);
			this.calls.push({text: text, color: this.color});
			this.text += text;
		},

		clear: function() {
			this.calls.push({clear: true});
			this.text = '';
		},

		setColor: function(context, name, args) {
			this.color = args[0];
		},

		getText: function() {
			return this.text;
		},

		getCalls: function() {
			return this.calls;
		}
	};

	output.Console = function() { return this.init.apply(this, arguments); };
	output.Console.prototype = {
		getScopeObjects: getScopeObjects,
		getAugmentedObject: getAugmentedObject,

		init: function(editor, options, $div) {
			this.$div = $div;
			this.$div.addClass('output console');
			this.$div.on('scroll', _(this.refreshAutoScroll).bind(this));

			this.$container = $('<div class="console-container"></div>');
			this.$div.append(this.$container);

			this.$targetConsole = $('<div class="console-target"></div>');
			this.$container.append(this.$targetConsole);

			this.$content = $('<div class="console-content"></div>');
			this.$container.append(this.$content);

			this.$old = $('<div class="console-old"></div>');
			this.$content.append(this.$old);

			this.$lines = $('<div class="console-lines"></div>');
			this.$content.append(this.$lines);

			//this.debugToBrowser = true;
			this.highlighting = false;
			this.autoScroll = true;
			this.editor = editor;

			this.refreshAutoScroll();
		},

		remove: function() {
			this.$lines.children().remove();
			this.$container.remove();
			this.$div.removeClass('output console');
			this.$div.off('scroll mousemove mouseleave');
		},

		log: function(context, name, args) {
			var text = makeLog(args[0]);
			this.text += text;

			var $element = $('<div class="console-line"></div>');
			$element.text(text);
			$element.css('color', this.color);
			$element.data('index', this.currentEvent.calls.length);
			$element.data('event', this.currentEvent);
			$element.addClass('console-line-visible');
			this.$lines.append($element);
			this.mirror += $element[0].outerHTML;
			
			this.currentEvent.calls.push({
				$element: $element,
				stepNum: context.getStepNum(),
				nodeId: context.getCallNodeId(),
				callId: context.getCallId()
			});
			
			if (this.currentEvent.$firstElement === null) {
				this.currentEvent.$firstElement = $element;
			}

			if (this.debugToBrowser && console && console.log) console.log(args[0]);
		},

		clear: function(context) {
			this.text = '';
			this.color = '';
			this.mirror = '';
			this.$old.hide();
			this.$lines.children('.console-line-visible').removeClass('console-line-visible');

			this.currentEvent.calls.push({
				clear: true,
				stepNum: context.getStepNum()
			});
			
			if (this.debugToBrowser && console && console.clear) console.clear();
		},

		setColor: function(context, name, args) {
			var color = args[0];
			this.color = color;
		},

		outputStartEvent: function(context) {
			this.currentEvent = {
				text: this.text,
				color: this.color,
				oldHtml: this.mirror,
				$firstElement: null,
				calls: []
			};
			this.events.push(this.currentEvent);
			this.stepNum = Infinity;
		},

		outputEndEvent: function() {
			this.updateEventHighlight();
		},

		stashOldLines: function() {
			if (!this.oldLinesStashed) {
				this.oldLinesStashed = true;
				this.$old.html(this.events[0].oldHtml);
				if (this.events[0].$firstElement !== null) {
					this.events[0].$firstElement.prevAll().remove();
				} else {
					this.$lines.children().remove();
				}
			}
		},

		outputClearAllEvents: function() {
			this.text = '';
			this.color = '';
			this.mirror = '';
			this.$old.html('');
			this.$old.show();
			this.oldLinesStashed = true;
			this.$lines.children().remove(); // prevent $.data leaks
			this.events = [];
		},

		outputPopFirstEvent: function() {
			this.events.shift();
			this.oldLinesStashed = false;
		},

		outputClearEventsFrom: function(eventNum) {
			this.stashOldLines();

			this.text = this.events[eventNum].text;
			this.color = this.events[eventNum].color;
			this.mirror = this.events[eventNum].oldHtml;
			for (var i=eventNum; i<this.events.length; i++) {
				if (this.events[i].$firstElement !== null) {
					this.events[i].$firstElement.nextAll().remove();
					this.events[i].$firstElement.remove();
					break;
				}
			}
			this.events = this.events.slice(0, eventNum);
		},

		outputClearEventsToEnd: function() {
			this.$old.html(this.mirror);
			this.$old.show();
			this.oldLinesStashed = true;
			this.$lines.children().remove(); // prevent $.data leaks
			this.events = [];
		},

		outputSetError: function(error) {
			if (error) {
				this.$content.addClass('console-error');
			} else {
				this.$content.removeClass('console-error');
			}
		},

		outputSetEventStep: function(eventNum, stepNum) {
			if (eventNum >= 0 && (this.currentEvent !== this.events[eventNum] || this.stepNum !== stepNum)) {
				this.stashOldLines();
				this.currentEvent = this.events[eventNum];
				this.stepNum = stepNum;

				this.$old.show();
				this.$lines.children('.console-line-visible').removeClass('console-line-visible');
				this.$lines.children('.console-line-highlight-step').removeClass('console-line-highlight-step');
				for (var i=0; i<this.events.length; i++) {
					if (i > eventNum) break;
					for (var j=0; j<this.events[i].calls.length; j++) {
						var call = this.events[i].calls[j];
						if (i === eventNum) {
							if (call.stepNum === this.stepNum) call.$element.addClass('console-line-highlight-step');
							else if (call.stepNum > this.stepNum) break;
						}

						if (call.clear) {
							this.$old.hide();
							this.$lines.children('.console-line-visible').removeClass('console-line-visible');
						} else {
							call.$element.addClass('console-line-visible');
						}
					}
				}

				this.updateEventHighlight();

				if (this.autoScroll) {
					this.scrollToY(this.$content.height());
				}
			}
		},

		highlightCallIds: function(callIds) {
			this.$lines.children('.console-line-highlight-line').removeClass('console-line-highlight-line');

			if (callIds !== null) {
				for (var i=0; i<this.currentEvent.calls.length; i++) {
					var call = this.currentEvent.calls[i];
					if (callIds.indexOf(call.callId) >= 0 && !call.clear) {
						call.$element.addClass('console-line-highlight-line');
					}
				}

				var $last = this.$lines.children('.console-line-highlight-line').last();
				if ($last.length > 0) {
					// the offset is weird since .position().top changes when scrolling
					this.scrollToY($last.position().top, true);
				}
			}
		},

		highlightTimeIds: function(timeIds) {
			this.$lines.children('.console-line-highlight-time').removeClass('console-line-highlight-time');
			if (timeIds !== null) {
				for (var i=0; i<this.events.length; i++) {
					for (var j=0; j<this.events[i].calls.length; j++) {
						var call = this.events[i].calls[j];

						if (timeIds[i].indexOf(call.callId) >= 0 && !call.clear) {
							call.$element.addClass('console-line-highlight-time');
						}
					}
				}
			}
		},

		enableHighlighting: function() {
			this.highlighting = true;
			this.$div.addClass('console-highlighting');
			this.$div.off('mousemove mouseleave');
			this.$div.on('mousemove', _(this.mouseMove).bind(this));
			this.$div.on('mouseleave', _(this.mouseLeave).bind(this));
			this.autoScroll = false;
			this.$div.removeClass('console-autoscroll');
			this.updateEventHighlight();
		},

		disableHighlighting: function() {
			this.highlighting = false;
			this.$lines.children('.console-line-highlight-line').removeClass('console-line-highlight-line');
			this.updateEventHighlight();
			this.$div.removeClass('console-highlighting');
			this.$div.off('mousemove mouseleave');
			this.refreshAutoScroll();
		},

		enableEventHighlighting: function() {
			this.$div.addClass('console-highlighting-current-event');
			this.updateEventHighlight();
		},

		disableEventHighlighting: function() {
			this.$div.removeClass('console-highlighting-current-event');
		},

		updateEventHighlight: function() {
			this.$lines.children('.console-line-highlight-event').removeClass('console-line-highlight-event');
			if (this.highlighting) {
				for (var i=0; i<this.currentEvent.calls.length; i++) {
					if (!this.currentEvent.calls[i].clear) {
						this.currentEvent.calls[i].$element.addClass('console-line-highlight-event');
					}
				}
			}
		},

		getText: function() {
			return this.text;
		},

		makeTargetConsole: function(content) {
			var lines = content.split('\n');
			while (lines.length > 0 && lines[lines.length-1] === '') {
				lines.pop();
			}
			for (var i=0; i<lines.length; i++) {
				var $element = $('<div class="console-line"></div>');
				$element.text(lines[i]);
				this.$targetConsole.append($element);
			}
		},

		setFocus: function() {
			this.$content.css('min-height', this.$targetConsole.height());
			this.refreshAutoScroll();
		},

		getMouseElement: function() {
			return this.$container;
		},

		/// INTERNAL FUNCTIONS ///
		scrollToY: function(y, smooth) {
			smooth = smooth || false;
			y = Math.max(0, y - this.$div.height()/2);
			this.$div.stop(true);
			if (smooth) {
				this.$div.animate({scrollTop : y}, 150);
			} else {
				this.$div.scrollTop(y);
			}
		},

		mouseMove: function(event) {
			if (this.highlighting) {
				var $target = $(event.target);
				if ($target.data('event') === this.currentEvent && this.currentEvent.calls[$target.data('index')] !== undefined) {
					if (!$target.hasClass('console-line-highlight-line')) {
						this.$lines.children('.console-line-highlight-line').removeClass('console-line-highlight-line');
						$target.addClass('console-line-highlight-line');
						this.editor.highlightNodeId(this.currentEvent.calls[$target.data('index')].nodeId);
					}
				} else {
					this.$lines.children('.console-line-highlight-line').removeClass('console-line-highlight-line');
					this.editor.highlightNodeId(0);
				}
			}
		},

		mouseLeave: function(event) {
			if (this.highlighting) {
				this.$lines.children('.console-line-highlight-line').removeClass('console-line-highlight-line');
				this.editor.highlightNodeId(0);
			}
		},

		refreshAutoScroll: function() {
			if (!this.highlighting) {
				if (this.$div.scrollTop() >= this.$content.outerHeight(true)-this.$div.height()-4 || this.$div.height() <= 0) {
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

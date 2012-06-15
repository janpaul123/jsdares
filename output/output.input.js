/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.Input = function() { return this.init.apply(this, arguments); };
	output.Input.prototype = {
		init: function(editor) {
			this.editor = editor;

			this.keyDown = $.proxy(this.keyDownHandler, this);
			this.keyUp = $.proxy(this.keyUpHandler, this);
			$(document).on('keydown', this.keyDown);
			$(document).on('keyup', this.keyUp);

			this.intervalId = null;
			this.start = true;
			this.outputClearAllEvents();
		},

		remove: function() {
			this.editor.removeOutput(this);
			$(document).off('keydown', this.keyDown);
			$(document).off('keyup', this.keyUp);
		},

		getAugmentedDocumentObject: function() {
			return {
				onkeydown: {
					name: 'onkeydown',
					info: 'document.onkeydown',
					type: 'variable',
					example: 'onkeydown = keyDownHandler',
					get: $.proxy(this.handleKeyboardGet, this),
					set: $.proxy(this.handleKeyboardSet, this)
				},
				onkeyup: {
					name: 'onkeyup',
					info: 'document.onkeyup',
					type: 'variable',
					example: 'onkeyup = keyUpHandler',
					get: $.proxy(this.handleKeyboardGet, this),
					set: $.proxy(this.handleKeyboardSet, this)
				}
			};
		},

		getAugmentedWindowObject: function() {
			return {
				setInterval: {
					name: 'setInterval',
					info: 'window.setInterval',
					type: 'function',
					example: 'setInterval(func, 30)',
					func: $.proxy(this.handleTimeCall, this)
				}
			};
		},

		handleKeyboardGet: function(name) {
			return this[name];
		},

		handleKeyboardSet: function(context, name, value) {
			this.checkStart();

			if (value.type !== 'internalFunction') {
				throw 'You can only set <var>' + name + '</var> to a function declared by you';
			}
			this[name] = value;
			this.editor.makeInteractive();
		},

		handleTimeCall: function(context, name, args) {
			this.checkStart();

			if (args.length !== 2) {
				throw '<var>setInterval</var> takes exactly <var>2</var> arguments';
			} else if (args[0].type !== 'internalFunction') {
				throw 'First argument to <var>setInterval</var> must be the name of a function declared by you';
			} else if (typeof args[1] !== 'number' || args[1] < 25) {
				throw 'Second argument to <var>setInterval</var> must be a number specifying the time in milliseconds, and cannot be smaller than 25';
			}

			this.clearInterval();
			this.interval = args[0];
			this.intervalId = setInterval($.proxy(this.doInterval, this), args[1]);
			this.editor.makeInteractive();
		},

		keyDownHandler: function(event) {
			// 17 == CTRL, 18 == ALT, (17, 91, 93, 224) == COMMAND
			// block these as they are only keyboard shortcuts
			if ([17, 18, 91, 93, 224].indexOf(event.keyCode) >= 0) {
				return;
			}
			if (this.onkeydown !== null) {
				this.editor.addEvent('keyboard', this.onkeydown.name, [{ keyCode: event.keyCode }]);
			}
		},

		keyUpHandler: function(event) {
			// 17 == CTRL, 18 == ALT, (17, 91, 93, 224) == COMMAND
			// block these as they are only keyboard shortcuts
			if ([17, 18, 91, 93, 224].indexOf(event.keyCode) >= 0) {
				return;
			}
			if (this.onkeyup !== null) {
				this.editor.addEvent('keyboard', this.onkeyup.name, [{ keyCode: event.keyCode }]);
			}
		},

		doInterval: function() {
			this.editor.addEvent('interval', this.interval.name, []);
		},

		clearInterval: function() {
			if (this.intervalId !== null) {
				clearInterval(this.intervalId);
			}
		},

		checkStart: function() {
			if (!this.start) {
				throw 'You an only set events in the first run, not from another event';
			}
		},
		
		outputEndEvent: function() {
			this.first = false;
		},

		outputClearAllEvents: function() {
			this.clearInterval();
			this.interval = null;
			this.onkeydown = null;
			this.onkeyup = null;
			this.first = true;
			this.popped = false;
		},

		outputPopFirstEvent: function() {
			this.popped = true;
		},

		outputClearEventsFrom: function(eventNum) {
			if (!this.popped && eventNum === 0) {
				this.outputClearAllEvents();
			}
		}
	};
};

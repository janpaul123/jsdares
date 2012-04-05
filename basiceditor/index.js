/*jshint node:true jquery:true*/
"use strict";

var based = {};

based.Editor = function() { return this.init.apply(this, arguments); };
based.Code = function() { return this.init.apply(this, arguments); };
	
based.Code.prototype = {
	init: function(text) {
		this.text = '' + text;
	},
	getText: function() {
		return this.text;
	},
	getLine: function(line) {
		this.makeLines();
		return this.lines[line-1];
	},
	lineColumnToOffset: function(line, column) {
		this.makeOffsets();
		return this.offsets[line-1] + column;
	},
	posToOffset: function(pos) {
		return this.lineColumnToOffset(pos.line, pos.column);
	},
	rangeToText: function(startPos, endPos) {
		return this.text.substring(this.posToOffset(startPos), this.posToOffset(endPos));
	},
	lineColumnToPositionText: function(line, column) {
		this.makeLines();
		return new Array(line).join('\n') + (this.lines[line-1] || '').substring(0, column);
	},
	elToText: function(el) {
		return this.rangeToText(el.startPos, el.endPos);
	},
	offsetToPos: function(offset) {
		this.makeOffsets();
		// TODO: implement binary search
		for (var i=0; i<this.lines.length; i++) {
			if (offset < this.offsets[i]) {
				return {line: i, column: offset-(this.offsets[i-1] || 0)};
			}
		}
		return {line: this.lines.length, column: offset-this.offsets[this.lines.length-1]};
	},
	insertAtOffset: function(offset, text) {
		return this.text.substring(0, offset) + text + this.text.substring(offset);
	},
	removeAtOffsetRange: function(offset1, offset2) {
		return this.text.substring(0, offset1) + this.text.substring(offset2);
	},
	/// INTERNAL FUNCTIONS ///
	makeLines: function() {
		if (this.lines !== undefined) return;
		this.lines = this.text.split(/\n/);
	},
	makeOffsets: function() {
		if (this.offsets !== undefined) return;
		this.makeLines();
		this.offsets = [0];
		for (var i=1; i<this.lines.length; i++) {
			// add one for the actual newline character
			this.offsets[i] = this.offsets[i-1] + this.lines[i-1].length + 1;
		}
	}
};

based.Editor.prototype = {
	init: function($div) {
		var that = this;

		this.$div = $div;
		this.$div.addClass('based-editor');

		// setting up textarea
		this.$textarea = $('<textarea class="based-code" autocorrect="off" autocapitalize="off" spellcheck="false" wrap="off"></textarea>');
		this.$div.append(this.$textarea);
		this.$textarea.bind('keydown', function(e) { that.keydown(e); });
		this.$textarea.bind('keyup', function(e) { that.keyup(e); });
		this.$textarea.bind('paste', function(e) { that.paste(e); });

		// setting up mirror
		this.$mirror = $('<div class="based-mirror"></div>');
		this.$mirrorContainer = $('<div class="based-mirror-container"></div>');
		this.$mirrorContainer.append(this.$mirror);
		this.$div.append(this.$mirrorContainer);

		// setting up margin
		this.$marginArrow = $('<div class="based-margin-arrow"><img src="img/arrow_right.png"/></div>');
		this.$marginError = $('<div class="based-margin-error"><img src="img/exclamation.png"/></div>');
		this.$marginArrow.click(function(e) { that.toggleMesssage(); });
		this.$marginError.click(function(e) { that.toggleMesssage(); });

		this.$margin = $('<div class="based-margin"></div>');
		this.$margin.append(this.$marginArrow);
		this.$margin.append(this.$marginError);
		this.$div.append(this.$margin);
		
		// setting up messages
		this.$messagebox = $('<div class="based-messagebox"><img class="based-messagecol" src="img/arrow_up.png"/><div class="based-message"></div></div>');
		this.$div.append(this.$messagebox);
		this.$messageMarking = this.addMarking(0,0,0,0, 'based-message-marking');
		this.$messageMarking.hide();

		this.$messagebox.click(function(e) { that.toggleMesssage(); });
		this.$messageMarking.click(function(e) { that.toggleMesssage(); });

		this.callbacks = {
			textChange: function() {}
		};

		this.reset();
	},

	reset: function() {
		this.dynamicState = {
			code: new based.Code(this.$textarea.val()),
			message: null
		};
		this.persistentState = {
			messageOpen: false
		};

		/*
		$('#margin .lineMsg').fadeOut(100, function() {
			$(this).remove();
		});
		*/
	},

	getCode: function() {
		return this.dynamicState.code;
	},

	setCode: function(code) {
		this.dynamicState.code = new based.Code(code);
		this.$textarea.val(code);
	},

	setMessage: function(message) {
		if (message.type === 'Error' &&
				(this.dynamicState.message === null || this.dynamicState.message.type !== 'Error')) {
			this.persistentState.messageOpen = false;
		}

		this.dynamicState.message = message;
	},

	clearMessage: function() {
		this.dynamicState.message = null;
	},

	openMessage: function() {
		this.persistentState.messageOpen = true;
	},

	setCallback: function(name, func) {
		this.callbacks[name] = func;
	},

	render: function() {
		this.renderMessage();
	},

	/// INTERNAL FUNCTIONS ///
	runCallback: function(name) {
		if (this.callbacks[name] !== undefined) {
			this.callbacks[name].apply(this, [].slice.call(arguments, 1));
		}
	},

	addMarking: function(x, y, width, height, type) {
		var $marking = $('<div class="based-marking"></div>');
		$marking.css('left', x);
		$marking.css('top', y);
		$marking.width(width);
		$marking.height(height);
		$marking.addClass(type);
		this.$div.append($marking);
		return $marking;
	},

	getPosition: function(text) {
		// add a space because of a bug when text contains only newlines
		text += ' ';
		this.$mirror.text(text);
		this.$mirror.text(text); // TODO: find out why this is here twice
		return {x: this.$mirror.outerWidth(), y: this.$mirror.outerHeight()};
	},
	
	renderMessage: function() {
		if (this.dynamicState.message === null) {
			this.$messagebox.fadeOut(100);
			this.$messageMarking.fadeOut(100);
			this.$marginArrow.fadeOut(100);
			this.$marginError.fadeOut(100);
			this.$textarea.removeClass('based-stepping');
			this.$textarea.removeClass('based-error');
		} else {
			var msg = this.dynamicState.message;

			var startPos = this.getPosition(this.dynamicState.code.lineColumnToPositionText(msg.line, msg.column));
			var endPos = null;
			if (msg.column2 > msg.column) endPos = this.getPosition(this.dynamicState.code.lineColumnToPositionText(msg.line, msg.column2));
			
			// the offset is weird since .position().top changes when scrolling
			var offset = {
				x: (this.$textarea.position().left + this.$div.scrollLeft()),
				y: (this.$textarea.position().top + this.$div.scrollTop())
			};
			
			if (endPos !== null && this.persistentState.messageOpen) {
				this.$messageMarking.css('left', startPos.x + offset.x);
				this.$messageMarking.css('top', startPos.y + offset.y);
				this.$messageMarking.width(endPos.x - startPos.x);
				// height is constant, set in css;
				this.$messageMarking.fadeIn(100);
			} else {
				this.$messageMarking.fadeOut(100);
			}

			if (this.persistentState.messageOpen) {
				this.$messagebox.css('left', startPos.x + offset.x);
				this.$messagebox.css('top', startPos.y + offset.y);
				this.$messagebox.find('.based-message').html(msg.html);
				this.$messagebox.fadeIn(100);
			} else {
				this.$messagebox.fadeOut(100);
			}
			
			if (msg.type === 'Error'){
				this.$marginError.css('top', startPos.y + offset.y);
				this.$marginError.fadeIn(100);
				this.$marginArrow.fadeOut(100);
				this.$textarea.addClass('based-error');
				this.$textarea.removeClass('based-stepping');
			} else {
				this.$marginArrow.css('top', startPos.y + offset.y);
				this.$marginArrow.fadeIn(100);
				this.$marginError.fadeOut(100);
				this.$textarea.addClass('based-stepping');
				this.$textarea.removeClass('based-error');
			}

			/*
			if (msg instanceof jsmm.msg.Line) {
				var message = msg.message;
				
				var lineMsg = $('#lineMsg-' + msg.line);
				if (lineMsg.length <= 0) {
					lineMsg = $('<div class="lineMsg"></div>');
					lineMsg.attr('id', 'lineMsg-' + msg.line);
					$('#margin').append(lineMsg);
					lineMsg.fadeIn(100);
					lineMsg.css('top', startPos.y + offset.y);
				} else {
					if (lineMsg.text().length > 0 && msg.append) {
						message = lineMsg.text() + ', ' + msg.message;
					}
				}
				lineMsg.text(message);
			}
			*/
		}
	},

	updateCode: function() {
		this.dynamicState.code = new based.Code(this.$textarea.val());
	},

	updateSize: function() {
		// NOTE: getPosition is not necessarily suitable for this
		this.$textarea.height(this.getPosition(this.$textarea.val()).y + 100);
		this.$textarea.width(this.getPosition(this.$textarea.val()).x + 100);
	},

	// TODO: use http://archive.plugins.jquery.com/project/fieldselection
	autoindent: function(e) {
		// 13 = enter, 221 = ] or }
		if (e.keyCode === 13 || e.keyCode === 221) {
			var code = this.dynamicState.code;
			var offset = this.$textarea[0].selectionStart;
			var pos = code.offsetToPos(offset);
			if (pos.line > 1) {
				var prevLine = code.getLine(pos.line-1);
				var curLine = code.getLine(pos.line);
				var spaces = prevLine.match(/^ */)[0].length;
				var spacesAlready = curLine.match(/^ */)[0].length;
				spaces += prevLine.match(/\{ *$/) !== null ? 2 : 0;
				spaces -= spacesAlready;
				spaces -= curLine.match(/^ *\}/) !== null ? 2 : 0;

				var startOffset, endOffset;
				if (spaces > 0) {
					startOffset = code.lineColumnToOffset(pos.line, 0);
					this.$textarea.val(code.insertAtOffset(startOffset, new Array(spaces+1).join(' ')));
					this.$textarea[0].selectionStart = offset + spaces;
					this.$textarea[0].selectionEnd = this.$textarea[0].selectionStart;
					this.updateCode();
				} else if (spaces < 0 && spacesAlready >= -spaces) {
					startOffset = code.lineColumnToOffset(pos.line, 0);
					endOffset = startOffset-spaces;
					this.$textarea.val(code.removeAtOffsetRange(startOffset, endOffset));
					this.$textarea[0].selectionStart = offset + spaces;
					this.$textarea[0].selectionEnd = this.$textarea[0].selectionStart;
					this.updateCode();
				}
			}
		}
	},

	keydown: function(e) {
		if (this.$textarea.val() !== this.dynamicState.code.getText()) {
			this.updateSize();

			this.$marginArrow.hide();
			this.$marginError.hide();
			this.$messagebox.hide();
			this.$messageMarking.hide();
		}
		// TODO: include offset vars and update UI elements
	},

	keyup: function(e) {
		if (this.$textarea.val() !== this.dynamicState.code.getText()) {
			this.updateSize(); // TODO: remove?
			this.updateCode();
			this.autoindent(e);
			this.runCallback('textChange');
		}
	},

	paste: function(e) {
		if (this.$textarea.val() !== this.dynamicState.code.getText()) {
			this.updateSize();
			this.updateCode();
			this.autoindent(e);
			this.runCallback('textChange');
		}
	},

	toggleMesssage: function() {
		this.persistentState.messageOpen = !this.persistentState.messageOpen;
		this.renderMessage();
	}
	
};

module.exports = based;

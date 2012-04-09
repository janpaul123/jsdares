/*jshint node:true jquery:true*/
"use strict";

var clayer = require('../clayer');

var based = {};

based.Code = function() { return this.init.apply(this, arguments); };
based.NumberEditable = function() { return this.init.apply(this, arguments); };
based.Editor = function() { return this.init.apply(this, arguments); };

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
	removeOffsetRange: function(offset1, offset2) {
		return this.text.substring(0, offset1) + this.text.substring(offset2);
	},
	replaceOffsetRange: function(offset1, offset2, text) {
		return this.text.substring(0, offset1) + text + this.text.substring(offset2);
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

based.NumberEditable.prototype = {
	init: function(node, editor) {
		this.editor = editor;

		this.line = node.startPos.line;
		this.column = node.startPos.column;
		this.column2 = node.endPos.column;
		this.text = this.editor.code.rangeToText(node.startPos, node.endPos);
		this.startPos = this.editor.getPosition(this.editor.code.lineColumnToPositionText(this.line, this.column));
		this.parseNumber();

		this.$marking = editor.addMarking(0,0,0,0);
		//this.$box = editor.addBox(startPos.x, startPos.y, content, width);
		this.touchable = new clayer.Touchable(this.$marking, this);
		this.updateMarking();
	},

	remove: function() {
		this.touchable.setTouchable(false);
		delete this.touchable;
		this.$marking.remove();
		delete this.$marking;
	},

	offsetColumn: function(column, amount) {
		if (this.column2 > column) {
			this.column2 += amount;
			if (this.column > column) {
				this.column += amount;
				this.startPos = this.editor.getPosition(this.editor.code.lineColumnToPositionText(this.line, this.column));
			}
			this.updateMarking();
		}
	},

	/// INTERNAL FUNCTIONS ///

	parseNumber: function() {
		var split = this.splitNumber(this.text);
		this.exponentLetter = split.exponentLetter || 'e';
		/*
		this.normalisedValue = parseFloat((split.sign || '') + (split.integer || '0') + '.' + (split.decimals || '0'));
		this.decimals = (split.decimals || '').length;
		this.exponent = parseInt(split.exponent || '0', 10);
		this.needsReparse = false;
		*/

		this.significant = ((split.integer || '') + (split.decimals || '')).replace(/^0*/, '').length;
		if (this.significant > 8) this.significant = 8;
		else if (this.significant < 1) this.significant = 1;
		this.value = parseFloat(this.text);
		this.invDelta = Math.pow(10, -(parseInt(split.exponent || '0', 10) - (split.decimals || '').length));

		if (this.value === 0) {
			this.decimals = (split.decimals || '').length;
		} else {
			this.decimals = (this.splitNumber(this.value.toPrecision(this.significant)).decimals || '').length;
		}

		console.log(this.significant, 'significant');
	},

	splitNumber: function(str) {
		var match = /([+\-]?)([0-9]+)(?:[.]([0-9]+))?(?:([eE])[+]?([\-]?[0-9]+))?/g.exec(str);
		return {
			sign: match[1],
			integer: match[2],
			decimals: match[3],
			exponentLetter: match[4],
			exponent: match[5]
		};
	},

	makeNumber: function(deltaOffset, realOffset) {
		var split = this.splitNumber((this.value + realOffset/this.invDelta).toPrecision(8));

		var newText = split.integer || '0';
		if (this.decimals > 0) {
			newText += '.' + (split.decimals || '0').substring(0, this.decimals);
		}
		if (split.exponent !== undefined) {
			newText += this.exponentLetter + split.exponent;
		}

		if (split.sign === '-' && parseFloat(newText) !== 0) {
			newText = '-' + newText;
		}

		return newText;

		// sigmoid between 0.4 and 1.0 for |realOffset| between ~0 and ~80
		/*
		var factor = 0.6/(1+Math.exp(2-Math.abs(realOffset)/15))+0.4;
		console.log(realOffset, deltaOffset);
		var newText = (this.normalisedValue + factor*deltaOffset*Math.pow(10, -this.decimals)).toPrecision(8);
		var split = this.splitNumber(newText);

		newText = split.integer || '0';

		if (split.exponent !== undefined) {
			split.decimals = split.decimals || '0';
			newText += '.' + split.decimals;
			this.needsReparse = true;
		} else if (this.decimals > 0) {
			split.decimals = (split.decimals || '0').substring(0, this.decimals);
			newText += '.' + split.decimals;
		} else {
			split.decimals = '';
		}

		if (split.decimals.length !== this.decimals) {
			this.needsReparse = true;
		}

		var exponent = this.exponent + parseInt(split.exponent || 0, 10);
		if (exponent !== 0) {
			newText += this.exponentLetter + exponent;
		}

		if (parseFloat(newText) !== 0) {
			newText = (split.sign || '') + newText;
		}

		return newText;
		*/
	},

	updateMarking: function() {
		var endPos = this.editor.getPosition(this.editor.code.lineColumnToPositionText(this.line, this.column2));
		this.editor.updateMarking(this.$marking, this.startPos.x, this.startPos.y, endPos.x - this.startPos.x, 0);
	},

	touchDown: function(touch) {
		this.offset = this.editor.code.lineColumnToOffset(this.line, this.column);
		this.parseNumber();
	},

	touchMove: function(touch) {
		var newText = this.makeNumber(touch.deltaTranslation.x, touch.translation.x);
		this.editor.setCode(this.editor.code.replaceOffsetRange(this.offset, this.offset+this.text.length, newText));

		if (newText.length !== this.text.length) {
			this.editor.offsetEditables(this.line, this.column, newText.length - this.text.length);
		}

		this.text = newText;
		if (this.needsReparse) {
			console.log('reparse!');
			this.parseNumber();
			touch.resetDeltaTranslation();
		}
	},

	touchUp: function(touch) {
		
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
		this.$messagebox = $('<div class="based-messagebox"><div class="arrow"></div><div class="based-message"></div></div>');
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
		this.code = new based.Code('');
		this.messageOpen = false;
		this.renderedError = false;

		this.editables = [];
		this.editablesByLine = {};
		this.editablesEnabled = false;

		this.clearDebugState();
	},

	clearDebugState: function() {
		this.debugState = {
			message: null
		};

		/*
		$('#margin .lineMsg').fadeOut(100, function() {
			$(this).remove();
		});
		*/
	},

	getCode: function() {
		return this.code;
	},

	setCode: function(code) {
		this.$textarea.val(code);
		this.updateCode();
		this.updateSize();
		this.clearDebugState();
		this.runCallback('textChange');
	},

	setMessage: function(message) {
		this.debugState.message = message;

		if (!this.renderedError && message.type === 'Error') {
			this.messageOpen = false;
		}
	},

	clearMessage: function() {
		this.debugState.message = null;
	},

	openMessage: function() {
		this.messageOpen = true;
	},

	setCallback: function(name, func) {
		this.callbacks[name] = func;
	},

	render: function() {
		this.renderMessage();
	},

	enableEditables: function() {
		this.editablesEnabled = true;
		this.refreshEditables();
	},

	disableEditables: function() {
		this.removeEditables();
		this.editablesEnabled = false;
	},

	addNumberEditable: function(node) {
		this.addEditable(new based.NumberEditable(node, this));
	},

	/// INTERNAL FUNCTIONS ///
	runCallback: function(name) {
		if (this.callbacks[name] !== undefined) {
			this.callbacks[name].apply(this, [].slice.call(arguments, 1));
		}
	},

	addEditable: function(editable) {
		if (this.editablesByLine[editable.line] === undefined) {
			this.editablesByLine[editable.line] = [];
		}
		this.editables.push(editable);
		this.editablesByLine[editable.line].push(editable);
	},


	removeEditables: function() {
		if (this.editablesEnabled) {
			for (var i=0; i<this.editables.length; i++) {
				this.editables[i].remove();
			}
			this.editables = [];
			this.editablesByLine = {};
		}
	},

	refreshEditables: function() {
		if (this.editablesEnabled) {
			this.removeEditables();
			this.runCallback('generateEditables');
		}
	},

	offsetEditables: function(line, column, amount) {
		if (this.editablesByLine[line] !== undefined) {
			for (var i=0; i<this.editablesByLine[line].length; i++) {
				this.editablesByLine[line][i].offsetColumn(column, amount);
			}
		}
	},

	addMarking: function(x, y, width, height) {
		var $marking = $('<div class="based-marking"></div>');
		this.updateMarking($marking, x, y, width, height);
		this.$div.append($marking);
		return $marking;
	},

	updateMarking: function($marking, x, y, width, height) {
		var offset = this.getTextAreaOffset();
		$marking.css('left', x + offset.x);
		$marking.css('top', y + offset.y);
		$marking.width(width);
		$marking.height(height);
	},

	addBox: function(x, y, html, markingWidth) {
		var $box = $('<div class="based-messagebox"><div class="arrow"></div><div class="based-message"></div></div>');
		this.$div.append($box);
		this.updateBox($box, x, y, html, markingWidth);
		$box.hide();
		return $box;
	},

	updateBox: function($box, x, y, html, markingWidth) {
		markingWidth = markingWidth || 0;
		var offset = this.getTextAreaOffset();
		var $content = $box.children('.based-message');

		$content.html(html);

		var visible = $box.is(":visible");
		$box.show();
		$box.css('left', x + offset.x - $box.outerWidth()/2 + markingWidth/2);
		$box.css('top', y + offset.y);
		if (!visible) $box.hide();

		return $box;
	},

	getPosition: function(text) {
		// add a space because of a bug when text contains only newlines
		text += ' ';
		this.$mirror.text(text);
		this.$mirror.text(text); // TODO: find out why this is here twice
		return {x: this.$mirror.outerWidth(), y: this.$mirror.outerHeight()};
	},

	getTextAreaOffset: function() {
		// the offset is weird since .position().top changes when scrolling
		return {
			x: (this.$textarea.position().left + this.$div.scrollLeft()),
			y: (this.$textarea.position().top + this.$div.scrollTop())
		};
	},
	
	renderMessage: function() {
		this.renderedError = false;

		if (this.debugState.message === null) {
			this.$messagebox.fadeOut(100);
			this.$messageMarking.fadeOut(100);
			this.$marginArrow.fadeOut(100);
			this.$marginError.fadeOut(100);
			this.$textarea.removeClass('based-stepping');
			this.$textarea.removeClass('based-error');
		} else {
			var msg = this.debugState.message;

			var startPos = this.getPosition(this.code.lineColumnToPositionText(msg.line, msg.column));
			var width = 0;
			if (msg.column2 > msg.column) {
				var endPos = this.getPosition(this.code.lineColumnToPositionText(msg.line, msg.column2));
				width = endPos.x - startPos.x;
			}

			var offset = this.getTextAreaOffset();

			if (width > 0 && this.messageOpen) {
				this.updateMarking(this.$messageMarking, startPos.x, startPos.y, width, 0);
				this.$messageMarking.fadeIn(100);
			} else {
				this.$messageMarking.fadeOut(100);
			}

			if (this.messageOpen) {
				this.updateBox(this.$messagebox, startPos.x, startPos.y, msg.html, width);
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
				this.renderedError = true;
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
		this.code = new based.Code(this.$textarea.val());
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
			var code = this.code;
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
					this.$textarea.val(code.removeOffsetRange(startOffset, endOffset));
					this.$textarea[0].selectionStart = offset + spaces;
					this.$textarea[0].selectionEnd = this.$textarea[0].selectionStart;
					this.updateCode();
				}
			}
		}
	},

	keydown: function(e) {
		if (this.$textarea.val() !== this.code.getText()) {
			this.updateSize();

			// necessary to update the code object, otherwise the
			// comparison at keyup() may fail when pressing space-backspace
			// simultaneously
			this.updateCode();

			this.$marginArrow.hide();
			this.$marginError.hide();
			this.$messagebox.hide();
			this.$messageMarking.hide();
			this.removeEditables();
		}
		// TODO: include offset vars and update UI elements
	},

	keyup: function(e) {
		if (this.$textarea.val() !== this.code.getText()) {
			this.updateSize(); // TODO: remove?
			this.updateCode();
			this.autoindent(e);
			this.runCallback('textChange');
			this.refreshEditables();
		}
	},

	paste: function(e) {
		if (this.$textarea.val() !== this.code.getText()) {
			this.updateSize();
			this.updateCode();
			this.autoindent(e);
			this.runCallback('textChange');
			this.refreshEditables();
		}
	},

	toggleMesssage: function() {
		this.messageOpen = !this.messageOpen;
		this.renderMessage();
	}
	
};

module.exports = based;

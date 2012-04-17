/*jshint node:true jquery:true*/
"use strict";

var clayer = require('../clayer');

module.exports = function(editor) {
	editor.Box = function() { return this.init.apply(this, arguments); };
	editor.Message = function() { return this.init.apply(this, arguments); };
	editor.Surface = function() { return this.init.apply(this, arguments); };
	
	editor.Box.prototype = {
		init: function($marking, surface) {
			this.$marking = $marking;
			this.surface = surface;
			this.$element = $('<div class="editor-box"></div>');
			this.surface.addElement(this.$element);
			this.$element.hide();
			this.$arrow = $('<div class="editor-box-arrow"></div>');
			this.$element.append(this.$arrow);
			this.$message = $('<div class="editor-box-message"></div>');
			this.$element.append(this.$message);
		},
		updatePosition: function() {
			//console.log(this.$marking.offset().left);
			//this.surface.setElementCenterPosition(this.$element, this.$marking.position().left+this.$marking.outerWidth()/2, this.$marking.position().top+this.$marking.outerHeight());
			var left = this.$marking.position().left+this.$marking.outerWidth()/2;
			var newLeft = Math.max(-8, left-this.$element.outerWidth()/2);
			this.$element.css('left', newLeft);
			this.$arrow.css('left', left-newLeft);
			this.$element.css('top', this.$marking.position().top+this.$marking.outerHeight());
		},
		html: function(html) {
			this.$message.html(html);
			this.updatePosition();
		},
		remove: function() {
			this.$element.remove();
		}
	};

	editor.Message.prototype = {
		init: function(type, surface) {
			this.surface = surface;
			this.$marginIcon = $('<div class="editor-margin-message-icon-' + type + '"><img src="img/margin-message-icon-' + type + '.png"/></div>');
			this.surface.addElementToMargin(this.$marginIcon);
			this.$marginIcon.hide();
			this.$marking = $('<div class="editor-marking"></div>');
			this.surface.addElement(this.$marking);
			this.$marking.hide();
			this.box = new editor.Box(this.$marking, this.surface);
			this.$marginIcon.on('click', $.proxy(this.toggleMesssage, this));
			this.$marking.on('click', $.proxy(this.toggleMesssage, this));
			this.box.$element.on('click', $.proxy(this.toggleMesssage, this));
			this.visible = false;
			this.messageOpen = false;
			this.message = null;
		},
		showAtLocation: function(msg) {
			this.$marginIcon.css('top', this.surface.lineToY(msg.line));
			this.$marginIcon.fadeIn(150);
			this.message = msg;
			this.visible = true;
			this.updateMessage();
		},
		openMessage: function() {
			this.messageOpen = true;
			this.updateMessage();
		},
		closeMessage: function() {
			this.messageOpen = false;
			this.updateMessage();
		},
		hide: function() {
			this.visible = false;
			this.$marginIcon.fadeOut(150);
			this.updateMessage();
		},
		/// INTERNAL FUNCTIONS ///
		toggleMesssage: function() {
			this.messageOpen = !this.messageOpen;
			this.updateMessage();
		},
		updateMessage: function() {
			if (this.visible && this.messageOpen && this.message !== null) {
				this.$marking.fadeIn(150);
				this.box.$element.fadeIn(150);
				this.surface.setElementLocationRange(this.$marking, this.message.line, this.message.column, this.message.line+1, this.message.column2);
				this.box.html(this.message.html);
			} else {
				this.$marking.fadeOut(150);
				this.box.$element.fadeOut(150);
			}
		}
	};

	editor.Surface.prototype = {
		init: function($div, delegate) {
			this.$div = $div;
			this.$div.addClass('editor');
			this.delegate = delegate;

			// setting up textarea
			this.$textarea = $('<textarea class="editor-code" autocorrect="off" autocapitalize="off" spellcheck="false" wrap="off"></textarea>');
			this.$div.append(this.$textarea);

			this.$textarea.on('keydown', $.proxy(this.keyDown, this));
			this.$textarea.on('keyup', $.proxy(this.keyUp, this));

			// setting up surface
			this.$surface = $('<div class="editor-surface"></div>');
			this.$div.append(this.$surface);

			// setting up margin
			this.$margin = $('<div class="editor-margin"></div>');
			this.$div.append(this.$margin);
			
			// setting up messages
			this.errorMessage = new editor.Message('error', this);
			this.stepMessage = new editor.Message('step', this);

			// highlights
			this.$highlightMarking = $('<div class="editor-marking editor-highlight"></div>');
			this.addElement(this.$highlightMarking);
			this.$highlightMarking.hide();

			this.initOffsets();

			this.text = '';
			this.userChangedText = false;
		},

		getText: function() {
			return this.text;
		},

		setText: function(newText) {
			this.lastSelectionStart = this.$textarea[0].selectionStart;
			this.lastSelectionEnd = this.$textarea[0].selectionEnd;
			this.$textarea.val(newText);
			this.text = newText;
			this.userChangedText = false;
			this.updateSize();
			this.$textarea[0].selectionStart = this.lastSelectionStart;
			this.$textarea[0].selectionEnd = this.lastSelectionStart;
		},

		columnToX: function(column) {
			return column*this.charWidth;
		},

		lineToY: function(line) {
			return (line-1)*this.lineHeight;
		},

		addElement: function($element) {
			this.$surface.append($element);
		},

		addElementToMargin: function($element) {
			this.$margin.append($element);
		},

		enableMouse: function() {
			this.$div.on('mousemove', $.proxy(this.mouseMove, this));
			this.$div.on('mouseleave', $.proxy(this.mouseLeave, this));
		},

		disableMouse: function() {
			this.$div.off('mousemove mouseleave');
		},

		showErrorMessage: function(message) {
			this.errorMessage.showAtLocation(message);
			this.$textarea.addClass('editor-error');
		},

		hideErrorMessage: function() {
			this.$textarea.removeClass('editor-error');
			this.errorMessage.closeMessage();
			this.errorMessage.hide();
		},

		openStepMessage: function() {
			this.stepMessage.openMessage();
		},

		showStepMessage: function(message) {
			this.$textarea.addClass('editor-step');
			this.stepMessage.showAtLocation(message);
		},

		hideStepMessage: function() {
			this.$textarea.removeClass('editor-step');
			this.stepMessage.hide();
		},

		enableHighlighting: function() {
			this.$textarea.addClass('editor-highlighting');
		},

		disableHighlighting: function() {
			this.$textarea.removeClass('editor-highlighting');
			this.hideHighlight();
		},

		showHighlight: function(line, column, line2, column2) {
			this.$highlightMarking.show();
			this.setElementLocationRange(this.$highlightMarking, line, column, line2, column2);
		},

		hideHighlight: function() {
			this.$highlightMarking.hide();
		},

		scrollToLine: function(line) {
			this.scrollToY(this.lineToY(line));
		},

		setElementLocation: function($element, line, column) {
			$element.css('left', this.columnToX(column));
			$element.css('top', this.lineToY(line));
		},

		setElementLocationRange: function($element, line, column, line2, column2) {
			var x = this.columnToX(column), y = this.lineToY(line);
			$element.css('left', x);
			$element.css('top', y);
			$element.width(this.columnToX(column2) - x);
			$element.height(this.lineToY(line2) - y);
		},

		setElementCenterPosition: function($element, x, y) {
			$element.css('left', x-$element.outerWidth()/2);
			$element.css('top', y);
		},

		setElementCenterLocation: function($element, line, column) {
			$element.css('left', this.columnToX(column)-$element.outerWidth()/2);
			$element.css('top', this.lineToY(line));
		},

		restoreCursor: function(from, offset) {
			if (this.lastSelectionStart !== null && this.lastSelectionEnd !== null) {
				if (this.lastSelectionStart >= from) this.$textarea[0].selectionStart = this.lastSelectionStart + offset;
				if (this.lastSelectionEnd >= from) this.$textarea[0].selectionEnd = this.lastSelectionEnd + offset;
			}
		},

		restoreCursorRange: function(offset1, offset2) {
			if (this.lastSelectionStart !== null && this.lastSelectionEnd !== null) {
				this.$textarea[0].selectionStart = this.lastSelectionStart + offset1;
				this.$textarea[0].selectionEnd = this.lastSelectionEnd + offset2;
			}
		},

		resetCursor: function() {
			this.lastSelectionStart = null;
			this.lastSelectionEnd = null;
		},

		/// INTERNAL FUNCTIONS ///
		initOffsets: function($div) {
			// setting up mirror
			this.$mirror = $('<div class="editor-mirror"></div>');
			var $mirrorContainer = $('<div class="editor-mirror-container"></div>');
			$mirrorContainer.append(this.$mirror);
			this.$div.append($mirrorContainer);

			this.$mirror.text('a');
			this.textOffset = {x: this.$mirror.outerWidth(), y: this.$mirror.outerHeight()};

			// this trick of measuring a long string especially helps Firefox get an accurate character width
			this.$mirror.text('a' + new Array(100+1).join('a'));
			this.charWidth = (this.$mirror.outerWidth() - this.textOffset.x)/100;

			this.$mirror.text('a\na');
			this.lineHeight = this.$mirror.outerHeight() - this.textOffset.y;
			
			// this works assuming there is no padding on the right or bottom
			this.textOffset.x -= this.charWidth;
			this.textOffset.y -= this.lineHeight;

			// the offset is weird since .position().top changes when scrolling
			var textAreaOffset = {
				x: (this.$textarea.position().left + this.$div.scrollLeft()),
				y: (this.$textarea.position().top + this.$div.scrollTop())
			};

			this.$surface.css('left', textAreaOffset.x + this.textOffset.x);
			this.$surface.css('top', textAreaOffset.y + this.textOffset.y);
			this.$margin.css('top', textAreaOffset.y + this.textOffset.y);
		},

		updateSize: function() {
			this.$mirror.text(this.text);
			this.$textarea.width(this.$mirror.outerWidth() + 130);
			this.$textarea.height(Math.max(this.$mirror.outerHeight() + 100, this.$div.height()));
			this.$surface.width(this.$mirror.outerWidth() + 130);
		},

		showElements: function() {
			this.$surface.show();
			this.$margin.show();
		},

		hideElements: function() {
			this.$surface.hide();
			this.$margin.hide();
		},

		pageXToColumn: function(x) {
			return Math.floor((x-this.$textarea.offset().left-this.textOffset.x)/this.charWidth);
		},

		pageYToLine: function(y) {
			return 1+Math.floor((y-this.$textarea.offset().top-this.textOffset.y)/this.lineHeight);
		},

		scrollToY: function(y) {
			y = Math.max(0, y - this.$div.height()/2);
			this.$div.stop(true).animate({scrollTop : y}, 150);
			//this.$div.scrollTop(y);
		},

		keyDown: function(event) {
			if (this.$textarea.val() !== this.text) {
				this.text = this.$textarea.val();
				this.updateSize();
				this.userChangedText = true;
			} else {
				if (this.delegate.tabIndent(event, this.$textarea[0].selectionStart, this.$textarea[0].selectionEnd)) {
					this.userChangedText = true;
				}
			}

			if (this.userChangedText) {
				this.hideElements();
			}
			// TODO: include offset vars and update UI elements
		},

		keyUp: function(event) {
			if (this.$textarea.val() !== this.text) {
				this.text = this.$textarea.val();
				this.delegate.autoIndent(event, this.$textarea[0].selectionStart);
				this.updateSize();
				this.userChangedText = true;
			}

			if (this.userChangedText) {
				this.userChangedText = false;
				this.showElements();
				this.delegate.userChangedText();
			}
		},

		mouseMove: function(event) {
			this.delegate.mouseMove(event, this.pageYToLine(event.pageY), this.pageXToColumn(event.pageX));
		},

		mouseLeave: function(event) {
			this.delegate.mouseLeave(event);
		}
	};
};



	


/*jshint node:true jquery:true*/
"use strict";

var clayer = require('../clayer');

module.exports = function(editor) {
	editor.editables = {};

	editor.editables.NumberEditable = function() { return this.init.apply(this, arguments); };

	editor.editables.NumberEditable.prototype = {
		init: function(node, surface, delegate, parseNumber, makeNumber) {
			this.surface = surface;
			this.delegate = delegate;
			this.parseNumber = parseNumber;
			this.makeNumber = makeNumber;

			this.line = node.lineLoc.line;
			this.column = node.lineLoc.column;
			this.column2 = node.lineLoc.column2;
			this.text = delegate.getEditablesText(node);
			this.valid = this.parseNumber(this.text);

			this.$marking = $('<div class="based-marking based-editable based-number-editable"></div>');
			this.surface.addElement(this.$marking);
			this.touchable = new clayer.Touchable(this.$marking, this);
			this.box = null;
			this.updateMarking();
		},

		remove: function() {
			this.touchable.setTouchable(false);
			this.$marking.remove();
			if (this.box !== null) {
				this.box.remove();
			}
		},

		offsetColumn: function(column, amount) {
			if (this.column2 > column) {
				this.column2 += amount;
				if (this.column > column) {
					this.column += amount;
				}
				this.updateMarking();
			}
		},

		isValid: function() {
			return this.valid;
		},

		/// INTERNAL FUNCTIONS ///

		updateMarking: function() {
			this.surface.setElementLocationRange(this.$marking, this.line, this.column, this.line+1, this.column2);
			if (this.box !== null) {
				this.box.updatePosition();
			}
		},

		showBox: function() {
			if (this.box === null) {
				this.box = new editor.Box(this.$marking, this.surface);
				this.box.html('&larr; drag &rarr;');
			}
			this.box.$element.fadeIn(150);
		},

		hideBox: function() {
			if (this.box !== null) {
				this.box.$element.fadeOut(100);
			}
		},

		touchDown: function(touch) {
			this.hideBox();
		},

		touchMove: function(touch) {
			var newText = this.makeNumber(touch.translation.x);
			//this.editor.setCode(this.editor.code.replaceOffsetRange(this.offset, this.offset+this.text.length, newText));
			this.delegate.editableReplaceCode(this.line, this.column, this.column2, newText);

			if (newText.length !== this.text.length) {
				//this.editor.offsetEditables(this.line, this.column, newText.length - this.text.length);
			}

			this.text = newText;
		},

		touchUp: function(touch) {
			this.valid = this.parseNumber(this.text);
			if (touch.wasTap) {
				this.showBox();
			}
		}
	};
};

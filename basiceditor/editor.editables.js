/*jshint node:true jquery:true*/
"use strict";

var clayer = require('../clayer');

module.exports = function(editor) {
	editor.editables = {};

	editor.editables.NumberEditable = function() { return this.build.apply(this, arguments); };

	var addCommonMethods = function(type, editable) {
		editable.build = function(node, surface, delegate, parseValue, makeValue) {
			this.surface = surface;
			this.delegate = delegate;
			this.parseValue = parseValue;
			this.makeValue = makeValue;

			this.line = node.lineLoc.line;
			this.column = node.lineLoc.column;
			this.column2 = node.lineLoc.column2;
			this.text = delegate.getEditablesText(node);
			this.valid = this.parseValue(this.text);

			this.$marking = $('<div class="editor-marking editor-editable editor-' + type + '-editable"></div>');
			this.surface.addElement(this.$marking);
			this.box = null;
			this.touchable = null;
			this.updateMarking();
			this.init();
		};

		editable.offsetColumn = function(column, amount) {
			if (this.column2 > column) {
				this.column2 += amount;
				if (this.column > column) {
					this.column += amount;
				}
				this.updateMarking();
			}
		};

		editable.remove = function() {
			this.$marking.remove();
			if (this.touchable !== null) {
				this.touchable.setTouchable(false);
			}
			if (this.box !== null) {
				this.box.remove();
			}
		};

		/// INTERNAL FUNCTIONS ///

		editable.updateMarking = function() {
			if (!this.valid) this.remove();
			this.surface.setElementLocationRange(this.$marking, this.line, this.column, this.line+1, this.column2);
			if (this.box !== null) {
				this.box.updatePosition();
			}
		};

		editable.updateValue = function() {
			this.delegate.editableReplaceCode(this.line, this.column, this.column2, this.text);
		};
	};

	editor.editables.CycleEditable.prototype = addCommonMethods('cycle', {
		init: function() {
			this.$marking.on('click', $.proxy(this.cycle, this));
		},
		cycle: function() {
			this.text = this.makeValue();
			this.updateValue();
			this.valid = this.parseValue(this.text);
		}
	});

	editor.editables.NumberEditable.prototype = addCommonMethods('number', {
		init: function() {
			this.box = null;
			this.touchable = new clayer.Touchable(this.$marking, this);
		},

		/// INTERNAL FUNCTIONS ///
		showBox: function() {
			if (this.box === null) {
				this.box = new editor.Box(this.$marking, this.surface);
				this.box.html('&larr; drag &rarr;');
				this.box.$element.on('click', $.proxy(this.hideBox, this));
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
			this.text = this.makeValue(touch.translation.x);
			this.updateValue();
		},

		touchUp: function(touch) {
			this.valid = this.parseValue(this.text);
			if (touch.wasTap) {
				this.showBox();
			}
		}
	});
};

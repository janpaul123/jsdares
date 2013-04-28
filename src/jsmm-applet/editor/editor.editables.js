/*jshint node:true jquery:true*/
"use strict";

var clayer = require('../clayer');

module.exports = function(editor) {
	editor.editables = {};

	editor.editables.NumberEditable = function() { return this.build.apply(this, arguments); };
	editor.editables.CycleEditable = function() { return this.build.apply(this, arguments); };
	editor.editables.ColorEditable = function() { return this.build.apply(this, arguments); };

	var addCommonMethods = function(type, editable) {
		editable.build = function(node, surface, delegate, parseValue, makeValue) {
			this.surface = surface;
			this.delegate = delegate;
			this.parseValue = parseValue;
			this.makeValue = makeValue;

			this.loc = {
				line: node.lineLoc.line,
				line2: node.lineLoc.line+1,
				column: node.lineLoc.column,
				column2: node.lineLoc.column2
			};

			this.text = delegate.getEditablesText(node);
			this.finalText = this.text;
			this.valid = this.parseValue(this.text);

			this.$marking = $('<div class="editor-marking editor-editable editor-' + type + '-editable"></div>');
			this.surface.addElement(this.$marking);
			this.init();

			this.updateMarking();
		};

		editable.offsetColumn = function(column, amount) {
			if (this.loc.column2 > column) {
				this.loc.column2 += amount;
				if (this.loc.column > column) {
					this.loc.column += amount;
				}
				this.updateMarking();
			}
		};

		editable.show = function() {
			this.$marking.addClass('editor-editable-show');
		};

		editable.hide = function() {
			this.$marking.removeClass('editor-editable-show');
		};

		/// INTERNAL FUNCTIONS ///
		editable.updateMarking = function() {
			if (!this.valid) this.remove();
			this.$marking.css(this.surface.makeElementLocationRange(this.loc));
		};

		editable.updateValue = function() {
			this.delegate.editableReplaceCode(this.loc.line, this.loc.column, this.loc.column2, this.text);
		};

		return editable;
	};

	editor.editables.CycleEditable.prototype = addCommonMethods('cycle', {
		init: function() {
			this.$marking.on('click', _(this.cycle).bind(this));
		},
		remove: function() {
			this.$marking.remove();
		},
		cycle: function() {
			this.text = this.makeValue();
			this.updateValue();
			this.valid = this.parseValue(this.text);
		}
	});

	editor.editables.NumberEditable.prototype = addCommonMethods('number', {
		init: function() {
			this.$body = $('body');
			this.hasTooltip = false;
			this.touchable = new clayer.Touchable(this.$marking, this);
		},

		remove: function() {
			this.hideTooltip();
			this.$marking.remove();
			this.touchable.setTouchable(false);
		},

		/// INTERNAL FUNCTIONS ///
		showTooltip: function() {
			if (!this.hasTooltip) {
				this.hasTooltip = true;
				this.$marking.tooltip({
					title: '&larr; drag &rarr;',
					placement: 'bottom'
				});
			}
			this.$marking.tooltip('show');
		},

		hideTooltip: function() {
			if (this.hasTooltip) {
				this.$marking.tooltip('hide');
			}
		},

		touchDown: function(touch) {
			this.$marking.addClass('active');
			this.$body.addClass('editor-number-editable-dragging');
			this.surface.getTextArea().addClass('editor-number-editable-dragging');
			this.hideTooltip();
		},

		touchMove: function(touch) {
			this.text = this.makeValue(touch.translation.x);
			this.updateValue();
		},

		touchUp: function(touch) {
			this.$marking.removeClass('active');
			this.$body.removeClass('editor-number-editable-dragging');
			this.surface.getTextArea().removeClass('editor-number-editable-dragging');
			this.valid = this.parseValue(this.text);
			if (touch.wasTap) {
				this.showTooltip();
			}
		}
	});

	editor.editables.ColorEditable.prototype = addCommonMethods('color', {
		init: function() {
			this.$colorPicker = $('<div class="editor-editable-colorpicker"></div>');
			this.box = new editor.Box();
			this.surface.addElementToTop(this.box.getElement());
			this.box.html(this.$colorPicker, this.surface.makeElementLocationRange(this.loc));
			this.$colorPicker.colorPicker({
				format: this.colorData.format,
				size: 200,
				colorChange: _(this.colorChange).bind(this)
			});
			this.$colorPicker.colorPicker('setColor', this.colorData.value);
			this.$marking.on('click', _(this.click).bind(this));
		},

		/// INTERNAL FUNCTIONS ///
		remove: function() {
			this.$marking.remove();
			this.box.remove();
		},

		colorChange: function(event, ui) {
			this.text = this.makeValue(ui.color);
			this.updateValue();
		},

		click: function(event) {
			this.valid = this.parseValue(this.text);
			if (this.box.$element.is(':visible')) {
				this.$marking.removeClass('active');
				this.box.$element.fadeOut(150);
			} else {
				this.$marking.addClass('active');
				this.box.$element.fadeIn(150);
				this.box.updatePosition(this.surface.makeElementLocationRange(this.loc));
			}
		}
	});
};

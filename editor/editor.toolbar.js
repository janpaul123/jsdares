/*jshint node:true jquery:true*/
"use strict";

var clayer = require('../clayer');

module.exports = function(editor) {
	editor.BubbleValue = function() { return this.init.apply(this, arguments); };
	editor.BubbleValue.prototype = {
		init: function($div, delegate) {
			this.$body = $('body');

			this.$stepBubble = $('<div class="editor-toolbar-step-bubble"><div class="editor-toolbar-step-bubble-arrow"></div></div>');
			this.$stepValue = $('<span class="editor-toolbar-step-value"></span>');
			this.$stepBubble.append(this.$stepValue);

			this.$stepTotal = $('<span class="editor-toolbar-step-total"></span>');
			this.$stepBubble.append(this.$stepTotal);
			$div.append(this.$stepBubble);
			this.$stepBubble.hide();

			this.hasTooltip = false;
			this.touchable = new clayer.Touchable(this.$stepValue, this);
			this.setEditing(false);
			this.delegate = delegate;
		},

		remove: function() {
			this.hideTooltip();
			this.touchable.setTouchable(false);
			this.$stepValue.remove();
			this.$stepTotal.remove();
			this.$stepBubble.remove();
		},

		setStepInfo: function(stepValue, stepTotal) {
			this.$stepBubble.fadeIn(150);
			this.value = stepValue;
			this.total = stepTotal;
			this.$stepValue.text(stepValue);
			this.$stepTotal.text('/' + stepTotal);
			this.$stepBubble.css('margin-left', -this.$stepBubble.outerWidth());
		},

		disable: function() {
			this.$stepBubble.fadeOut(150);
		},

		setEditing: function(editing) {
			this.editing = editing;
			if (this.editing) {
				this.$stepBubble.addClass('editor-toolbar-step-editing');
			} else {
				this.$stepBubble.removeClass('editor-toolbar-step-editing');
			}
			this.touchable.setTouchable(this.editing);
		},

		/// INTERNAL FUNCTIONS ///
		showTooltip: function() {
			if (!this.hasTooltip) {
				this.hasTooltip = true;
				this.$stepValue.tooltip({
					title: '&larr; drag &rarr;',
					placement: 'bottom'
				});
			}
			this.$stepValue.tooltip('show');
		},

		hideTooltip: function() {
			if (this.hasTooltip) {
				this.$stepValue.tooltip('hide');
			}
		},

		touchDown: function(touch) {
			this.$body.addClass('editor-number-editable-dragging');
			this.hideTooltip();
			this.dragValue = this.value;
		},

		touchMove: function(touch) {
			var offset = touch.translation.x;
			
			// for calculating the new number the function x^3/(x^2+200), which provides nice snapping to the original number and
			// lower sensitiveness near the original number
			var value = Math.round(this.dragValue + (offset*offset*offset)/((offset*offset+200)));
			value = Math.min(Math.max(value, 0), this.total);

			if (value !== this.value) {
				this.delegate.bubbleValueChanged(value);
			}
		},

		touchUp: function(touch) {
			this.$body.removeClass('editor-number-editable-dragging');
			if (touch.wasTap) {
				this.showTooltip();
			}
		}
	};

	editor.StepBar = function() { return this.init.apply(this, arguments); };
	editor.StepBar.prototype = {
		init: function($div, $bubbleDiv, isBaseRun) {
			this.bubbleValue = new editor.BubbleValue($bubbleDiv, this);
			this.runner = null;
			this.run = null;
			this.isBaseRun = isBaseRun;

			this.$stepBackward = $('<button class="btn btn-success editor-toolbar-step-backward"><i class="icon-arrow-left icon-white"></i></button>');
			this.$stepBackward.on('mousedown', $.proxy(this.stepBackwardDown, this));
			this.$stepBackward.on('mouseup', $.proxy(this.stepBackwardUp, this));
			$div.append(this.$stepBackward);

			this.$stepForward = $('<button class="btn btn-success editor-toolbar-step-forward"><i class="icon-arrow-right icon-white"></i> Step</button>');
			this.$stepForward.on('mousedown', $.proxy(this.stepForwardDown, this));
			this.$stepForward.on('mouseup', $.proxy(this.stepForwardUp, this));
			$div.append(this.$stepForward);

			this.$restart = $('<button class="btn btn-success editor-toolbar-restart"><i class="icon-repeat icon-white"></i></button>');
			this.$restart.click($.proxy(this.restart, this));
			$div.append(this.$restart);

			this.disable();
		},

		remove: function() {
			this.bubbleValue.remove();
			this.$stepBackward.remove();
			this.$stepForward.remove();
			this.$restart.remove();
		},

		disable: function() {
			this.canRun = false;
			this.$stepForward.addClass('disabled');
			this.$stepBackward.addClass('disabled');
			this.$restart.addClass('disabled');
			this.clearStepping();
		},

		update: function(runner, run) {
			this.runner = runner;
			this.run = run;
			this.canRun = true;

			if (this.run.isStepping()) {
				if (this.run.hasError()) {
					this.$stepForward.addClass('disabled');
				} else {
					this.$stepForward.removeClass('disabled');
				}
				this.$stepBackward.removeClass('disabled');
				this.$restart.removeClass('disabled');
				this.bubbleValue.setStepInfo(this.run.getStepValue(), this.run.getStepTotal());
			} else {
				this.$stepForward.removeClass('disabled');
				this.$stepBackward.addClass('disabled');
				this.$restart.addClass('disabled');
				this.clearStepping();
			}
			if (this.isBaseRun && this.runner.isInteractive()) {
				this.$restart.removeClass('disabled');
			}
		},

		bubbleValueChanged: function(value) { // callback
			if (this.canRun) {
				this.selectIfBaseRun();
				this.run.setStepValue(value);
			}
		},

		selectIfBaseRun: function() {
			if (this.isBaseRun) {
				this.runner.selectBaseRun();
			}
		},

		stepForwardDown: function() {
			if (this.canRun) {
				this.selectIfBaseRun();
				this.run.stepForward();
			}
			this.stepForwardDelay = this.stepForwardDelay >= 400 ? 350 : Math.max((this.stepForwardDelay || 500) - 20, 70);
			this.stepForwardTimeout = setTimeout($.proxy(this.stepForwardDown, this), this.stepForwardDelay);
		},

		stepForwardUp: function() {
			this.stepForwardDelay = undefined;
			clearTimeout(this.stepForwardTimeout);
			this.stepForwardTimeout = null;
		},

		stepBackwardDown: function() {
			if (this.canRun) {
				this.selectIfBaseRun();
				this.run.stepBackward();
			}
			this.stepBackwardDelay = this.stepBackwardDelay >= 400 ? 350 : Math.max((this.stepBackwardDelay || 500) - 20, 70);
			this.stepBackwardTimeout = setTimeout($.proxy(this.stepBackwardDown, this), this.stepBackwardDelay);
		},

		stepBackwardUp: function() {
			this.stepBackwardDelay = undefined;
			clearTimeout(this.stepBackwardTimeout);
			this.stepBackwardTimeout = null;
		},

		restart: function() {
			if (this.canRun) {
				this.selectIfBaseRun();
				this.run.restart();
			}
		},

		clearStepping: function() {
			if (this.stepForwardTimeout === null) {
				this.stepForwardUp();
			}
			if (this.stepBackwardTimeout === null) {
				this.stepBackwardUp();
			}
			this.bubbleValue.disable();
		}
	};

	editor.RunBar = function() { return this.init.apply(this, arguments); };
	editor.RunBar.prototype = {
		init: function($div) {
			this.runner = null;
			this.$div = $div;
			//this.stepBar = new editor.StepBar()

			this.$playPause = $('<button class="btn btn-inverse dropdown-toggle editor-toolbar-run-playpause"></button>');
			this.$playPause.on('click', $.proxy(this.playPause, this));
			this.$div.append(this.$playPause);

			this.$sliderContainer = $('<span class="btn btn-inverse editor-toolbar-run-slider-container"></span>');
			this.$slider = $('<input class="editor-toolbar-run-slider" type="range" min="0"></input>');
			this.$slider.on('change', $.proxy(this.sliderChange, this));
			this.$sliderContainer.append(this.$slider);
			this.$div.append(this.$sliderContainer);

			this.disable();
		},

		remove: function() {
			this.$playPause.remove();
		},

		disable: function() {
			this.canRun = false;
			this.$playPause.addClass('disabled');
			this.hideSlider();
		},

		update: function(runner) {
			this.canRun = true;
			this.runner = runner;

			this.$playPause.removeClass('disabled');
			if (this.runner.isInteractive()) {
				this.$div.removeClass('editor-toolbar-run-disabled');

				if (this.runner.isPaused()) {
					this.$playPause.html('<i class="icon-play icon-white"></i>');
					if (this.runner.hasRuns()) {
						this.$slider.attr('max', this.runner.getRunTotal()-1);
						this.$slider.val(this.runner.getRunValue());
						this.$slider.width(this.runner.getRunTotal()*20);
						this.$sliderContainer.removeClass('editor-toolbar-run-slider-container-disabled');
						this.$slider.css('margin-left', '');
					} else {
						this.hideSlider();
					}
				} else {
					this.$playPause.html('<i class="icon-pause icon-white"></i>');
					this.hideSlider();
				}
			} else {
				this.$div.addClass('editor-toolbar-run-disabled');
				this.hideSlider();
			}
		},

		hideSlider: function() {
			this.$sliderContainer.addClass('editor-toolbar-run-slider-container-disabled');
			this.$slider.css('margin-left', -this.$slider.width()-20);
		},

		playPause: function() {
			if (this.runner.isInteractive()) {
				if (this.runner.isPaused()) {
					this.runner.play();
				} else {
					this.runner.pause();
				}
			}
		},

		sliderChange: function() {
			if (this.runner.hasRuns() && this.runner.isPaused()) {
				this.runner.setRunValue(parseInt(this.$slider.val(), 10));
			}
		}
	};

	editor.Toolbar = function() { return this.init.apply(this, arguments); };
	editor.Toolbar.prototype = {
		init: function($div, ed) {
			this.$div = $div;
			this.editor = ed;

			this.$div.addClass('btn-toolbar editor-toolbar');
			
			var $stepBar = $('<div class="btn-group editor-toolbar-step-bar"></div>');
			this.baseStepBar = new editor.StepBar($stepBar, this.$div, true);
			this.$div.append($stepBar);

			var isMac = navigator.platform.indexOf("Mac") >= 0;
			var $editHighlightGroup = $('<div class="btn-group editor-toolbar-highlight-group"></div>');
			this.$highlight = $('<button class="btn btn-inverse editor-toolbar-highlight"><i class="icon-screenshot icon-white"></i></button>');
			this.$highlight.tooltip({title: '<strong>ctrl</strong>' + (isMac ? ' or <strong>cmd</strong> (&#8984;)' : ''), placement: 'bottom'});
			this.$highlight.click($.proxy(this.highlight, this));
			$editHighlightGroup.append(this.$highlight);

			this.$edit = $('<button class="btn btn-inverse editor-toolbar-edit"><i class="icon-edit icon-white"></i></button>');
			this.$edit.click($.proxy(this.edit, this));
			this.$edit.tooltip({title: '<strong>alt</strong>' + (isMac ? ' (&#8997;)' : ''), placement: 'bottom'});
			$editHighlightGroup.append(this.$edit);
			this.$div.append($editHighlightGroup);

			var $runBar = $('<div class="btn-group editor-toolbar-run-bar"></div>');
			this.runBar = new editor.RunBar($runBar, this.$div);
			this.$div.append($runBar);

			this.$checkKeys = $.proxy(this.checkKeys, this);
			this.$keyDown = $.proxy(this.keyDown, this);
			this.$keyUp = $.proxy(this.keyUp, this);
			$(document).on('keydown', this.$keyDown);
			$(document).on('keyup', this.$keyUp);

			this.highlightingKey = false;
			this.editablesKey = false;
		},

		remove: function() {
			this.bubbleValue.remove();
			this.$stepBackward.remove();
			this.$stepForward.remove();
			this.$restart.remove();
			this.$highlight.remove();
			this.$edit.remove();
			$(document).off('mousemove', this.$checkKeys);
			$(document).off('keydown', this.$keyDown);
			$(document).off('keyup', this.$keyUp);
			this.$div.html('');
			this.$div.removeClass('btn-toolbar editor-toolbar');
		},

		editablesEnabled: function() {
			this.$edit.addClass('active');
		},

		editablesDisabled: function() {
			this.$edit.removeClass('active');
			this.editablesKey = false;
			this.refreshCheckKeys();
		},

		highlightingEnabled: function() {
			this.$highlight.addClass('active');
		},

		highLightingDisabled: function() {
			this.$highlight.removeClass('active');
			this.highlightingKey = false;
			this.refreshCheckKeys();
		},

		update: function(runner) {
			this.$highlight.removeClass('disabled');
			this.$edit.removeClass('disabled');
			this.baseStepBar.update(runner, runner.getBaseRun());
			this.runBar.update(runner);
		},

		disable: function() {
			this.baseStepBar.disable();
			this.runBar.disable();
			this.$highlight.addClass('disabled');
			this.$edit.addClass('disabled');
		},

		/// INTERNAL FUNCTIONS ///
		refreshCheckKeys: function() {
			if (this.highlightingKey || this.editablesKey) {
				$(document).on('mousemove', this.$checkKeys);
			} else {
				$(document).off('mousemove', this.$checkKeys);
			}
		},

		checkKeys: function(event) {
			if (this.highlightingKey && !(event.ctrlKey || event.metaKey)) {
				this.editor.disableHighlighting();
			}
			if (this.editablesKey && !event.altKey) {
				this.bubbleValue.setEditing(false);
				this.editor.disableEditables();
			}
		},

		keyDown: function(event) {
			// 17 == CTRL, 18 == ALT, (17, 91, 93, 224) == COMMAND
			if ([17, 91, 93, 224].indexOf(event.keyCode) >= 0) {
				this.editor.enableHighlighting();
				this.highlightingKey = true;
				this.refreshCheckKeys();
			} else if (event.keyCode === 18) {
				this.bubbleValue.setEditing(true);
				this.editor.enableEditables();
				this.editablesKey = true;
				this.refreshCheckKeys();
			}
		},

		keyUp: function(event) {
			// 17 == CTRL, 18 == ALT, (17, 91, 93, 224) == COMMAND
			if ([17, 91, 93, 224].indexOf(event.keyCode) >= 0) {
				this.editor.disableHighlighting();
			} else if (event.keyCode === 18) {
				this.bubbleValue.setEditing(false);
				this.editor.disableEditables();
			}
		},

		highlight: function(event) {
			if (this.$highlight.hasClass('active')) this.editor.disableHighlighting();
			else this.editor.enableHighlighting();
		},

		edit: function(event) {
			if (this.$edit.hasClass('active')) {
				this.bubbleValue.setEditing(false);
				this.editor.disableEditables();
			} else {
				this.bubbleValue.setEditing(true);
				this.editor.enableEditables();
			}
		}
	};
};

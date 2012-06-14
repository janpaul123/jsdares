/*jshint node:true jquery:true*/
"use strict";

var clayer = require('../clayer');

module.exports = function(editor) {
	editor.BubbleValue = function() { return this.init.apply(this, arguments); };
	editor.BubbleValue.prototype = {
		init: function($div, delegate) {
			this.delegate = delegate;
			this.$body = $('body');

			this.$stepBubble = $('<div class="editor-toolbar-step-bubble"><div class="editor-toolbar-step-bubble-arrow"></div></div>');
			this.$stepNum = $('<span class="editor-toolbar-step-value"></span>');
			this.$stepBubble.append(this.$stepNum);

			this.$stepTotal = $('<span class="editor-toolbar-step-total"></span>');
			this.$stepBubble.append(this.$stepTotal);
			$div.append(this.$stepBubble);
			this.$stepBubble.hide();

			this.hasTooltip = false;
			this.touchable = new clayer.Touchable(this.$stepNum, this);
			this.setEditing(false);
			this.enabled = false;
		},

		remove: function() {
			this.hideTooltip();
			this.touchable.setTouchable(false);
			this.$stepNum.remove();
			this.$stepTotal.remove();
			this.$stepBubble.remove();
		},

		setStepInfo: function(stepNum, stepTotal) {
			if (!this.enabled) {
				this.enabled = true;
				this.$stepBubble.fadeIn(150);
			}
			this.value = Math.min(stepNum, stepTotal);
			this.total = stepTotal;
			this.$stepNum.text(this.value);
			this.$stepTotal.text('/' + this.total);
			this.$stepBubble.css('margin-left', -this.$stepBubble.outerWidth());
		},

		disable: function() {
			if (this.enabled) {
				this.enabled = false;
				this.$stepBubble.fadeOut(150);
			}
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
				this.$stepNum.tooltip({
					title: '&larr; drag &rarr;',
					placement: 'bottom'
				});
			}
			this.$stepNum.tooltip('show');
		},

		hideTooltip: function() {
			if (this.hasTooltip) {
				this.$stepNum.tooltip('hide');
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
		init: function($div, $bubbleDiv, isBaseEvent) {
			this.bubbleValue = new editor.BubbleValue($bubbleDiv, this);
			this.runner = null;
			this.isBaseEvent = isBaseEvent;

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
			this.clearStepping();
			this.bubbleValue.remove();
			this.$stepBackward.remove();
			this.$stepForward.remove();
			this.$restart.remove();
		},

		setEditing: function(editing) {
			this.bubbleValue.setEditing(editing);
		},

		disable: function() {
			this.canRun = false;
			this.$stepForward.addClass('disabled');
			this.$stepBackward.addClass('disabled');
			this.$restart.addClass('disabled');
			this.clearStepping();
		},

		update: function(runner) {
			this.runner = runner;
			this.canRun = true;

			if (this.runner.isStepping() &&
					((this.runner.isBaseEventSelected() && !this.runner.isPaused()) || !this.isBaseEvent)) {
				if (this.runner.hasError()) {
					this.$stepForward.addClass('disabled');
				} else {
					this.$stepForward.removeClass('disabled');
				}
				this.$stepBackward.removeClass('disabled');
				this.$restart.removeClass('disabled');
				this.bubbleValue.setStepInfo(this.runner.getStepNum(), this.runner.getStepTotal());
			} else {
				this.$stepForward.removeClass('disabled');
				this.$stepBackward.addClass('disabled');
				this.$restart.addClass('disabled');
				this.clearStepping();
			}
			if (this.isBaseEvent && this.runner.isInteractive()) {
				this.$restart.removeClass('disabled');
			}
		},

		bubbleValueChanged: function(value) { // callback
			if (this.canRun) {
				this.selectIfBaseEvent();
				this.runner.setStepNum(value);
			}
		},

		selectIfBaseEvent: function() {
			if (this.isBaseEvent && (!this.runner.isBaseEventSelected() || this.runner.isPaused())) {
				this.runner.selectBaseEvent();
			}
		},

		stepForwardDown: function() {
			if (this.canRun) {
				this.selectIfBaseEvent();

				this.stepForwardDelay = this.stepForwardDelay >= 400 ? 350 : Math.max((this.stepForwardDelay || 500) - 20, 70);
				this.stepForwardTimeout = setTimeout($.proxy(this.stepForwardDown, this), this.stepForwardDelay);
				this.runner.stepForward();
			}
		},

		stepForwardUp: function() {
			this.stepForwardDelay = undefined;
			clearTimeout(this.stepForwardTimeout);
			this.stepForwardTimeout = null;
		},

		stepBackwardDown: function() {
			if (this.canRun) {
				this.selectIfBaseEvent();

				this.stepBackwardDelay = this.stepBackwardDelay >= 400 ? 350 : Math.max((this.stepBackwardDelay || 500) - 20, 70);
				this.stepBackwardTimeout = setTimeout($.proxy(this.stepBackwardDown, this), this.stepBackwardDelay);
				this.runner.stepBackward();
			}
		},

		stepBackwardUp: function() {
			this.stepBackwardDelay = undefined;
			clearTimeout(this.stepBackwardTimeout);
			this.stepBackwardTimeout = null;
		},

		restart: function() {
			if (this.canRun) {
				this.selectIfBaseEvent();
				this.runner.restart();
			}
		},

		clearStepping: function() {
			if (this.stepForwardTimeout !== null) {
				this.stepForwardUp();
			}
			if (this.stepBackwardTimeout !== null) {
				this.stepBackwardUp();
			}
			this.bubbleValue.disable();
		}
	};

	editor.PlayPauseAnimation = function() { return this.init.apply(this, arguments); };
	editor.PlayPauseAnimation.prototype = {
		init: function($playPause) {
			this.$playPause = $playPause;
			this.$playPauseAnimationBlock = $('<div class="editor-toolbar-run-playpause-animation-block"></div>');
			this.$playPauseAnimationContainer = $('<div class="editor-toolbar-run-playpause-animation-container"></div>');
			this.$playPauseAnimationContainer.append(this.$playPauseAnimationBlock);
			this.$playPause.append(this.$playPauseAnimationContainer);

			this.$playPauseIcon = $('<i class="icon-play icon-white"></i>');
			this.$playPause.append(this.$playPauseIcon);

			//this.max = this.$playPauseAnimationContainer.width();
			this.start = -40;
			this.max = 34;
			this.playing = false;
			this.animating = false;
			this.position = 0;
			this.speed = 0.01;
			this.restartTimeout = null;
		},

		animate: function(animate) {
			if (animate !== this.animating) {
				this.animating = animate;
				if (this.animating) {
					this.startAnimation();
				} else {
					this.stopTimeout();
					this.setFraction(((new Date()).getTime()-this.lastAnimationTime)*this.speed/this.max);
				}
			}
		},

		play: function() {
			if (!this.playing) {
				this.playing = true;
				this.$playPauseIcon.addClass('icon-pause');
				this.$playPauseIcon.removeClass('icon-play');
			}
		},

		pause: function() {
			if (this.playing) {
				this.playing = false;
				this.setFraction(1);
				this.$playPauseIcon.addClass('icon-play');
				this.$playPauseIcon.removeClass('icon-pause');
			}
		},

		setFraction: function(fraction) {
			if (!this.animating) {
				this.position = fraction*this.max;
				clayer.setCss3(this.$playPauseAnimationBlock, 'transition', '');
				this.$playPauseAnimationBlock.css('left', this.start+this.position);
			}
		},

		/// INTERNAL FUNCTIONS ///
		startAnimation: function() {
			this.stopTimeout();
			var time = (this.max-this.position)/this.speed;
			clayer.setCss3(this.$playPauseAnimationBlock, 'transition', 'left ' + time + 'ms linear');
			this.$playPauseAnimationBlock.css('left', this.start+this.max);
			this.restartTimeout = setTimeout($.proxy(this.restartAnimation, this), time);
			this.lastAnimationTime = (new Date()).getTime();
		},

		restartAnimation: function() {
			this.stopTimeout();
			clayer.setCss3(this.$playPauseAnimationBlock, 'transition', '');
			this.$playPauseAnimationBlock.css('left', this.start);
			this.position = 0;
			this.lastAnimationTime = (new Date()).getTime();
			this.restartTimeout = setTimeout($.proxy(this.startAnimation, this), this.start+this.max);
		},

		stopTimeout: function() {
			if (this.restartTimeout !== null) {
				clearTimeout(this.restartTimeout);
				this.restartTimeout = null;
			}
		}
	};

	editor.RunBar = function() { return this.init.apply(this, arguments); };
	editor.RunBar.prototype = {
		init: function($div, ed, maxHistory) {
			this.runner = null;
			this.$div = $div;
			this.editor = ed;
			this.maxHistory = maxHistory;
			//this.stepBar = new editor.StepBar()

			this.$playPause = $('<button class="btn btn-primary dropdown-toggle editor-toolbar-run-playpause"></button>');
			this.$playPause.on('click', $.proxy(this.playPause, this));
			this.$div.append(this.$playPause);

			this.playPauseAnimation = new editor.PlayPauseAnimation(this.$playPause);

			this.$sliderContainer = $('<div class="editor-toolbar-run-slider-container"></div>');
			this.$sliderButton = $('<div class="btn btn-primary editor-toolbar-run-slider-button"></div>');
			this.$slider = $('<div class="editor-toolbar-run-slider"></div>');
			this.slider = new clayer.Slider(this.$slider, this, 140/this.maxHistory);
			this.$sliderButton.append(this.$slider);
			this.$sliderContainer.append(this.$sliderButton);
			this.$div.append(this.$sliderContainer);

			this.$stepBarContainer = $('<div class="btn-group editor-toolbar-run-step-bar-container"></div>');
			this.$stepBarContainer.append('<div class="editor-toolbar-run-step-bar-arrow"></div>');
			this.$div.append(this.$stepBarContainer);


			this.$stepBarIcon = $('<i></i>');
			this.$stepBarContainer.append(this.$stepBarIcon);

			var $stepBar = $('<div class="btn-group editor-toolbar-run-step-bar"></div>');
			this.stepBar = new editor.StepBar($stepBar, this.$stepBarContainer, false);
			this.$stepBarContainer.append($stepBar);

			this.$stepBarErrorIcon = $('<img class="editor-toolbar-run-step-bar-error-icon" src="img/margin-message-icon-error.png"/>');
			this.$stepBarErrorIcon.on('click', $.proxy(this.errorIconClick, this));
			this.$stepBarContainer.append(this.$stepBarErrorIcon);

			this.sliderEnabled = true;
			this.$stepBarContainer.hide(); // hacky fix
			this.disable();
		},

		remove: function() {
			this.slider.remove();
			this.stepBar.remove();
			this.$stepBarErrorIcon.remove();
			this.$stepBarContainer.remove();
			this.$playPause.remove();
			this.$slider.remove();
			this.$sliderContainer.remove();
		},

		disable: function() {
			this.canRun = false;
			this.playPauseAnimation.animate(false);
			this.$playPause.addClass('disabled');
			this.hideSlider();
		},

		setEditing: function(editing) {
			this.stepBar.setEditing(editing);
		},

		update: function(runner) {
			this.canRun = true;
			this.runner = runner;

			this.playPauseAnimation.animate(runner.canReceiveEvents());
			this.$playPause.removeClass('disabled');
			if (this.runner.isInteractive()) {
				this.$div.removeClass('editor-toolbar-run-disabled');

				if (this.runner.isPaused()) {
					this.playPauseAnimation.pause();
					if (this.runner.hasEvents()) {
						if (!this.sliderEnabled) {
							this.sliderEnabled = true;
							this.$stepBarContainer.fadeIn(150);
							this.$div.removeClass('editor-toolbar-run-slider-disabled');
							this.$div.addClass('editor-toolbar-run-slider-enabled');
							this.$slider.width(this.runner.getEventTotal()*140/this.maxHistory);
							this.slider.setValue(this.runner.getEventNum());
							this.$sliderButton.css('margin-left', '');
						}
						this.setSliderErrors(runner);
						this.playPauseAnimation.setFraction(this.runner.getEventNum()/(this.runner.getEventTotal()-1));
						this.stepBar.update(runner);
						this.$stepBarContainer.css('left', this.$sliderContainer.position().left + this.runner.getEventNum()*140/this.maxHistory);
						this.$stepBarIcon.removeClass();
						this.$stepBarIcon.addClass('editor-toolbar-run-step-bar-icon icon-white icon-' + {
							base: 'stop',
							keyboard: 'keyboard',
							mouse: 'mouse',
							interval: 'time'
						}[this.runner.getStepType()]);
						if (this.runner.hasError()) {
							this.$stepBarContainer.addClass('editor-toolbar-run-step-bar-error');
						} else {
							this.$stepBarContainer.removeClass('editor-toolbar-run-step-bar-error');
						}
					} else {
						this.hideSlider();
					}
				} else {
					this.playPauseAnimation.play();
					this.hideSlider();
				}
			} else {
				this.$div.addClass('editor-toolbar-run-disabled');
				this.hideSlider();
			}
		},

		setSliderErrors: function(runner) {
			var errorEventNums = runner.getErrorEventNums();
			var segments = [];
			for (var i=0; i<errorEventNums.length;) {
				var start = i, end = i++;
				while(i<errorEventNums.length && errorEventNums[i] === errorEventNums[i-1]+1) {
					end = i++;
				}
				segments.push({start: errorEventNums[start], end: errorEventNums[end], color: 'rgba(255, 0, 0, 0.7)'});
			}
			this.slider.setSegments(segments);
		},

		hideSlider: function() {
			if (this.sliderEnabled) {
				this.sliderEnabled = false;
				this.$div.addClass('editor-toolbar-run-slider-disabled');
				this.$div.removeClass('editor-toolbar-run-slider-enabled');
				this.$sliderButton.css('margin-left', -this.$slider.width()-20);
				this.$stepBarContainer.fadeOut(150);
			}
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

		sliderChanged: function(value) {
			if (this.runner.isPaused()) {
				this.runner.setEventNum(value);
			}
		},

		errorIconClick: function() {
			this.editor.scrollToError();
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
			this.runBar = new editor.RunBar($runBar, this.editor, 50);
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
			this.baseStepBar.remove();
			this.runBar.remove();
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
			if (runner.isStatic()) {
				this.$highlight.removeClass('disabled');
			} else {
				this.$highlight.addClass('disabled');
			}
			this.$edit.removeClass('disabled');
			this.baseStepBar.update(runner);
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
				this.setEditing(false);
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
				this.setEditing(true);
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
				this.setEditing(false);
				this.editor.disableEditables();
			}
		},

		highlight: function(event) {
			if (this.$highlight.hasClass('active')) this.editor.disableHighlighting();
			else this.editor.enableHighlighting();
		},

		edit: function(event) {
			if (this.$edit.hasClass('active')) {
				this.setEditing(false);
				this.editor.disableEditables();
			} else {
				this.setEditing(true);
				this.editor.enableEditables();
			}
		},

		setEditing: function(editing) {
			this.baseStepBar.setEditing(editing);
			this.runBar.setEditing(editing);
		}
	};
};

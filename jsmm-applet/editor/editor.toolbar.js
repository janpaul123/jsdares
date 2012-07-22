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
			value = Math.min(Math.max(value, 0), this.total-1);

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

			this.stepBackwardDown = this.stepBackwardDown.bind(this);
			this.stepBackwardUp = this.stepBackwardUp.bind(this);
			this.stepForwardDown = this.stepForwardDown.bind(this);
			this.stepForwardUp = this.stepForwardUp.bind(this);
			this.close = this.close.bind(this);

			this.$stepBackward = $('<button class="btn btn-success editor-toolbar-step-backward"><i class="icon-arrow-left icon-white"></i></button>');
			this.$stepBackward.on('mousedown', this.stepBackwardDown);
			this.$stepBackward.on('mouseup', this.stepBackwardUp);
			$div.append(this.$stepBackward);

			this.$stepForward = $('<button class="btn btn-success editor-toolbar-step-forward"><i class="icon-arrow-right icon-white"></i> Step</button>');
			this.$stepForward.on('mousedown', this.stepForwardDown);
			this.$stepForward.on('mouseup', this.stepForwardUp);
			$div.append(this.$stepForward);

			this.$close = $('<button class="btn btn-success editor-toolbar-close"><i class="icon-remove icon-white"></i></button>');
			this.$close.click(this.close);
			$div.append(this.$close);

			this.disable();
		},

		remove: function() {
			this.clearTimeouts();
			this.bubbleValue.remove();
			this.$stepBackward.remove();
			this.$stepForward.remove();
			this.$close.remove();
		},

		setEditing: function(editing) {
			this.bubbleValue.setEditing(editing);
		},

		disable: function() {
			this.clearTimeouts();
			this.canRun = false;
			this.$stepForward.addClass('disabled');
			this.$stepBackward.addClass('disabled');
			this.$close.addClass('disabled');
			this.bubbleValue.disable();
		},

		update: function(runner) {
			this.runner = runner;
			this.canRun = true;

			if (this.runner.isStepping()) {
				this.$stepForward.removeClass('disabled');
				this.$stepBackward.removeClass('disabled');
				this.$close.removeClass('disabled');
				this.bubbleValue.setStepInfo(this.runner.getStepNum(), this.runner.getStepTotal());
			} else {
				if (this.runner.canStep()) {
					this.$stepForward.removeClass('disabled');
				} else {
					this.$stepForward.addClass('disabled');
				}
				this.$stepBackward.addClass('disabled');
				this.$close.addClass('disabled');
				this.clearTimeouts();
				this.bubbleValue.disable();
			}
		},

		bubbleValueChanged: function(value) { // callback
			if (this.canRun) {
				this.runner.setStepNum(value);
			}
		},

		stepForwardDown: function() {
			this.clearTimeouts();
			if (this.canRun) {
				this.stepForwardDelay = this.stepForwardDelay >= 400 ? 350 : Math.max((this.stepForwardDelay || 500) - 20, 70);
				this.stepForwardTimeout = setTimeout(this.stepForwardDown, this.stepForwardDelay);
				this.runner.stepForward();
			}
		},

		stepForwardUp: function() {
			this.clearTimeouts();
			this.stepForwardDelay = undefined;
		},

		stepBackwardDown: function() {
			this.clearTimeouts();
			if (this.canRun) {
				this.stepBackwardDelay = this.stepBackwardDelay >= 400 ? 350 : Math.max((this.stepBackwardDelay || 500) - 20, 70);
				this.stepBackwardTimeout = setTimeout(this.stepBackwardDown, this.stepBackwardDelay);
				this.runner.stepBackward();
			}
		},

		stepBackwardUp: function() {
			this.clearTimeouts();
			this.stepBackwardDelay = undefined;
		},

		close: function() {
			this.clearTimeouts();
			if (this.canRun) {
				this.runner.restart();
			}
		},

		clearTimeouts: function() {
			if (this.stepForwardTimeout !== null) {
				clearTimeout(this.stepForwardTimeout);
			}
			if (this.stepBackwardTimeout !== null) {
				clearTimeout(this.stepBackwardTimeout);
			}
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
			this.max = 30;
			this.playing = false;
			this.animating = false;
			this.position = 0;
			this.speed = 0.01;
			this.restartTimeout = null;

			this.startAnimation = this.startAnimation.bind(this);
			this.restartAnimation = this.restartAnimation.bind(this);
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
			this.stopTimeout();
			this.position = fraction*this.max;
			clayer.setCss3(this.$playPauseAnimationBlock, 'transition', 'none');
			this.$playPauseAnimationBlock.css('width', this.position);
			if (this.animating) {
				this.restartTimeout = setTimeout(this.startAnimation, 0);
			}
		},

		/// INTERNAL FUNCTIONS ///
		startAnimation: function() {
			this.stopTimeout();
			var time = (this.max-this.position)/this.speed;
			clayer.setCss3(this.$playPauseAnimationBlock, 'transition', 'width ' + time + 'ms linear');
			this.$playPauseAnimationBlock.css('width', this.max);
			this.restartTimeout = setTimeout(this.restartAnimation, time);
			this.lastAnimationTime = (new Date()).getTime();
		},

		restartAnimation: function() {
			this.stopTimeout();
			clayer.setCss3(this.$playPauseAnimationBlock, 'transition', '');
			this.$playPauseAnimationBlock.css('width', 0);
			this.position = 0;
			this.lastAnimationTime = (new Date()).getTime();
			this.restartTimeout = setTimeout(this.startAnimation, this.start+this.max);
		},

		stopTimeout: function() {
			if (this.restartTimeout !== null) {
				clearTimeout(this.restartTimeout);
				this.restartTimeout = null;
			}
		}
	};

	var eventWidth = 6;
	editor.RunBar = function() { return this.init.apply(this, arguments); };
	editor.RunBar.prototype = {
		init: function($div, ed) {
			this.runner = null;
			this.$div = $div;
			this.editor = ed;

			this.$div.on('mouseenter', this.mouseEnter.bind(this));
			this.$div.on('mouseleave', this.mouseLeave.bind(this));

			this.$reload = $('<button class="btn btn-primary editor-toolbar-reload"><i class="icon-repeat icon-white"></i></button>');
			this.$reload.on('click', this.reload.bind(this));
			this.$div.append(this.$reload);

			this.$playPause = $('<button class="btn btn-primary dropdown-toggle editor-toolbar-run-playpause"></button>');
			this.$playPause.tooltip({title: 'play/pause (<strong>esc</strong>)', placement: 'bottom'});
			this.$playPause.on('click', this.playPause.bind(this));
			this.$div.append(this.$playPause);

			this.playPauseAnimation = new editor.PlayPauseAnimation(this.$playPause);

			this.$sliderContainer = $('<div class="editor-toolbar-run-slider-container"></div>');
			this.$sliderButton = $('<div class="btn btn-primary editor-toolbar-run-slider-button"></div>');
			this.$slider = $('<div class="editor-toolbar-run-slider"></div>');
			this.slider = new clayer.Slider(this.$slider, this, eventWidth);
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

			this.$stepBarErrorIcon = $('<div class="editor-toolbar-run-step-bar-error-icon"/>');
			this.$stepBarErrorIcon.on('click', this.errorIconClick.bind(this));
			this.$stepBarContainer.append(this.$stepBarErrorIcon);

			this.sliderEnabled = true;
			this.stepBarEnabled = true;
			this.$stepBarContainer.hide(); // hacky fix
			this.disable();
		},

		remove: function() {
			this.playPauseAnimation.animate(false);
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
			this.$reload.removeClass('editor-toolbar-reload-blink');
			this.$reload.addClass('disabled');
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

			this.$reload.removeClass('disabled');
			this.playPauseAnimation.animate(runner.canReceiveEvents());
			this.$playPause.removeClass('disabled');

			if (this.runner.isPaused()) {
				this.playPauseAnimation.pause();
				if (this.runner.hasEvents()) {
					if (!this.sliderEnabled) {
						this.sliderEnabled = true;
						this.$stepBarContainer.fadeIn(150);
						this.$div.removeClass('editor-toolbar-run-slider-disabled');
						this.$div.addClass('editor-toolbar-run-slider-enabled');
						this.$slider.width(this.runner.getEventTotal()*eventWidth);
						this.slider.setValue(this.runner.getEventNum());
						this.$sliderButton.css('margin-left', '');
					}
					this.showStepBar();
					this.setSliderErrors(runner);
					this.playPauseAnimation.setFraction(this.runner.getEventNum()/(this.runner.getEventTotal()-1));
					this.stepBar.update(runner);
					this.$stepBarContainer.css('left', this.$sliderContainer.position().left + this.runner.getEventNum()*eventWidth);
					this.$stepBarIcon.removeClass();
					this.$stepBarIcon.addClass('editor-toolbar-run-step-bar-icon icon-white icon-' + {
						base: 'stop',
						keyboard: 'keyboard',
						mouse: 'mouse',
						interval: 'time'
					}[this.runner.getEventType()]);
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
				if (this.runner.isBaseEventSelected()) {
					this.playPauseAnimation.setFraction(0);
				}
			}

			this.$reload.toggleClass('editor-toolbar-reload-blink', this.runner.hasbaseCodeChanged());
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
				this.editor.highlightFunctionNode(null);
				this.hideStepBar();
			}
		},

		playPause: function() {
			if (this.runner !== null && this.runner.isInteractive()) {
				if (this.runner.isPaused()) {
					this.runner.play();
				} else {
					this.runner.pause();
				}
			}
		},

		reload: function() {
			if (this.canRun) {
				this.runner.reload();
			}
		},

		sliderChanged: function(value) {
			if (this.runner.isPaused()) {
				this.runner.setEventNum(value);
				this.editor.highlightFunctionNode(this.runner.getFunctionNode(), !this.runner.isStepping());
			}
		},

		showStepBar: function() {
			if (!this.stepBarEnabled) {
				this.$stepBarContainer.fadeIn(150);
				this.stepBarEnabled = true;
			}
		},

		hideStepBar: function() {
			if (this.stepBarEnabled) {
				this.$stepBarContainer.fadeOut(150);
				this.stepBarEnabled = false;
			}
		},

		mouseEnter: function(event) {
			if (this.sliderEnabled) {
				this.editor.highlightFunctionNode(this.runner.getFunctionNode());
				this.showStepBar();
			}
		},

		mouseLeave: function(event) {
			this.editor.highlightFunctionNode(null);
			if (this.sliderEnabled && this.stepBarEnabled && !this.runner.isStepping()) {
				this.hideStepBar();
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

			this.$div.addClass('editor-toolbar');
			
			var $stepBar = $('<div class="btn-group editor-toolbar-step-bar"></div>');
			this.baseStepBar = new editor.StepBar($stepBar, this.$div, true);
			this.$div.append($stepBar);

			var isMac = navigator.platform.indexOf("Mac") >= 0;
			var $editHighlightGroup = $('<div class="btn-group editor-toolbar-highlight-group"></div>');
			this.$highlight = $('<button class="btn btn-inverse editor-toolbar-highlight"><i class="icon-screenshot icon-white"></i></button>');
			this.$highlight.tooltip({title: 'highlighting (<strong>ctrl</strong>' + (isMac ? ' or <strong>cmd</strong> &#8984;)' : ' or <strong>F2</strong>)'), placement: 'bottom'});
			this.$highlight.click(this.highlight.bind(this));
			$editHighlightGroup.append(this.$highlight);

			this.$edit = $('<button class="btn btn-inverse editor-toolbar-edit"><i class="icon-edit icon-white"></i></button>');
			this.$edit.click(this.edit.bind(this));
			this.$edit.tooltip({title: 'manipulation (<strong>alt</strong>' + (isMac ? ' &#8997;)' : ' or <strong>F3</strong>)'), placement: 'bottom'});
			$editHighlightGroup.append(this.$edit);
			this.$div.append($editHighlightGroup);

			var $runBar = $('<div class="btn-group editor-toolbar-run-bar"></div>');
			this.runBar = new editor.RunBar($runBar, this.editor);
			this.$div.append($runBar);

			this.keyDown = this.keyDown.bind(this);
			this.keyUp = this.keyUp.bind(this);
			this.lostFocus = this.lostFocus.bind(this);
			$(document).on('keydown', this.keyDown);
			$(document).on('keyup', this.keyUp);
			$(document).on('blur', this.lostFocus);

			this.keys = {};
			this.timers = {};
			this.clearAllKeys();
			this.enabled = true;
		},

		remove: function() {
			this.baseStepBar.remove();
			this.runBar.remove();
			this.$highlight.remove();
			this.$edit.remove();
			this.clearAllKeys();
			$(document).off('keydown', this.keyDown);
			$(document).off('keyup', this.keyUp);
			$(document).off('blur', this.lostFocus);
			this.$div.html('');
			this.$div.removeClass('editor-toolbar editor-toolbar-interactive');
		},

		enableEditables: function() {
			this.$edit.addClass('active');
			this.baseStepBar.setEditing(true);
			this.runBar.setEditing(true);
		},

		disableEditables: function() {
			this.$edit.removeClass('active');
			this.baseStepBar.setEditing(false);
			this.runBar.setEditing(false);
		},

		enableHighlighting: function() {
			this.$highlight.addClass('active');
		},

		disableHighlighting: function() {
			this.$highlight.removeClass('active');
		},

		update: function(runner) {
			this.enabled = true;
			if (runner.isStatic()) {
				this.$highlight.removeClass('disabled');
			} else {
				this.$highlight.addClass('disabled');
			}
			this.$edit.removeClass('disabled');
			if (runner.isInteractive()) {
				this.$div.addClass('editor-toolbar-interactive');
				this.baseStepBar.disable();
				this.runBar.update(runner);
			} else {
				this.$div.removeClass('editor-toolbar-interactive');
				this.baseStepBar.update(runner);
				this.runBar.disable();
			}
		},

		disable: function() {
			this.enabled = false;
			this.baseStepBar.disable();
			this.runBar.disable();
			this.$highlight.addClass('disabled');
			this.$edit.addClass('disabled');
			this.clearAllKeys();
		},

		/// INTERNAL FUNCTIONS ///
		keyDown: function(event) {
			if (!this.enabled) return;
			// 17 == CTRL, 18 == ALT, (17, 91, 93, 224) == COMMAND, 27 == ESC, 113 = F2, 114 = F3
			if ([17, 91, 93, 224].indexOf(event.keyCode) >= 0) {
				if (!this.keys.highlighting) {
					this.editor.enableHighlighting();
				}
				this.setKey('highlighting');
				event.preventDefault();
			} else if (event.keyCode === 113) {
				if (!this.keys.highlighting) {
					this.editor.toggleHighlighting();
				}
				this.setKey('highlighting');
				event.preventDefault();
			} else if (event.keyCode === 18) {
				if (!this.keys.editables) {
					this.editor.enableEditables();
				}
				this.setKey('editables');
				event.preventDefault();
			} else if (event.keyCode === 114) {
				if (!this.keys.editables) {
					this.editor.toggleEditables();
				}
				this.setKey('editables');
				event.preventDefault();
			} else if (event.keyCode === 27) {
				if (!this.keys.escape) {
					this.runBar.playPause();
				}
				this.setKey('escape');
				event.preventDefault();
			}
		},

		keyUp: function(event) {
			if (!this.enabled) return;
			// 17 == CTRL, 18 == ALT, (17, 91, 93, 224) == COMMAND, 27 == ESC, 113 = F2, 114 = F3
			if ([17, 91, 93, 224].indexOf(event.keyCode) >= 0) {
				this.editor.disableHighlighting();
				this.clearKey('highlighting');
				event.preventDefault();
			} else if (event.keyCode === 113) {
				this.clearKey('highlighting');
				event.preventDefault();
			} else if (event.keyCode === 18) {
				this.editor.disableEditables();
				this.clearKey('editables');
				event.preventDefault();
			} else if (event.keyCode === 114) {
				this.clearKey('editables');
				event.preventDefault();
			} else if (event.keyCode === 27) {
				this.clearKey('escape');
				event.preventDefault();
			}
		},

		lostFocus: function(event) {
			if (!this.enabled) return;
			this.editor.disableHighlighting();
			this.editor.disableEditables();
			this.clearAllKeys();
		},

		setKey: function(type) {
			this.clearTimer(type);
			this.keys[type] = true;
			this.timers[type] = setTimeout((function() { this.keys[type] = false; }).bind(this), 1000);
		},

		clearKey: function(type) {
			this.clearTimer(type);
			this.keys[type] = false;
		},

		clearTimer: function(type) {
			if (this.timers[type] !== undefined) {
				clearTimeout(this.timers[type]);
				this.timers[type] = undefined;
			}
		},

		clearAllKeys: function() {
			this.clearKey('higlighting');
			this.clearKey('editables');
			this.clearKey('escape');
		},

		highlight: function(event) {
			this.editor.toggleHighlighting();
		},

		edit: function(event) {
			this.editor.toggleEditables();
		}
	};
};

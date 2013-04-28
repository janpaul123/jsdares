/*jshint node:true jquery:true*/
"use strict";

var clayer = require('../clayer');

module.exports = function(editor) {
	editor.PlayPauseAnimation = function() { return this.init.apply(this, arguments); };
	editor.PlayPauseAnimation.prototype = {
		init: function($playPause) {
			this.$playPause = $playPause;
			this.$playPauseAnimationBlock = $('<div class="editor-toolbar-run-playpause-animation-block"></div>');
			this.$playPauseAnimationContainer = $('<div class="editor-toolbar-run-playpause-animation-container"></div>');
			this.$playPauseAnimationContainer.append(this.$playPauseAnimationBlock);
			this.$playPause.append(this.$playPauseAnimationContainer);

			this.$playPauseIcon = $('<i class="icon icon-play icon-white"></i>');
			this.$playPause.append(this.$playPauseIcon);

			//this.max = this.$playPauseAnimationContainer.width();
			this.max = 30;
			this.playing = false;
			this.animating = false;
			this.position = 0;
			this.speed = 0.01;
			this.restartTimeout = null;

			this.startAnimation = _(this.startAnimation).bind(this);
			this.restartAnimation = _(this.restartAnimation).bind(this);
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

			this.$div.on('mouseenter', _(this.mouseEnter).bind(this));
			this.$div.on('mouseleave', _(this.mouseLeave).bind(this));

			this.$reload = $('<button class="btn btn-primary editor-toolbar-reload"><i class="icon icon-repeat icon-white"></i></button>');
			this.$reload.on('click', _(this.reload).bind(this));
			this.$div.append(this.$reload);

			this.$playPause = $('<button class="btn btn-primary dropdown-toggle editor-toolbar-run-playpause"></button>');
			this.$playPause.tooltip({title: 'play/pause (<strong>esc</strong>)', placement: 'bottom'});
			this.$playPause.on('click', _(this.playPause).bind(this));
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

			this.$stepBarErrorIcon = $('<i class="icon-exclamation-sign-color editor-toolbar-run-step-bar-error-icon"/></i>');
			this.$stepBarErrorIcon.on('click', _(this.errorIconClick).bind(this));
			this.$stepBarContainer.append(this.$stepBarErrorIcon);

			this.$stepBarIcon = $('<i></i>');
			this.$stepBarContainer.append(this.$stepBarIcon);

			this.sliderEnabled = true;
			this.stepBarEnabled = true;
			this.$stepBarContainer.hide(); // hacky fix
			this.disable();
		},

		remove: function() {
			this.playPauseAnimation.animate(false);
			this.slider.remove();
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
					this.$stepBarContainer.css('left', this.$sliderContainer.position().left + this.runner.getEventNum()*eventWidth);
					this.$stepBarIcon.removeClass();
					this.$stepBarIcon.addClass('icon editor-toolbar-run-step-bar-icon icon-white icon-' + {
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
			ed.bindEventHandler(this);
			
			this.$div = $div;
			this.editor = ed;

			this.$div.addClass('editor-toolbar');
			
			// var isMac = navigator.platform.indexOf("Mac") >= 0;

			var $runBar = $('<div class="btn-group editor-toolbar-run-bar"></div>');
			this.runBar = new editor.RunBar($runBar, this.editor);
			this.$div.append($runBar);

			this.keyDown = _(this.keyDown).bind(this);
			this.keyUp = _(this.keyUp).bind(this);
			this.lostFocus = _(this.lostFocus).bind(this);
			$(document).on('keydown', this.keyDown);
			$(document).on('keyup', this.keyUp);
			$(window).on('blur', this.lostFocus);

			this.keys = {};
			this.timers = {};
			this.clearAllKeys();
			this.enabled = true;
		},

		remove: function() {
			this.runBar.remove();
			this.clearAllKeys();
			$(document).off('keydown', this.keyDown);
			$(document).off('keyup', this.keyUp);
			$(window).off('blur', this.lostFocus);
			this.$div.html('');
			this.$div.removeClass('editor-toolbar editor-toolbar-interactive');
		},

		update: function(runner) {
			this.enabled = true;
			if (runner.isInteractive()) {
				this.runBar.update(runner);
				this.$div.addClass('editor-toolbar-interactive');
			} else {
				this.runBar.disable();
				this.$div.removeClass('editor-toolbar-interactive');
			}
		},

		disable: function() {
			this.enabled = false;
			this.runBar.disable();
			this.clearAllKeys();
		},

		/// INTERNAL FUNCTIONS ///
		keyDown: function(event) {
			if (!this.enabled) return;
			// 17 == CTRL, 18 == ALT, (17, 91, 93, 224) == COMMAND, 27 == ESC, 113 = F2, 114 = F3
			if (event.keyCode === 27) {
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
			if (event.keyCode === 27) {
				this.clearKey('escape');
				event.preventDefault();
			}
		},

		lostFocus: function(event) {
			if (!this.enabled) return;
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
			this.clearKey('escape');
		}
	};
};

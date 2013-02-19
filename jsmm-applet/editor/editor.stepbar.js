/*jshint node:true jquery:true*/
"use strict";

var clayer = require('../clayer');

module.exports = function(editor) {
	editor.Stepbar = function() { return this.init.apply(this, arguments); };
	editor.Stepbar.prototype = {
		init: function($div, ed) {
			this.$div = $div;
			this.editor = ed;

			this.$div.addClass('editor-stepbar');
			this.$div.on('mousemove', this.onMouseMove.bind(this));
			this.$div.on('mouseleave', this.onMouseLeave.bind(this));
			this.$div.on('click', this.onClick.bind(this));

			this.$numbers = $('<div class="editor-stepbar-numbers"></div>');
			this.$div.append(this.$numbers);

			this.stepNumbers = [];
			this.numberWidth = 16;
			this.numberMargin = 3;
			this.currentStep = null;
			this.mouseX = null;
			this.locked = false;
		},

		remove: function() {
			this.$div.html('');
			this.$div.removeClass('editor-stepbar');
		},

		update: function(runner) {
			if (runner.isStatic() && runner.canStep()) {
				this.enabled = true;
				this.runner = runner;
				this.$numbers.show();
				this.setStepTotal(runner.getStepTotal());
				this.setStepNum(runner.getStepNum());
			} else {
				this.disable();
			}
		},

		disable: function() {
			this.enabled = false;
			this.runner = null;
			this.$numbers.hide();
			this.mouseX = null;
			this.unsetlocked();
		},

		/// INTERNAL FUNCTIONS ///
		onMouseMove: function(e) {
			this.mouseX = e.pageX - this.$div.offset().left;
			this.updateMouse();
		},

		onMouseLeave: function() {
			this.mouseX = null;
			this.updateMouse();
		},

		onClick: function() {
			if (this.currentStep !== null) {
				if (this.locked) {
					this.unsetlocked();
					this.updateMouse();
				} else {
					this.setlocked();
				}
			}
		},

		setlocked: function() {
			this.$div.addClass('editor-stepbar-locked');
			this.locked = true;
		},

		unsetlocked: function() {
			this.$div.removeClass('editor-stepbar-locked');
			this.locked = false;
		},

		updateMouse: function() {
			if (this.locked) return;

			if (this.enabled && this.mouseX !== null) {
				var fraction = this.fractionFromX(this.mouseX);
				var leftOffset = this.leftOffsetFromFraction(fraction);
				this.$numbers.css('left', -leftOffset);

				var step = this.stepFromXAndLeftOffset(this.mouseX, leftOffset);
				this.runner.setStepNum(step);
			} else {
				this.runner.restart();
			}
		},

		fractionFromX: function(x) {
			var sideMargin = this.numberWidth/2;
			var totalWidth = this.$div.outerWidth();
			var clippedX = Math.max(sideMargin, Math.min(totalWidth-sideMargin, x));
			return (clippedX-sideMargin)/(this.$div.outerWidth()-sideMargin*2);
		},

		leftOffsetFromFraction: function(fraction) {
			var scrollWidth = this.$numbers.outerWidth() - this.$div.outerWidth();
			return Math.round(fraction*scrollWidth);
		},

		stepFromXAndLeftOffset: function(x, leftOffset) {
			var width = this.numberWidth + this.numberMargin;
			var realX = leftOffset+x + this.numberMargin/2;
			
			var totalWidth = this.$numbers.outerWidth();
			var step = Math.floor(realX*this.stepTotal/totalWidth);

			return Math.min(this.stepTotal-1, Math.max(0, step));
		},

		setStepNum: function(stepNum) {
			if (stepNum === Infinity) stepNum = null;

			if (this.currentStep !== stepNum) {
				if (this.currentStep !== null) {
					this.stepNumbers[this.currentStep].$stepNumber.removeClass('editor-stepbar-step-number-active');
				}
				if (stepNum !== null) {
					this.stepNumbers[stepNum].$stepNumber.addClass('editor-stepbar-step-number-active');
				}
				this.currentStep = stepNum;
			}
		},

		setStepTotal: function(stepTotal) {
			if (stepTotal !== this.stepTotal) {
				for (var step=this.stepNumbers.length; step<stepTotal; step++) {
					this.addStepNumber(step);
				}

				this.removeNumbers(stepTotal);
				this.updateNumbersWidth(stepTotal);
				this.stepTotal = stepTotal;
			}
		},

		removeNumbers: function(fromStep) {
			var lastStepNumber = this.stepNumbers[fromStep-1];
			lastStepNumber.$stepNumber.nextAll().remove();
			this.stepNumbers = this.stepNumbers.slice(0, fromStep);
			
			if (this.currentStep >= fromStep) {
				this.currentStep = null;
			}
		},

		addStepNumber: function(step) {
			var $stepNumber = $('<div class="editor-stepbar-step-number">' + (step+1) + '</div>');
			this.$numbers.append($stepNumber);
			this.stepNumbers[step] = {$stepNumber: $stepNumber};
		},

		updateNumbersWidth: function(stepTotal) {
			var width = this.numberWidth+this.numberMargin;
			this.$numbers.width(width*stepTotal);
		}
	};
};

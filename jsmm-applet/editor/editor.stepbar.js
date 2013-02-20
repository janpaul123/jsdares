/*jshint node:true jquery:true*/
"use strict";

var clayer = require('../clayer');

module.exports = function(editor) {
	editor.Stepbar = function() { return this.init.apply(this, arguments); };
	editor.Stepbar.prototype = {
		init: function($div, ed) {
			ed.bindEventHandler(this);
			
			this.$div = $div;
			this.editor = ed;

			this.$div.addClass('editor-stepbar');
			this.$div.on('mousemove', this.onMouseMove.bind(this));
			this.$div.on('mouseleave', this.onMouseLeave.bind(this));
			this.$div.on('click', this.onClick.bind(this));

			this.$numbers = $('<div class="editor-stepbar-numbers"></div>');
			this.$div.append(this.$numbers);

			this.editorMarginSize = 26; // corresponds to @editor-margin-size in global.less

			this.stepNumbers = [];
			this.numberWidth = 16;
			this.numberMargin = 3;
			this.currentStep = null;
			this.mouseX = null;
			this.locked = false;
			this.lockedStep = null;
			this.leftOffset = 0;
		},

		remove: function() {
			this.$div.html('');
			this.$div.removeClass('editor-stepbar');
		},

		update: function(runner) {
			if (runner.isStatic() && runner.canStep()) {
				if (!this.enabled) {
					this.setLeftOffset(0);
				}
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
			this.lockedStep = this.currentStep;

			if (this.lockedStep !== null) {
				this.stepNumbers[this.lockedStep].$stepNumber.addClass('editor-stepbar-step-number-locked');
			}
		},

		unsetlocked: function() {
			this.$div.removeClass('editor-stepbar-locked');
			this.locked = false;
			this.lockedStep = null;
			this.$numbers.children('.editor-stepbar-step-number-locked').removeClass('editor-stepbar-step-number-locked');
		},

		updateLeftOffset: function() {
			if (!this.enabled || this.locked) return;

			var fraction = 0;
			if (this.mouseX !== null) {
				fraction = this.fractionFromX(this.mouseX);
			}
			this.setLeftOffset(this.leftOffsetFromFraction(fraction));
		},

		updateMouse: function() {
			if (!this.enabled) return;

			this.updateLeftOffset();
			if (this.mouseX !== null) {
				var step = this.stepFromXAndLeftOffset(this.mouseX, this.leftOffset);
				this.runner.setStepNum(step);
			} else if (this.currentStep !== this.lockedStep) {
				if (this.lockedStep !== null) {
					this.runner.setStepNum(this.lockedStep);
				} else {
					this.runner.restart();
				}
			}
		},

		setLeftOffset: function(leftOffset) {
			this.$numbers.css('left', leftOffset);
			this.leftOffset = leftOffset;
		},

		fractionFromX: function(x) {
			var sideMargin = this.numberWidth/2;
			var totalWidth = this.$div.outerWidth();
			var clippedX = Math.max(sideMargin, Math.min(totalWidth-sideMargin, x));
			return (clippedX-sideMargin)/(this.$div.outerWidth()-sideMargin*2);
		},

		leftOffsetFromFraction: function(fraction) {
			if (this.$numbers.outerWidth() >= this.$div.outerWidth()) {
				var scrollWidth = this.$numbers.outerWidth() - this.$div.outerWidth();
				return -Math.round(fraction*scrollWidth);
			} else {
				var halfDivWidth = Math.floor(this.$div.outerWidth() / 2);
				var leftOffsetAlignedRight = this.$div.outerWidth() - this.$numbers.outerWidth();
				return Math.min(leftOffsetAlignedRight, halfDivWidth + this.editorMarginSize);
			}
		},

		stepFromXAndLeftOffset: function(x, leftOffset) {
			var width = this.numberWidth + this.numberMargin;
			var realX = x-leftOffset + this.numberMargin/2;
			
			var totalWidth = this.$numbers.outerWidth();
			var step = Math.floor(realX*this.stepTotal/totalWidth);

			return Math.min(this.stepTotal-1, Math.max(0, step));
		},

		setStepNum: function(stepNum) {
			if (stepNum === Infinity) stepNum = null;

			if (this.currentStep !== stepNum) {
				if (this.currentStep !== null) {
					this.stepNumbers[this.currentStep].$stepNumber.removeClass('editor-stepbar-step-number-hover');
				}
				if (stepNum !== null) {
					this.stepNumbers[stepNum].$stepNumber.addClass('editor-stepbar-step-number-hover');
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
				this.updateLeftOffset();
			}
		},

		removeNumbers: function(fromStep) {
			var lastStepNumber = this.stepNumbers[fromStep-1];
			lastStepNumber.$stepNumber.nextAll().remove();
			this.stepNumbers = this.stepNumbers.slice(0, fromStep);
			
			if (this.currentStep >= fromStep) {
				this.currentStep = null;
			}
			if (this.lockedStep >= fromStep) {
				this.unsetlocked();
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

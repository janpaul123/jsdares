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
			this.$div.on('mousemove', _(this.onMouseMove).bind(this));
			this.$div.on('mouseleave', _(this.onMouseLeave).bind(this));
			this.$div.on('click', _(this.onClick).bind(this));

			this.$numbers = $('<div class="editor-stepbar-numbers"></div>');
			this.$div.append(this.$numbers);

			this.editorMarginSize = 26; // corresponds to @editor-margin-size in global.less

			this.stepNumbersLength = 0;
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
				if (this.locked && this.currentStep === this.lockedStep) {
					this.unsetlocked();
					this.updateMouse();
				} else {
					this.unsetlocked();
					this.setlocked();
				}
			}
		},

		setlocked: function() {
			this.$div.addClass('editor-stepbar-locked');
			this.locked = true;
			this.lockedStep = this.currentStep;

			if (this.lockedStep !== null) {
				this.$stepNumber(this.lockedStep).addClass('editor-stepbar-step-number-locked');
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
			var numbersWidth = this.$numbers.outerWidth();
			var divWidth = this.$div.outerWidth();
			if (numbersWidth >= divWidth) {
				var scrollWidth = numbersWidth - divWidth;
				return -Math.round(fraction*scrollWidth);
			} else {
				var halfDivWidth = Math.floor(divWidth / 2);
				var leftOffsetAlignedRight = divWidth - numbersWidth;
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
			if (stepNum >= 998) stepNum = null;

			if (this.currentStep !== stepNum) {
				if (this.currentStep !== null) {
					this.$stepNumber(this.currentStep).removeClass('editor-stepbar-step-number-hover');
				}
				if (stepNum !== null) {
					this.$stepNumber(stepNum).addClass('editor-stepbar-step-number-hover');
				}
				this.currentStep = stepNum;
			}
		},

		setStepTotal: function(stepTotal) {
			if (stepTotal >= 998) stepTotal = 998;

			if (stepTotal !== this.stepTotal) {
				var stepsHTML = '';
				for (var step=this.stepNumbersLength; step<stepTotal; step++) {
					stepsHTML += this.getStepNumberHTML(step);
				}
				this.$numbers.append(stepsHTML);
				this.stepNumbersLength = step;

				this.removeNumbers(stepTotal);
				this.updateNumbersWidth(stepTotal);
				this.stepTotal = stepTotal;
				this.updateLeftOffset();
			}
		},

		removeNumbers: function(fromStep) {
			var $lastStepNumber = this.$stepNumber(fromStep-1);
			$lastStepNumber.nextAll().remove();
			this.stepNumbersLength = fromStep;
			
			if (this.currentStep >= fromStep) {
				this.currentStep = null;
			}
			if (this.lockedStep >= fromStep) {
				this.unsetlocked();
			}
		},

		getStepNumberHTML: function(step) {
			return '<div class="editor-stepbar-step-number editor-stepbar-step-number-' + step + '">' + (step+1) + '</div>';
		},

		$stepNumber: function(step) {
			return this.$numbers.children('.editor-stepbar-step-number-' + step);
		},

		updateNumbersWidth: function(stepTotal) {
			var width = this.numberWidth+this.numberMargin;
			this.$numbers.width(width*stepTotal);
		}
	};
};

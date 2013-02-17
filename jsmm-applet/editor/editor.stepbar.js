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

			this.$numbers = $('<div class="editor-stepbar-numbers"></div>');
			this.$div.append(this.$numbers);

			this.stepNumbers = [];
			this.numberWidth = 16;
			this.numberMargin = 3;
			this.currentStep = null;
			this.mouseX = null;
		},

		remove: function() {
			this.$div.html('');
			this.$div.removeClass('editor-stepbar');
		},

		update: function(runner) {
			if (runner.canStep()) {
				this.enabled = true;
				this.runner = runner;
				this.$numbers.show();
				this.setStepTotal(runner.getStepTotal());
			} else {
				this.disable();
			}
		},

		disable: function() {
			this.enabled = false;
			this.runner = null;
			this.$numbers.hide();
			this.currentStep = null;
			this.mouseX = null;
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

		updateMouse: function() {
			if (this.enabled && this.mouseX !== null) {
				var fraction = this.fractionFromX(this.mouseX);
				var leftOffset = this.leftOffsetFromFraction(fraction);
				this.$numbers.css('left', -leftOffset);

				var step = this.stepFromXAndLeftOffset(this.mouseX, leftOffset);
				this.showStep(step);
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

		showStep: function(step) {
			if (this.currentStep !== null) {
				this.stepNumbers[this.currentStep].$stepNumber.removeClass('editor-stepbar-step-number-active');
			}

			this.stepNumbers[step].$stepNumber.addClass('editor-stepbar-step-number-active');
			this.currentStep = step;
			this.runner.setStepNum(step);
		},

		setStepTotal: function(stepTotal) {
			if (stepTotal !== this.stepTotal) {
				for (var step=this.stepNumbers.length; step<stepTotal; step++) {
					this.addStepNumber(step);
				}

				this.removeNumbers(stepTotal);
				this.stepTotal = stepTotal;
				this.updateMouse();
			}
		},

		removeNumbers: function(fromStep) {
			var lastStepNumber = this.stepNumbers[fromStep-1];
			lastStepNumber.$stepNumber.nextAll().remove();
			this.$numbers.width(lastStepNumber.xEnd);
			this.stepNumbers = this.stepNumbers.slice(0, fromStep);
			
			if (this.currentStep >= fromStep) {
				this.currentStep = null;
			}
		},

		addStepNumber: function(step) {
			var xStart = this.$numbers.outerWidth();
			
			var $stepNumber = $('<div class="editor-stepbar-step-number">' + (step+1) + '</div>');
			this.$numbers.append($stepNumber);

			var width = $stepNumber.outerWidth(true);
			var xEnd = xStart+width;

			this.stepNumbers[step] = {$stepNumber: $stepNumber, xStart: xStart, xEnd: xEnd, width: width};
			this.$numbers.width(xEnd);
		}
	};
};

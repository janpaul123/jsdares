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
			this.stepsRendered = 0;
			this.currentStep = null;
		},

		remove: function() {
			this.$div.html('');
			this.$div.removeClass('editor-stepbar');
		},

		update: function(runner) {
			if (runner.canStep()) {
				this.enabled = true;
				this.runner = runner;
				this.setStepTotal(runner.getStepTotal());
			} else {
				this.disable();
			}
		},

		disable: function() {
			this.enabled = false;
			this.runner = null;
			this.setStepTotal(0);
			this.currentStep = null;
		},

		/// INTERNAL FUNCTIONS ///
		onMouseMove: function(e) {
			var x = e.pageX - this.$div.offset().left;

			var sideMargin = 10;
			var totalWidth = this.$div.outerWidth();
			var clippedX = Math.max(0, Math.min(totalWidth-sideMargin*2, x-sideMargin));
			var fraction = clippedX/(this.$div.outerWidth()-sideMargin*2);

			console.info(fraction);
			this.moveNumbers(fraction);
			
			var step = Math.round(fraction*this.stepTotal);
			step = Math.min(this.stepTotal-1, Math.max(0, step));

			this.showStep(step);
		},

		moveNumbers: function(fraction) {
			var scrollWidth = this.$numbers.outerWidth() - this.$div.outerWidth();
			this.$numbers.css('left', -fraction*scrollWidth);
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
			for (var step=this.stepsRendered; step<stepTotal; step++) {
				this.addStepNumber(step);
			}

			this.stepNumbers[stepTotal-1].$stepNumber.prevAll().removeClass('hide');
			this.stepNumbers[stepTotal-1].$stepNumber.removeClass('hide');
			this.stepNumbers[stepTotal-1].$stepNumber.nextAll().addClass('hide');
			this.stepTotal = stepTotal;
		},

		addStepNumber: function(step) {
			var x = this.$numbers.width();
			
			var $stepNumber = $('<div class="editor-stepbar-step-number">' + (step+1) + '</div>');
			this.$numbers.append($stepNumber);

			var width = $stepNumber.outerWidth(true);

			this.stepNumbers[step] = {$stepNumber: $stepNumber, x: x, width: width};
			this.stepsRendered++;

			this.$numbers.width(x+width);
		}
	};
};

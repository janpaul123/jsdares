/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.Robot = function() { return this.init.apply(this, arguments); };

	output.Robot.prototype = {
		init: function($div, editor, columns, rows) {
			this.blockSize = 65;
			this.columns = columns;
			this.rows = rows;

			this.$div = $div;
			this.$div.addClass('robot');

			this.$container = $('<div class="robot-container"></div>');
			this.$div.append(this.$container);
			this.$container.width(this.columns * this.blockSize);
			this.$container.height(this.rows * this.blockSize);

			this.$maze = $('<div class="robot-maze"></div>');
			this.$container.append(this.$maze);

			this.$robot = $('<div class="robot-robot"></div>');
			this.$container.append(this.$robot);

			this.makeMaze();
			this.setRobotPosition(3, 3);
			this.setRobotOrientation(0);
		},

		makeMaze: function() {
			var x, y, $line;

			// inits
			this.verticalLines = [];
			this.horizontalLines = [];
			for (x=0; x<this.columns; x++) {
				this.verticalLines[x] = [];
				this.horizontalLines[x] = [];
			}

			// vertical lines
			for (y=0; y<this.rows; y++) {
				for (x=1; x<this.columns; x++) {
					$line = $('<div class="robot-maze-line-vertical"><div class="robot-maze-line-inside"></div></div>');
					$line.css('left', x*this.blockSize);
					$line.css('top', y*this.blockSize);
					$line.on('click', $.proxy(this.clickVerticalLine, this));
					$line.data('x', x);
					$line.data('y', y);
					this.$maze.append($line);
					this.verticalLines[x][y] = {$line: $line, active: false};
				}
			}

			// horizontal lines
			for (x=0; x<this.columns; x++) {
				for (y=1; y<this.rows; y++) {
					$line = $('<div class="robot-maze-line-horizontal"><div class="robot-maze-line-inside"></div></div>');
					$line.css('left', x*this.blockSize);
					$line.css('top', y*this.blockSize);
					$line.on('click', $.proxy(this.clickHorizontalLine, this));
					$line.data('x', x);
					$line.data('y', y);
					this.$maze.append($line);
					this.horizontalLines[x][y] = {$line: $line, active: false};
				}
			}
		},

		clickVerticalLine: function(event) {
			var $target = $(event.delegateTarget);
			var active = !this.verticalLines[$target.data('x')][$target.data('y')].active;
			this.verticalLines[$target.data('x')][$target.data('y')].active = active;
			if (active) {
				$target.addClass('robot-maze-line-active');
			} else {
				$target.removeClass('robot-maze-line-active');
			}
		},

		clickHorizontalLine: function(event) {
			var $target = $(event.delegateTarget);
			var active = !this.horizontalLines[$target.data('x')][$target.data('y')].active;
			this.horizontalLines[$target.data('x')][$target.data('y')].active = active;
			if (active) {
				$target.addClass('robot-maze-line-active');
			} else {
				$target.removeClass('robot-maze-line-active');
			}
		},

		setRobotPosition: function(x, y) {
			this.x = x;
			this.y = y;
			this.$robot.css('left', this.x*this.blockSize);
			this.$robot.css('top', this.y*this.blockSize);
		},

		setRobotCss3: function(name, value, addBrowserToValue) {
			addBrowserToValue = addBrowserToValue || false;
			var browsers = ['', '-ms-', '-moz-', '-webkit-', '-o-'];
			for (var i=0; i<browsers.length; i++) {
				var cssName = browsers[i] + name;
				var cssValue = (addBrowserToValue ? browsers[i] : '') + value;
				this.$robot.css(cssName, cssValue);
			}
		},

		setRobotOrientation: function(angle) {
			this.angle = angle;
			this.setRobotCss3('transform', 'rotate(' + this.angle + 'deg)');
		},

		animateRobotForward: function(amount) {
			var time = Math.abs(amount).toFixed(2);
			this.setRobotCss3('transition', 'left ' + time + 's ease-in-out, top ' + time + 's ease-in-out');
			this.setRobotPosition(
				this.x + Math.cos((this.angle-90)/180*Math.PI)*amount,
				this.y + Math.sin((this.angle-90)/180*Math.PI)*amount);
		},

		animateRobotLeft: function(amount) {
			var time = (amount/100).toFixed(2);
			this.setRobotCss3('transition', 'transform ' + time + 's linear', true);
			this.setRobotOrientation(this.angle-amount);
		},

		animateRobotRight: function(amount) {
			var time = (amount/100).toFixed(2);
			this.setRobotCss3('transition', 'transform ' + time + 's linear', true);
			this.setRobotOrientation(this.angle+amount);
		},
		
		getAugmentedObject: function() {
			return {};
		},

		startHighlighting: function() {
		},

		stopHighlighting: function() {
		},

		enableHighlighting: function() {
		},

		disableHighlighting: function() {
		},

		startRun: function() {
		},

		endRun: function() {
		},

		hasError: function() {
			//this.$canvas.addClass('robot-error');
		},

		clear: function() {
		},

		/// INTERNAL FUNCTIONS ///
		
	};
};
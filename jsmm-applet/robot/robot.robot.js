/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	var clayer = require('../clayer');

	output.Robot = function() { return this.init.apply(this, arguments); };
	output.Robot.prototype = {
		init: function($container, readOnly, blockSize, state) {
			this.readOnly = readOnly;
			this.blockSize = blockSize;

			this.$container = $container;
			this.$container.addClass('robot-container');

			this.$maze = $('<div class="robot-maze"></div>');
			this.$container.append(this.$maze);

			this.$path = $('<div class="robot-path"></div>');
			this.$container.append(this.$path);

			this.$robot = $('<div class="robot-robot"></div>');
			this.$container.append(this.$robot);
			this.$robot.hide();

			this.$initial = $('<div class="robot-robot robot-initial"></div>');
			this.$container.append(this.$initial);
			if (this.blockSize !== 64) {
				clayer.setCss3(this.$initial, 'transform', 'scale(' + (this.blockSize/64+0.01) + ')');
			}

			this.animationManager = new output.RobotAnimationManager(this.$robot, this.$maze, this.blockSize);
			this.animation = null;

			if (state !== undefined) {
				this.state = JSON.parse(state);
				this.drawInterface();
				this.clear();
			}
		},

		remove: function() {
			this.clear();
			this.$container.children('.robot-maze-block .robot-maze-line-vertical, .robot-maze-line-horizontal').remove();
			this.animationManager.remove();
			this.lastAnim = null;
			this.$lastElement = null;

			this.$maze.remove();
			this.$path.remove();
			this.$robot.remove();
		},

		clear: function() {
			this.$path.children('.robot-path-line, .robot-path-point').remove();
			this.animation = this.animationManager.newAnimation();
			this.lastAnim = null;
			this.$lastElement = null;
		},

		insertDelay: function(delay) { // only to be called right after creating this object with a state
			this.lastAnim = {type: 'delay', x: this.state.initialX, y: this.state.initialY, angle: this.state.initialAngle, length: delay};
			this.animation.add(this.lastAnim);
			this.$lastElement = null;
		},

		insertLine: function(fromX, fromY, toX, toY, angle, goals) {
			var dy = (toY-fromY)*this.blockSize, dx = (toX-fromX)*this.blockSize;
			var angleRad = Math.atan2(dy, dx);
			var length = Math.sqrt(dx*dx+dy*dy);
			var $line = $('<div class="robot-path-line"><div class="robot-path-line-inside"></div></div>');
			this.$path.append($line);
			$line.width(Math.round(length));
			clayer.setCss3($line, 'transform', 'rotate(' + (angleRad*180/Math.PI) + 'deg)');
			$line.css('left', Math.round(fromX*this.blockSize + this.blockSize/2 + dx/2 - length/2));
			$line.css('top', Math.round(fromY*this.blockSize + this.blockSize/2 + dy/2));

			if (goals !== null) {
				for (var i=0; i<goals.length; i++) {
					goals[i].$block = this.$blocks[goals[i].x][goals[i].y];
				}
			}

			this.lastAnim = {type: 'movement', x: fromX, y: fromY, x2: toX, y2: toY, angle: angle, goals: goals};
			this.animation.add(this.lastAnim);

			this.$lastElement = $line;
		},

		insertPoint: function(x, y, fromAngle, amount) {
			var toAngle = fromAngle+amount;
			var $point = $('<div class="robot-path-point"><div class="robot-path-point-inside"><div class="robot-path-point-arrow"></div></div></div>');
			this.$path.append($point);

			var toAngleRad = toAngle/180*Math.PI;

			// 5 = 0.5*@robot-path-point-arrow-hover
			$point.css('left', Math.round(x*this.blockSize + this.blockSize/2 + 5*Math.cos(toAngleRad)));
			$point.css('top', Math.round(y*this.blockSize + this.blockSize/2 - 5*Math.sin(toAngleRad)));
			clayer.setCss3($point, 'transform', 'rotate(' + (-toAngle) + 'deg)');

			this.lastAnim = {type: 'rotation', x: x, y: y, angle: fromAngle, angle2: toAngle};
			this.animation.add(this.lastAnim);

			this.$lastElement = $point;
		},

		insertDetectWall: function(x, y, angle, wall) {
			this.lastAnim = {type: 'wall', x: x, y: y, angle: angle, wall: wall};
			this.animation.add(this.lastAnim);
			this.$lastElement = null;
			return wall;
		},

		removePathHighlights: function() {
			this.$path.children('.robot-path-highlight').removeClass('robot-path-highlight');
		},

		removeEventHighlights: function() {
			this.$path.children('.robot-path-highlight-event').removeClass('robot-path-highlight-event');
		},

		removeTimeHighlights: function() {
			this.$path.children('.robot-path-highlight-time').removeClass('robot-path-highlight-time');
		},

		highlightVisitedGoal: function(goal) {
			this.$maze.children('.robot-maze-block-goal-blink').removeClass('robot-maze-block-goal-blink');
			if (goal !== null) {
				this.$blocks[goal%this.state.columns][Math.floor(goal/this.state.columns)].addClass('robot-maze-block-goal-blink');
			}
		},

		drawInterface: function() {
			var x, y, $line, $block;

			this.width = this.state.columns * this.blockSize;
			this.height = this.state.rows * this.blockSize;
			this.$container.width(this.width);
			this.$container.height(this.height);

			// inits
			this.$maze.children('.robot-maze-block, .robot-maze-line-vertical, .robot-maze-line-horizontal').remove();
			this.$verticalLines = [];
			this.$horizontalLines = [];
			this.$blocks = [];
			for (x=0; x<this.state.columns; x++) {
				this.$verticalLines[x] = [];
				this.$horizontalLines[x] = [];
				this.$blocks[x] = [];
			}

			// blocks
			for (x=0; x<this.state.columns; x++) {
				for (y=0; y<this.state.rows; y++) {
					$block = $('<div class="robot-maze-block"></div>');
					$block.css('left', x*this.blockSize);
					$block.css('top', y*this.blockSize);
					$block.width(this.blockSize);
					$block.height(this.blockSize);
					$block.data('x', x);
					$block.data('y', y);
					if (this.state.blockGoal[x][y]) $block.addClass('robot-maze-block-goal');
					this.$maze.append($block);
					this.$blocks[x][y] = $block;
				}
			}

			// vertical lines
			for (y=0; y<this.state.rows; y++) {
				for (x=1; x<this.state.columns; x++) {
					$line = $('<div class="robot-maze-line-vertical"><div class="robot-maze-line-inside"></div></div>');
					$line.css('left', x*this.blockSize);
					$line.css('top', y*this.blockSize);
					$line.height(this.blockSize);
					$line.data('x', x);
					$line.data('y', y);
					if (this.state.verticalActive[x][y]) $line.addClass('robot-maze-line-active');
					this.$maze.append($line);
					this.$verticalLines[x][y] = $line;
				}
			}

			// horizontal lines
			for (x=0; x<this.state.columns; x++) {
				for (y=1; y<this.state.rows; y++) {
					$line = $('<div class="robot-maze-line-horizontal"><div class="robot-maze-line-inside"></div></div>');
					$line.css('left', x*this.blockSize);
					$line.css('top', y*this.blockSize);
					$line.width(this.blockSize);
					$line.data('x', x);
					$line.data('y', y);
					if (this.state.horizontalActive[x][y]) $line.addClass('robot-maze-line-active');
					this.$maze.append($line);
					this.$horizontalLines[x][y] = {$line: $line, active: false};
				}
			}

			this.drawInitial();
		},

		drawInitial: function() {
			this.$initial.css('left', this.state.initialX * this.blockSize + this.blockSize/2);
			this.$initial.css('top', this.state.initialY * this.blockSize + this.blockSize/2);
		},

		playAll: function() {
			this.animationManager.forcePlay(0, Infinity);
		},

		stop: function() {
			this.animationManager.stop();
		}
	};
};
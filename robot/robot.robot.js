/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	var clayer = require('../clayer');

	output.Robot = function() { return this.init.apply(this, arguments); };
	output.Robot.prototype = {
		init: function($container, blockSize, columns, rows) {
			this.columns = columns || 8;
			this.rows = rows || 8;
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

			this.animationManager = new output.RobotAnimationManager(this.$robot, this.blockSize);
			this.animation = null;

			this.initialState(columns, rows);
			this.clear();
		},

		remove: function() {
			this.clear();
			this.$container.children('.robot-maze-block .robot-maze-line-vertical, .robot-maze-line-horizontal').remove();
			this.animationManager.remove();

			this.$maze.remove();
			this.$path.remove();
			this.$robot.remove();
		},

		clear: function() {
			this.robotX = this.initialX;
			this.robotY = this.initialY;
			this.robotAngle = this.initialAngle;
			this.$path.children('.robot-path-line, .robot-path-point').remove();
			this.animation = this.animationManager.newAnimation();
		},

		insertLine: function(toX, toY) {
			var fromX = this.robotX, fromY = this.robotY;
			var dy = (toY-fromY)*this.blockSize, dx = (toX-fromX)*this.blockSize;
			var angleRad = Math.atan2(dy, dx);
			var length = Math.sqrt(dx*dx+dy*dy);
			var $line = $('<div class="robot-path-line"><div class="robot-path-line-inside"></div></div>');
			this.$path.append($line);
			$line.width(length);
			clayer.setCss3($line, 'transform', 'rotate(' + (angleRad*180/Math.PI) + 'deg)');
			$line.css('left', fromX*this.blockSize + this.blockSize/2 + dx/2 - length/2);
			$line.css('top', fromY*this.blockSize + this.blockSize/2 + dy/2);

			this.robotX = toX;
			this.robotY = toY;

			var anim = {type: 'movement', x: fromX, y: fromY, x2: toX, y2: toY, angle: this.robotAngle};
			this.animation.add(anim);

			return {
				$element: $line,
				anim: anim
			};
		},

		insertPoint: function(amount) {
			var fromAngle = this.robotAngle, toAngle = this.robotAngle+amount;
			var $point = $('<div class="robot-path-point"><div class="robot-path-point-inside"><div class="robot-path-point-arrow"></div></div></div>');
			this.$path.append($point);

			var toAngleRad = toAngle/180*Math.PI;

			// 5 = 0.5*@robot-path-point-arrow-hover
			$point.css('left', this.robotX*this.blockSize + this.blockSize/2 + 5*Math.cos(toAngleRad));
			$point.css('top', this.robotY*this.blockSize + this.blockSize/2 - 5*Math.sin(toAngleRad));
			clayer.setCss3($point, 'transform', 'rotate(' + (-toAngle) + 'deg)');

			this.robotAngle = (toAngle%360+360)%360;

			var anim = {type: 'rotation', x: this.robotX, y: this.robotY, angle: fromAngle, angle2: toAngle};
			this.animation.add(anim);

			return {
				$element: $point,
				anim: anim
			};
		},

		insertDetectWall: function(wall) {
			var anim = {type: 'wall', x: this.robotX, y: this.robotY, angle: this.robotAngle, wall: wall};
			this.animation.add(anim);
			return {anim: anim};
		},

		insertDelay: function(delay) {
			var anim = {type: 'delay', x: this.robotX, y: this.robotY, angle: this.robotAngle, length: delay};
			this.animation.add(anim);
			return {anim: anim};
		},

		removeHighlights: function() {
			this.$path.children('.robot-path-highlight').removeClass('robot-path-highlight');
		},

		getState: function() {
			var verticalActive = [], horizontalActive = [], blockGoal = [], numGoals = 0;
			for (var x=0; x<this.columns; x++) {
				verticalActive[x] = [];
				horizontalActive[x] = [];
				blockGoal[x] = [];
				for (var y=0; y<this.rows; y++) {
					verticalActive[x][y] = this.verticalActive[x][y];
					horizontalActive[x][y] = this.horizontalActive[x][y];
					blockGoal[x][y] = this.blockGoal[x][y];
					if (blockGoal[x][y]) numGoals++;
				}
			}
			return JSON.stringify({
				columns: this.columns,
				rows: this.rows,
				initialX: this.initialX,
				initialY: this.initialY,
				initialAngle: this.initialAngle,
				mazeObjects: this.mazeObjects,
				verticalActive: verticalActive,
				horizontalActive: horizontalActive,
				blockGoal: blockGoal,
				numGoals: numGoals
			});
		},

		setState: function(state) {
			state = JSON.parse(state);
			this.columns = state.columns;
			this.rows = state.rows;
			this.initialX = state.initialX;
			this.initialY = state.initialY;
			this.initialAngle = state.initialAngle;
			this.mazeObjects = state.mazeObjects;
			this.verticalActive = [];
			this.horizontalActive = [];
			this.blockGoal = [];
			for (var x=0; x<this.columns; x++) {
				this.verticalActive[x] = [];
				this.horizontalActive[x] = [];
				this.blockGoal[x] = [];
				for (var y=0; y<this.rows; y++) {
					this.verticalActive[x][y] = state.verticalActive[x][y];
					this.horizontalActive[x][y] = state.horizontalActive[x][y];
					this.blockGoal[x][y] = state.blockGoal[x][y];
				}
			}
			this.drawInterface();
		},

		initialState: function(columns, rows) {
			this.columns = columns;
			this.rows = rows;
			this.initialX = Math.floor(this.columns/2);
			this.initialY = rows-1;
			this.initialAngle = 90;
			this.mazeObjects = 0;
			this.verticalActive = [];
			this.horizontalActive = [];
			this.blockGoal = [];
			for (var x=0; x<this.columns; x++) {
				this.verticalActive[x] = [];
				this.horizontalActive[x] = [];
				this.blockGoal[x] = [];
				for (var y=0; y<this.rows; y++) {
					this.verticalActive[x][y] = false;
					this.horizontalActive[x][y] = false;
					this.blockGoal[x][y] = false;
				}
			}
			this.drawInterface();
		},

		drawInterface: function() {
			var x, y, $line, $block;

			this.width = this.columns * this.blockSize;
			this.height = this.rows * this.blockSize;
			this.$container.width(this.width);
			this.$container.height(this.height);

			// inits
			this.$container.children('.robot-maze-block .robot-maze-line-vertical, .robot-maze-line-horizontal').remove();
			this.$verticalLines = [];
			this.$horizontalLines = [];
			this.$blocks = [];
			for (x=0; x<this.columns; x++) {
				this.$verticalLines[x] = [];
				this.$horizontalLines[x] = [];
				this.$blocks[x] = [];
			}

			// blocks
			for (x=0; x<this.columns; x++) {
				for (y=0; y<this.rows; y++) {
					$block = $('<div class="robot-maze-block"></div>');
					$block.css('left', x*this.blockSize);
					$block.css('top', y*this.blockSize);
					$block.width(this.blockSize);
					$block.height(this.blockSize);
					$block.data('x', x);
					$block.data('y', y);
					if (this.blockGoal[x][y]) $block.addClass('robot-maze-block-goal');
					this.$maze.append($block);
					this.$blocks[x][y] = $block;
				}
			}

			// vertical lines
			for (y=0; y<this.rows; y++) {
				for (x=1; x<this.columns; x++) {
					$line = $('<div class="robot-maze-line-vertical"><div class="robot-maze-line-inside"></div></div>');
					$line.css('left', x*this.blockSize);
					$line.css('top', y*this.blockSize);
					$line.height(this.blockSize);
					$line.data('x', x);
					$line.data('y', y);
					if (this.verticalActive[x][y]) $line.addClass('robot-maze-line-active');
					this.$maze.append($line);
					this.$verticalLines[x][y] = $line;
				}
			}

			// horizontal lines
			for (x=0; x<this.columns; x++) {
				for (y=1; y<this.rows; y++) {
					$line = $('<div class="robot-maze-line-horizontal"><div class="robot-maze-line-inside"></div></div>');
					$line.css('left', x*this.blockSize);
					$line.css('top', y*this.blockSize);
					$line.width(this.blockSize);
					$line.data('x', x);
					$line.data('y', y);
					if (this.horizontalActive[x][y]) $line.addClass('robot-maze-line-active');
					this.$maze.append($line);
					this.$horizontalLines[x][y] = {$line: $line, active: false};
				}
			}
		},

		playAll: function() {
			this.animationManager.playAll();
		},

		playLast: function() {
			this.animationManager.playLast();
		},

		stop: function() {
			this.animationManager.remove();
		}
	};
};
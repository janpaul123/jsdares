/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	var clayer = require('../clayer');

	output.Robot = function() { return this.init.apply(this, arguments); };
	output.Robot.prototype = {
		init: function($container, readOnly, blockSize, columns, rows) {
			this.readOnly = readOnly;
			this.blockSize = blockSize;
			this.columns = columns || 8;
			this.rows = rows || 8;

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

			this.initialState(columns, rows);
			this.clear();
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
			this.robotX = this.initialX;
			this.robotY = this.initialY;
			this.robotAngle = this.initialAngle;
			this.$path.children('.robot-path-line, .robot-path-point').remove();
			this.animation = this.animationManager.newAnimation();
			this.visitedGoals = [];
			this.lastAnim = null;
			this.$lastElement = null;
		},

		drive: function(amount) {
			if (amount === undefined) amount = 1;

			if (amount !== 0) {
				var x = this.robotX, y = this.robotY;

				var goals = null;
				if (this.mazeObjects > 0) {
					var positive = amount > 0;

					for (var i=0; i<Math.abs(amount); i++) {
						if (this.isWall(x, y, positive ? this.robotAngle : (this.robotAngle + 180)%360)) {
							this.insertLine(x, y, goals);
							throw 'Robot ran into a wall';
						}
						if (this.robotAngle === 0) {
							x += (positive ? 1 : -1);
						} else if (this.robotAngle === 90) {
							y -= (positive ? 1 : -1);
						} else if (this.robotAngle === 180) {
							x -= (positive ? 1 : -1);
						} else if (this.robotAngle === 270) {
							y += (positive ? 1 : -1);
						}
						if (this.blockGoal[x][y]) {
							var goal = {$block: this.$blocks[x][y], amount: i+1, loc: x+y*this.columns};
							if (goals === null) {
								goals = [goal];
							} else {
								goals.push(goal);
							}
							if (this.visitedGoals.indexOf(x+y*this.columns) < 0) {
								this.visitedGoals.push(x+y*this.columns);
							}
						}
					}
				} else {
					x += Math.cos(this.robotAngle / 180 * Math.PI)*amount;
					y -= Math.sin(this.robotAngle / 180 * Math.PI)*amount;
				}
				this.insertLine(x, y, goals);
			}
		},

		turnLeft: function(amount) {
			if (amount === undefined) amount = 90;
			this.insertPoint(amount);
		},

		turnRight: function(amount) {
			if (amount === undefined) amount = 90;
			this.insertPoint(-amount);
		},

		detectWall: function() {
			var wall = this.isWall(this.robotX, this.robotY, this.robotAngle);
			this.lastAnim = {type: 'wall', x: this.robotX, y: this.robotY, angle: this.robotAngle, wall: wall};
			this.animation.add(this.lastAnim);
			this.$lastElement = null;
			return wall;
		},

		detectGoal: function(node, name, args) {
			this.lastAnim = null;
			this.$lastElement = null;
			if (this.mazeObjects <= 0) return false;
			else return this.blockGoal[this.robotX][this.robotY];
		},

		insertDelay: function(delay) {
			this.lastAnim = {type: 'delay', x: this.robotX, y: this.robotY, angle: this.robotAngle, length: delay};
			this.animation.add(this.lastAnim);
			this.$lastElement = null;
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
				this.$blocks[goal%this.columns][Math.floor(goal/this.columns)].addClass('robot-maze-block-goal-blink');
			}
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
			this.$maze.children('.robot-maze-block, .robot-maze-line-vertical, .robot-maze-line-horizontal').remove();
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
					if (!this.readOnly || this.blockGoal[x][y]) {
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
			}

			// vertical lines
			for (y=0; y<this.rows; y++) {
				for (x=1; x<this.columns; x++) {
					if (!this.readOnly || this.verticalActive[x][y]) {
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
			}

			// horizontal lines
			for (x=0; x<this.columns; x++) {
				for (y=1; y<this.rows; y++) {
					if (!this.readOnly || this.horizontalActive[x][y]) {
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
			}

			this.drawInitial();
		},

		drawInitial: function() {
			this.$initial.css('left', this.initialX * this.blockSize + this.blockSize/2);
			this.$initial.css('top', this.initialY * this.blockSize + this.blockSize/2);
		},

		playAll: function() {
			this.animationManager.forcePlay(0, Infinity);
		},

		stop: function() {
			this.animationManager.stop();
		},

		/// INTERNAL FUNCTIONS ///
		isWall: function(x, y, angle) {
			if (this.mazeObjects <= 0) {
				return false;
			} else {
				if (angle === 0) {
					if (x >= this.columns-1 || this.verticalActive[x+1][y]) {
						return true;
					}
				} else if (angle === 90) {
					if (y <= 0 || this.horizontalActive[x][y]) {
						return true;
					}
				} else if (angle === 180) {
					if (x <= 0 || this.verticalActive[x][y]) {
						return true;
					}
				} else if (angle === 270) {
					if (y >= this.rows-1 || this.horizontalActive[x][y+1]) {
						return true;
					}
				}
				return false;
			}
		},

		insertLine: function(toX, toY, goals) {
			var fromX = this.robotX, fromY = this.robotY;
			var dy = (toY-fromY)*this.blockSize, dx = (toX-fromX)*this.blockSize;
			var angleRad = Math.atan2(dy, dx);
			var length = Math.sqrt(dx*dx+dy*dy);
			var $line = $('<div class="robot-path-line"><div class="robot-path-line-inside"></div></div>');
			this.$path.append($line);
			$line.width(Math.round(length));
			clayer.setCss3($line, 'transform', 'rotate(' + (angleRad*180/Math.PI) + 'deg)');
			$line.css('left', Math.round(fromX*this.blockSize + this.blockSize/2 + dx/2 - length/2));
			$line.css('top', Math.round(fromY*this.blockSize + this.blockSize/2 + dy/2));

			this.robotX = toX;
			this.robotY = toY;

			this.lastAnim = {type: 'movement', x: fromX, y: fromY, x2: toX, y2: toY, angle: this.robotAngle, goals: goals};
			this.animation.add(this.lastAnim);

			this.$lastElement = $line;
		},

		insertPoint: function(amount) {
			var fromAngle = this.robotAngle, toAngle = this.robotAngle+amount;
			var $point = $('<div class="robot-path-point"><div class="robot-path-point-inside"><div class="robot-path-point-arrow"></div></div></div>');
			this.$path.append($point);

			var toAngleRad = toAngle/180*Math.PI;

			// 5 = 0.5*@robot-path-point-arrow-hover
			$point.css('left', Math.round(this.robotX*this.blockSize + this.blockSize/2 + 5*Math.cos(toAngleRad)));
			$point.css('top', Math.round(this.robotY*this.blockSize + this.blockSize/2 - 5*Math.sin(toAngleRad)));
			clayer.setCss3($point, 'transform', 'rotate(' + (-toAngle) + 'deg)');

			this.robotAngle = (toAngle%360+360)%360;

			this.lastAnim = {type: 'rotation', x: this.robotX, y: this.robotY, angle: fromAngle, angle2: toAngle};
			this.animation.add(this.lastAnim);

			this.$lastElement = $point;
		}
	};
};
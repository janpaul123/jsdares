/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.RobotObject = function() { return this.init.apply(this, arguments); };
	output.Robot = function() { return this.init.apply(this, arguments); };

	var setCss3 = function($element, name, value, addBrowserToValue) {
		addBrowserToValue = addBrowserToValue || false;
		var browsers = ['', '-ms-', '-moz-', '-webkit-', '-o-'];
		for (var i=0; i<browsers.length; i++) {
			var cssName = browsers[i] + name;
			var cssValue = (addBrowserToValue ? browsers[i] : '') + value;
			$element.css(cssName, cssValue);
		}
	};

	/*
	output.RobotObject.prototype = {
		init: function($robot, x, y) {
			this.$robot = $robot;
			this.initialX = x;
			this.initialY = y;
			this.setPosition(x, y);
			this.animationQueue = [];
		},

		setPosition: function(x, y) {
			this.x = x;
			this.y = y;
			this.$robot.css('left', this.x*this.blockSize);
			this.$robot.css('top', this.y*this.blockSize);
		},

		setOrientation: function(angle) {
			this.angle = angle;
			this.setCss3('transform', 'rotate(' + this.angle + 'deg)');
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
		}
	};
	*/

	output.Robot.prototype = {
		init: function($div, editor, columns, rows) {
			this.blockSize = 64;
			this.columns = columns;
			this.rows = rows;

			this.$div = $div;
			this.$div.addClass('robot');

			this.$container = $('<div class="robot-container robot-not-highlighting"></div>');
			this.$container.on('mouseup', $.proxy(this.containerMouseUp, this));
			this.$container.on('mouseleave', $.proxy(this.containerMouseLeave, this));
			this.$div.append(this.$container);

			this.$maze = $('<div class="robot-maze"></div>');
			this.$container.append(this.$maze);

			this.$path = $('<div class="robot-path"></div>');
			this.$container.append(this.$path);

			this.$initial = $('<div class="robot-robot robot-initial"></div>');
			this.$initial.on('mousedown', $.proxy(this.initialMouseDown, this));
			this.$initial.on('mouseup', $.proxy(this.initialMouseUp, this));
			this.$container.append(this.$initial);

			this.editor = editor;
			this.editor.addOutput(this);

			this.highlighting = false;
			this.highlightNext = false;

			this.initialState(columns, rows);
			this.clear();
		},

		drive: function(node, name, args) {
			var amount = args[0] || 1;
			if (args.length > 1) {
				throw function(f) { return f('forward') + ' accepts no more than' + f('1') + ' argument'; };
			} else if (typeof amount !== 'number' || !isFinite(amount)) {
				throw function(f) { return 'Argument has to be a valid number'; };
			} else if (Math.round(amount) !== amount && this.mazeObjects > 0) {
				throw function(f) { return 'Fractional amounts are only allowed when the maze is empty'; };
			} else if (amount !== 0) {
				var fromX = this.getPathPos(this.robotX), fromY = this.getPathPos(this.robotY);

				if (this.mazeObjects > 0) {
					var positive = amount > 0;
					for (var i=0; i<Math.abs(amount); i++) {
						if (this.isWall(this.robotX, this.robotY, positive ? this.robotAngle : (this.robotAngle + 180)%360)) {
							this.insertLine(node, fromX, fromY, this.getPathPos(this.robotX), this.getPathPos(this.robotY));
							throw 'Robot ran into a wall';
						}
						if (this.robotAngle === 0) {
							this.robotX += (positive ? 1 : -1);
						} else if (this.robotAngle === 90) {
							this.robotY -= (positive ? 1 : -1);
						} else if (this.robotAngle === 180) {
							this.robotX -= (positive ? 1 : -1);
						} else if (this.robotAngle === 270) {
							this.robotY += (positive ? 1 : -1);
						}
					}
				} else {
					this.robotX += Math.cos(this.robotAngle / 180 * Math.PI)*amount;
					this.robotY -= Math.sin(this.robotAngle / 180 * Math.PI)*amount;
				}
				this.insertLine(node, fromX, fromY, this.getPathPos(this.robotX), this.getPathPos(this.robotY));
			}
		},

		turn: function(node, name, args) {
			var amount = args[0] || 90;
			amount = ((amount%360)+360)%360;

			if (args.length > 1) {
				throw function(f) { return f(name) + ' accepts no more than' + f('1') + ' argument'; };
			} else if (typeof amount !== 'number' || !isFinite(amount)) {
				throw function(f) { return 'Argument has to be a valid number'; };
			} else if ([0, 90, 180, 270].indexOf(amount) < 0 && this.mazeObjects > 0) {
				throw function(f) { return 'Only 90, 180 and 270 degrees are allowed when the maze is not empty'; };
			} else {
				if (amount > 0) {
					this.robotAngle += (name === 'turnLeft' ? amount : -amount);
					this.robotAngle = ((this.robotAngle%360)+360)%360;
				}
				this.insertPoint(node, this.getPathPos(this.robotX), this.getPathPos(this.robotY));
			}
		},

		detectWall: function(node, name, args) {
			return this.isWall(this.robotX, this.robotY, this.robotAngle);
		},

		detectGoal: function(node, name, args) {
			if (this.mazeObjects <= 0) return false;
			else return this.blockGoal[this.robotX][this.robotY];
		},
		
		getAugmentedObject: function() {
			return {
				drive: {
					name: 'drive',
					augmented: 'function',
					example: 'drive(3)',
					func: $.proxy(this.drive, this)
				},
				turnLeft: {
					name: 'turnLeft',
					augmented: 'function',
					example: 'turnLeft()',
					func: $.proxy(this.turn, this)
				},
				turnRight: {
					name: 'turnRight',
					augmented: 'function',
					example: 'turnRight()',
					func: $.proxy(this.turn, this)
				},
				detectWall: {
					name: 'detectWall',
					augmented: 'function',
					example: 'detectWall()',
					func: $.proxy(this.detectWall, this)
				},
				detectGoal: {
					name: 'detectGoal',
					augmented: 'function',
					example: 'detectGoal()',
					func: $.proxy(this.detectGoal, this)
				}
			};
		},

		startHighlighting: function() {
			this.highlightNext = true;
		},

		stopHighlighting: function() {
			this.highlightNext = false;
		},

		enableHighlighting: function() {
			this.highlighting = true;
			this.$container.removeClass('robot-not-highlighting');
			this.$container.addClass('robot-highlighting');
		},

		disableHighlighting: function() {
			this.highlighting = false;
			this.$container.removeClass('robot-highlighting');
			this.$container.addClass('robot-not-highlighting');
		},

		startRun: function() {
			this.clear();
			this.$container.removeClass('robot-error');
		},

		endRun: function() {
		},

		hasError: function() {
			this.$container.addClass('robot-error');
		},

		clear: function() {
			this.robotX = this.initialX;
			this.robotY = this.initialY;
			this.robotAngle = this.initialAngle;
			this.$path.children('.robot-path-line, .robot-path-point').remove();
		},

		getState: function() {
			var verticalActive = [], horizontalActive = [], blockGoal = [];
			for (var x=0; x<this.columns; x++) {
				verticalActive[x] = [];
				horizontalActive[x] = [];
				blockGoal[x] = [];
				for (var y=0; y<this.rows; y++) {
					verticalActive[x][y] = this.verticalActive[x][y];
					horizontalActive[x][y] = this.horizontalActive[x][y];
					blockGoal[x][y] = this.blockGoal[x][y];
				}
			}
			return {
				columns: this.columns,
				rows: this.rows,
				initialX: this.initialX,
				initialY: this.initialY,
				initialAngle: this.initialAngle,
				mazeObjects: this.mazeObjects,
				verticalActive: verticalActive,
				horizontalActive: horizontalActive
			};
		},

		setState: function(state) {
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

		/// INTERNAL FUNCTIONS ///
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
			this.mazeObjects = 0;
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
					$block.data('x', x);
					$block.data('y', y);
					$block.on('click', $.proxy(this.clickBlock, this));
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
					$line.on('click', $.proxy(this.clickVerticalLine, this));
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
					$line.on('click', $.proxy(this.clickHorizontalLine, this));
					$line.data('x', x);
					$line.data('y', y);
					if (this.horizontalActive[x][y]) $line.addClass('robot-maze-line-active');
					this.$maze.append($line);
					this.$horizontalLines[x][y] = {$line: $line, active: false};
				}
			}

			this.drawInitial();
		},

		drawInitial: function() {
			this.$initial.css('left', this.initialX * this.blockSize);
			this.$initial.css('top', this.initialY * this.blockSize);
		},

		clickVerticalLine: function(event) {
			var $target = $(event.delegateTarget);
			var active = !this.verticalActive[$target.data('x')][$target.data('y')];
			this.verticalActive[$target.data('x')][$target.data('y')] = active;
			if (active) {
				this.mazeObjects++;
				$target.addClass('robot-maze-line-active');
			} else {
				this.mazeObjects--;
				$target.removeClass('robot-maze-line-active');
			}
			this.editor.outputRequestsRerun();
		},

		clickHorizontalLine: function(event) {
			var $target = $(event.delegateTarget);
			var active = !this.horizontalActive[$target.data('x')][$target.data('y')];
			this.horizontalActive[$target.data('x')][$target.data('y')] = active;
			if (active) {
				this.mazeObjects++;
				$target.addClass('robot-maze-line-active');
			} else {
				this.mazeObjects--;
				$target.removeClass('robot-maze-line-active');
			}
			this.editor.outputRequestsRerun();
		},
		
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

		getPathPos: function(val) {
			return val*this.blockSize + this.blockSize/2;
		},

		insertLine: function(node, fromX, fromY, toX, toY) {
			var dy = toY-fromY, dx = toX-fromX;
			var angleRad = Math.atan2(dy, dx);
			var length = Math.sqrt(dx*dx+dy*dy);
			var $line = $('<div class="robot-path-line"><div class="robot-path-line-inside"></div></div>');
			this.$path.append($line);
			$line.width(length);
			setCss3($line, 'transform', 'rotate(' + (angleRad*180/Math.PI) + 'deg)');
			$line.css('left', fromX + dx/2 - length/2);
			$line.css('top', fromY + dy/2);
			if (this.highlightNext) {
				$line.addClass('robot-path-highlight');
			}
			$line.on('mousemove', $.proxy(this.pathMouseMove, this));
			$line.data('node', node);
		},

		insertPoint: function(node, x, y) {
			var $point = $('<div class="robot-path-point"><div class="robot-path-point-inside"></div>');
			this.$path.append($point);
			$point.css('left', x);
			$point.css('top', y);
			if (this.highlightNext) {
				$point.addClass('robot-path-highlight');
			}
			$point.on('mousemove', $.proxy(this.pathMouseMove, this));
			$point.data('node', node);
		},

		pathMouseMove: function(event) {
			if (this.highlighting) {
				var $target = $(event.delegateTarget);
				if ($target.data('node') !== undefined && !$target.hasClass('robot-path-highlight')) {
					this.$path.children('.robot-path-highlight').removeClass('robot-path-highlight');
					$target.addClass('robot-path-highlight');
					this.editor.highlightNode($target.data('node'));
				}
			}
		},

		initialMouseDown: function(event) {
			this.$container.on('mousemove', $.proxy(this.containerInitialMouseMove, this));
			this.$initial.addClass('robot-initial-dragging');
			event.preventDefault();
		},

		containerMouseUp: function(event) {
			this.$container.off('mousemove');
			this.$initial.removeClass('robot-initial-dragging');
		},

		containerMouseLeave: function(event) {
			this.$container.off('mousemove');
			this.$initial.removeClass('robot-initial-dragging');
		},

		containerInitialMouseMove: function(event) {
			var $target = $(event.target);
			if ($target.hasClass('robot-maze-block')) {
				this.initialX = $target.data('x');
				this.initialY = $target.data('y');
				this.drawInitial();
				this.editor.outputRequestsRerun();
			}
		},

		clickBlock: function(event) {
			var $target = $(event.delegateTarget);
			var goal = !this.blockGoal[$target.data('x')][$target.data('y')];
			this.blockGoal[$target.data('x')][$target.data('y')] = goal;
			if (goal) {
				this.mazeObjects++;
				$target.addClass('robot-maze-block-goal');
			} else {
				this.mazeObjects--;
				$target.removeClass('robot-maze-block-goal');
			}
			this.editor.outputRequestsRerun();
		}
	};
};
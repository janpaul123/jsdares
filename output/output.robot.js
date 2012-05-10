/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.RobotAnimationManager = function() { return this.init.apply(this, arguments); };
	output.RobotAnimation = function() { return this.init.apply(this, arguments); };
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

	var blockSize = 64;

	output.RobotAnimationManager.prototype = {
		init: function($robot) {
			this.$robot = $robot;
			this.$robot.hide();
			this.runningAnimation = null;
			this.insertingAnimation = null;
		},

		newAnimation: function() {
			this.insertingAnimation = new output.RobotAnimation(this.$robot);
			return this.insertingAnimation;
		},
		
		playAll: function() {
			if (this.runningAnimation === null) {
				this.runningAnimation = this.insertingAnimation;
				this.runningAnimation.playAll();
			} else if (this.insertingAnimation.animationString !== this.runningAnimation.animationString) {
				this.runningAnimation.remove();
				this.runningAnimation = this.insertingAnimation;
				this.runningAnimation.playAll();
			}
			this.insertingAnimation = null;
		},

		playLast: function() {
			if (this.runningAnimation === null) {
				this.runningAnimation = this.insertingAnimation;
				this.runningAnimation.playLast();
			} else if (this.insertingAnimation.animationString !== this.runningAnimation.animationString) {
				this.runningAnimation.remove();
				this.runningAnimation = this.insertingAnimation;
				this.runningAnimation.playLast();
			}
			this.insertingAnimation = null;
		},

		remove: function() {
			if (this.runningAnimation !== null) {
				this.runningAnimation.remove();
			}
			if (this.insertingAnimation !== null) {
				this.insertingAnimation.remove();
			}
		}
	};

	output.RobotAnimation.prototype = {
		init: function($robot) {
			this.$robot = $robot;
			
			this.rotationFactor = 0.6;
			this.detectWallLength = 40000;
			this.animationQueue = [];
			this.animationLength = 0;
			this.duration = 0.006;
			this.animateTimeout = null;
			this.currentAnimation = null;
			this.lastNumber = 0;
			this.animationString = '';
		},

		addMovement: function(x1, y1, x2, y2, angle) {
			var dx = (x2-x1)*blockSize, dy = (y2-y1)*blockSize;
			var length = Math.sqrt(dx*dx + dy*dy);
			this.animationQueue.push({
				type: 'movement', x: x1, y: y1, x2: x2, y2: y2, angle: angle, length: length
			});
			this.animationLength += length;
			this.animationString += 'm' + x1 + ',' + y1 + ',' + x2 + ',' + y2 + ',' + angle;
		},

		addRotation: function(x, y, angle1, angle2) {
			var length = Math.abs(angle2-angle1);
			this.animationQueue.push({
				type: 'rotation', x: x, y: y, angle: angle1, angle2: angle2, length: length
			});
			this.animationLength += length*this.rotationFactor;
			this.animationString += 'r' + x + ',' + y + ',' + angle1 + ',' + angle2;
		},

		addDetectWall: function(x, y, angle, wall) {
			this.animationQueue.push({
				type: 'wall', x: x, y: y, angle: angle, wall: wall
			});
			this.animationLength += this.detectWallLength;
			this.animationString += 'w' + x + ',' + y + ',' + angle + ',' + wall;
		},

		playAnimation: function(number) {
			this.$robot.show();
			setCss3(this.$robot, 'transition', '');
			this.$robot.off('transitionend webkitTransitionEnd MSTransitionEnd oTransitionEnd');

			var animation = this.animationQueue[number];
			this.number = number;
			this.setPosition(animation.x, animation.y);
			this.setOrientation(animation.angle);
			this.setLight('default');

			if (this.animateTimeout !== null) {
				clearTimeout(this.animateTimeout);
			}

			if (animation.type === 'wall') {
				this.setLight(animation.wall ? 'red' : 'green');
				this.animateTimeout = setTimeout($.proxy(this.animationEnd, this), this.duration*this.detectWallLength);
			} else {
				this.animateTimeout = setTimeout($.proxy(this.animationStart, this), 0);
				this.$robot.on('transitionend webkitTransitionEnd MSTransitionEnd oTransitionEnd', $.proxy(this.animationEnd, this));
			}
		},

		playAll: function() {
			if (this.animationQueue.length > 0) {
				this.lastNumber = this.animationQueue.length-1;
				this.playAnimation(0);
			}
		},

		playLast: function() {
			if (this.animationQueue.length > 0) {
				this.lastNumber = this.animationQueue.length-1;
				this.playAnimation(this.lastNumber);
			}
		},

		remove: function() {
			if (this.animateTimeout !== null) {
				clearTimeout(this.animateTimeout);
			}
			this.$robot.off('transitionend webkitTransitionEnd MSTransitionEnd oTransitionEnd');
			this.$robot.hide();
		},

		/// INTERNAL FUNCTIONS ///
		animationStart: function() {
			this.animateTimeout = null;
			var animation = this.animationQueue[this.number];
			var duration = this.duration*animation.length;

			if (animation.type === 'movement') {
				setCss3(this.$robot, 'transition', 'left ' + duration + 's ease-in-out, top ' + duration + 's ease-in-out');
				this.setPosition(animation.x2, animation.y2);
			} else if (animation.type === 'rotation') {
				duration = this.rotationFactor*duration;
				setCss3(this.$robot, 'transition', 'transform ' + duration + 's linear', true);
				this.setOrientation(animation.angle2);
			}
		},

		animationEnd: function() {
			this.animateTimeout = null;
			if (this.number < this.lastNumber) {
				this.playAnimation(this.number+1);
			}
		},

		setPosition: function(x, y) {
			this.$robot.css('left', x*blockSize);
			this.$robot.css('top', y*blockSize);
		},

		setOrientation: function(angle) {
			setCss3(this.$robot, 'transform', 'rotate(' + (90-angle) + 'deg)');
		},

		setLight: function(state) {
			this.$robot.removeClass('robot-green robot-red');
			if (state === 'red') {
				this.$robot.addClass('robot-red');
			} else if (state === 'green') {
				this.$robot.addClass('robot-green');
			}
		}
	};

	output.Robot.prototype = {
		init: function($div, editor, columns, rows) {
			this.columns = columns || 8;
			this.rows = rows || 8;

			this.$div = $div;
			this.$div.addClass('output robot');

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

			this.$robot = $('<div class="robot-robot"></div>');
			this.$container.append(this.$robot);
			this.$robot.hide();

			this.highlighting = false;
			this.highlightNext = false;
			this.animation = null;
			this.stateChangedCallback = null;
			this.animationManager = new output.RobotAnimationManager(this.$robot);

			this.initialState(columns, rows);
			this.clear();

			this.editor = editor;
			this.editor.addOutput(this);
		},

		remove: function() {
			this.clear();
			this.$container.children('.robot-maze-block .robot-maze-line-vertical, .robot-maze-line-horizontal').remove();
			this.animationManager.remove();

			this.$container.remove();
			this.$maze.remove();
			this.$path.remove();
			this.$initial.remove();
			this.$robot.remove();
			this.$div.removeClass('output robot');
			this.editor.removeOutput(this);
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
				var fromX = this.robotX, fromY = this.robotY;

				if (this.mazeObjects > 0) {
					var positive = amount > 0;
					for (var i=0; i<Math.abs(amount); i++) {
						if (this.isWall(this.robotX, this.robotY, positive ? this.robotAngle : (this.robotAngle + 180)%360)) {
							this.animation.addMovement(fromX, fromY, this.robotX, this.robotY, this.robotAngle);
							this.insertLine(node, fromX, fromY, this.robotX, this.robotY);
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
				this.insertLine(node, fromX, fromY, this.robotX, this.robotY);
				if (this.animation !== null) {
					this.animation.addMovement(fromX, fromY, this.robotX, this.robotY, this.robotAngle);
				}
			}
		},

		turn: function(node, name, args) {
			var amount = args[0] || 90;
			amount = (name === 'turnLeft' ? amount : -amount);

			var amountNormalized = ((amount%360)+360)%360;
			if (args.length > 1) {
				throw function(f) { return f(name) + ' accepts no more than' + f('1') + ' argument'; };
			} else if (typeof amount !== 'number' || !isFinite(amount)) {
				throw function(f) { return 'Argument has to be a valid number'; };
			} else if ([0, 90, 180, 270].indexOf(amountNormalized) < 0 && this.mazeObjects > 0) {
				throw function(f) { return 'Only 90, 180 and 270 degrees are allowed when the maze is not empty'; };
			} else {
				if (this.animation !== null) {
					this.animation.addRotation(this.robotX, this.robotY, this.robotAngle, this.robotAngle + amount);
				}
				this.robotAngle += amount;
				this.robotAngle = ((this.robotAngle%360)+360)%360;
				this.insertPoint(node, this.robotX, this.robotY, this.robotAngle);
			}
		},

		detectWall: function(node, name, args) {
			var wall = this.isWall(this.robotX, this.robotY, this.robotAngle);
			if (this.animation !== null) {
				this.animation.addDetectWall(this.robotX, this.robotY, this.robotAngle, wall);
			}
			return wall;
		},

		detectGoal: function(node, name, args) {
			if (this.mazeObjects <= 0) return false;
			else return this.blockGoal[this.robotX][this.robotY];
		},
		
		getAugmentedObject: function() {
			return {
				drive: {
					name: 'drive',
					type: 'function',
					example: 'drive(3)',
					func: $.proxy(this.drive, this)
				},
				turnLeft: {
					name: 'turnLeft',
					type: 'function',
					example: 'turnLeft()',
					func: $.proxy(this.turn, this)
				},
				turnRight: {
					name: 'turnRight',
					type: 'function',
					example: 'turnRight()',
					func: $.proxy(this.turn, this)
				},
				detectWall: {
					name: 'detectWall',
					type: 'function',
					example: 'detectWall()',
					func: $.proxy(this.detectWall, this)
				},
				detectGoal: {
					name: 'detectGoal',
					type: 'function',
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
			/*
			if (this.animation !== null) {
				this.animation.remove();
				this.animation = null;
			}
			*/
		},

		startRun: function() {
			this.clear();
			this.$container.removeClass('robot-error');
			this.animation = this.animationManager.newAnimation();
		},

		endRun: function() {
			this.animationManager.playAll();
		},

		endRunStepping: function() {
			this.animationManager.playLast();
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
			return JSON.stringify({
				columns: this.columns,
				rows: this.rows,
				initialX: this.initialX,
				initialY: this.initialY,
				initialAngle: this.initialAngle,
				mazeObjects: this.mazeObjects,
				verticalActive: verticalActive,
				horizontalActive: horizontalActive,
				blockGoal: blockGoal
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

		setStateChangedCallback: function(callback) {
			this.stateChangedCallback = callback;
		},

		setFocus: function() {
			this.animation.playAll();
		},

		/// INTERNAL FUNCTIONS ///
		drawInterface: function() {
			var x, y, $line, $block;

			this.width = this.columns * blockSize;
			this.height = this.rows * blockSize;
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
					$block.css('left', x*blockSize);
					$block.css('top', y*blockSize);
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
					$line.css('left', x*blockSize);
					$line.css('top', y*blockSize);
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
					$line.css('left', x*blockSize);
					$line.css('top', y*blockSize);
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
			this.$initial.css('left', this.initialX * blockSize);
			this.$initial.css('top', this.initialY * blockSize);
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
			this.stateChanged();
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
			this.stateChanged();
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

		insertLine: function(node, fromX, fromY, toX, toY) {
			var dy = (toY-fromY)*blockSize, dx = (toX-fromX)*blockSize;
			var angleRad = Math.atan2(dy, dx);
			var length = Math.sqrt(dx*dx+dy*dy);
			var $line = $('<div class="robot-path-line"><div class="robot-path-line-inside"></div></div>');
			this.$path.append($line);
			$line.width(length);
			setCss3($line, 'transform', 'rotate(' + (angleRad*180/Math.PI) + 'deg)');
			$line.css('left', fromX*blockSize + blockSize/2 + dx/2 - length/2);
			$line.css('top', fromY*blockSize + blockSize/2 + dy/2);
			if (this.highlightNext) {
				$line.addClass('robot-path-highlight');
			}
			$line.on('mousemove', $.proxy(this.pathMouseMove, this));
			$line.on('mouseleave', $.proxy(this.pathMouseLeave, this));
			$line.data('node', node);
		},

		insertPoint: function(node, x, y, angle) {
			var $point = $('<div class="robot-path-point"><div class="robot-path-point-inside"><div class="robot-path-point-arrow"></div></div></div>');
			this.$path.append($point);
			var angleRad = angle/180*Math.PI;
			// 5 = 0.5*@robot-path-point-arrow-hover
			$point.css('left', x*blockSize + blockSize/2 + 5*Math.cos(angleRad));
			$point.css('top', y*blockSize + blockSize/2 - 5*Math.sin(angleRad));
			setCss3($point, 'transform', 'rotate(' + (-angle) + 'deg)');
			if (this.highlightNext) {
				$point.addClass('robot-path-highlight');
			}
			$point.on('mousemove', $.proxy(this.pathMouseMove, this));
			$point.on('mouseleave', $.proxy(this.pathMouseLeave, this));
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

		pathMouseLeave: function(event) {
			if (this.highlighting) {
				this.$path.children('.robot-path-highlight').removeClass('robot-path-highlight');
				this.editor.highlightNode(null);
			}
		},

		initialMouseDown: function(event) {
			if (!this.draggingInitial) {
				this.draggingInitial = true;
				this.$container.on('mousemove', $.proxy(this.containerInitialMouseMove, this));
				this.$initial.addClass('robot-initial-dragging');
				event.preventDefault();
			}
		},

		containerMouseUp: function(event) {
			if (this.draggingInitial) {
				this.$container.off('mousemove');
				this.$initial.removeClass('robot-initial-dragging');
				this.draggingInitial = false;
			}
		},

		containerMouseLeave: function(event) {
			if (this.draggingInitial) {
				this.$container.off('mousemove');
				this.$initial.removeClass('robot-initial-dragging');
				this.draggingInitial = false;
			}
		},

		containerInitialMouseMove: function(event) {
			var $target = $(event.target);
			if ($target.hasClass('robot-maze-block')) {
				this.initialX = $target.data('x');
				this.initialY = $target.data('y');
				this.drawInitial();
				this.editor.outputRequestsRerun();
				this.stateChanged();
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
			this.stateChanged();
		},

		stateChanged: function() {
			if (this.stateChangedCallback !== null) {
				this.stateChangedCallback(this.getState());
			}
		}
	};
};
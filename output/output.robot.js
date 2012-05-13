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

		add: function(anim) {
			if (anim.type === 'movement') {
				var dx = (anim.x2-anim.x)*blockSize, dy = (anim.y2-anim.y)*blockSize;
				anim.length = Math.sqrt(dx*dx + dy*dy);
				if (anim.length <= 0) return;
				this.animationLength += anim.length;
			} else if (anim.type === 'rotation') {
				anim.length = Math.abs(anim.angle2-anim.angle);
				if (anim.length <= 0) return;
				this.animationLength += anim.length*this.rotationFactor;
			} else { // anim.type === 'wall'
				this.animationLength += this.detectWallLength;
			}
			this.animationQueue.push(anim);
			this.animationString += anim.type + ',' + anim.x + ',' + anim.y + ',' + anim.x2 + ',' + anim.y2 + ',' + anim.angle + ',' + anim.angle2 + ',';
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
			this.$robot.on('transitionend webkitTransitionEnd MSTransitionEnd oTransitionEnd', $.proxy(this.animationEnd, this));
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
			this.calls = [];
			this.callNr = Infinity;
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

		drive: function(context, name, args) {
			var amount = 1;
			if (args[0] !== undefined) {
				amount = args[0];
			}

			if (args.length > 1) {
				throw '<var>forward</var> accepts no more than <var>1</var> argument';
			} else if (typeof amount !== 'number' || !isFinite(amount)) {
				throw 'Argument has to be a valid number';
			} else if (Math.round(amount) !== amount && this.mazeObjects > 0) {
				throw 'Fractional amounts are only allowed when the maze is empty';
			} else if (amount !== 0) {
				var fromX = this.robotX, fromY = this.robotY, $element, anim;

				if (this.mazeObjects > 0) {
					var positive = amount > 0;
					for (var i=0; i<Math.abs(amount); i++) {
						if (this.isWall(this.robotX, this.robotY, positive ? this.robotAngle : (this.robotAngle + 180)%360)) {
							anim = {type: 'movement', x: fromX, y: fromY, x2: this.robotX, y2: this.robotY, angle: this.robotAngle};
							$element = this.insertLine(this.calls.length, fromX, fromY, this.robotX, this.robotY);
							this.calls.push({callNr: context.getCallNr(), node: context.getCallNode(), $element: $element, anim: anim});
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
				$element = this.insertLine(this.calls.length, fromX, fromY, this.robotX, this.robotY);
				anim = {type: 'movement', x: fromX, y: fromY, x2: this.robotX, y2: this.robotY, angle: this.robotAngle};
				this.calls.push({callNr: context.getCallNr(), node: context.getCallNode(), $element: $element, anim: anim});
			}
		},

		turn: function(context, name, args) {
			var amount = 90;
			if (args[0] !== undefined) {
				amount = args[0];
			}
			amount = (name === 'turnLeft' ? amount : -amount);

			var amountNormalized = ((amount%360)+360)%360;
			if (args.length > 1) {
				throw '<var>' + name + '</var> accepts no more than <var>1</var> argument';
			} else if (typeof amount !== 'number' || !isFinite(amount)) {
				throw 'Argument has to be a valid number';
			} else if ([0, 90, 180, 270].indexOf(amountNormalized) < 0 && this.mazeObjects > 0) {
				throw 'Only <var>90</var>, <var>180</var> and <var>270</var> degrees are allowed when the maze is not empty';
			} else {
				var anim = {type: 'rotation', x: this.robotX, y: this.robotY, angle: this.robotAngle, angle2: this.robotAngle+amount};
				this.robotAngle += amount;
				this.robotAngle = ((this.robotAngle%360)+360)%360;
				var $element = this.insertPoint(this.calls.length, this.robotX, this.robotY, this.robotAngle);
				this.calls.push({callNr: context.getCallNr(), node: context.getCallNode(), $element: $element, anim: anim});
			}
		},

		detectWall: function(context, name, args) {
			var wall = this.isWall(this.robotX, this.robotY, this.robotAngle);
			var anim = {type: 'wall', x: this.robotX, y: this.robotY, angle: this.robotAngle, wall: wall};
			this.calls.push({callNr: context.getCallNr(), node: context.getCallNode(), anim: anim});
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

		// startHighlighting: function() {
		// 	this.highlightNext = true;
		// },

		// stopHighlighting: function() {
		// 	this.highlightNext = false;
		// },

		enableHighlighting: function() {
			this.highlighting = true;
			this.$container.removeClass('robot-not-highlighting');
			this.$container.addClass('robot-highlighting');
		},

		disableHighlighting: function() {
			this.highlighting = false;
			this.$container.removeClass('robot-highlighting');
			this.$container.addClass('robot-not-highlighting');
			this.$path.children('.robot-path-highlight').removeClass('robot-path-highlight');
			/*
			if (this.animation !== null) {
				this.animation.remove();
				this.animation = null;
			}
			*/
		},

		startRun: function() {
			this.clear();
			this.calls = [];
			this.$container.removeClass('robot-error');
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

		setCallNr: function(context, callNr) {
			if (callNr !== this.callNr) {
				this.callNr = callNr;
			}
			this.update();
		},

		highlightCalls: function(calls) {
			this.$path.children('.robot-path-highlight').removeClass('robot-path-highlight');
			for (var i=0; i<this.calls.length; i++) {
				var call = this.calls[i];
				if (calls.indexOf(call.callNr) >= 0) {
					call.$element.addClass('robot-path-highlight');
				}
			}
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

		update: function() {
			this.$path.children('.robot-path-line, .robot-path-point').hide();
			this.animation = this.animationManager.newAnimation();
			for (var i=0; i<this.calls.length; i++) {
				var call = this.calls[i];
				if (call.callNr > this.callNr) break;
				if (call.$element !== undefined) call.$element.show();
				if (call.anim !== undefined) this.animation.add(call.anim);
			}
			if (this.callNr === Infinity) this.animationManager.playAll();
			else this.animationManager.playLast();
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

		insertLine: function(index, fromX, fromY, toX, toY) {
			var dy = (toY-fromY)*blockSize, dx = (toX-fromX)*blockSize;
			var angleRad = Math.atan2(dy, dx);
			var length = Math.sqrt(dx*dx+dy*dy);
			var $line = $('<div class="robot-path-line"><div class="robot-path-line-inside"></div></div>');
			this.$path.append($line);
			$line.width(length);
			setCss3($line, 'transform', 'rotate(' + (angleRad*180/Math.PI) + 'deg)');
			$line.css('left', fromX*blockSize + blockSize/2 + dx/2 - length/2);
			$line.css('top', fromY*blockSize + blockSize/2 + dy/2);
			// if (this.highlightNext) {
			// 	$line.addClass('robot-path-highlight');
			// }
			$line.on('mousemove', $.proxy(this.pathMouseMove, this));
			$line.on('mouseleave', $.proxy(this.pathMouseLeave, this));
			$line.data('index', index);
			return $line;
		},

		insertPoint: function(index, x, y, angle) {
			var $point = $('<div class="robot-path-point"><div class="robot-path-point-inside"><div class="robot-path-point-arrow"></div></div></div>');
			this.$path.append($point);
			var angleRad = angle/180*Math.PI;
			// 5 = 0.5*@robot-path-point-arrow-hover
			$point.css('left', x*blockSize + blockSize/2 + 5*Math.cos(angleRad));
			$point.css('top', y*blockSize + blockSize/2 - 5*Math.sin(angleRad));
			setCss3($point, 'transform', 'rotate(' + (-angle) + 'deg)');
			// if (this.highlightNext) {
			// 	$point.addClass('robot-path-highlight');
			// }
			$point.on('mousemove', $.proxy(this.pathMouseMove, this));
			$point.on('mouseleave', $.proxy(this.pathMouseLeave, this));
			$point.data('index', index);
			return $point;
		},

		pathMouseMove: function(event) {
			if (this.highlighting) {
				var $target = $(event.delegateTarget);
				if (this.calls[$target.data('index')] !== undefined) {
					if (!$target.hasClass('robot-path-highlight')) {
						this.$path.children('.robot-path-highlight').removeClass('robot-path-highlight');
						$target.addClass('robot-path-highlight');
						this.editor.highlightNode(this.calls[$target.data('index')].node);
					}
				} else {
					this.$path.children('.robot-path-highlight').removeClass('robot-path-highlight');
					this.editor.highlightNode(null);
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
			this.stateChanged();
		},

		stateChanged: function() {
			this.editor.outputRequestsRerun();
			if (this.stateChangedCallback !== null) {
				this.stateChangedCallback(this.getState());
			}
		}
	};
};
/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	var robot = require('../robot');
	var clayer = require('../clayer');
	var blockSize = 64;

	output.Robot = function() { return this.init.apply(this, arguments); };
	output.Robot.prototype = {
		init: function($div, editor, columns, rows) {
			this.columns = columns || 8;
			this.rows = rows || 8;

			this.$div = $div;
			this.$div.addClass('output robot');

			this.$container = $('<div class="robot-not-highlighting"></div>');
			this.$container.on('mouseup', $.proxy(this.containerMouseUp, this));
			this.$container.on('mouseleave', $.proxy(this.containerMouseLeave, this));
			this.$div.append(this.$container);
			this.robot = new robot.Robot(this.$container, columns, rows, blockSize);

			this.$initial = $('<div class="robot-robot robot-initial"></div>');
			this.$initial.on('mousedown', $.proxy(this.initialMouseDown, this));
			this.$initial.on('mouseup', $.proxy(this.initialMouseUp, this));
			this.$container.append(this.$initial);

			this.highlighting = false;
			this.animation = null;
			this.stateChangedCallback = null;
			this.calls = [];
			this.callNr = Infinity;

			this.updateInterface();
			this.clear();
			this.editor = editor;
			this.editor.addOutput(this);
		},

		remove: function() {
			this.robot.remove();
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
			} else if (Math.round(amount) !== amount && this.robot.mazeObjects > 0) {
				throw 'Fractional amounts are only allowed when the maze is empty';
			} else if (amount !== 0) {
				var x = this.robot.robotX, y = this.robot.robotY;

				if (this.robot.mazeObjects > 0) {
					var positive = amount > 0;
					for (var i=0; i<Math.abs(amount); i++) {
						if (this.isWall(x, y, positive ? this.robot.robotAngle : (this.robot.robotAngle + 180)%360)) {
							this.addCall(context, this.robot.insertLine(x, y));
							throw 'Robot ran into a wall';
						}
						if (this.robot.robotAngle === 0) {
							x += (positive ? 1 : -1);
						} else if (this.robot.robotAngle === 90) {
							y -= (positive ? 1 : -1);
						} else if (this.robot.robotAngle === 180) {
							x -= (positive ? 1 : -1);
						} else if (this.robot.robotAngle === 270) {
							y += (positive ? 1 : -1);
						}
					}
				} else {
					x += Math.cos(this.robot.robotAngle / 180 * Math.PI)*amount;
					y -= Math.sin(this.robot.robotAngle / 180 * Math.PI)*amount;
				}
				this.addCall(context, this.robot.insertLine(x, y));
			}
		},

		addCall: function(context, info) {
			if (this.calls.length > 300) {
				throw 'Program takes too long to run';
			}
			if (info.$element !== undefined) {
				info.$element.data('index', this.calls.length);
				info.$element.on('mousemove', $.proxy(this.pathMouseMove, this));
				info.$element.on('mouseleave', $.proxy(this.pathMouseLeave, this));
			}
			this.calls.push({callNr: context.getCallNr(), node: context.getCallNode(), info: info});
		},

		turn: function(context, name, args) {
			var amount = 90;
			if (args[0] !== undefined) {
				amount = args[0];
			}
			amount = (name === 'turnLeft' ? amount : -amount);

			if (args.length > 1) {
				throw '<var>' + name + '</var> accepts no more than <var>1</var> argument';
			} else if (typeof amount !== 'number' || !isFinite(amount)) {
				throw 'Argument has to be a valid number';
			} else if ([0, 90, 180, 270].indexOf((amount%360+360)%360) < 0 && this.robot.mazeObjects > 0) {
				throw 'Only <var>90</var>, <var>180</var> and <var>270</var> degrees are allowed when the maze is not empty';
			} else {
				this.addCall(context, this.robot.insertPoint(amount));
			}
		},

		detectWall: function(context, name, args) {
			var wall = this.isWall(this.robot.robotX, this.robot.robotY, this.robot.robotAngle);
			this.addCall(context, this.robot.insertDetectWall(wall));
			return wall;
		},

		detectGoal: function(node, name, args) {
			if (this.robot.mazeObjects <= 0) return false;
			else return this.robot.blockGoal[this.robot.robotX][this.robot.robotY];
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

		enableHighlighting: function() {
			this.highlighting = true;
			this.$container.removeClass('robot-not-highlighting');
			this.$container.addClass('robot-highlighting');
		},

		disableHighlighting: function() {
			this.highlighting = false;
			this.$container.removeClass('robot-highlighting');
			this.$container.addClass('robot-not-highlighting');
			this.robot.removeHighlights();
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
			this.robot.clear();
		},

		setState: function(state) {
			this.robot.setState(state);
			this.updateInterface();
		},

		setStateChangedCallback: function(callback) {
			this.stateChangedCallback = callback;
		},

		setFocus: function() {
			this.robot.playAll();
		},

		setCallNr: function(context, callNr) {
			if (callNr !== this.callNr) {
				this.callNr = callNr;
			}
			this.update();
		},

		highlightCalls: function(calls) {
			this.robot.removeHighlights();
			for (var i=0; i<this.calls.length; i++) {
				var call = this.calls[i];
				if (calls.indexOf(call.callNr) >= 0 && call.info.$element !== undefined) {
					call.info.$element.addClass('robot-path-highlight');
				}
			}
		},

		/// INTERNAL FUNCTIONS ///
		updateInterface: function() {
			$('.robot-maze-block').click($.proxy(this.clickBlock, this));
			$('.robot-maze-line-vertical').click($.proxy(this.clickVerticalLine, this));
			$('.robot-maze-line-horizontal').click($.proxy(this.clickHorizontalLine, this));
			this.drawInitial();
		},

		drawInitial: function() {
			this.$initial.css('left', this.robot.initialX * blockSize + blockSize/2);
			this.$initial.css('top', this.robot.initialY * blockSize + blockSize/2);
		},

		update: function() {
			this.robot.$path.children('.robot-path-line, .robot-path-point').hide();
			this.robot.animation = this.robot.animationManager.newAnimation();
			for (var i=0; i<this.calls.length; i++) {
				var call = this.calls[i];
				if (call.callNr > this.callNr) break;
				if (call.info.$element !== undefined) call.info.$element.show();
				if (call.info.anim !== undefined) this.robot.animation.add(call.info.anim);
			}
			if (this.callNr === Infinity) this.robot.playAll();
			else this.robot.playLast();
		},

		clickVerticalLine: function(event) {
			var $target = $(event.delegateTarget);
			var active = !this.robot.verticalActive[$target.data('x')][$target.data('y')];
			this.robot.verticalActive[$target.data('x')][$target.data('y')] = active;
			if (active) {
				this.robot.mazeObjects++;
				$target.addClass('robot-maze-line-active');
			} else {
				this.robot.mazeObjects--;
				$target.removeClass('robot-maze-line-active');
			}
			this.stateChanged();
		},

		clickHorizontalLine: function(event) {
			var $target = $(event.delegateTarget);
			var active = !this.robot.horizontalActive[$target.data('x')][$target.data('y')];
			this.robot.horizontalActive[$target.data('x')][$target.data('y')] = active;
			if (active) {
				this.robot.mazeObjects++;
				$target.addClass('robot-maze-line-active');
			} else {
				this.robot.mazeObjects--;
				$target.removeClass('robot-maze-line-active');
			}
			this.stateChanged();
		},
		
		isWall: function(x, y, angle) {
			if (this.robot.mazeObjects <= 0) {
				return false;
			} else {
				if (angle === 0) {
					if (x >= this.columns-1 || this.robot.verticalActive[x+1][y]) {
						return true;
					}
				} else if (angle === 90) {
					if (y <= 0 || this.robot.horizontalActive[x][y]) {
						return true;
					}
				} else if (angle === 180) {
					if (x <= 0 || this.robot.verticalActive[x][y]) {
						return true;
					}
				} else if (angle === 270) {
					if (y >= this.rows-1 || this.robot.horizontalActive[x][y+1]) {
						return true;
					}
				}
				return false;
			}
		},

		pathMouseMove: function(event) {
			if (this.highlighting) {
				var $target = $(event.delegateTarget);
				if (this.calls[$target.data('index')] !== undefined) {
					if (!$target.hasClass('robot-path-highlight')) {
						this.robot.removeHighlights();
						$target.addClass('robot-path-highlight');
						this.editor.highlightNode(this.calls[$target.data('index')].node);
					}
				} else {
					this.robot.removeHighlights();
					this.editor.highlightNode(null);
				}
			}
		},

		pathMouseLeave: function(event) {
			if (this.highlighting) {
				this.robot.removeHighlights();
				this.editor.highlightNode(null);
			}
		},

		initialMouseDown: function(event) {
			var offset = this.$container.offset();
			if (!this.draggingInitial) {
				this.draggingInitial = true;
				this.dragX = (event.pageX - offset.left)%blockSize - blockSize/2;
				this.dragY = (event.pageY - offset.top)%blockSize - blockSize/2;
				this.$container.on('mousemove', $.proxy(this.containerMouseMove, this));
				this.$initial.addClass('robot-initial-dragging');
				event.preventDefault();
			}
		},

		containerMouseUp: function(event) {
			if (this.draggingInitial) {
				this.$container.off('mousemove');
				this.$initial.removeClass('robot-initial-dragging');
				this.draggingInitial = false;
				this.drawInitial();
			}
		},

		containerMouseLeave: function(event) {
			if (this.draggingInitial) {
				this.$container.off('mousemove');
				this.$initial.removeClass('robot-initial-dragging');
				this.draggingInitial = false;
				this.drawInitial();
			}
		},

		containerMouseMove: function(event) {
			var offset = this.$container.offset();
			var x = Math.floor((event.pageX - offset.left)/blockSize);
			var y = Math.floor((event.pageY - offset.top)/blockSize);

			if (x !== this.robot.initialX || y !== this.robot.initalY) {
				this.robot.initialX = x;
				this.robot.initialY = y;
				this.stateChanged();
			}
			this.$initial.css('left', event.pageX - offset.left - this.dragX);
			this.$initial.css('top', event.pageY - offset.top - this.dragY);
		},

		clickBlock: function(event) {
			var $target = $(event.delegateTarget);
			var goal = !this.robot.blockGoal[$target.data('x')][$target.data('y')];
			this.robot.blockGoal[$target.data('x')][$target.data('y')] = goal;
			if (goal) {
				this.robot.mazeObjects++;
				$target.addClass('robot-maze-block-goal');
			} else {
				this.robot.mazeObjects--;
				$target.removeClass('robot-maze-block-goal');
			}
			this.stateChanged();
		},

		stateChanged: function() {
			this.editor.outputRequestsRerun();
			if (this.stateChangedCallback !== null) {
				this.stateChangedCallback(this.robot.getState());
			}
		}
	};
};
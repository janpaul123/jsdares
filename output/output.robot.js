/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	var robot = require('../robot');
	var clayer = require('../clayer');
	var blockSize = 64;

	output.Robot = function() { return this.init.apply(this, arguments); };
	output.Robot.prototype = {
		init: function($div, editor, readOnly, columns, rows) {
			this.$div = $div;
			this.$div.addClass('output robot');
			this.readOnly = readOnly || false;

			this.$container = $('<div class="robot-not-highlighting"></div>');
			this.$container.on('mouseup', $.proxy(this.containerMouseUp, this));
			this.$container.on('mouseleave', $.proxy(this.containerMouseLeave, this));
			this.$div.append(this.$container);
			this.robot = new robot.Robot(this.$container, this.readOnly, blockSize, columns || 8, rows || 8);

			this.callNr = Infinity;
			this.highlighting = false;
			this.animation = null;
			this.stateChangedCallback = null;
			this.calls = [];

			if (!this.readOnly) {
				this.robot.$initial.on('mousedown', $.proxy(this.initialMouseDown, this));
				this.robot.$initial.on('mouseup', $.proxy(this.initialMouseUp, this));
				this.updateInterface();
			}

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
				try {
					this.robot.drive(amount);
				} catch (error) {
					this.addCall(context);
					throw error;
				}
				this.addCall(context);
			}
		},

		turn: function(context, name, args) {
			var amount = 90;
			if (args[0] !== undefined) {
				amount = args[0];
			}

			if (args.length > 1) {
				throw '<var>' + name + '</var> accepts no more than <var>1</var> argument';
			} else if (typeof amount !== 'number' || !isFinite(amount)) {
				throw 'Argument has to be a valid number';
			} else if ([0, 90, 180, 270].indexOf((amount%360+360)%360) < 0 && this.robot.mazeObjects > 0) {
				throw 'Only <var>90</var>, <var>180</var> and <var>270</var> degrees are allowed when the maze is not empty';
			} else {
				this.robot[name](amount);
				this.addCall(context);
			}
		},

		detectWall: function(context, name, args) {
			var wall = this.robot.detectWall();
			this.addCall(context);
			return wall;
		},

		detectGoal: function(node, name, args) {
			return this.robot.detectGoal();
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
			this.robot.clear();
			this.calls = [];
			this.$container.removeClass('robot-error');
		},

		hasError: function() {
			this.$container.addClass('robot-error');
			this.robot.stop();
		},

		setState: function(state) {
			this.robot.setState(state);
			this.updateInterface();
		},

		setStateChangedCallback: function(callback) {
			this.stateChangedCallback = callback;
		},

		setFocus: function() {
			this.robot.animationManager.playAll();
		},

		setCallNr: function(context, callNr) {
			this.callNr = callNr;
			if (this.callNr === Infinity) {
				this.robot.$path.children('.robot-path-line, .robot-path-point').show();
				this.robot.animationManager.playAll();
			} else {
				this.robot.$path.children('.robot-path-line, .robot-path-point').hide();
				var call;
				for (var i=0; i<this.calls.length; i++) {
					if (this.calls[i].callNr > this.callNr) break;
					call = this.calls[i];
					if (call.$element !== null) call.$element.show();
				}
				if (call !== undefined) {
					if (call.callNr === this.callNr) {
						this.robot.animationManager.playAnimNum(call.animNum);
					} else {
						this.robot.animationManager.setAnimNumEnd(call.animNum);
					}
				} else {
					this.robot.animationManager.playNone();
				}
			}
		},

		highlightCalls: function(calls) {
			this.robot.removeHighlights();
			for (var i=0; i<this.calls.length; i++) {
				var call = this.calls[i];
				if (calls.indexOf(call.callNr) >= 0 && call.$element !== null) {
					call.$element.addClass('robot-path-highlight');
				}
			}
		},

		getVisitedGoals: function() {
			return this.robot.visitedGoals;
		},

		/// INTERNAL FUNCTIONS ///
		addCall: function(context) {
			if (this.calls.length > 300) {
				throw 'Program takes too long to run';
			}
			var $element = this.robot.$lastElement;
			if ($element !== null) {
				$element.data('index', this.calls.length);
				$element.on('mousemove', $.proxy(this.pathMouseMove, this));
				$element.on('mouseleave', $.proxy(this.pathMouseLeave, this));
			}
			this.calls.push({callNr: context.getCallNr(), node: context.getCallNode(), $element: $element, animNum: this.robot.animation.getLength()-1});
		},

		updateInterface: function() {
			if (!this.readOnly) {
				$('.robot-maze-block').click($.proxy(this.clickBlock, this));
				$('.robot-maze-line-vertical').click($.proxy(this.clickVerticalLine, this));
				$('.robot-maze-line-horizontal').click($.proxy(this.clickHorizontalLine, this));
			}
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
				this.robot.$initial.addClass('robot-initial-dragging');
				event.preventDefault();
			}
		},

		containerMouseUp: function(event) {
			if (this.draggingInitial) {
				this.$container.off('mousemove');
				this.robot.$initial.removeClass('robot-initial-dragging');
				this.draggingInitial = false;
				this.robot.drawInitial();
			}
		},

		containerMouseLeave: function(event) {
			if (this.draggingInitial) {
				this.$container.off('mousemove');
				this.robot.$initial.removeClass('robot-initial-dragging');
				this.draggingInitial = false;
				this.robot.drawInitial();
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
			this.robot.$initial.css('left', event.pageX - offset.left - this.dragX);
			this.robot.$initial.css('top', event.pageY - offset.top - this.dragY);
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
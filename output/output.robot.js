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

			this.highlighting = false;
			this.stateChangedCallback = null;

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
					info: 'robot.drive',
					type: 'function',
					example: 'drive(3)',
					func: $.proxy(this.drive, this)
				},
				turnLeft: {
					name: 'turnLeft',
					info: 'robot.turnLeft',
					type: 'function',
					example: 'turnLeft()',
					func: $.proxy(this.turn, this)
				},
				turnRight: {
					name: 'turnRight',
					info: 'robot.turnRight',
					type: 'function',
					example: 'turnRight()',
					func: $.proxy(this.turn, this)
				},
				detectWall: {
					name: 'detectWall',
					info: 'robot.detectWall',
					type: 'function',
					example: 'detectWall()',
					func: $.proxy(this.detectWall, this)
				},
				detectGoal: {
					name: 'detectGoal',
					info: 'robot.detectGoal',
					type: 'function',
					example: 'detectGoal()',
					func: $.proxy(this.detectGoal, this)
				}
			};
		},

		outputStartEvent: function(context) {
			var event = {
				robotX: this.robot.robotX,
				robotY: this.robot.robotY,
				robotAngle: this.robot.robotAngle,
				startAnimNum: this.robot.animation.animationQueue.length,
				endAnimNum: this.robot.animation.animationQueue.length,
				calls: []
			};
			this.eventPosition = this.events.length;
			this.events.push(event);
		},

		outputEndEvent: function() {
			this.updateEventHighlight();
			this.robot.animationManager.play(this.events[this.eventPosition].startAnimNum, this.events[this.eventPosition].endAnimNum);
		},

		outputClearAll: function() {
			this.robot.clear();
			this.eventStart = 0;
			this.eventPosition = 0;
			this.events = [];
			this.callCounter = 0;
		},

		outputPopFront: function() {
			this.eventStart++;
		},

		outputClearEventsFrom: function(eventNum) {
			var position = this.eventStart+eventNum;
			this.robot.robotX = this.events[position].robotX;
			this.robot.robotY = this.events[position].robotY;
			this.robot.robotAngle = this.events[position].robotAngle;
			for (var i=position; i<this.events.length; i++) {
				for (var j=0; j<this.events[i].calls.length; j++) {
					var call = this.events[i].calls[j];
					this.callCounter--;
					if (call.$element !== null) {
						call.$element.remove();
					}
				}
			}
			this.events = this.events.slice(0, eventNum);
		},

		outputClearToEnd: function() {
			this.eventStart = this.events.length;
		},

		outputSetError: function(error) {
			if (error) {
				this.$container.addClass('robot-error');
				this.robot.stop();
			} else {
				this.$container.removeClass('robot-error');
			}
		},

		outputSetEventStep: function(eventNum, stepNum) {
			if (this.eventPosition !== this.eventStart + eventNum || this.stepNum !== stepNum) {
				this.eventPosition = this.eventStart + eventNum;
				this.stepNum = stepNum;

				this.robot.$path.children('.robot-path-line, .robot-path-point').hide();
				for (var i=0; i<this.events.length; i++) {
					if (i > this.eventPosition) break;
					for (var j=0; j<this.events[i].calls.length; j++) {
						var call = this.events[i].calls[j];
						if (i === this.eventPosition && call.stepNum > this.stepNum) break;

						if (call.$element !== null) {
							call.$element.show();
						}
					}
				}

				if (this.highlighting) {
					this.updateEventHighlight();
				}

				if (this.stepNum === Infinity) {
					this.robot.animationManager.play(this.events[this.eventPosition].startAnimNum, this.events[this.eventPosition].endAnimNum);
				} else {
					var lastAnimNum = null;
					for (var i=0; i<this.events[this.eventPosition].calls.length; i++) {
						var call = this.events[this.eventPosition].calls[i];
						if (call.stepNum > this.stepNum) break;

						lastAnimNum = call.animNum;
						if (call.stepNum === this.stepNum) {
							this.robot.animationManager.play(call.animNum, call.animNum+1);
							lastAnimNum = false;
							break;
						}
					}

					if (lastAnimNum === null) {
						this.robot.animationManager.play(this.events[this.eventPosition].startAnimNum, this.events[this.eventPosition].startAnimNum);
					} else if (lastAnimNum !== false) {
						this.robot.animationManager.play(lastAnimNum+1, lastAnimNum+1);
					}
				}
			}
		},

		enableHighlighting: function() {
			this.highlighting = true;
			this.$container.removeClass('robot-not-highlighting');
			this.$container.addClass('robot-highlighting');
			this.updateEventHighlight();
		},

		disableHighlighting: function() {
			this.highlighting = false;
			this.$container.removeClass('robot-highlighting');
			this.$container.addClass('robot-not-highlighting');
			this.robot.removeAllHighlights();
		},

		updateEventHighlight: function() {
			this.robot.removeAllHighlights();
			if (this.highlighting) {
				for (var i=0; i<this.events[this.eventPosition].calls.length; i++) {
					var call = this.events[this.eventPosition].calls[i];
					if (call.$element !== null) {
						call.$element.addClass('robot-path-highlight-event');
					}
				}
			}
		},

		setState: function(state) {
			this.robot.setState(state);
			this.updateInterface();
		},

		setStateChangedCallback: function(callback) {
			this.stateChangedCallback = callback;
		},

		setFocus: function() {
			this.robot.animationManager.play(this.events[this.eventPosition].startAnimNum, this.events[this.eventPosition].endAnimNum);
		},

		highlightCallNodes: function(nodeIds) {
			this.robot.removePathHighlights();
			for (var i=0; i<this.events[this.eventPosition].calls.length; i++) {
				var call = this.events[this.eventPosition].calls[i];
				if (nodeIds.indexOf(call.nodeId) >= 0 && call.$element !== null) {
					call.$element.addClass('robot-path-highlight');
				}
			}
		},

		getVisitedGoals: function() {
			return this.robot.visitedGoals;
		},

		highlightVisitedGoal: function(goal) {
			this.robot.highlightVisitedGoal(goal);
		},

		/// INTERNAL FUNCTIONS ///
		addCall: function(context) {
			if (this.callCounter++ > 300) {
				throw 'Program takes too long to run';
			}
			var $element = this.robot.$lastElement;
			if ($element !== null) {
				$element.data('eventPosition', this.eventPosition);
				$element.data('index', this.events[this.eventPosition].calls.length);
				$element.on('mousemove', $.proxy(this.pathMouseMove, this));
				$element.on('mouseleave', $.proxy(this.pathMouseLeave, this));
			}
			this.events[this.eventPosition].calls.push({
				stepNum: context.getStepNum(),
				nodeId: context.getCallNodeId(),
				$element: $element,
				animNum: this.robot.animation.getLength()-1
				//anim: this.robot.lastAnim
			});
			this.events[this.eventPosition].endAnimNum = this.robot.animation.getLength();
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
				if ($target.data('eventPosition') === this.eventPosition &&
						this.events[this.eventPosition].calls[$target.data('index')] !== undefined) {
					if (!$target.hasClass('robot-path-highlight')) {
						this.robot.removePathHighlights();
						$target.addClass('robot-path-highlight');
						this.editor.highlightNodeId(this.events[this.eventPosition].calls[$target.data('index')].nodeId);
					}
				} else {
					this.robot.removeHighlights();
					this.editor.highlightNodeId(0);
				}
			}
		},

		pathMouseLeave: function(event) {
			if (this.highlighting) {
				this.robot.removePathHighlights();
				this.editor.highlightNodeId(0);
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
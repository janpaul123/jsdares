/*jshint node:true jquery:true*/
"use strict";

var robot = require('../robot');
var clayer = require('../clayer');
var blockSize = 64;

var getScopeObjects = function() {
	return {robot: this.getAugmentedObject()};
};

var getAugmentedObject = function() {
	return {
		type: 'object',
		string: '[object robot]',
		properties: {
			drive: {
				name: 'drive',
				info: 'robot.drive',
				type: 'function',
				example: 'drive(3)',
				string: '[function robot.drive]',
				func: _(this.drive).bind(this),
				cost: 0.7
			},
			turnLeft: {
				name: 'turnLeft',
				info: 'robot.turnLeft',
				type: 'function',
				example: 'turnLeft()',
				string: '[function robot.turnLeft]',
				func: _(this.turn).bind(this),
				cost: 0.7
			},
			turnRight: {
				name: 'turnRight',
				info: 'robot.turnRight',
				type: 'function',
				example: 'turnRight()',
				string: '[function robot.turnRight]',
				func: _(this.turn).bind(this),
				cost: 0.7
			},
			detectWall: {
				name: 'detectWall',
				info: 'robot.detectWall',
				type: 'function',
				example: 'detectWall()',
				string: '[function robot.detectWall]',
				func: _(this.detectWall).bind(this),
				cost: 0.2
			},
			detectGoal: {
				name: 'detectGoal',
				info: 'robot.detectGoal',
				type: 'function',
				example: 'detectGoal()',
				string: '[function robot.detectGoal]',
				func: _(this.detectGoal).bind(this),
				cost: 0.2
			}
		}
	};
};

var drive = function(object, args) {
	var amount = 1;
	if (args[0] !== undefined) {
		amount = args[0];
	}

	if (args.length > 1) {
		throw '<var>forward</var> accepts no more than <var>1</var> argument';
	} else if (typeof amount !== 'number' || !isFinite(amount)) {
		throw 'Argument has to be a valid number';
	} else if (Math.round(amount) !== amount && object.state.mazeObjects > 0) {
		throw 'Fractional amounts are only allowed when the maze is empty';
	} else if (amount !== 0) {
		var goals = null;
		if (object.state.mazeObjects > 0) {
			var positive = amount > 0;

			for (var i=0; i<Math.abs(amount); i++) {
				if (isWall(object, object.robotX, object.robotY, positive ? object.robotAngle : (object.robotAngle + 180)%360)) {
					throw 'Robot ran into a wall';
				}
				if (object.robotAngle === 0) {
					object.robotX += (positive ? 1 : -1);
				} else if (object.robotAngle === 90) {
					object.robotY -= (positive ? 1 : -1);
				} else if (object.robotAngle === 180) {
					object.robotX -= (positive ? 1 : -1);
				} else if (object.robotAngle === 270) {
					object.robotY += (positive ? 1 : -1);
				}
				if (object.state.blockGoal[object.robotX][object.robotY]) {
					var goal = {x: object.robotX, y: object.robotY, amount: i+1};
					if (goals === null) {
						goals = [goal];
					} else {
						goals.push(goal);
					}

					if (object.visitedGoals.indexOf(object.robotX+object.robotY*object.state.columns) < 0) {
						object.visitedGoals.push(object.robotX+object.robotY*object.state.columns);
					}
				}
			}
		} else {
			object.robotX += Math.cos(object.robotAngle / 180 * Math.PI)*amount;
			object.robotY -= Math.sin(object.robotAngle / 180 * Math.PI)*amount;
		}
		return goals;
	} else {
		return null;
	}
};

var turn = function(object, name, args) {
	var amount = 90;
	if (args[0] !== undefined) {
		amount = args[0];
	}

	if (args.length > 1) {
		throw '<var>' + name + '</var> accepts no more than <var>1</var> argument';
	} else if (typeof amount !== 'number' || !isFinite(amount)) {
		throw 'Argument has to be a valid number';
	} else if ([0, 90, 180, 270].indexOf((amount%360+360)%360) < 0 && object.state.mazeObjects > 0) {
		throw 'Only <var>90</var>, <var>180</var> and <var>270</var> degrees are allowed when the maze is not empty';
	} else {
		if (name === 'turnRight') amount = -amount;
		object.robotAngle = ((object.robotAngle+amount)%360+360)%360;
		return amount;
	}
};

var isWall = function(object, x, y, angle) {
	if (object.state.mazeObjects <= 0) {
		return false;
	} else {
		if (angle === 0) {
			if (x >= object.state.columns-1 || object.state.verticalActive[x+1][y]) {
				return true;
			}
		} else if (angle === 90) {
			if (y <= 0 || object.state.horizontalActive[x][y]) {
				return true;
			}
		} else if (angle === 180) {
			if (x <= 0 || object.state.verticalActive[x][y]) {
				return true;
			}
		} else if (angle === 270) {
			if (y >= object.state.rows-1 || object.state.horizontalActive[x][y+1]) {
				return true;
			}
		}
		return false;
	}
};

var detectGoal = function(object) {
	if (object.state.mazeObjects <= 0) return false;
	else return object.state.blockGoal[object.robotX][object.robotY];
};

module.exports = function(output) {
	output.SimpleRobot = function() { return this.init.apply(this, arguments); };
	output.SimpleRobot.prototype = {
		getScopeObjects: getScopeObjects,
		getAugmentedObject: getAugmentedObject,

		init: function(state) {
			this.calls = [];
			this.state = JSON.parse(state);
			this.robotX = this.state.initialX;
			this.robotY = this.state.initialY;
			this.robotAngle = this.state.initialAngle;
			this.visitedGoals = [];
		},

		drive: function(context, name, args) {
			var goals = null, fromX = this.robotX, fromY = this.robotY;
			try {
				goals = drive(this, args);
			} finally {
				this.calls.push({name: 'insertLine', args: [fromX, fromY, this.robotX, this.robotY, this.robotAngle, goals]});
			}
		},

		turn: function(context, name, args) {
			var fromAngle = this.robotAngle, amount = turn(this, name, args);
			this.calls.push({name: 'insertPoint', args: [this.robotX, this.robotY, fromAngle, amount]});
		},

		detectWall: function(context, name, args) {
			var wall = isWall(this, this.robotX, this.robotY, this.robotAngle);
			this.calls.push({name: 'insertDetectWall', args: [this.robotX, this.robotY, this.robotAngle, wall]});
			return wall;
		},

		detectGoal: function(context, name, args) {
			return detectGoal(this);
		},

		getCalls: function() {
			return this.calls;
		},

		play: function(robot) {
			for (var i=0; i<this.calls.length; i++) {
				robot[this.calls[i].name].apply(robot, this.calls[i].args);
			}
		}
	};

	output.Robot = function() { return this.init.apply(this, arguments); };
	output.Robot.prototype = {
		getScopeObjects: getScopeObjects,
		getAugmentedObject: getAugmentedObject,

		init: function(editor, options, $div) {
			this.$div = $div;
			this.$div.addClass('output robot');
			this.readOnly = options.readOnly || false;

			this.$container = $('<div class="robot-not-highlighting"></div>');
			this.$container.on('mouseup', _(this.containerMouseUp).bind(this));
			this.$container.on('mouseleave', _(this.containerMouseLeave).bind(this));
			this.$div.append(this.$container);

			this.highlighting = false;
			this.stateChangeCallback = null;

			if (options.state !== undefined && options.state.length > 0) this.state = JSON.parse(options.state);
			else this.initialState(options);

			this.robot = new robot.Robot(this.$container, this.readOnly, blockSize);
			this.robot.state = this.state;
			this.robot.drawInterface();

			if (!this.readOnly) {
				this.$container.addClass('robot-interactive');
				this.robot.$initial.on('mousedown', _(this.initialMouseDown).bind(this));
				this.updateInterface();
			}

			this.editor = editor;
			this.error = false;
		},

		remove: function() {
			this.robot.remove();
			this.$div.removeClass('output robot');
		},

		drive: function(context, name, args) {
			var goals = null, fromX = this.robotX, fromY = this.robotY;
			try {
				goals = drive(this, args);
			} finally {
				this.robot.insertLine(fromX, fromY, this.robotX, this.robotY, this.robotAngle, goals);
				this.addCall(context);
			}
		},

		turn: function(context, name, args) {
			var fromAngle = this.robotAngle, amount = turn(this, name, args);
			this.robot.insertPoint(this.robotX, this.robotY, fromAngle, amount);
			this.addCall(context);
		},

		detectWall: function(context, name, args) {
			var wall = isWall(this, this.robotX, this.robotY, this.robotAngle);
			this.robot.insertDetectWall(this.robotX, this.robotY, this.robotAngle, wall);
			this.addCall(context);
			return wall;
		},

		detectGoal: function(node, name, args) {
			return detectGoal(this);
		},

		outputStartEvent: function(context) {
			var event = {
				robotX: this.robotX,
				robotY: this.robotY,
				robotAngle: this.robotAngle,
				startAnimNum: this.robot.animation.animationQueue.length,
				endAnimNum: this.robot.animation.animationQueue.length,
				calls: [],
				visitedGoals: this.visitedGoals.slice(0)
			};
			this.eventPosition = this.events.length;
			this.events.push(event);
			this.stepNum = Infinity;
		},

		outputEndEvent: function() {
			this.updateEventHighlight();
			this.robot.animationManager.play(this.events[this.eventPosition].startAnimNum, this.events[this.eventPosition].endAnimNum);
		},

		outputClearAllEvents: function() {
			this.robot.clear();
			this.eventStart = 0;
			this.eventPosition = 0;
			this.events = [];
			this.callCounter = 0;
			this.robotX = this.state.initialX;
			this.robotY = this.state.initialY;
			this.robotAngle = this.state.initialAngle;
			this.visitedGoals = [];
		},

		outputPopFirstEvent: function() {
			this.eventStart++;
		},

		outputClearEventsFrom: function(eventNum) {
			var position = this.eventStart+eventNum;
			this.robotX = this.events[position].robotX;
			this.robotY = this.events[position].robotY;
			this.robotAngle = this.events[position].robotAngle;
			this.visitedGoals = this.events[position].visitedGoals; // .slice(0) copying not necessary, state gets deleted anyway
			for (var i=position; i<this.events.length; i++) {
				for (var j=0; j<this.events[i].calls.length; j++) {
					var call = this.events[i].calls[j];
					this.callCounter--;
					if (call.$element !== null) {
						call.$element.remove();
					}
				}
			}
			this.robot.animation.removeFromAnimNum(this.events[position].startAnimNum+1);
			this.events = this.events.slice(0, position);
		},

		outputClearEventsToEnd: function() {
			this.eventStart = this.events.length;
		},

		outputSetError: function(error) {
			if (error) {
				this.error = true;
				this.$container.addClass('robot-error');
				this.robot.stop();
			} else {
				this.error = false;
				this.$container.removeClass('robot-error');
			}
		},

		outputSetEventStep: function(eventNum, stepNum) {
			if (this.eventPosition !== this.eventStart + eventNum || this.stepNum !== stepNum) {
				this.eventPosition = this.eventStart + eventNum;
				this.stepNum = stepNum;

				this.robot.$path.children('.robot-path-line, .robot-path-point').addClass('robot-path-hidden');
				this.robot.$path.children('.robot-path-highlight-step').removeClass('robot-path-highlight-step');
				for (var i=0; i<this.events.length; i++) {
					if (i > this.eventPosition) break;
					for (var j=0; j<this.events[i].calls.length; j++) {
						var call = this.events[i].calls[j];
						if (i === this.eventPosition) {
							if (call.stepNum === this.stepNum && call.$element !== null) call.$element.addClass('robot-path-highlight-step');
							else if (call.stepNum > this.stepNum) break;
						}

						if (call.$element !== null) {
							call.$element.removeClass('robot-path-hidden');
						}
					}
				}
			}

			if (!this.error) {
				if (this.stepNum === Infinity) {
					this.robot.animationManager.play(this.events[this.eventPosition].startAnimNum, this.events[this.eventPosition].endAnimNum);
				} else {
					var lastAnimNum = null;
					for (var i=0; i<this.events[this.eventPosition].calls.length; i++) {
						var call = this.events[this.eventPosition].calls[i];
						if (call.stepNum > this.stepNum) break;

						if (call.stepNum === this.stepNum) {
							this.robot.animationManager.play(call.animNum, call.animNum+1);
							lastAnimNum = false;
							break;
						} else {
							lastAnimNum = call.animNum;
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
			this.robot.removeEventHighlights();
			this.robot.removePathHighlights();
		},

		enableEventHighlighting: function() {
			this.$container.addClass('robot-highlighting-current-event');
			this.updateEventHighlight();
		},

		disableEventHighlighting: function() {
			this.$container.removeClass('robot-highlighting-current-event');
		},

		updateEventHighlight: function() {
			this.robot.removeEventHighlights();
			if (this.highlighting) {
				for (var i=0; i<this.events[this.eventPosition].calls.length; i++) {
					var call = this.events[this.eventPosition].calls[i];
					if (call.$element !== null) {
						call.$element.addClass('robot-path-highlight-event');
					}
				}
			}
		},

		highlightCallIds: function(callIds) {
			this.robot.removePathHighlights();
			if (callIds !== null) {
				for (var i=0; i<this.events[this.eventPosition].calls.length; i++) {
					var call = this.events[this.eventPosition].calls[i];
					if (callIds.indexOf(call.callId) >= 0 && call.$element !== null) {
						call.$element.addClass('robot-path-highlight');
					}
				}
			}
		},

		highlightTimeIds: function(timeIds) {
			this.robot.removeTimeHighlights();
			if (timeIds !== null) {
				for (var i=this.eventStart; i<this.events.length; i++) {
					for (var j=0; j<this.events[i].calls.length; j++) {
						var call = this.events[i].calls[j];

						if (timeIds[i-this.eventStart].indexOf(call.callId) >= 0 && call.$element !== null) {
							call.$element.addClass('robot-path-highlight-time');
						}
					}
				}
			}
		},

		setState: function(state) {
			this.state = JSON.parse(state);
			this.robot.state = this.state;
			this.robot.drawInterface();
			this.updateInterface();
			this.stateChanged();
		},

		initialState: function(options) {
			var columns = options.columns || 8, rows = options.rows || 8;
			this.state = {
				columns: columns,
				rows: rows,
				initialX: Math.floor(columns/2),
				initialY: rows-1,
				initialAngle: 90,
				mazeObjects: 0,
				verticalActive: [],
				horizontalActive: [],
				blockGoal: []
			};
			for (var x=0; x<columns; x++) {
				this.state.verticalActive[x] = [];
				this.state.horizontalActive[x] = [];
				this.state.blockGoal[x] = [];
				for (var y=0; y<rows; y++) {
					this.state.verticalActive[x][y] = false;
					this.state.horizontalActive[x][y] = false;
					this.state.blockGoal[x][y] = false;
				}
			}
		},

		setStateChangeCallback: function(callback) {
			this.stateChangeCallback = callback;
		},

		getVisitedGoals: function() {
			return this.visitedGoals.slice(0);
		},

		highlightVisitedGoal: function(goal) {
			this.robot.highlightVisitedGoal(goal);
		},

		getMouseElement: function() {
			//return this.$container;
			return null; // no support for now
		},

		setFocus: function() {
			this.robot.animationManager.replay();
		},

		getState: function() {
			return JSON.stringify(this.state);
		},

		getTotalGoals: function() {
			var total = 0;
			for (var x=0; x<this.state.columns; x++) {
				for (var y=0; y<this.state.rows; y++) {
					if (this.state.blockGoal[x][y]) total++;
				}
			}
			return total;
		},

		/// INTERNAL FUNCTIONS ///
		addCall: function(context) {
			if (this.callCounter++ > 300) {
				context.throwTimeout();
			}
			var $element = this.robot.$lastElement;
			if ($element !== null) {
				$element.data('eventPosition', this.eventPosition);
				$element.data('index', this.events[this.eventPosition].calls.length);
				$element.on('mousemove', _(this.pathMouseMove).bind(this));
				$element.on('mouseleave', _(this.pathMouseLeave).bind(this));
			}
			this.events[this.eventPosition].calls.push({
				stepNum: context.getStepNum(),
				nodeId: context.getCallNodeId(),
				callId: context.getCallId(),
				$element: $element,
				animNum: this.robot.animation.getLength()-1
			});
			this.events[this.eventPosition].endAnimNum = this.robot.animation.getLength();
		},

		updateInterface: function() {
			if (!this.readOnly) {
				$('.robot-maze-block').click(_(this.clickBlock).bind(this));
				$('.robot-maze-line-vertical').click(_(this.clickVerticalLine).bind(this));
				$('.robot-maze-line-horizontal').click(_(this.clickHorizontalLine).bind(this));
			}
		},

		clickVerticalLine: function(event) {
			var $target = $(event.delegateTarget);
			var active = !this.state.verticalActive[$target.data('x')][$target.data('y')];
			this.state.verticalActive[$target.data('x')][$target.data('y')] = active;
			if (active) {
				this.state.mazeObjects++;
				$target.addClass('robot-maze-line-active');
			} else {
				this.state.mazeObjects--;
				$target.removeClass('robot-maze-line-active');
			}
			this.stateChanged();
		},

		clickHorizontalLine: function(event) {
			var $target = $(event.delegateTarget);
			var active = !this.state.horizontalActive[$target.data('x')][$target.data('y')];
			this.state.horizontalActive[$target.data('x')][$target.data('y')] = active;
			if (active) {
				this.state.mazeObjects++;
				$target.addClass('robot-maze-line-active');
			} else {
				this.state.mazeObjects--;
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
					this.robot.removePathHighlights();
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
				this.$container.on('mousemove', _(this.containerMouseMove).bind(this));
				this.robot.$initial.addClass('robot-initial-dragging');
				event.preventDefault();
				this.robot.drawInitial();
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

			if (x !== this.state.initialX || y !== this.state.initialY) {
				this.state.initialX = x;
				this.state.initialY = y;
				this.stateChanged();
			}
			this.robot.$initial.css('left', event.pageX - offset.left - this.dragX);
			this.robot.$initial.css('top', event.pageY - offset.top - this.dragY);
		},

		clickBlock: function(event) {
			var $target = $(event.delegateTarget);
			var goal = !this.state.blockGoal[$target.data('x')][$target.data('y')];
			this.state.blockGoal[$target.data('x')][$target.data('y')] = goal;
			if (goal) {
				this.state.mazeObjects++;
				$target.addClass('robot-maze-block-goal');
			} else {
				this.state.mazeObjects--;
				$target.removeClass('robot-maze-block-goal');
			}
			this.stateChanged();
		},

		stateChanged: function() {
			this.editor.outputRequestsRerun();
			if (this.stateChangeCallback !== null) {
				this.stateChangeCallback(this.getState());
			}
		}
	};
};
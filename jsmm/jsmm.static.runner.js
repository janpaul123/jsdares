/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	require('./jsmm.msg')(jsmm);
	
	jsmm.Event = function() { return this.init.apply(this, arguments); };
	jsmm.Event.prototype = {
		init: function(runner, type, funcName, args) {
			this.runner = runner;
			this.type = type;
			this.funcName = funcName || null;
			this.args = args || [];
			this.context = null;
		},

		run: function(context) {
			this.context = context;
			this.runner.delegate.startEvent(this.context);
			if (this.funcName === null) {
				this.context.runProgram();
			} else {
				this.context.runFunction(this.funcName, this.args);
			}
			this.runner.delegate.endEvent(this.context);
		}
	};

	jsmm.Runner = function() { return this.init.apply(this, arguments); };
	jsmm.Runner.prototype = {
		init: function(delegate, scope, outputs, maxHistory) {
			this.delegate = delegate;
			this.scope = scope;
			this.outputs = outputs;
			this.maxHistory = maxHistory || 80;

			this.tree = null;
			this.baseEvent = new jsmm.Event(this, 'base');
			this.events = [this.baseEvent];
			this.eventNum = 0;
			this.stepNum = Infinity;
			this.runScope = null;
			this.errorEventNums = [];

			this.paused = false;
			this.interactive = false;
			this.enabled = false;
		},

		selectBaseEvent: function() {
			if (this.events.length !== 1 || this.eventNum !== 0 || this.events[0] !== this.baseEvent) {
				this.events = [this.baseEvent];
				this.stepNum = Infinity;
			}
			this.eventNum = 0;
			this.interactive = false;
			this.paused = false;
			this.errorEventNums = [];
			this.delegate.clearAllEvents();
			this.baseEvent.run(new jsmm.RunContext(this.tree, this.scope));
			this.runScope = this.baseEvent.context.scope.getVars();
			if (this.baseEvent.context.hasError()) this.errorEventNums.push(0);
			this.delegate.runnerChanged();
		},

		canReceiveEvents: function() {
			return this.enabled && !this.isStatic() && !this.hasError();
		},

		isStatic: function() {
			return !this.interactive || this.paused || this.isStepping();
		},

		addEvent: function(type, funcName, args) {
			if (!this.canReceiveEvents()) {
				return false;
			} else {
				var event = new jsmm.Event(this, type, funcName, args);
				event.run(new jsmm.RunContext(this.tree, this.runScope));
				this.runScope = event.context.scope.getVars();

				this.eventNum = this.events.length;
				this.events.push(event);
				if (this.events.length > this.maxHistory) {
					this.events.shift();
					this.eventNum--;
					this.delegate.popFirstEvent();
				}
				if (event.context.hasError()) {
					this.errorEventNums.push(this.events.length-1);
					this.delegate.runnerChanged();
				}
				return true;
			}
		},

		newTree: function(tree) {
			this.tree = tree;
			if (this.baseEvent.context !== null && this.tree.compareMain(this.baseEvent.context)) {
				if (this.interactive && !this.tree.compareAll(this.baseEvent.context)) {
					this.errorEventNums = [];
					if (!this.paused || this.eventNum < 0) {
						this.delegate.clearEventToEnd();
						this.events = [];
						this.eventNum = -1;
						this.stepNum = Infinity;
						this.tree.programNode.getFunctionFunction()(this.runScope);
					} else {
						var start;
						if (this.events[0] === this.baseEvent) {
							this.delegate.clearAllEvents();
							this.baseEvent.run(new jsmm.RunContext(this.tree, this.scope));
							this.runScope = this.baseEvent.context.scope.getVars();
							if (this.baseEvent.context.hasError()) this.errorEventNums.push(0);
							start = 1;
						} else {
							this.delegate.clearEventsFrom(0);
							this.runScope = this.events[0].context.startScope.getVars();
							this.tree.programNode.getFunctionFunction()(this.runScope);
							start = 0;
						}
						for (var i=start; i<this.events.length; i++) {
							this.events[i].run(new jsmm.RunContext(this.tree, this.runScope));
							this.runScope = this.events[i].context.scope.getVars();
							if (this.events[i].context.hasError()) this.errorEventNums.push(i);
						}

						if (this.stepNum < Infinity && this.stepNum >= this.events[this.eventNum].context.steps.length) {
							this.stepNum = Infinity;
						}
					}
				}
				this.baseEvent.context.tree = this.tree;
				this.delegate.runnerChanged();
			} else {
				this.selectBaseEvent();
			}
		},

		/// EVENTS ///
		play: function() {
			this.paused = false;
			if (this.eventNum < this.events.length-1) {
				this.events = this.events.slice(0, this.eventNum+1);
				this.delegate.clearEventsFrom(this.eventNum+1);
				this.stepNum = Infinity;
				this.runScope = this.events[this.eventNum].context.scope.getVars();
			}
			this.delegate.runnerChanged();
		},

		pause: function() {
			this.paused = true;
			this.delegate.runnerChanged();
		},

		isPaused: function() {
			return this.paused;
		},

		hasEvents: function() {
			return this.events.length > 0;
		},

		getEventTotal: function() {
			return this.events.length;
		},

		getEventNum: function() {
			return this.eventNum;
		},

		setEventNum: function(eventNum) {
			if (eventNum >= 0 && eventNum < this.events.length) {
				this.eventNum = eventNum;
				this.step = Infinity;
			}
			this.delegate.runnerChanged();
		},

		isBaseEventSelected: function() {
			return this.eventNum === 0 && this.events[0] === this.baseEvent;
		},

		/// STEPPING ///
		isStepping: function() {
			return this.stepNum < Infinity;
		},

		restart: function() {
			if (this.stepNum !== Infinity) {
				this.stepNum = Infinity;
			}
			this.delegate.runnerChanged();
		},

		stepForward: function() {
			if (this.eventNum >= 0) {
				if (this.stepNum < this.events[this.eventNum].context.steps.length-1) {
					this.stepNum++;
				} else if (this.stepNum === Infinity) {
					this.stepNum = 0;
				} else {
					this.stepNum = Infinity;
				}
			}
			this.delegate.runnerChanged();
		},

		stepBackward: function() {
			if (this.stepNum < Infinity && this.stepNum > 0) {
				this.stepNum--;
			} else if (this.stepNum < Infinity) {
				this.stepNum = Infinity;
			}
			this.delegate.runnerChanged();
		},

		getStepTotal: function() {
			return this.events[this.eventNum].context.steps.length-1;
		},

		getStepNum: function() {
			return this.stepNum;
		},

		setStepNum: function(stepNum) {
			if (stepNum >= 0 && stepNum < this.events[this.eventNum].context.steps.length) {
				this.stepNum = stepNum;
			}
			this.delegate.runnerChanged();
		},

		getStepType: function() {
			if (this.eventNum < 0) {
				return '';
			} else {
				return this.events[this.eventNum].type;
			}
		},

		/// CONTROLS ///
		enable: function() {
			this.enabled = true;
		},

		disable: function() {
			this.enabled = false;
		},

		isEnabled: function() {
			return this.enabled;
		},

		isInteractive: function() {
			return this.interactive;
		},

		makeInteractive: function() {
			this.interactive = true;
		},

		/// ERRORS & MSG ///
		hasError: function() {
			return this.eventNum >= 0 && this.events[this.eventNum].context.hasError();
		},

		getError: function() {
			return this.events[this.eventNum].context.getError();
		},

		getErrorEventNums: function() {
			return this.errorEventNums;
		},

		getMessages: function() {
			if (this.eventNum < 0 || this.events[this.eventNum].context === null || this.stepNum === Infinity) return [];
			else return this.events[this.eventNum].context.steps[this.stepNum] || [];
		},

		/// UTILS ///
		getCallNodesByRange: function(line1, line2) {
			if (this.eventNum >= 0) {
				return this.events[this.eventNum].context.getCallNodesByRange(line1, line2);
			} else {
				return [];
			}
		},

		getAllCallNodesByRange: function(line1, line2) {
			var nodes = [];
			for (var i=0; i<this.events.length; i++) {
				nodes[i] = this.events[i].context.getCallNodesByRange(line1, line2);
			}
			return nodes;
		},

		getExamples: function(text) {
			return jsmm.editor.autocompletion.getExamples(new jsmm.func.Scope(this.runScope || this.scope), text);
		}
	};
};

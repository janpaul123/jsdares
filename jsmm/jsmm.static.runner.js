/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	jsmm.Event = function() { return this.init.apply(this, arguments); };
	jsmm.Event.prototype = {
		init: function(runner, type, funcName, args) {
			this.runner = runner;
			this.type = type;
			this.funcName = funcName || undefined;
			this.args = args || [];
			this.context = null;
		},

		run: function(tree, scope, limits) {
			this.context = new jsmm.Context(tree, scope, limits);
			this.runner.delegate.startEvent(this.context);
			this.context.run(this.funcName, this.args);
			this.runner.delegate.endEvent(this.context);
		}
	};

	jsmm.Runner = function() { return this.init.apply(this, arguments); };
	jsmm.Runner.prototype = {
		init: function(delegate, scope, limits) {
			this.delegate = delegate;
			this.scope = new jsmm.Scope(scope);
			this.limits = {
				history: limits.history || 40,
				base: limits.base || {
					callStackDepth: 100,
					executionCounter: 4000,
					costCounter: 1000
				},
				event: limits.event || {
					callStackDepth: 100,
					executionCounter: 400,
					costCounter: 100
				}
			};

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
			this.baseEvent.run(this.tree, this.scope.getCopy(), this.limits.base);
			this.runScope = this.baseEvent.context.getBaseScope().getCopy();
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
				event.run(this.tree, this.runScope, this.limits.event);
				this.runScope = event.context.getBaseScope().getCopy();

				this.eventNum = this.events.length;
				this.events.push(event);
				if (this.events.length > this.limits.history) {
					this.events.shift();
					this.eventNum--;
					this.delegate.popFirstEvent();
				}
				if (event.context.hasError()) {
					this.errorEventNums.push(this.events.length-1);
					this.delegate.runnerChanged();
				} else {
					this.delegate.runnerChangedEvent();
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
						this.delegate.clearEventsToEnd();
						this.events = [];
						this.eventNum = -1;
						this.stepNum = Infinity;
						this.tree.programNode.getFunctionFunction()(this.runScope);
					} else {
						var start;
						if (this.events[0] === this.baseEvent) {
							this.delegate.clearAllEvents();
							this.baseEvent.run(this.tree, this.scope.getCopy(), this.limits.base);
							this.runScope = this.baseEvent.context.getBaseScope().getCopy();
							if (this.baseEvent.context.hasError()) this.errorEventNums.push(0);
							start = 1;
						} else {
							this.delegate.clearEventsFrom(0);
							this.runScope = this.events[0].context.getStartScope().getCopy();
							this.tree.programNode.getFunctionFunction()(this.runScope);
							start = 0;
						}
						for (var i=start; i<this.events.length; i++) {
							this.events[i].run(this.tree, this.runScope, this.limits.event);
							this.runScope = this.events[i].context.getBaseScope().getCopy();
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
				this.runScope = this.events[this.eventNum].context.getBaseScope().getCopy();
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
		getCallIdsByRange: function(line1, line2) {
			if (this.eventNum >= 0) {
				return this.events[this.eventNum].context.getCallIdsByRange(line1, line2);
			} else {
				return [];
			}
		},

		getAllCallIdsByRange: function(line1, line2) {
			var nodes = [];
			for (var i=0; i<this.events.length; i++) {
				nodes[i] = this.events[i].context.getCallIdsByRange(line1, line2);
			}
			return nodes;
		},

		getExamples: function(text) {
			return jsmm.editor.autocompletion.getExamples(this.runScope || this.scope, text);
		},

		getFunctionNode: function() {
			if (this.events[this.eventNum] === this.baseEvent) {
				return null;
			} else {
				return this.tree.getFunctionNode(this.events[this.eventNum].funcName);
			}
		}
	};
};

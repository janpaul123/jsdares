/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	jsmm.SimpleRunner = function() { return this.init.apply(this, arguments); };
	jsmm.SimpleRunner.prototype = {
		init: function(scope, options) {
			this.options = options || {};
			this.scope = new jsmm.Scope(scope);
			this.error = null;
			this.context = null;
		},

		run: function(text) {
			var tree = new jsmm.Tree(text, this.options);
			if (tree.hasError()) {
				this.error = tree.getError();
			} else {
				this.context = new jsmm.Context(tree, this.scope, jsmm.defaultLimits.base);
				this.context.run();
				if (this.context.hasError()) {
					this.error = this.context.getError();
				}
			}
		},

		hasError: function() {
			return this.error !== null;
		},

		getError: function() {
			return this.error;
		},

		getTree: function() {
			return this.tree;
		},

		getContext: function() {
			return this.context;
		}
	};

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
			this.exampleScope = this.scope;
			this.limits = limits || jsmm.defaultLimits;

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
			this.baseCodeChanged = false;
			this.interactiveSignature = '';
		},

		selectBaseEvent: function() {
			if (this.events.length !== 1 || this.eventNum !== 0 || this.events[0] !== this.baseEvent) {
				this.events = [this.baseEvent];
				this.stepNum = Infinity;
			}
			this.eventNum = 0;
			this.interactive = false;
			this.paused = false;
			this.baseCodeChanged = false;
			this.interactiveSignature = '';
			this.errorEventNums = [];
			this.delegate.clearReload();
			this.delegate.clearAllEvents();
			this.baseEvent.run(this.tree, this.scope.getCopy(), this.limits.base);
			this.runScope = this.baseEvent.context.getBaseScope().getCopy();
			if (this.baseEvent.context.hasError()) {
				this.errorEventNums.push(0);
				this.paused = true;
			} else {
				this.exampleScope = this.runScope;
			}
			this.updateStepping();
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
					this.paused = true;
					this.delegate.runnerChanged();
				} else {
					this.exampleScope = this.runScope;
					this.delegate.runnerChangedEvent();
				}
				return true;
			}
		},

		newTree: function(tree) {
			this.tree = tree;

			if (this.baseEvent.context !== null) {
				if (this.tree.compareAll(this.baseEvent.context)) {
					if (this.interactive) {
						this.errorEventNums = [];
						if (!this.paused || this.eventNum < 0) {
							// don't check if only functions have changed here, as when the base code is changed,
							// the base event should also be invalidated
							this.delegate.clearEventsToEnd();
							this.events = [];
							this.eventNum = -1;
							this.stepNum = Infinity;
							this.tree.programNode.getFunctionFunction()(this.runScope);

							if (this.tree.compareBase(this.baseEvent.context)) {
								this.baseCodeChanged = true;
							}
						} else {
							var start;
							if (this.events[0] === this.baseEvent) {
								var oldSignature = this.interactiveSignature;
								this.delegate.clearAllEvents();
								this.baseEvent.run(this.tree, this.scope.getCopy(), this.limits.base);
								this.runScope = this.baseEvent.context.getBaseScope().getCopy();
								if (this.baseEvent.context.hasError()) {
									this.errorEventNums.push(0);
									// when there was an error, functions may not have been declared
									this.tree.programNode.getFunctionFunction()(this.runScope);
									this.baseCodeChanged = false;
								}
								else {
									this.exampleScope = this.runScope;
									this.baseCodeChanged = (oldSignature !== this.interactiveSignature);
									this.interactiveSignature = oldSignature; // restore it for future comparisons
								}
								start = 1;
							} else if (this.tree.compareFunctions(this.baseEvent.context)) {
								this.delegate.clearEventsFrom(0);
								this.runScope = this.events[0].context.getStartScope().getCopy();
								this.tree.programNode.getFunctionFunction()(this.runScope);
								start = 0;

								if (this.tree.compareBase(this.baseEvent.context)) {
									this.baseCodeChanged = true;
								}
							} else {
								start = Infinity;
								this.baseCodeChanged = true;
							}
							for (var i=start; i<this.events.length; i++) {
								this.events[i].run(this.tree, this.runScope, this.limits.event);
								this.runScope = this.events[i].context.getBaseScope().getCopy();
								if (this.events[i].context.hasError()) this.errorEventNums.push(i);
								else this.exampleScope = this.runScope;
							}
							this.updateStepping();
						}
					} else {
						this.selectBaseEvent();
						return;
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
			this.stepNum = Infinity;
			if (this.eventNum < this.events.length-1) {
				this.runScope = this.events[this.eventNum+1].context.getStartScope().getCopy();
				this.events = this.events.slice(0, this.eventNum+1);
				this.delegate.clearEventsFrom(this.eventNum+1);
			}
			this.delegate.runnerChanged();
		},

		pause: function() {
			this.paused = true;
			this.delegate.runnerChanged();
		},

		reload: function() {
			if (this.stepNum !== Infinity) {
				this.stepNum = Infinity;
			}
			this.selectBaseEvent();
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

		getEventType: function() {
			if (this.eventNum < 0) {
				return '';
			} else {
				return this.events[this.eventNum].type;
			}
		},

		isBaseEventSelected: function() {
			return this.eventNum === 0 && this.events[0] === this.baseEvent;
		},

		/// STEPPING ///
		isStepping: function() {
			return this.stepNum < Infinity;
		},

		canStep: function() {
			return this.eventNum >= 0 && this.getStepTotal() > 0 && this.enabled;
		},

		restart: function() {
			if (this.stepNum !== Infinity) {
				this.stepNum = Infinity;
			}
			this.delegate.runnerChanged();
		},

		stepForward: function() {
			if (this.canStep()) {
				if (this.stepNum < this.events[this.eventNum].context.steps.length-1) {
					this.stepNum++;
				} else if (this.stepNum === Infinity) {
					this.stepNum = 0;
				} else {
					this.stepNum = Infinity;
				}
				this.delegate.runnerChanged();
			}
		},

		stepBackward: function() {
			if (this.canStep()) {
				if (this.stepNum < Infinity && this.stepNum > 0) {
					this.stepNum--;
				} else if (this.stepNum < Infinity) {
					this.stepNum = Infinity;
				}
				this.delegate.runnerChanged();
			}
		},

		getStepTotal: function() {
			return this.events[this.eventNum].context.steps.length;
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

		updateStepping: function() {
			var total = this.getStepTotal();
			if (total <= 0) {
				this.stepNum = Infinity;
			} else if (this.stepNum < Infinity && this.stepNum >= total) {
				this.stepNum = total-1;
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

		makeInteractive: function(signature) {
			this.interactive = true;
			this.interactiveSignature = signature;
			if (this.isStepping()) {
				this.paused = true;
			}
		},

		hasbaseCodeChanged: function() {
			return this.baseCodeChanged;
		},

		getAllSteps: function() {
			if (this.eventNum >= 0) {
				return this.events[this.eventNum].context.getAllSteps();
			} else {
				return [];
			}
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

		getMessage: function() {
			if (this.eventNum < 0 || this.events[this.eventNum].context === null || this.stepNum === Infinity) return null;
			else return this.events[this.eventNum].context.steps[this.stepNum] || null;
		},

		/// UTILS ///
		getCallIdsByNodeIds: function(nodeIds) {
			if (this.eventNum >= 0) {
				return this.events[this.eventNum].context.getCallIdsByNodeIds(nodeIds);
			} else {
				return [];
			}
		},

		getAllCallIdsByNodeIds: function(nodeIds) {
			var callIds = [];
			for (var i=0; i<this.events.length; i++) {
				callIds[i] = this.events[i].context.getCallIdsByNodeIds(nodeIds);
			}
			return callIds;
		},

		getExamples: function(text) {
			return jsmm.editor.autocompletion.getExamples(this.exampleScope, text);
		},

		getFunctionNode: function() {
			if (this.events[this.eventNum] === this.baseEvent || this.eventNum < 0) {
				return null;
			} else {
				return this.tree.getFunctionNode(this.events[this.eventNum].funcName);
			}
		}
	};
};

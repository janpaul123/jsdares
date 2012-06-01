/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	require('./jsmm.msg')(jsmm);
	
	jsmm.Event = function() { return this.init.apply(this, arguments); };
	jsmm.Event.prototype = {
		init: function(runner, funcName, args) {
			this.runner = runner;
			this.funcName = funcName || null;
			this.args = args || [];
			this.context = null;
		},

		run: function(context) {
			this.context = context;
			this.runner.callOutputs('outputStartEvent', this.context);
			if (this.funcName === null) {
				this.context.runProgram();
			} else {
				this.context.runFunction(this.funcName, this.args);
			}
			this.runner.callOutputs('outputEndEvent', this.context);
		}
	};

	jsmm.Runner = function() { return this.init.apply(this, arguments); };
	jsmm.Runner.prototype = {
		init: function(editor, scope, outputs, inputs, maxHistory) {
			this.editor = editor;
			this.scope = scope;
			this.outputs = outputs;
			this.inputs = inputs;
			this.maxHistory = maxHistory || 10;

			this.tree = null;
			this.baseEvent = new jsmm.Event(this);
			this.events = [this.baseEvent];
			this.eventNum = 0;
			this.stepNum = Infinity;
			this.runScope = null;

			this.paused = false;
			this.interactive = false;
			this.enabled = false;

			this.newTree(new jsmm.Tree(''));
		},

		selectBaseEvent: function() {
			this.eventNum = 0;
			this.paused = false;
			this.events = [this.baseEvent];
			this.callOutputs('outputClearAll');
			this.baseEvent.run(new jsmm.RunContext(this.tree, this.scope));
			this.runScope = this.baseEvent.context.scope.getVars();
		},

		addEvent: function(funcName, args) {
			if (!this.enabled || this.paused || this.isStepping()) {
				return false;
			} else {
				var event = new jsmm.Event(this, funcName, args);
				event.run(new jsmm.RunContext(this.tree, this.runScope));
				this.runScope = event.context.scope.getVars();

				this.eventNum = this.events.length;
				this.events.push(event);
				if (this.events.length > this.maxHistory) {
					this.events.shift();
					this.eventNum--;
					this.callOutputs('outputPopFront');
				}
				this.updateEditor();
				return true;
			}
		},

		newTree: function(tree) {
			this.tree = tree;
			if (this.baseEvent.context !== null && this.tree.compareMain(this.baseEvent.context)) {
				if (this.interactive && !this.tree.compareAll(this.baseEvent.context)) {
					if (!this.paused || this.eventNum < 0) {
						this.callOutputs('outputClearToEnd');
						this.events = [];
						this.eventNum = -1;
						this.tree.programNode.getFunctionFunction()(this.runScope);
					} else {
						var start;
						if (this.events[0] === this.baseEvent) {
							this.callOutputs('outputClearAll');
							this.baseEvent.run(new jsmm.RunContext(this.tree, this.scope));
							this.runScope = this.baseEvent.context.scope.getVars();
							start = 1;
						} else {
							this.callOutputs('outputClearToStart');
							this.runScope = this.events[0].context.startScope.getVars();
							this.tree.programNode.getFunctionFunction()(this.runScope);
							start = 0;
						}
						for (var i=start; i<this.events.length; i++) {
							this.events[i].run(new jsmm.RunContext(this.tree, this.runScope));
							this.runScope = this.events[i].context.scope.getVars();
						}
						this.updateEventStep();
					}
				} else {
					this.updateEditor();
				}
				this.baseEvent.context.tree = this.tree;
			} else {
				this.interactive = false;
				this.selectBaseEvent();
			}
		},

		/// EVENTS ///
		play: function() {
			this.paused = false;
			if (this.eventNum < this.events.length-1) {
				this.events = this.events.slice(0, this.eventNum+1);
				this.callOutputs('outputClearEventsFrom', this.eventNum+1);
				this.stepNum = Infinity;
				this.updateEventStep();
			} else {
				this.updateEditor();
			}
		},

		pause: function() {
			this.paused = true;
			this.updateEditor();
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
			this.eventNum = eventNum;
			this.step = Infinity;
			this.updateEventStep();
		},

		/// STEPPING ///
		isStepping: function() {
			return this.stepNum < Infinity;
		},

		restart: function() {
			this.stepNum = Infinity;
			this.updateEventStep();
		},

		stepForward: function() {
			if (this.stepNum < Infinity) {
				this.stepNum++;
				this.updateEventStep();
			} else { // this.stepNum === Infinity
				this.stepNum = 0;
				this.updateEventStep();
			}
		},

		stepBackward: function() {
			if (this.stepNum < Infinity) {
				this.stepNum--;
				this.updateEventStep();
			}
		},

		getStepTotal: function() {
			return this.events[this.eventNum].context.steps.length-1;
		},

		getStepNum: function() {
			return this.stepNum;
		},

		setStepNum: function(stepNum) {
			this.stepNum = stepNum;
			this.updateEventStep();
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

		getMessages: function() {
			if (this.eventNum < 0 || this.events[this.eventNum].context === null || this.stepNum === Infinity) return [];
			else return this.events[this.eventNum].context.steps[this.step] || [];
		},

		/// UTILS ///
		getCallNodesByRange: function(line1, line2) {
			return this.events[this.eventNum].context.getCallNodesByRange(line1, line2);
		},

		getExamples: function(text) {
			return null;
			/*
			var scope = this.context === null ? new jsmm.func.Scope(this.scope) : this.context.scope;
			if (scope === null) return null;
			else {
				return jsmm.editor.autocompletion.getExamples(scope, text);
			}
			*/
		},

		/// INTERNAL FUNCTIONS ///
		callOutputs: function(funcName) {
			for (var i=0; i<this.outputs.length; i++) {
				if (this.outputs[i][funcName] !== undefined) {
					this.outputs[i][funcName].apply(this.outputs[i], [].slice.call(arguments, 1));
				}
			}
		},

		updateEventStep: function() {
			if (this.events.length <= 0) {
				this.eventNum = -1;
			} else {
				if (this.eventNum < 0 || this.eventNum >= this.events.length) {
					throw 'Event number invalid';
				} else if (this.stepNum < 0 ||
						(this.stepNum < Infinity && this.stepNum >= this.events[this.eventNum].context.steps.length)) {
					throw 'Step number invalid';
				} else {
					this.callOutputs('outputSetEventStep', this.eventNum, this.stepNum);
				}
			}
			this.updateEditor();
		},

		updateEditor: function() {
			this.editor.updateRunnerOutput(this);
		}
	};
};

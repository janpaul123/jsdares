/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	require('./jsmm.msg')(jsmm);
	
	jsmm.Run = function() { return this.init.apply(this, arguments); };
	jsmm.Run.prototype = {
		init: function(runner, funcName, args) {
			this.runner = runner;
			this.funcName = funcName;
			this.args = args;
			this.context = null;
			this.step = Infinity;
		},

		select: function(step) {
			if (step !== undefined) {
				this.step = step;
			}
			if (this.step < 0 || this.step >= this.context.steps.length) this.step = Infinity;
			this.runner.callAll('outputs', 'outputSetState', this.context, this.step);
			this.runner.updateEditor();
		},

		restart: function() {
			this.select(Infinity);
		},

		stepForward: function() {
			if (this.context === null) {
				return false;
			} else if (this.step < Infinity) {
				this.select(this.step+1);
				return true;
			} else { // this.step === Infinity
				this.select(0);
				return true;
			}
		},

		stepBackward: function() {
			if (this.context !== null && this.step < Infinity) {
				this.select(this.step-1);
				return true;
			} else {
				return false;
			}
		},

		isStepping: function() {
			return this.step < Infinity;
		},

		getStepValue: function() {
			return this.step;
		},

		getStepTotal: function() {
			return this.context.steps.length-1;
		},

		hasError: function() {
			return this.context.hasError();
		},

		getError: function() {
			return this.context.getError();
		},

		run: function(context) {
			this.context = context;
			if (this.funcName === null) {
				this.context.runProgram();
			} else {
				this.context.runFunction(this.funcName, this.args);
			}
		},

		getMessages: function() {
			if (this.context === null || this.step === Infinity) return [];
			else return this.context.steps[this.step] || [];
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
			this.baseRun = new jsmm.Run(this, null);
			this.runs = [this.baseRun];
			this.currentRun = 0;
			this.calledFunctions = [];
			this.compareCode = '';
			this.oldRun = null;
			this.paused = false;
			this.interactive = false;
			this.enabled = false;

			this.newTree(new jsmm.Tree(''));
		},

		updateEditor: function() {
			this.editor.updateRunnerOutput(this);
		},

		callAll: function(type, funcName) {
			for (var i=0; i<this[type].length; i++) {
				if (this[type][i][funcName] !== undefined) {
					this[type][i][funcName].apply(this[type][i], [].slice.call(arguments, 2));
				}
			}
		},

		selectBaseRun: function() {
			this.oldRun = null;
			this.currentRun = 0;
			this.paused = false;
			this.runs = [this.baseRun];
		},

		getCurrentRun: function() {
			if (this.currentRun < 0) return this.oldRun;
			else return this.runs[this.currentRun];
		},

		isBaseSelected: function() {
			return this.currentRun === 0;
		},

		getBaseRun: function() {
			return this.baseRun;
		},

		hasRuns: function() {
			return this.runs.length > 0;
		},

		isPaused: function() {
			return this.paused;
		},

		isInteractive: function() {
			return this.interactive;
		},

		makeInteractive: function() {
			this.interactive = true;
		},

		pause: function() {
			this.paused = true;
			this.updateEditor();
		},

		play: function() {
			this.paused = false;
			if (this.currentRun < this.runs.length-1) {
				this.runs = this.runs.slice(0, this.currentRun+1);
				this.getCurrentRun().restart();
			} else {
				this.updateEditor();
			}
		},

		getRunTotal: function() {
			return this.runs.length;
		},

		getRunValue: function() {
			return this.currentRun;
		},

		setRunValue: function(value) {
			if (value >= 0 && value < this.runs.length) {
				this.currentRun = value;
				this.runs[this.currentRun].restart();
			}
		},

		disable: function() {
			this.enabled = false;
		},

		enable: function() {
			this.enabled = true;
		},

		isEnabled: function() {
			return this.enabled;
		},

		addEvent: function(funcName, args) {
			if (!this.enabled || this.paused || this.getCurrentRun().isStepping()) {
				return false;
			} else {
				var run = new jsmm.Run(this, funcName, args);
				run.run(new jsmm.RunContext(this.tree, this.getCurrentRun().context.scope.getVars(), this.outputs));
				this.currentRun = this.runs.length;
				this.runs.push(run);
				if (this.runs.length > this.maxHistory) {
					this.oldRun = this.runs.shift();
					this.currentRun--;
				}
				this.updateEditor();
				return true;
			}
		},

		newTree: function(tree) {
			this.tree = tree;
			if (this.baseRun.context !== null && this.tree.compareMain(this.baseRun.context)) {
				if (this.hasRuns() && !this.tree.compareAll(this.baseRun.context)) {
					var func = tree.programNode.getFunctionFunction();
					func(this.baseRun.context.scope);

					if (this.paused) {
						var start, run;
						if (this.oldRun !== null) {
							func(this.oldRun.context.scope);
							run = this.oldRun;
							start = 0;
						} else {
							run = this.baseRun;
							start = 1;
						}
						run.select(Infinity);
						for (var i=start; i<this.runs.length; i++) {
							var scope = run.context.scope.getVars();
							run = this.runs[i];
							run.run(new jsmm.RunContext(this.tree, scope, this.outputs));
						}
						this.getCurrentRun().select();
					} else {
						this.oldRun = this.getCurrentRun();
						this.runs = [];
						this.currentRun = -1;
						func(this.oldRun.context.scope);
					}
				}
			} else {
				this.interactive = false;

				this.baseRun.run(new jsmm.RunContext(this.tree, this.scope, this.outputs));
				this.calledFunctions = this.baseRun.context.getCalledFunctions();
				this.compareCode = this.tree.programNode.getCompareCode(this.calledFunctions);

				this.selectBaseRun();
				this.paused = false;
				this.baseRun.select();
			}
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
		}

		/// INTERNAL FUNCTIONS ///
		
	};
};

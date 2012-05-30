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
		},

		restart: function() {
			this.select(Infinity);
		},

		stepForward: function() {
			if (this.context === null) {
				return false;
			} else {
				this.select(this.step+1);
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
		init: function(editor, scope, outputs, inputs) {
			this.editor = editor;
			this.scope = scope;
			this.outputs = outputs;
			this.inputs = inputs;

			this.tree = null;
			this.baseRun = new jsmm.Run(this, null);
			this.runs = [this.baseRun];
			this.currentRun = 0;
			this.calledFunctions = [];
			this.compareCode = '';

			this.newTree(new jsmm.Tree(''));
		},

		callAll: function(type, funcName) {
			for (var i=0; i<this[type].length; i++) {
				if (this[type][i][funcName] !== undefined) {
					this[type][i][funcName].apply(this[type][i], [].slice.call(arguments, 2));
				}
			}
		},

		removeRuns: function() {
			this.currentRun = 0;
			this.runs = [this.baseRun];
		},

		getCurrentRun: function() {
			return this.runs[this.currentRun];
		},

		restart: function() {
			this.removeRuns();
			return this.baseRun.select(Infinity);
		},

		baseStepForward: function() {
			this.removeRuns();
			return this.baseRun.stepForward();
		},

		baseStepBackward: function() {
			this.removeRuns();
			return this.baseRun.stepBackward();
		},

		isStepping: function() {
			return this.getCurrentRun().isStepping();
		},

		getStepValue: function() {
			return this.getCurrentRun().getStepValue();
		},

		setStepTotal: function() {
			return this.getCurrentRun().getStepTotal();
		},

		setStepValue: function(value) {
			this.getCurrentRun().setStepValue(value);
		},

		hasError: function() {
			return this.getCurrentRun().hasError();
		},

		getError: function() {
			return this.getCurrentRun().getError();
		},

		getMessages: function() {
			return this.getCurrentRun().getMessages();
		},

		addEvent: function(funcName, args) {
			var run = new jsmm.Run(this, funcName, args);
			run.run(new jsmm.RunContext(this.tree, this.runs[this.runs.length-1].context.scope.getVars(), this.outputs));
			this.runs.push(run);
		},

		newTree: function(tree) {
			this.tree = tree;
			if (this.baseRun.context !== null && this.currentRun > 0 && this.tree.compare(this.baseRun.context)) {
				/*
				var context = new jsmm.RunContext(this.tree, this.runs[0].context.scope.getVars(), this.outputs);
				this.runs[0].select(Infinity);
				var func = this.tree.programNode.getFunctionFunction(context);

				for (var i=1; i<this.runs.length; i++) {
					var scope = this.runs[i-1].context.scope.getVars();
					this.runs[i].run(new jsmm.RunContext(this.tree, scope, this.outputs));
				}
				this.runs[this.currentRun].select();
				*/
			} else {
				this.baseRun.run(new jsmm.RunContext(this.tree, this.scope, this.outputs));
				this.baseRun.select();
				this.calledFunctions = this.baseRun.context.getCalledFunctions();
				this.compareCode = this.tree.programNode.getCompareCode(this.calledFunctions);
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

/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	require('./jsmm.msg')(jsmm);
	
	jsmm.Run = function() { return this.init.apply(this, arguments); };
	jsmm.Run.prototype = {
		init: function(runner) {
			this.runner = runner;
			this.context = null;
			this.step = Infinity;
		},

		select: function(step) {
			if (this.step !== undefined) {
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

		run: function() {
			this.context = this.runner.getNewContext();
			this.context.runProgram();
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

			this.tree = new jsmm.Tree('');
			this.baseRun = new jsmm.Run(this);
			this.liveRuns = [];
			this.currentRun = -1;
			this.calledFunctions = [];
			this.compareCode = '';

			this.baseRun.run();
		},

		callAll: function(type, funcName) {
			for (var i=0; i<this[type].length; i++) {
				if (this[type][i][funcName] !== undefined) {
					this[type][i][funcName].apply(this[type][i], [].slice.call(arguments, 2));
				}
			}
		},

		getNewContext: function() {
			return new jsmm.RunContext(this.tree, this.scope, this.outputs);
		},

		removeLiveRuns: function() {
			this.currentRun = -1;
			this.liveRuns = [];
		},

		getCurrentRun: function() {
			if (this.currentRun < 0) return this.baseRun;
			else return this.liveRuns[this.run];
		},

		restart: function() {
			this.removeLiveRuns();
			return this.baseRun.select(Infinity);
		},

		baseStepForward: function() {
			this.removeLiveRuns();
			return this.baseRun.stepForward();
		},

		baseStepBackward: function() {
			this.removeLiveRuns();
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

		newTree: function(tree) {
			this.tree = tree;
			if (this.tree.compare(this.baseRun.context)) {

			} else {
				console.log(this.tree.programNode.getCompareCode(this.calledFunctions), this.compareCode);
				this.baseRun.run();
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

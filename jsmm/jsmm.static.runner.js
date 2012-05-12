/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	require('./jsmm.msg')(jsmm);
	
	jsmm.StaticRunner = function() { return this.init.apply(this, arguments); };
		
	jsmm.StaticRunner.prototype = {
		init: function() {
			this.tree = null;
			this.scope = null;
			this.error = null;
			this.runFunc = null;
			this.context = null;
			this.step = -1;
		},

		restart: function() {
			// set a running state
			this.step = -1;
		},

		hasError: function() {
			return this.error !== null;
		},

		stepForward: function() {
			if (this.context === null) return false;
			this.step++;
			if (this.step >= this.context.steps.length) this.step = -1;
			return true;
		},

		stepBackward: function() {
			if (this.context === null) return false;
			this.step--;
			if (this.step < -1) this.step = -1;
			return true;
		},

		isStepping: function() {
			return this.step >= 0;
		},

		getStepValue: function() {
			return this.step;
		},

		getStepTotal: function() {
			return this.context.steps.length-1;
		},

		setStepValue: function(value) {
			if (value >= 0 && value < this.context.steps.length) {
				this.step = value;
			}
		},

		getError: function() {
			return this.error;
		},

		run: function() {
			if (this.tree === null || this.scope === null) return false;
			this.error = null;

			try {
				if (this.runFunc === null) {
					this.runFunc = this.tree.programNode.getRunFunction();
				}

				this.context = new jsmm.RunContext(this.tree, this.scope);
				this.runFunc(this.context);

				if (this.step >= this.context.steps.length) this.step = this.context.steps.length-1;

				return true;
			} catch (error) {
				this.handleError(error);
				return false;
			}
		},

		getMessages: function() {
			if (this.context === null || this.step < 0) return [];
			else return this.context.steps[this.step] || [];
		},

		newTree: function(tree) {
			this.tree = tree;
			this.runFunc = null;
			this.context = null;
		},

		newScope: function(scope) {
			this.scope = scope;
			this.context = null;
		},

		getExamples: function(text) {
			var scope = this.context === null ? new jsmm.func.Scope(this.scope) : this.context.scope;
			if (scope === null) return null;
			else {
				return jsmm.editor.autocompletion.getExamples(scope, text);
			}
		},

		getCallsByRange: function(lineStart, lineEnd) {
			return this.context.getCallsByRange(lineStart, lineEnd);
		},

		getInfoByLine: function(line) {
			return this.context.getInfoByLine(line);
		},

		/// INTERNAL FUNCTIONS ///
		handleError: function(error) {
			if (error instanceof jsmm.msg.Error) {
				this.error = error;
			} else {
				throw error;
				this.error = new jsmm.msg.Error({}, 'An unknown error has occurred', '', error);
			}
		}
	};
};

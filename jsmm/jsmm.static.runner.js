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
			this.context = null;
			this.stepCount = 0;
			this.messages = [];
		},

		restart: function() {
			// set a running state
			this.stepCount = 0;
		},

		hasError: function() {
			return this.error !== null;
		},

		run: function() {
			if (this.tree === null || this.scope === null) return false;
			if (this.context !== null) return true;

			if (!this.runSafe()) return false;
			return true;
		},

		stepForward: function() {
			if (!this.run()) return false;
			this.stepCount++;
			if (this.stepCount >= this.context.steps.length) this.stepCount = 0;
			return true;
		},

		stepBackward: function() {
			this.stepCount--;
			if (this.stepCount < 0) this.stepCount = 0;
			return this.run();
		},

		isStepping: function() {
			return this.stepCount > 0;
		},

		getError: function() {
			return this.error;
		},

		getMessages: function() {
			if (this.context === null || this.stepCount === 0) return [];
			else return this.context.steps[this.stepCount-1] || [];
		},

		newTree: function(tree) {
			this.tree = tree;
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

		/// INTERNAL FUNCTIONS ///
		handleError: function(error) {
			if (error instanceof jsmm.msg.Error) {
				this.error = error;
			} else {
				throw error;
				this.error = new jsmm.msg.Error({}, 'An unknown error has occurred', '', error);
			}
		},

		runSafe: function() {
			this.error = null;
			this.messages = [];

			try {
				this.context = this.tree.programNode.getRunFunction(this.scope)();
				return true;
			} catch (error) {
				this.handleError(error);
				return false;
			}
		}
	};
};

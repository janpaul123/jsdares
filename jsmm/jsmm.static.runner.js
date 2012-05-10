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
			this.lastScope = null;
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

			if (this.stepCount <= 0) {
				if (!this.runSafe()) return false;
			} else {
				if (!this.stepInit()) return false;
				while(this.stepPos < this.stepCount) {
					if (!this.stepNext()) return false;
				}
			}
			return true;
		},

		stepForward: function() {
			this.stepCount++;
			if (!this.run()) {
				if (this.error !== null) return false;
				else {
					this.stepCount = 0;
				}
			}
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
			return this.messages;
		},

		newTree: function(tree) {
			this.tree = tree;
		},

		newScope: function(scope) {
			this.scope = scope;
		},

		getExamples: function(text) {
			var scope = this.lastScope === null ? new jsmm.func.Scope(this.scope) : this.lastScope;
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
				this.lastScope = this.tree.programNode.getRunFunction(this.scope)();
				return true;
			} catch (error) {
				this.handleError(error);
				return false;
			}
		},

		stepInit: function() {
			this.error = null;
			try {
				this.stack = new jsmm.step.Stack(this.tree, this.scope);
				this.stepPos = 0;
				this.messages = [];
				return true;
			} catch (error) {
				this.handleError(error);
				return false;
			}
		},

		stepNext: function() {
			this.error = null;

			var ret = [];
			try {
				var cont;
				do {
					if (this.stack === null || !this.stack.hasNext()) return false;
					
					cont = false;
					var msgs = this.stack.stepNext();
					if (msgs.length <= 0) return undefined;
					
					for (var i=0; i<msgs.length; i++) {
						if (msgs[i] instanceof jsmm.msg.Error) {
							this.error = msgs[i];
							return undefined;
						} else if (msgs[i] instanceof jsmm.msg.Continue) {
							cont = true;
						} else {
							// don't push jsmm.msg.Continue
							ret.push(msgs[i]);
						}
					}
					// TODO: store all messages instead of the last ones
					this.messages = msgs;
				} while (cont === true);
				this.stepPos++;
				return ret;
			} catch (error) {
				this.handleError(error);
				return false;
			}
		}
	};
};

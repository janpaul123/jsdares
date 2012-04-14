/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	require('./jsmm.msg')(jsmm);
	
	jsmm.SimpleRunner = function() { return this.init.apply(this, arguments); };
		
	jsmm.SimpleRunner.prototype = {
		init: function(text, scope) {
			this.code = text || '';
			this.scope = scope || {};
			this.reset();
		},
		
		reset: function() {
			this.context = null;
			this.rawFunc = null;
			this.safeFunc = null;
			this.stack = null;
			this.stepPos = null;
			this.resetError();
		},
		
		resetError: function() {
			this.error = null;
		},
		
		setText: function(text) {
			this.reset();
			this.code = text;
		},
		
		setScope: function(scope) {
			this.reset();
			this.scope = scope;
		},
		
		getCode: function() {
			return this.code;
		},
		
		handleError: function(error) {
			//console.log(error);
			if (error instanceof jsmm.msg.Error) {
				this.error = error;
			} else {
				//throw error;
				this.error = new jsmm.msg.Error({}, 'An unknown error has occurred', '', error);
			}
			//console.log(this.error);
		},
		
		parse: function() {
			this.resetError();
			if (this.context !== null) return true;
			
			try {
				this.context = new jsmm.Tree(this.code);
				if (this.context.hasError()) {
					this.handleError(this.context.getError());
					return false;
				}
				return true;
			} catch (error) {
				this.handleError(error);
				return false;
			}
		},

		getElementsByType: function(type) {
			this.resetError();
			if (!this.parse()) return undefined;

			return this.context.nodesByType[type];
		},

		getElementByLine: function(line) {
			this.resetError();
			if (!this.parse()) return undefined;

			return this.context.nodesByLine[line];
		},

		addHookBeforeNode: function(node, func) {
			this.safeFunc = null;
			this.context.addHookBeforeNode(node, func);
		},

		addHookAfterNode: function(node, func) {
			this.safeFunc = null;
			this.context.addHookAfterNode(node, func);
		},
		
		getDot: function() {
			this.resetError();
			if (!this.parse()) return undefined;
			
			try {
				return this.context.programNode.getDot();
			} catch (error) {
				this.handleError(error);
				return undefined;
			}
		},
		
		getRawCode: function() {
			this.resetError();
			if (!this.parse()) return undefined;
			
			try {
				return this.context.programNode.getCode();
			} catch (error) {
				this.handleError(error);
				return undefined;
			}
		},
		
		makeRawFunc: function() {
			this.resetError();
			if (this.rawFunc !== null) return true;
			if (!this.parse()) return false;
			
			try {
				this.rawFunc = this.context.programNode.getFunction(this.scope);
				return true;
			} catch (error) {
				this.handleError(error);
				return false;
			}
		},
		
		runRaw: function() {
			this.resetError();
			if (!this.makeRawFunc()) return false;
			
			try {
				this.rawFunc();
				return true;
			} catch (error) {
				this.handleError(error);
				return false;
			}
		},
		
		getSafeCode: function() {
			this.resetError();
			if (!this.parse()) return undefined;
			
			try {
				return this.context.programNode.getSafeCode();
			} catch (error) {
				this.handleError(error);
				return undefined;
			}
		},
		
		makeSafeFunc: function() {
			this.resetError();
			if (this.safeFunc !== null) return true;
			if (!this.parse()) return false;
			
			try {
				this.safeFunc = this.context.programNode.getSafeFunction(this.scope);
				return true;
			} catch (error) {
				this.handleError(error);
				return false;
			}
		},
		
		runSafe: function() {
			this.resetError();
			if (!this.makeSafeFunc()) return false;
			
			try {
				this.safeFunc();
				return true;
			} catch (error) {
				this.handleError(error);
				return false;
			}
		},
		
		stepInit: function() {
			this.resetError();
			if (!this.parse()) return false;
			try {
				this.stack = new jsmm.step.Stack(this.context, this.scope);
				this.stepPos = 0;
				return true;
			} catch (error) {
				this.handleError(error);
				return false;
			}
		},
		
		stepNext: function() {
			this.resetError();
			
			var ret = [];
			try {
				var cont;
				do {
					if (this.stack === null || !this.stack.hasNext()) return undefined;
					
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
				} while (cont === true);
				this.stepPos++;
				return ret;
			} catch (error) {
				this.handleError(error);
				return undefined;
			}
		},

		stepBack: function() {
			this.resetError();
			var stepPos = this.stepPos-1;

			var result;
			if (stepPos >= 0) {
				this.stepInit();
				while (this.stepPos < stepPos) {
					result = this.stepNext();
					if (result === undefined) return undefined;
				}
			}
			return result;
		},
		
		isStepping: function() {
			return (this.stack !== null && this.stack.hasNext());
		},
		
		runStep: function() {
			this.resetError();
			
			if (this.stepInit()) {
				var step;
				do {
					step = this.stepNext();
				} while(step !== undefined);
			}
			
			return !this.hasError();
		},
		
		hasError: function() {
			return this.error !== null;
		},
		
		getError: function() {
			return this.error;
		},
	};
};

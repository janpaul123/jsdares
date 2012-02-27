module.exports = function(jsmm) {
	require('./jsmm.msg')(jsmm);
	
	jsmm.Browser = function() { return this.init.apply(this, arguments); };
	
	jsmm.Browser.prototype.init = function(code, scope) {
		this.code = code || '';
		this.scope = scope || {};
		this.reset();
	};
	
	jsmm.Browser.prototype.reset = function() {
		this.context = null;
		this.rawFunc = null;
		this.safeFunc = null;
		this.stack = null;
		this.resetError();
	};
	
	jsmm.Browser.prototype.resetError = function() {
		this.error = null;
	};
	
	jsmm.Browser.prototype.setCode = function(code) {
		this.reset();
		this.code = code;
	};
	
	jsmm.Browser.prototype.setScope = function(scope) {
		this.reset();
		this.scope = scope;
	};
	
	jsmm.Browser.prototype.handleError = function(error) {
		//console.log(error);
		if (error instanceof jsmm.msg.Error) {
			this.error = error;
		} else {
			throw error;
			this.error = new jsmm.msg.Error({}, 'An unknown error has occurred', '', error);
		}
		//console.log(this.error);
	};
	
	jsmm.Browser.prototype.parse = function() {
		this.resetError();
		if (this.context !== null) return true;
		
		try {
			this.context = jsmm.parse(this.code);
			return true;
		} catch (error) {
			this.handleError(error);
			return false;
		}
	};
	
	jsmm.Browser.prototype.getDot = function() {
		this.resetError();
		if (!this.parse()) return undefined;
		
		try {
			return this.context.program.getDot();
		} catch (error) {
			this.handleError(error);
			return undefined;
		}
	};
	
	jsmm.Browser.prototype.getRawCode = function() {
		this.resetError();
		if (!this.parse()) return undefined;
		
		try {
			return this.context.program.getCode();
		} catch (error) {
			this.handleError(error);
			return undefined;
		}
	};
	
	jsmm.Browser.prototype.makeRawFunc = function() {
		this.resetError();
		if (this.rawFunc !== null) return true;
		if (!this.parse()) return false;
		
		try {
			this.rawFunc = this.context.program.getFunction(this.scope);
			return true;
		} catch (error) {
			this.handleError(error);
			return false;
		}
	}
	
	jsmm.Browser.prototype.runRaw = function() {
		this.resetError();
		if (!this.makeRawFunc()) return false;
		
		try {
			this.rawFunc();
			return true;
		} catch (error) {
			this.handleError(error);
			return false;
		}
	};
	
	jsmm.Browser.prototype.getSafeCode = function() {
		this.resetError();
		if (!this.parse()) return undefined;
		
		try {
			return this.context.program.getSafeCode();
		} catch (error) {
			this.handleError(error);
			return undefined;
		}
	};
	
	jsmm.Browser.prototype.makeSafeFunc = function() {
		this.resetError();
		if (this.safeFunc !== null) return true;
		if (!this.parse()) return false;
		
		try {
			this.safeFunc = this.context.program.getSafeFunction(this.scope);
			return true;
		} catch (error) {
			this.handleError(error);
			return false;
		}
	}
	
	jsmm.Browser.prototype.runSafe = function() {
		this.resetError();
		if (!this.makeSafeFunc()) return false;
		
		try {
			this.safeFunc();
			return true;
		} catch (error) {
			this.handleError(error);
			return false;
		}
	};
	
	jsmm.Browser.prototype.stepInit = function() {
		this.resetError();
		if (!this.parse()) return false;
		try {
			this.stack = new jsmm.step.Stack(this.context, this.scope);
			return true;
		} catch (error) {
			this.handleError(error);
			return false;
		}
	};
	
	jsmm.Browser.prototype.stepNext = function() {
		this.resetError();
		if (this.stack === null || !this.stack.hasNext()) return undefined;
		
		try {
			return this.stack.stepNext();
		} catch (error) {
			this.handleError(error);
			return undefined;
		}
	};
	
	jsmm.Browser.prototype.isStepping = function() {
		return (this.stack !== null && this.stack.hasNext());
	};
	
	jsmm.Browser.prototype.runStep = function() {
		this.resetError();
		
		if (this.stepInit()) {		
			var step;
			do {
				step = this.stepNext();
			} while(step !== undefined);
		}
		
		return !this.hasError();
	}
	
	jsmm.Browser.prototype.hasError = function() {
		return this.error !== null;
	}
	
	jsmm.Browser.prototype.getError = function() {
		return this.error;
	};
	
	jsmm.Browser.prototype.formatErrorForPosition = function() {
		// split into lines
		var lines = this.code.split(/\r\n|\n|\r/);
		
		// join lines back together
		return Array(this.error.line).join('\n') + (lines[this.error.line-1] || '').substring(0, this.error.column+1);
	};
	
	// TODO: clean up
	jsmm.Browser.prototype.formatForPosition = function(line, column) {
		// split into lines
		var lines = this.code.split(/\r\n|\n|\r/);
		
		// join lines back together
		return Array(line).join('\n') + (lines[line-1] || '').substring(0, column+1);
	};
};

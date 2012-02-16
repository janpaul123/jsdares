module.exports = function(jsmm) {
	jsmm.Browser = function() { return this.init.apply(this, arguments); };
	
	jsmm.Browser.prototype.init = function() {
		this.code = '';
		this.scope = {};
		this.reset();
	};
	
	jsmm.Browser.prototype.reset = function() {
		this.root = null;
		this.func = null;
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
		if (error.line === undefined) {
			throw error;
			this.error = {
				type: 'unknown',
				msg: 'An unknown error has occurred',
				html: 'An unknown error has occurred',
				orig: error,
				line: 0,
				column: 0
			};
		} else {
			this.error = error;
		}
		console.log(this.error);
	};
	
	jsmm.Browser.prototype.parse = function() {
		if (this.root !== null) return true;
		
		try {
			this.root = jsmm.parse(this.code);
			return true;
		} catch (error) {
			this.handleError(error);
			return false;
		}
	};
	
	jsmm.Browser.prototype.getSafeCode = function() {
		if (!this.parse()) return undefined;
		
		try {
			return this.root.getSafeCode();
		} catch (error) {
			this.handleError(error);
			return undefined;
		}
	};
	
	jsmm.Browser.prototype.makeFunc = function() {
		if (this.func !== null) return true;
		if (!this.parse()) return false;
		
		try {
			this.func = this.root.getSafeFunction();
			return true;
		} catch (error) {
			this.handleError(error);
			return false;
		}
	}
	
	jsmm.Browser.prototype.runAll = function() {
		if (!this.makeFunc()) return false;
		
		try {
			this.func(jsmm, this.scope);
			return true;
		} catch (error) {
			this.handleError(error);
			return false;
		}
	};
	
	jsmm.Browser.prototype.getError = function() {
		return this.error;
	};
	
	jsmm.Browser.prototype.formatErrorForPosition = function() {
		// split into lines
		var lines = this.code.split(/\r\n|\n|\r/);
		
		// join lines back together
		return Array(this.error.line).join('\n') + (lines[this.error.line-1] || '').substring(0, this.error.column+1);
	};
};

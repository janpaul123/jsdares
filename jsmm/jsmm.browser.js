module.exports = function(jsmm) {
	require('./jsmm.msg')(jsmm);
	
	jsmm.Browser = function() { return this.init.apply(this, arguments); };
	jsmm.Code = function() { return this.init.apply(this, arguments); };
	
	jsmm.Code.prototype = {
		init: function(text) {
			this.text = '' + text;
			this.lines = text.split(/\n/);
			this.offsets = [0];
			for (var i=1; i<this.lines.length; i++) {
				// add one for the actual newline character
				this.offsets[i] = this.offsets[i-1] + this.lines[i-1].length + 1;
			}
		},
		getLine: function(line) {
			return this.lines[line-1];
		},
		lineColumnToOffset: function(line, column) {
			return this.offsets[line-1] + column;
		},
		posToOffset: function(pos) {
			return this.lineColumnToOffset(pos.line, pos.column);
		},
		rangeToText: function(startPos, endPos) {
			return this.text.substring(this.posToOffset(startPos), this.posToOffset(endPos));
		},
		lineColumnToPositionText: function(line, column) {
			return new Array(line).join('\n') + (this.lines[line-1] || '').substring(0, column);
		},
		elToText: function(el) {
			return this.rangeToText(el.startPos, el.endPos);
		},
		offsetToPos: function(offset) {
			// TODO: implement binary search
			for (var i=0; i<this.lines.length; i++) {
				if (offset < this.offsets[i]) {
					return {line: i, column: offset-(this.offsets[i-1] || 0)};
				}
			}
			return {line: this.lines.length, column: offset-this.offsets[this.lines.length-1]};
		},
		insertAtOffset: function(offset, text) {
			return this.text.substring(0, offset) + text + this.text.substring(offset);
		},
		removeAtOffsetRange: function(offset1, offset2) {
			return this.text.substring(0, offset1) + this.text.substring(offset2);
		}
	};
	
	jsmm.Browser.prototype.init = function(text, scope) {
		this.code = new jsmm.Code(text || '');
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
	
	jsmm.Browser.prototype.setText = function(text) {
		this.reset();
		this.code = new jsmm.Code(text);
	};
	
	jsmm.Browser.prototype.setScope = function(scope) {
		this.reset();
		this.scope = scope;
	};
	
	jsmm.Browser.prototype.getCode = function() {
		return this.code;
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
			this.context = jsmm.parse(this.code.text);
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
		
		var ret = [];
		try {
			do {
				if (this.stack === null || !this.stack.hasNext()) return undefined;
				
				var cont = false;
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
			return ret;
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
};

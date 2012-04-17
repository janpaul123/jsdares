/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	require('./jsmm.msg')(jsmm);
	
	jsmm.func = {};
	jsmm.func.maxCallStackDepth = 100;
	jsmm.func.maxExecutionCounter = 4000;
	
	var findVar = function(scope, name) {
		do {
			if (scope.vars[name] !== undefined) {
				return scope.vars[name];
			}
			scope = scope.parent;
		} while(scope !== null);
		return undefined;
	};

	var getValue = function(node, expression) {
		if (expression.value === undefined) {
			throw new jsmm.msg.Error(node, function(f){ return f(expression.name) + ' is ' + f('undefined'); });
		} else if (expression.value === null) {
			throw new jsmm.msg.Error(node, function(f){ return f(expression.name) + ' is ' + f('null'); });
		} else if (typeof expression.value === 'number' && !isFinite(expression.value)) {
			throw new jsmm.msg.Error(node, function(f){ return f(expression.name) + ' is not a valid number'; });
		} else if (typeof expression.value === 'object' && expression.value.augmented === 'variable') {
			return expression.value.get(node, expression.value.name);
		} else {
			return expression.value;
		}
	};
	
	jsmm.func.Scope = function(vars, parent) {
		this.vars = {};
		for(var name in vars) {
			this.vars[name] = {name: name, value: vars[name]};
		}
		this.parent = parent || null;
	};

	jsmm.func.stringify = function(node, value) {
		if (typeof value === 'function') return '[function]';
		else if (typeof value === 'object' && value.augmented === 'function') return '[function]';
		else if (typeof value === 'object' && value.augmented === 'variable') return JSON.stringify(value.get(node, value.name));
		else if (Object.prototype.toString.call(value) === '[object Array]') return '[array]';
		else if (typeof value === 'object') return '[object]';
		else if (value === undefined) return 'undefined';
		else return JSON.stringify(value);
	};
	
	jsmm.func.postfix = function(node, variable, symbol) {
		if (typeof variable.value !== 'number') {
			throw new jsmm.msg.Error(node, function(f){ return f(symbol) + ' not possible since ' + f(jsmm.func.stringify(node, variable.value)) + ' is not a number'; });
		} else {
			if (symbol === '++') {
				variable.value++;
			} else {
				variable.value--;
			}
		}
		return variable;
	};
	
	jsmm.func.assignment = function(node, variable, symbol, expression) {
		var value;
		if (symbol === '=') {
			value = getValue(node, expression);
		} else {
			value = getValue(node, jsmm.func.binary(node, variable, symbol, expression));
		}
		if (typeof variable.value === 'object' && variable.value.augmented === 'variable') {
			try {
				variable.value.set(node, variable.value.name, value);
			} catch (error) {
				// augmented variables should do their own error handling, so wrap the resulting strings or functions in jsmm messages
				if (['string', 'function'].indexOf(typeof error) >= 0) {
					throw new jsmm.msg.Error(node, error);
				} else {
					throw error;
				}
			}
		} else {
			variable.value = value;
		}
		return variable;
	};
	
	jsmm.func.varItem = function(node, scope, name) {
		scope.vars[name] = {name: name, value: undefined};
		return scope.vars[name];
	};
	
	jsmm.func.binary = function(node, expression1, symbol, expression2) {
		var value1 = getValue(node, expression1), value2 = getValue(node, expression2);
		if (['-', '*', '/', '%', '-=', '*=', '/=', '%=', '>', '>=', '<', '<='].indexOf(symbol) >= 0) {
			if (typeof value1 !== 'number' || !isFinite(value1)) {
				throw new jsmm.msg.Error(node, function(f){ return f(symbol) + ' not possible since ' + f(jsmm.func.stringify(node, value1)) + ' is not a number'; });
			} else if (typeof value2 !== 'number' || !isFinite(value2)) {
				throw new jsmm.msg.Error(node, function(f){ return f(symbol) + ' not possible since ' + f(jsmm.func.stringify(node, value2)) + ' is not a number'; });
			} else if (['/', '/=', '%', '%='].indexOf(symbol) >= 0 && value2 === 0) {
				throw new jsmm.msg.Error(node, function(f){ return f(symbol) + ' not possible since it is a division by zero'; });
			}
		} else if (['+', '+='].indexOf(symbol) >= 0) {
			if (['number', 'string'].indexOf(typeof value1) < 0) {
				throw new jsmm.msg.Error(node, function(f){ return f(symbol) + ' not possible since ' + f(jsmm.func.stringify(node, value1)) + ' is not a number or string'; });
			} else if (['number', 'string'].indexOf(typeof value2) < 0) {
				throw new jsmm.msg.Error(node, function(f){ return f(symbol) + ' not possible since ' + f(jsmm.func.stringify(node, value2)) + ' is not a number or string'; });
			}
		} else if (['&&', '||'].indexOf(symbol) >= 0) {
			if (typeof value1 !== 'boolean') {
				throw new jsmm.msg.Error(node, function(f){ return f(symbol) + ' not possible since ' + f(jsmm.func.stringify(node, value1)) + ' is not a boolean'; });
			} else if (typeof value2 !== 'boolean') {
				throw new jsmm.msg.Error(node, function(f){ return f(symbol) + ' not possible since ' + f(jsmm.func.stringify(node, value2)) + ' is not a boolean'; });
			}
		}
		
		/*jshint eqeqeq:false*/
		var retVal;
		switch(symbol) {
			case '+': case '+=': retVal = value1 + value2; break;
			case '-': case '-=': retVal = value1 - value2; break;
			case '*': case '*=': retVal = value1 * value2; break;
			case '/': case '/=': retVal = value1 / value2; break;
			case '%': case '%=': retVal = value1 % value2; break;
			case '>': retVal = value1 > value2; break;
			case '>=': retVal = value1 >= value2; break;
			case '<': retVal = value1 < value2; break;
			case '<=': retVal = value1 <= value2; break;
			case '&&': retVal = value1 && value2; break;
			case '||': retVal = value1 || value2; break;
			case '==': retVal = value1 == value2; break;
			case '!=': retVal = value1 != value2; break;
		}
		
		return {name: '(' + expression1.name + ' ' + symbol + ' ' + expression2.name + ')', value: retVal};
	};
	
	jsmm.func.unary = function(node, symbol, expression) {
		var value = getValue(node, expression), retVal;
		if (symbol === '!') {
			if (typeof value !== 'boolean') {
				throw new jsmm.msg.Error(node, function(f){ return f(symbol) + ' not possible since ' + f(jsmm.func.stringify(node, value)) + ' is not a boolean'; });
			} else {
				//return {name: symbol + expression.name, value: !value};
				retVal = !value;
			}
		} else {
			if (typeof value !== 'number') {
				throw new jsmm.msg.Error(node, function(f){ return f(symbol) + ' not possible since ' + f(jsmm.func.stringify(node, value)) + ' is not a number'; });
			} else {
				//return {name: symbol + expression.name, value: (symbol==='+' ? value : -value)};
				retVal = (symbol === '+' ? value : -value);
			}
		}
		return {name: '(' + symbol + expression.name + ')', value: retVal};
	};
	
	jsmm.func.number = function(node, num) {
		return {name: jsmm.func.stringify(node, num), value: num};
	};
	
	jsmm.func.string = function(node, str) {
		return {name: jsmm.func.stringify(node, str), value: str};
	};
	
	jsmm.func.bool = function(node, bool) {
		return {name: jsmm.func.stringify(node, bool), value: bool};
	};
	
	jsmm.func.name = function(node, scope, name) {
		var val = findVar(scope, name);
		if (val === undefined) {
			throw new jsmm.msg.Error(node, function(f){ return 'Variable ' + f(name) + ' could not be found'; });
		} else {
			return val;
		}
	};
	
	jsmm.func.object = function(node, object, property) {
		var objectValue = getValue(node, object);
		if (objectValue[property] === undefined || objectValue.augmented !== undefined) {
			throw new jsmm.msg.Error(node, function(f){ return 'Variable ' + f(object.name) + ' does not have property ' + f(property); });
		} else {
			return {name: object.name + '.' + property, value: objectValue[property], parent: objectValue};
		}
	};
	
	jsmm.func.array = function(node, array, index) {
		var arrayValue = getValue(node, array), indexValue = getValue(node, index);
		if (typeof indexValue !== 'number' && indexValue % 1 !== 0) {
			throw new jsmm.msg.Error(node, function(f){ return 'Index ' + f(index.name) + ' is not an integer'; });
		} else if (Object.prototype.toString.call(arrayValue) !== '[object Array]') {
			throw new jsmm.msg.Error(node, function(f){ return 'Variable ' + f(array.name) + ' is not an array'; });
		} else if (arrayValue[indexValue] === undefined) {
			throw new jsmm.msg.Error(node, function(f){ return 'Array ' + f(array.name) + ' has no index ' + f(index.name); });
		} else {
			return {name: array.name + '[' + index.name + ']', value: arrayValue[indexValue]};
		}
	};
	
	jsmm.func.conditional = function(node, type, expression) {
		var value = getValue(node, expression);
		if (typeof value !== 'boolean') {
			throw new jsmm.msg.Error(node, function(f){ return f(type) + ' is not possible since ' + f(expression.name) + ' is not a boolean'; });
		} else {
			return value;
		}
	};
	
	jsmm.func.funcCall = function(node, func, args) {
		var funcValue = getValue(node, func), funcArgs = [], appFunc;

		for (var i=0; i<args.length; i++) {
			funcArgs.push(getValue(node, args[i]));
		}

		if (typeof funcValue === 'object' && funcValue.augmented === 'function') {
			try {
				return jsmm.func.funcWrapResult(node, func, funcValue.func.call(func.parent || null, node, funcValue.name, funcArgs));
			} catch (error) {
				// augmented functions should do their own error handling, so wrap the resulting strings or functions in jsmm messages
				if (['string', 'function'].indexOf(typeof error) >= 0) {
					throw new jsmm.msg.Error(node, error);
				} else {
					throw error;
				}
			}
		} else if (typeof funcValue !== 'function') {
			throw new jsmm.msg.Error(node, function(f){ return 'Variable ' + f(func.name) + ' is not a function'; });
		} else {
			return jsmm.func.funcWrapResult(node, func, funcValue.apply(func.parent || null, funcArgs));
		}
	};
	
	jsmm.func.funcWrapResult = function(node, func, result) {
		if (result === null) result = undefined;
		return {name: func.name, value: result};
	};
	
	jsmm.func.funcDecl = function(node, scope, name, func) {
		// only check local scope for conflicts
		if (scope.vars[name] !== undefined) {
			if (typeof scope.vars[name].value === 'function' || (typeof scope.vars[name].value === 'object' && scope.vars[name].value.augmented === 'function')) {
				throw new jsmm.msg.Error(node, function(f){ return 'Function ' + f(name) + ' cannot be declared since there already is a function with that name'; });
			} else {
				throw new jsmm.msg.Error(node, function(f){ return 'Function ' + f(name) + ' cannot be declared since there already is a variable with that name'; });
			}
		} else {
			scope.vars[name] = {name: name, value: func};
			return scope.vars[name];
		}
	};
	

	jsmm.func.funcEnter = function(node, scope, callStackDepth) {
		/*jshint loopfunc:true*/
		if (callStackDepth > jsmm.func.maxCallStackDepth) {
			throw new jsmm.msg.Error(node, function(f){ return 'Too many nested function calls have been made already, perhaps there is infinite recursion somewhere'; });
		}
		for (var name in scope.vars) {
			if (scope.vars[name].value === undefined) {
				throw new jsmm.msg.Error(node, function(f){ return 'Variable ' + f(scope.vars[name].name) + ' is ' + f('undefined') + ', perhaps there are not enough arguments in the function call'; });
			} else if (scope.vars[name].value === null) {
				throw new jsmm.msg.Error(node, function(f){ return 'Variable ' + f(scope.vars[name].name) + ' is ' + f('null'); });
			}
		}
	};
	
	jsmm.func.funcReturn = function(node, expression) {
		if (expression !== undefined) {
			return getValue(node, expression);
		} else {
			return undefined;
		}
	};
	
	jsmm.func.checkExecutionCounter = function(node, executionCounter) {
		if (executionCounter > jsmm.func.maxExecutionCounter) {
			throw new jsmm.msg.Error(node, function(f){ return 'Program takes too long to run'; });
		}
	};
};

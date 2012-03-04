module.exports = function(jsmm) {
	require('./jsmm.msg')(jsmm);
	
	jsmm.func = {};
	jsmm.func.maxCallStackDepth = 100;
	jsmm.func.maxExecutionCounter = 1000;
	
	var callStackDepth = 0;
	
	var findVar = function(scope, name) {
		do {
			if (scope.vars[name] !== undefined) {
				return scope.vars[name];
			}
			scope = scope.parent;
		} while(scope !== null);
		return undefined;
	};
	
	var stringify = function(value) {
		if (typeof value === 'function') return 'function';
		else if (Object.prototype.toString.call(value) === '[object Array]') return 'array';
		else if (typeof value === 'object') return 'object';
		else if (value === undefined) return 'undefined';
		else return JSON.stringify(value);
	};
	
	jsmm.func.Scope = function(vars, parent) {
		this.vars = {};
		for(var name in vars) {
			this.vars[name] = {name: name, str: stringify(vars[name]), value: vars[name]};
		}
		this.parent = parent || null;
	};
	
	jsmm.func.postfix = function(el, variable, symbol) {
		if (typeof variable.value !== 'number') {
			throw new jsmm.msg.Error(el, function(f){ return f(symbol) + ' not possible since ' + f(variable.name) + ' is not a number'; });
		} else {
			if (symbol === '++') {
				variable.value++;
			} else {
				variable.value--;
			}
		}
		variable.str = stringify(variable.value);
		return variable;
	};
	
	jsmm.func.assignment = function(el, variable, symbol, expression) {
		if (symbol === '=') {
			variable.value = expression.value;
		} else {
			variable.value = jsmm.func.binary(el, variable, symbol, expression).value;
		}
		variable.str = stringify(variable.value);
		return variable;
	};
	
	jsmm.func.varItem = function(el, scope, name) {
		scope.vars[name] = {name: name, value: undefined, str: stringify(undefined)};
		return scope.vars[name];
	};
	
	jsmm.func.binary = function(el, expression1, symbol, expression2) {
		if (expression1.value === undefined) {
			throw new jsmm.msg.Error(el, function(f){ return f(symbol) + ' not possible since ' + f(expression1.name) + ' is ' + f('undefined'); });
		} else if (expression2.value === undefined) {
			throw new jsmm.msg.Error(el, function(f){ return f(symbol) + ' not possible since ' + f(expression2.name) + ' is ' + f('undefined'); });
		} else if (expression1.value === null) {
			throw new jsmm.msg.Error(el, function(f){ return f(symbol) + ' not possible since ' + f(expression1.name) + ' is ' + f('null'); });
		} else if (expression2.value === null) {
			throw new jsmm.msg.Error(el, function(f){ return f(symbol) + ' not possible since ' + f(expression2.name) + ' is ' + f('null'); });
		} else if (['-', '*', '/', '%', '-=', '*=', '/=', '%=', '>', '>=', '<', '<='].indexOf(symbol) >= 0) {
			if (typeof expression1.value !== 'number' || !isFinite(expression1.value)) {
				throw new jsmm.msg.Error(el, function(f){ return f(symbol) + ' not possible since ' + f(expression1.name) + ' is not a number'; });
			} else if (typeof expression2.value !== 'number' || !isFinite(expression2.value)) {
				throw new jsmm.msg.Error(el, function(f){ return f(symbol) + ' not possible since ' + f(expression2.name) + ' is not a number'; });
			} else if (['/', '/=', '%', '%='].indexOf(symbol) >= 0 && expression2.value === 0) {
				throw new jsmm.msg.Error(el, function(f){ return f(symbol) + ' not possible since it is a division by zero'; });
			}
		} else if (['+', '+='].indexOf(symbol) >= 0) {
			if (['number', 'string'].indexOf(typeof expression1.value) < 0) {
				throw new jsmm.msg.Error(el, function(f){ return f(symbol) + ' not possible since ' + f(expression1.name) + ' is not a number or string'; });
			} else if (['number', 'string'].indexOf(typeof expression2.value) < 0) {
				throw new jsmm.msg.Error(el, function(f){ return f(symbol) + ' not possible since ' + f(expression2.name) + ' is not a number or string'; });
			}
		} else if (['&&', '||'].indexOf(symbol) >= 0) {
			if (typeof expression1.value !== 'boolean') {
				throw new jsmm.msg.Error(el, function(f){ return f(symbol) + ' not possible since ' + f(expression1.name) + ' is not a boolean'; });
			} else if (typeof expression2.value !== 'boolean') {
				throw new jsmm.msg.Error(el, function(f){ return f(symbol) + ' not possible since ' + f(expression2.name) + ' is not a boolean'; });
			}
		}
		
		var val;
		switch(symbol) {
			case '+': case '+=': val = expression1.value + expression2.value; break;
			case '-': case '-=': val = expression1.value - expression2.value; break;
			case '*': case '*=': val = expression1.value * expression2.value; break;
			case '/': case '/=': val = expression1.value / expression2.value; break;
			case '%': case '%=': val = expression1.value % expression2.value; break;
			case '>': val = expression1.value > expression2.value; break;
			case '>=': val = expression1.value >= expression2.value; break;
			case '<': val = expression1.value < expression2.value; break;
			case '<=': val = expression1.value <= expression2.value; break;
			case '&&': val = expression1.value && expression2.value; break;
			case '||': val = expression1.value || expression2.value; break;
			case '==': val = expression1.value == expression2.value; break;
			case '!=': val = expression1.value != expression2.value; break;
		}
		
		return {name: '(' + expression1.name + ' ' + symbol + ' ' + expression2.name + ')', str: stringify(val), value: val};
	};
	
	jsmm.func.unary = function(el, symbol, expression) {
		var val;
		if (symbol === '!') {
			if (typeof expression.value !== 'boolean') {
				throw new jsmm.msg.Error(el, function(f){ return f(symbol) + ' not possible since ' + f(expression.name) + ' is not a boolean'; });
			} else {
				//return {name: symbol + expression.name, value: !expression.value};
				val = !expression.value;
			}
		} else {
			if (typeof expression.value !== 'number') {
				throw new jsmm.msg.Error(el, function(f){ return f(symbol) + ' not possible since ' + f(expression.name) + ' is not a number'; });
			} else {
				//return {name: symbol + expression.name, value: (symbol==='+' ? expression.value : -expression.value)};
				val = (symbol==='+' ? expression.value : -expression.value);
			}
		}
		return {name: '(' + symbol + expression.name + ')', str: stringify(val), value: val};
	};
	
	jsmm.func.number = function(el, num) {
		return {name: stringify(num), str: stringify(num), value: num};
	};
	
	jsmm.func.string = function(el, str) {
		return {name: stringify(str), str: stringify(str), value: str};
	};
	
	jsmm.func.bool = function(el, bool) {
		return {name: stringify(bool), str: stringify(bool), value: bool};
	};
	
	jsmm.func.name = function(el, scope, name) {
		var val = findVar(scope, name);
		if (val === undefined) {
			throw new jsmm.msg.Error(el, function(f){ return 'Variable ' + f(name) + ' could not be found'; });
		} else {
			return val;
		}
	};
	
	jsmm.func.object = function(el, object, property) {
		if (object.value[property] === undefined) {
			throw new jsmm.msg.Error(el, function(f){ return 'Variable ' + f(object.name) + ' does not have property ' + f(property); });
		} else {
			return {name: object.name + '.' + property, str: stringify(object.value[property]), value: object.value[property], parent: object.value};
		}
	};
	
	jsmm.func.array = function(el, array, index) {
		if (typeof index.value !== "number" && index.value % 1 !== 0) {
			throw new jsmm.msg.Error(el, function(f){ return 'Index ' + f(index.name) + ' is not an integer'; });
		} else if (Object.prototype.toString.call(array.value) !== '[object Array]') {
			throw new jsmm.msg.Error(el, function(f){ return 'Variable ' + f(array.name) + ' is not an array'; });
		} else if (array.value[index.value] === undefined) {
			throw new jsmm.msg.Error(el, function(f){ return 'Array ' + f(array.name) + ' has no index ' + f(index.name); });
		} else {
			return {name: object.name + '[' + index.name + ']', str: stringify(array.value[index.value]), value: array.value[index.value]};
		}
	};
	
	jsmm.func.conditional = function(el, type, expression) {
		if (typeof expression.value !== 'boolean') {
			throw new jsmm.msg.Error(el, function(f){ return f(type) + ' is not possible since ' + f(expression.name) + ' is not a boolean'; });
		} else {
			return expression.value;
		}
	};
	
	jsmm.func.funcCall = function(el, func, args) {
		if (typeof func.value !== 'function') {
			throw new jsmm.msg.Error(el, function(f){ return 'Variable ' + f(func.name) + ' is not a function'; });
		} else {
			var funcArgs = [];
			for (var i=0; i<args.length; i++) {
				if (args[i].value === undefined) {
					throw new jsmm.msg.Error(el, function(f){ return 'Argument ' + f(args[i].name) + ' is undefined'; });
				} else if (args[i].value === undefined) {
					throw new jsmm.msg.Error(el, function(f){ return 'Argument ' + f(args[i].name) + ' is null'; });
				} else {
					funcArgs.push(args[i].value);
				}
			}
			
			return jsmm.func.funcWrapResult(el, func, func.value.apply(func.parent || null, funcArgs));
		}
	};
	
	jsmm.func.funcWrapResult = function(el, func, result) {
		if (result === null) result = undefined;
		
		if (typeof func.value !== 'function') {
			throw new jsmm.msg.Error(el, function(f){ return 'Variable ' + f(func.name) + ' is not a function'; });
		} else {
			return {name: func.name, str: stringify(result), value: result};
		}
	};
	
	jsmm.func.funcDecl = function(el, scope, name, func) {
		// only check local scope for conflicts
		if (scope.vars[name] !== undefined) {
			if (typeof scope.vars[name].value === 'function') {
				throw new jsmm.msg.Error(el, function(f){ return 'Function ' + f(name) + ' cannot be declared since there already is a function with that name'; });
			} else {
				throw new jsmm.msg.Error(el, function(f){ return 'Function ' + f(name) + ' cannot be declared since there already is a variable with that name'; });
			}
		} else {
			scope.vars[name] = {name: name, str: name, value: func};
			return scope.vars[name];
		}
	};
	
	jsmm.func.funcEnter = function(el, scope) {
		callStackDepth++;
		if (callStackDepth > jsmm.func.maxCallStackDepth) {
			throw new jsmm.msg.Error(el, function(f){ return 'Too many nested function calls have been made already, perhaps there is infinite recursion somewhere'; });
		}
		for (var name in scope.vars) {
			if (scope.vars[name].value === undefined) {
				throw new jsmm.msg.Error(el, function(f){ return 'Variable ' + f(scope.vars[name].name) + ' is ' + f('undefined') + ', perhaps there are not enough arguments in the function call'; });
			} else if (scope.vars[name].value === null) {
				throw new jsmm.msg.Error(el, function(f){ return 'Variable ' + f(scope.vars[name].name) + ' is ' + f('null'); });
			}
		}
	};
	
	jsmm.func.funcReturn = function(el, expression) {
		var value = undefined;
		if (expression !== undefined) {
			value = expression.value;
		}
		callStackDepth--;
		return value;
	};
	
	jsmm.func.checkExecutionCounter = function(el, executionCounter) {
		if (executionCounter > jsmm.func.maxExecutionCounter) {
			throw new jsmm.msg.Error(el, function(f){ return 'Program takes too long to run, perhaps there is an infinite loop somewhere'; });
		}
	};
};

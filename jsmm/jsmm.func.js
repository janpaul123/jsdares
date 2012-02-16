module.exports = function(jsmm) {
	jsmm.func = {};
	jsmm.func.maxCallStackDepth = 100;
	jsmm.func.maxExecutionCounter = 1000;
	
	var callStackDepth = 0;
	var executionCounter = 0;
	
	var findVar = function(scope, name) {
		do {
			if (scope.vars[name] !== undefined) {
				return scope.vars[name];
			}
			scope = scope.parent;
		} while(scope !== null);
		return undefined;
	};
	
	jsmm.func.Scope = function(vars, parent) {
		this.vars = {};
		for(var name in vars) {
			this.vars[name] = {name: name, value: vars[name]};
		}
		this.parent = parent || null;
	};
	
	jsmm.func.postfix = function(pos, variable, symbol) {
		if (typeof variable.value !== 'number') {
			jsmm.throwError(pos, function(f){ return f(symbol) + ' not possible since ' + f(variable.name) + ' is not a number'; });
		} else {
			if (symbol === '++') {
				variable.value++;
			} else {
				variable.value--;
			}
		}
	};
	
	jsmm.func.assignment = function(pos, variable, symbol, expression) {
		if (symbol === '=') {
			variable.value = expression.value;
		} else {
			variable.value = jsmm.func.binary(pos, variable, symbol, expression).value;
		}
	};
	
	jsmm.func.varItem = function(pos, scope, name) {
		scope.vars[name] = {name: name, value: undefined};
	};
	
	jsmm.func.binary = function(pos, expression1, symbol, expression2) {
		if (expression1.value === undefined) {
			jsmm.throwError(pos, function(f){ return f(symbol) + ' not possible since ' + f(expression1.name) + ' is ' + f('undefined'); });
		} else if (expression2.value === undefined) {
			jsmm.throwError(pos, function(f){ return f(symbol) + ' not possible since ' + f(expression2.name) + ' is ' + f('undefined'); });
		} else if (['-', '*', '/', '%', '-=', '*=', '/=', '%=', '>', '>=', '<', '<='].indexOf(symbol) >= 0) {
			if (typeof expression1.value !== 'number') {
				jsmm.throwError(pos, function(f){ return f(symbol) + ' not possible since ' + f(expression1.name) + ' is not a number'; });
			} else if (typeof expression2.value !== 'number') {
				jsmm.throwError(pos, function(f){ return f(symbol) + ' not possible since ' + f(expression2.name) + ' is not a number'; });
			} else if (isNaN(expression1.value)) {
				jsmm.throwError(pos, function(f){ return f(symbol) + ' not possible since ' + f(expression1.name) + ' is ' + f('NaN') + ' (special ' + f('not a number') + ' value)'; });
			} else if (isNaN(expression1.value)) {
				jsmm.throwError(pos, function(f){ return f(symbol) + ' not possible since ' + f(expression2.name) + ' is ' + f('NaN') + ' (special ' + f('not a number') + ' value)'; });
			}
		} else if (['+', '+='].indexOf(symbol) >= 0) {
			if (['number', 'string'].indexOf(typeof expression1.value) < 0) {
				jsmm.throwError(pos, function(f){ return f(symbol) + ' not possible since ' + f(expression1.name) + ' is not a number or string'; });
			} else if (['number', 'string'].indexOf(typeof expression2.value) < 0) {
				jsmm.throwError(pos, function(f){ return f(symbol) + ' not possible since ' + f(expression2.name) + ' is not a number or string'; });
			}
		} else if (['&&', '||'].indexOf(symbol) >= 0) {
			if (typeof expression1.value !== 'boolean') {
				jsmm.throwError(pos, function(f){ return f(symbol) + ' not possible since ' + f(expression1.name) + ' is not a boolean'; });
			} else if (typeof expression2.value !== 'boolean') {
				jsmm.throwError(pos, function(f){ return f(symbol) + ' not possible since ' + f(expression2.name) + ' is not a boolean'; });
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
		return {name: '(' + expression1.name + ' ' + symbol + ' ' + expression2.name + ')', value: val};
	};
	
	jsmm.func.unary = function(pos, symbol, expression) {
		if (symbol === '!') {
			if (typeof expression.value !== 'boolean') {
				jsmm.throwError(pos, function(f){ return f(symbol) + ' not possible since ' + f(expression) + ' is not a boolean'; });
			} else {
				return {name: symbol + expression.name, value: !expression.value};
			}
		} else {
			if (typeof expression.value !== 'number') {
				jsmm.throwError(pos, function(f){ return f(symbol) + ' not possible since ' + f(expression) + ' is not a number'; });
			} else {
				return {name: symbol + expression.name, value: (symbol==='+' ? expression.value : -expression.value)};
			}
		}
	};
	
	jsmm.func.number = function(pos, num) {
		return {name: num, value: num};
	};
	
	jsmm.func.string = function(pos, str) {
		return {name: JSON.stringify(str), value: str};
	};
	
	jsmm.func.bool = function(pos, bool) {
		return {name: (bool?'true':'false'), value: bool};
	};
	
	jsmm.func.name = function(pos, scope, name) {
		var val = findVar(scope, name);
		if (val === undefined) {
			jsmm.throwError(pos, function(f){ return 'Variable ' + f(name) + ' could not be found'; });
		} else {
			return val;
		}
	};
	
	jsmm.func.object = function(pos, object, property) {
		if (object.value[property] === undefined) {
			jsmm.throwError(pos, function(f){ return 'Variable ' + f(object.name) + ' does not have property ' + f(property); });
		} else {
			return {name: object.name + '.' + property, value: object.value[property], parent: object.value};
		}
	};
	
	jsmm.func.array = function(pos, array, index) {
		if (typeof index.value !== "number" && index.value % 1 !== 0) {
			jsmm.throwError(pos, function(f){ return 'Index ' + f(index.name) + ' is not an integer'; });
		} else if (Object.prototype.toString.call(array.value) !== '[object Array]') {
			jsmm.throwError(pos, function(f){ return 'Variable ' + f(array.name) + ' is not an array'; });
		} else if (array.value[index.value] === undefined) {
			jsmm.throwError(pos, function(f){ return 'Array ' + f(array.name) + ' has no index ' + f(index.name); });
		} else {
			return {name: object.name + '[' + index.name + ']', value: array.value[index.value]};
		}
	};
	
	jsmm.func.conditional = function(pos, type, expression) {
		if (typeof expression.value !== 'boolean') {
			jsmm.throwError(pos, function(f){ return f(type) + ' is not possible since ' + f(expression.name) + ' is not a boolean'; });
		} else {
			return expression.value;
		}
	};
	
	jsmm.func.funcCall = function(pos, func, args) {
		if (typeof func.value !== 'function') {
			jsmm.throwError(pos, function(f){ return 'Variable ' + f(func.name) + ' is not a function'; });
		} else {
			var funcArgs = [];
			for (var i=0; i<args.length; i++) {
				if (args[i].value === undefined) {
					jsmm.throwError(pos, function(f){ return 'Argument ' + f(args[i].name) + ' is undefined'; });
				} else if (args[i].value === undefined) {
					jsmm.throwError(pos, function(f){ return 'Argument ' + f(args[i].name) + ' is null'; });
				} else {
					funcArgs.push(args[i].value);
				}
			}
			
			return {name: func.name, value: func.value.apply(func.parent || null, funcArgs)};
		}
	};
	
	jsmm.func.funcDecl = function(pos, scope, name, func) {
		// only check local scope for conflicts
		if (scope.vars[name] !== undefined) {
			if (typeof scope.vars[name].value === 'function') {
				jsmm.throwError(pos, function(f){ return 'Function ' + f(name) + ' cannot be declared since there already is a function with that name'; });
			} else {
				jsmm.throwError(pos, function(f){ return 'Function ' + f(name) + ' cannot be declared since there already is a variable with that name'; });
			}
		} else {
			scope.vars[name] = {name: name, value: func};
		}
	};
	
	jsmm.func.funcEnter = function(pos) {
		callStackDepth++;
		if (callStackDepth > jsmm.func.maxCallStackDepth) {
			jsmm.throwError(pos, function(f){ return 'Too many nested function calls have been made already, perhaps there is infinite recursion somewhere'; });
		}
	};
	
	jsmm.func.funcReturn = function(pos, expression) {
		var value = undefined;
		if (expression !== undefined) {
			value = expression.value;
		}
		callStackDepth--;
		return value;
	};
	
	jsmm.func.increaseExecutionCounter = function(pos) {
		executionCounter++;
		jsmm.func.checkExecutionCounter(pos);
	};
	
	jsmm.func.checkExecutionCounter = function(pos) {
		if (executionCounter > jsmm.func.maxExecutionCounter) {
			jsmm.throwError(pos, function(f){ return 'Program takes too long to run, perhaps there is an infinite loop somewhere'; });
		}
	};
	
	jsmm.func.resetExecutionCounter = function() {
		executionCounter = 0;
	};
};

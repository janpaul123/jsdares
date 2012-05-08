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
			throw new jsmm.msg.Error(node, '<var>' + expression.name + '</var> is <var>undefined</var>');
		} else if (expression.value === null) {
			throw new jsmm.msg.Error(node, '<var>' + expression.name + '</var> is <var>null</var>');
		} else if (typeof expression.value === 'number' && !isFinite(expression.value)) {
			throw new jsmm.msg.Error(node, '<var>' + expression.name + '</var> is not a valid number');
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
	
	jsmm.nodes.PostfixStatement.prototype.runFunc = function(context, variable, symbol) {
		if (typeof variable.value !== 'number') {
			throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since <var>' + jsmm.func.stringify(this, variable.value) + '</var> is not a number');
		} else {
			if (symbol === '++') {
				variable.value++;
			} else {
				variable.value--;
			}
		}
		return variable;
	};
	
	jsmm.nodes.AssignmentStatement.prototype.runFunc = function(context, variable, symbol, expression) {
		var value;
		if (symbol === '=') {
			value = getValue(this, expression);
		} else {
			value = getValue(this, jsmm.nodes.BinaryExpression.prototype.runFunc.call(this, context, variable, symbol, expression));
		}
		if (typeof variable.value === 'object' && variable.value.augmented === 'variable') {
			try {
				variable.value.set(this, variable.value.name, value);
			} catch (error) {
				// augmented variables should do their own error handling, so wrap the resulting strings in jsmm messages
				if (typeof error === 'string') {
					throw new jsmm.msg.Error(this, error);
				} else {
					throw error;
				}
			}
		} else {
			variable.value = value;
		}
		return variable;
	};
	
	jsmm.nodes.VarItem.prototype.runFunc = function(context, scope, name) {
		scope.vars[name] = {name: name, value: undefined};
		return scope.vars[name];
	};
	
	jsmm.nodes.BinaryExpression.prototype.runFunc = function(context, expression1, symbol, expression2) {
		var value1 = getValue(this, expression1), value2 = getValue(this, expression2);
		if (['-', '*', '/', '%', '-=', '*=', '/=', '%=', '>', '>=', '<', '<='].indexOf(symbol) >= 0) {
			if (typeof value1 !== 'number' || !isFinite(value1)) {
				throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since <var>' + jsmm.func.stringify(this, value1) + '</var> is not a number');
			} else if (typeof value2 !== 'number' || !isFinite(value2)) {
				throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since <var>' + jsmm.func.stringify(this, value2) + '</var> is not a number');
			} else if (['/', '/=', '%', '%='].indexOf(symbol) >= 0 && value2 === 0) {
				throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since it is a division by zero');
			}
		} else if (['+', '+='].indexOf(symbol) >= 0) {
			if (['number', 'string'].indexOf(typeof value1) < 0) {
				throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since <var>' + jsmm.func.stringify(this, value1) + '</var> is not a number or string');
			} else if (['number', 'string'].indexOf(typeof value2) < 0) {
				throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since <var>' + jsmm.func.stringify(this, value2) + '</var> is not a number or string');
			}
		} else if (['&&', '||'].indexOf(symbol) >= 0) {
			if (typeof value1 !== 'boolean') {
				throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since <var>' + jsmm.func.stringify(this, value1) + '</var> is not a boolean');
			} else if (typeof value2 !== 'boolean') {
				throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since <var>' + jsmm.func.stringify(this, value2) + '</var> is not a boolean');
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
	
	jsmm.nodes.UnaryExpression.prototype.runFunc = function(context, symbol, expression) {
		var value = getValue(this, expression), retVal;
		if (symbol === '!') {
			if (typeof value !== 'boolean') {
				throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since <var>' + jsmm.func.stringify(this, value) + '</var> is not a boolean');
			} else {
				//return {name: symbol + expression.name, value: !value};
				retVal = !value;
			}
		} else {
			if (typeof value !== 'number') {
				throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since <var>' + jsmm.func.stringify(this, value) + '</var> is not a number');
			} else {
				//return {name: symbol + expression.name, value: (symbol==='+' ? value : -value)};
				retVal = (symbol === '+' ? value : -value);
			}
		}
		return {name: '(' + symbol + expression.name + ')', value: retVal};
	};
	
	jsmm.nodes.NumberLiteral.prototype.runFunc = function(context, num) {
		return {name: jsmm.func.stringify(this, num), value: num};
	};
	
	jsmm.nodes.StringLiteral.prototype.runFunc = function(context, str) {
		return {name: jsmm.func.stringify(this, str), value: str};
	};
	
	jsmm.nodes.BooleanLiteral.prototype.runFunc = function(context, bool) {
		return {name: jsmm.func.stringify(this, bool), value: bool};
	};
	
	jsmm.nodes.NameIdentifier.prototype.runFunc = function(context, scope, name) {
		var val = findVar(scope, name);
		if (val === undefined) {
			throw new jsmm.msg.Error(this, 'Variable <var>' + name + '</var> could not be found');
		} else {
			return val;
		}
	};
	
	jsmm.nodes.ObjectIdentifier.prototype.runFunc = function(context, object, property) {
		var objectValue = getValue(this, object);
		if (objectValue[property] === undefined || objectValue.augmented !== undefined) {
			throw new jsmm.msg.Error(this, 'Variable <var>' + object.name + '</var> does not have property <var>' + property + '</var>');
		} else {
			return {name: object.name + '.' + property, value: objectValue[property]};
		}
	};
	
	jsmm.nodes.ArrayIdentifier.prototype.runFunc = function(context, array, index) {
		var arrayValue = getValue(this, array), indexValue = getValue(this, index);
		if (typeof indexValue !== 'number' && indexValue % 1 !== 0) {
			throw new jsmm.msg.Error(this, 'Index <var>' + index.name + '</var> is not an integer');
		} else if (Object.prototype.toString.call(arrayValue) !== '[object Array]') {
			throw new jsmm.msg.Error(this, 'Variable <var>' + array.name + '</var> is not an array');
		} else if (arrayValue[indexValue] === undefined) {
			throw new jsmm.msg.Error(this, 'Array <var>' + array.name + '</var> has no index <var>' + index.name + '</var>');
		} else {
			return {name: array.name + '[' + index.name + ']', value: arrayValue[indexValue]};
		}
	};
	
	jsmm.nodes.IfBlock.prototype.runFunc = jsmm.nodes.WhileBlock.prototype.runFunc =
	jsmm.nodes.ForBlock.prototype.runFunc = function(context, expression) {
		var value = getValue(this, expression);
		var type = ''; // TODO
		if (typeof value !== 'boolean') {
			throw new jsmm.msg.Error(this, '<var>' + type + '</var> is not possible since <var>' + expression.name + '</var> is not a boolean');
		} else {
			return value;
		}
	};
	
	jsmm.nodes.FunctionCall.prototype.runFunc = function(context, func, args) {
		var funcValue = getValue(this, func), funcArgs = [], appFunc;

		for (var i=0; i<args.length; i++) {
			funcArgs.push(getValue(this, args[i]));
		}

		var retVal;
		if (typeof funcValue === 'object' && funcValue.augmented === 'function') {
			context.enterExternalCall(this, funcValue, funcArgs);
			try {
				retVal = funcValue.func.call(null, context, funcValue.name, funcArgs);
			} catch (error) {
				// augmented functions should do their own error handling, so wrap the resulting strings in jsmm messages
				if (typeof error === 'string') {
					throw new jsmm.msg.Error(this, error);
				} else {
					throw error;
				}
			}
			context.leaveExternalCall(this);
		} else if (typeof funcValue !== 'function') {
			throw new jsmm.msg.Error(this, 'Variable <var>' + func.name + '</var> is not a function');
		} else {
			context.enterInternalCall(this);
			retVal = funcValue.call(null, context, funcArgs);
			context.leaveInternalCall(this);
		}

		if (retVal === null) retVal = undefined;

		return {name: func.name, value: retVal};
	};
	
	jsmm.nodes.FunctionDeclaration.prototype.runFuncDecl = function(context, scope, name, func) {
		// only check local scope for conflicts
		if (scope.vars[name] !== undefined) {
			if (typeof scope.vars[name].value === 'function' || (typeof scope.vars[name].value === 'object' && scope.vars[name].value.augmented === 'function')) {
				throw new jsmm.msg.Error(this, 'Function <var>' + name + '</var> cannot be declared since there already is a function with that name');
			} else {
				throw new jsmm.msg.Error(this, 'Function <var>' + name + '</var> cannot be declared since there already is a variable with that name');
			}
		} else {
			scope.vars[name] = {name: name, value: func};
			return scope.vars[name];
		}
	};
	
	jsmm.nodes.FunctionDeclaration.prototype.runFuncEnter = function(context, args) {
		/*jshint loopfunc:true*/
		if (args.length < this.nameArgs.length) {
			throw new jsmm.msg.Error(this, 'Function expects <var>' + this.nameArgs.length + '</var> arguments, but got only <var>' + args.length + '</var> are given');
		}
		var scopeVars = {};
		for (var i=0; i<this.nameArgs.length; i++) {
			if (args[i] === undefined) {
				throw new jsmm.msg.Error(this, 'Variable <var>' + this.nameArgs[i] + '</var> is <var>undefined</var>');
			} else if (args[i] === null) {
				throw new jsmm.msg.Error(this, 'Variable <var>' + this.nameArgs[i] + '</var> is <var>null</var>');
			} else {
				scopeVars[this.nameArgs[i]] = args[i];
			}
		}
		context.enterFunction(this);
		return new jsmm.func.Scope(scopeVars);
	};
	
	jsmm.nodes.ReturnStatement.prototype.runFunc =
	jsmm.nodes.FunctionDeclaration.prototype.runFuncLeave = function(context, expression) {
		var retVal;
		if (expression !== undefined) {
			retVal = getValue(this, expression);
		}
		context.leaveFunction(this);
		return retVal;
	};
};

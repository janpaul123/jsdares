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
		var value = expression;
		if (typeof value === 'object' && value.type === 'local') {
			value = value.value;
		}

		if (value === undefined) {
			throw new jsmm.msg.Error(node, '<var>' + node.getCode() + '</var> is <var>undefined</var>');
		} else if (value === null) {
			throw new jsmm.msg.Error(node, '<var>' + node.getCode() + '</var> is <var>null</var>');
		} else if (typeof value === 'number' && !isFinite(value)) {
			throw new jsmm.msg.Error(node, '<var>' + node.getCode() + '</var> is not a valid number');
		} else if (typeof value === 'object' && value.type === 'variable') {
			return value.get(node, value.name);
		} else {
			return value;
		}
	};

	var stringify = function(value) {
		if (typeof value === 'function') return '[function]';
		else if (typeof value === 'object' && value.type === 'function') return '[function]';
		else if (Object.prototype.toString.call(value) === '[object Array]') return '[array]';
		else if (typeof value === 'object') return '[object]';
		else if (value === undefined) return 'undefined';
		else return JSON.stringify(value);
	};
	
	jsmm.func.Scope = function(vars, parent) {
		this.vars = {};
		for (var name in vars) {
			this.vars[name] = {type: 'local', value: vars[name]};
		}
		this.parent = parent || null;
	};

	var setVariable = function(node, variableNode, variable, value) {
		if (typeof variable !== 'object' || ['variable', 'local'].indexOf(variable.type) < 0) {
			throw new jsmm.msg.Error(node, 'Cannot assign <var>' + stringify(value) + '</var> to <var>' + variableNode.getCode() + '</var>');
		} else if (variable.type === 'variable') {
			try {
				variable.set(node, variable.name, value);
			} catch (error) {
				// augmented variables should do their own error handling, so wrap the resulting strings in jsmm messages
				if (typeof error === 'string') {
					throw new jsmm.msg.Error(node, error);
				} else {
					throw error;
				}
			}
		} else {
			variable.value = value;
		}
	};
	
	jsmm.nodes.PostfixStatement.prototype.runFunc = function(context, variable, symbol) {
		var value = getValue(this.identifier, variable);

		if (typeof value !== 'number') {
			throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since <var>' + stringify(value) + '</var> is not a number');
		} else {
			if (symbol === '++') {
				value++;
			} else {
				value--;
			}
			setVariable(this, this.identifier, variable, value);
			context.newStep([new jsmm.msg.Inline(this, context.callCounter, '<var>' + this.identifier.getCode() + '</var> = <var>' + stringify(value) + '</var>')]);
		}
	};

	var runBinaryExpression = function(value1, symbol, value2) {
		if (['-', '*', '/', '%', '-=', '*=', '/=', '%=', '>', '>=', '<', '<='].indexOf(symbol) >= 0) {
			if (typeof value1 !== 'number' || !isFinite(value1)) {
				throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since <var>' + stringify(value1) + '</var> is not a number');
			} else if (typeof value2 !== 'number' || !isFinite(value2)) {
				throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since <var>' + stringify(value2) + '</var> is not a number');
			} else if (['/', '/=', '%', '%='].indexOf(symbol) >= 0 && value2 === 0) {
				throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since it is a division by zero');
			}
		} else if (['+', '+='].indexOf(symbol) >= 0) {
			if (['number', 'string'].indexOf(typeof value1) < 0) {
				throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since <var>' + stringify(value1) + '</var> is not a number or string');
			} else if (['number', 'string'].indexOf(typeof value2) < 0) {
				throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since <var>' + stringify(value2) + '</var> is not a number or string');
			}
		} else if (['&&', '||'].indexOf(symbol) >= 0) {
			if (typeof value1 !== 'boolean') {
				throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since <var>' + stringify(value1) + '</var> is not a boolean');
			} else if (typeof value2 !== 'boolean') {
				throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since <var>' + stringify(value2) + '</var> is not a boolean');
			}
		}
		
		switch(symbol) {
			case '+': case '+=': return value1 + value2;
			case '-': case '-=': return value1 - value2;
			case '*': case '*=': return value1 * value2;
			case '/': case '/=': return value1 / value2;
			case '%': case '%=': return value1 % value2;
			case '>': return value1 > value2;
			case '>=': return value1 >= value2;
			case '<': return value1 < value2;
			case '<=': return value1 <= value2;
			case '&&': return value1 && value2;
			case '||': return value1 || value2;
			case '==': return value1 == value2;
			case '!=': return value1 != value2;
		}
	};
	
	jsmm.nodes.AssignmentStatement.prototype.runFunc = function(context, variable, symbol, expression) {
		var value;
		if (symbol === '=') {
			value = getValue(this.expression, expression);
		} else {
			value = runBinaryExpression(getValue(this.identifier, variable), symbol, getValue(this.expression, expression));
		}
		setVariable(this, this.identifier, variable, value);
		context.newStep([new jsmm.msg.Inline(this, context.callCounter, '<var>' + this.identifier.getCode() + '</var> = <var>' + stringify(value) + '</var>')]);
	};
	
	jsmm.nodes.VarItem.prototype.runFunc = function(context, scope, name) {
		scope.vars[name] = {type: 'local', value: undefined};
		if (this.assignment === null) {
			context.newStep([new jsmm.msg.Inline(this, context.callCounter, '<var>' + this.name + '</var> = <var>undefined</var>')]);
		}
	};
	
	jsmm.nodes.BinaryExpression.prototype.runFunc = function(context, expression1, symbol, expression2) {
		var value1 = getValue(this.expression1, expression1);
		var value2 = getValue(this.expression2, expression2);
		var result = runBinaryExpression(value1, symbol, value2);
		context.newStep([new jsmm.msg.Inline(this, context.callCounter, '<var>' + stringify(value1) + '</var> ' + symbol + ' <var>' + stringify(value2) + '</var> = <var>' + stringify(result) + '</var>')]);
		return result;
	};
	
	jsmm.nodes.UnaryExpression.prototype.runFunc = function(context, symbol, expression) {
		var value = getValue(this.expression, expression);
		var result;
		if (symbol === '!') {
			if (typeof value !== 'boolean') {
				throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since <var>' + stringify(value) + '</var> is not a boolean');
			} else {
				result = !value;
			}
		} else {
			if (typeof value !== 'number') {
				throw new jsmm.msg.Error(this, '<var>' + symbol + '</var> not possible since <var>' + stringify(value) + '</var> is not a number');
			} else {
				result = (symbol === '+' ? value : -value);
			}
		}
		context.newStep([new jsmm.msg.Inline(this, context.callCounter, '<var>' + symbol + stringify(value) + '</var> = <var>' + stringify(result) + '</var>')]);
		return result;
	};
	
	jsmm.nodes.NameIdentifier.prototype.runFunc = function(context, scope, name) {
		var val = findVar(scope, name);
		if (val === undefined) {
			throw new jsmm.msg.Error(this, 'Variable <var>' + name + '</var> could not be found');
		} else {
			return val;
		}
	};
	
	jsmm.nodes.ObjectIdentifier.prototype.runFunc = function(context, identifier, property) {
		var identifierValue = getValue(this.identifier, identifier);
		if (identifierValue[property] === undefined || identifierValue.type !== undefined) {
			throw new jsmm.msg.Error(this, 'Variable <var>' + this.identifier.getCode() + '</var> does not have property <var>' + property + '</var>');
		} else {
			return identifierValue[property];
		}
	};
	
	jsmm.nodes.ArrayIdentifier.prototype.runFunc = function(context, identifier, expression) {
		var identifierValue = getValue(this.identifier, identifier);
		var expressionValue = getValue(this.expression, expression);
		if (typeof expressionValue !== 'number' && expressionValue % 1 !== 0) {
			throw new jsmm.msg.Error(this, 'Index <var>' + this.expression.getCode() + '</var> is not an integer');
		} else if (Object.prototype.toString.call(identifierValue) !== '[object Array]') {
			throw new jsmm.msg.Error(this, 'Variable <var>' + this.identifier.getCode() + '</var> is not an array');
		} else if (identifierValue[expressionValue] === undefined) {
			throw new jsmm.msg.Error(this, 'Array <var>' + this.identifier.getCode() + '</var> has no index <var>' + stringify(expressionValue) + '</var>');
		} else {
			return identifierValue[expressionValue];
		}
	};
	
	jsmm.nodes.IfBlock.prototype.runFunc = jsmm.nodes.WhileBlock.prototype.runFunc =
	jsmm.nodes.ForBlock.prototype.runFunc = function(context, expression) {
		var value = getValue(this.expression, expression);
		var type = (this.type === 'IfBlock' ? 'if' : (this.type === 'WhileBlock' ? 'while' : 'for'));
		if (typeof value !== 'boolean') {
			throw new jsmm.msg.Error(this, '<var>' + type + '</var> is not possible since <var>' + stringify(value) + '</var> is not a boolean');
		} else {
			return value;
		}
	};
	
	jsmm.nodes.FunctionCall.prototype.runFunc = function(context, func, args) {
		var funcValue = getValue(this.identifier, func), funcArgs = [], msgFuncArgs = [], appFunc;

		for (var i=0; i<args.length; i++) {
			var value = getValue(this.expressionArgs[i], args[i]);
			funcArgs.push(value);
			msgFuncArgs.push(stringify(value));
		}

		context.newStep([new jsmm.msg.Inline(this, context.callCounter, 'calling <var>' + this.identifier.getCode() + '(' + msgFuncArgs.join(', ') + ')' + '</var>')]);

		var retVal;
		context.enterCall(this);
		if (typeof funcValue === 'object' && funcValue.type === 'function') {
			context.newCall(this);
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
		} else if (typeof funcValue !== 'function') {
			throw new jsmm.msg.Error(this, 'Variable <var>' + this.identifier.getCode() + '</var> is not a function');
		} else {
			retVal = funcValue.call(null, context, funcArgs);
		}
		context.leaveCall(this);

		if (retVal === null) {
			retVal = undefined;
		}

		if (retVal !== undefined) {
			context.newStep([new jsmm.msg.Inline(this, context.callCounter, '<var>' + this.identifier.getCode() + '(' + msgFuncArgs.join(', ') + ')' + '</var> = <var>' + stringify(retVal) + '</var>')]);
		}



		return retVal;
	};
	
	jsmm.nodes.FunctionDeclaration.prototype.runFuncDecl = function(context, scope, name, func) {
		// only check local scope for conflicts
		if (scope.vars[name] !== undefined) {
			if (typeof scope.vars[name] === 'function' || (typeof scope.vars[name] === 'object' && scope.vars[name].type === 'function')) {
				throw new jsmm.msg.Error(this, 'Function <var>' + name + '</var> cannot be declared since there already is a function with that name');
			} else {
				throw new jsmm.msg.Error(this, 'Function <var>' + name + '</var> cannot be declared since there already is a variable with that name');
			}
		} else {
			scope.vars[name] = func;
			context.newStep([new jsmm.msg.Inline(this, context.callCounter, 'declaring <var>' + this.name + this.getArgList() + '</var>')]);
			return scope.vars[name];
		}
	};
	
	jsmm.nodes.FunctionDeclaration.prototype.runFuncEnter = function(context, args) {
		/*jshint loopfunc:true*/
		if (args.length < this.nameArgs.length) {
			throw new jsmm.msg.Error(this, 'Function expects <var>' + this.nameArgs.length + '</var> arguments, but got only <var>' + args.length + '</var> are given');
		}
		var scopeVars = {}, msgFuncArgs = [];
		for (var i=0; i<this.nameArgs.length; i++) {
			if (args[i] === undefined) {
				throw new jsmm.msg.Error(this, 'Variable <var>' + this.nameArgs[i] + '</var> is <var>undefined</var>');
			} else if (args[i] === null) {
				throw new jsmm.msg.Error(this, 'Variable <var>' + this.nameArgs[i] + '</var> is <var>null</var>');
			} else {
				scopeVars[this.nameArgs[i]] = args[i];
				msgFuncArgs.push(stringify(args[i]));
			}
		}
		context.newStep([new jsmm.msg.Inline(this, context.callCounter, 'entering <var>' + this.name + '(' + msgFuncArgs.join(', ') + ')' + '</var>')]);
		return new jsmm.func.Scope(scopeVars, context.scope);
	};
	
	jsmm.nodes.ReturnStatement.prototype.runFunc =
	jsmm.nodes.FunctionDeclaration.prototype.runFuncLeave = function(context, expression) {
		var retVal;
		if (this.expression !== undefined && expression !== undefined) {
			retVal = getValue(this.expression, expression);
			context.newStep([new jsmm.msg.Inline(this, context.callCounter, 'returning <var>' + stringify(retVal) + '</var>')]);
		}
		return retVal;
	};
};

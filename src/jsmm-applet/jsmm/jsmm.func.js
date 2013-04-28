/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	var getValue = function(context, node, expression) {
		var value = expression;
		if (typeof value === 'object' && value.type === 'local') {
			value = value.value;
		}

		if (value === undefined) {
			throw new jsmm.msg.Error(node.id, '<var>' + node.getCode() + '</var> is <var>undefined</var>');
		} else if (value === null) {
			throw new jsmm.msg.Error(node.id, '<var>' + node.getCode() + '</var> is <var>null</var>');
		} else if (typeof value === 'number' && !isFinite(value)) {
			throw new jsmm.msg.Error(node.id, '<var>' + node.getCode() + '</var> is not a valid number');
		} else if (typeof value === 'object' && value.type === 'newArrayValue') {
			throw new jsmm.msg.Error(node.id, '<var>' + node.getCode() + '</var> is <var>undefined</var>');
		} else if (typeof value === 'object' && value.type === 'variable') {
			context.addCommand(node, value.info);
			return value.get(value.name);
		} else {
			return value;
		}
	};

	var dereferenceArray = function(context, value) {
		if (typeof value === 'object' && value.type === 'arrayPointer') {
			return context.scope.getArray(value.id);
		} else {
			return value;
		}
	};

	var setVariable = function(context, node, variableNode, variable, value) {
		if (typeof variable === 'object' && variable.type === 'newArrayValue') {
			throw new jsmm.msg.Error(node.id, '<var>' + variableNode.getCode() + '</var> is <var>undefined</var>');
		} else if (typeof variable !== 'object' || ['variable', 'local'].indexOf(variable.type) < 0) {
			throw new jsmm.msg.Error(node.id, 'Cannot assign <var>' + jsmm.stringify(value) + '</var> to <var>' + variableNode.getCode() + '</var>');
		} else if (variable.type === 'variable') {
			context.addCommand(node, variable.info);
			try {
				variable.set(context, variable.name, value);
			} catch (error) {
				// augmented variables should do their own error handling, so wrap the resulting strings in jsmm messages
				if (typeof error === 'string') {
					throw new jsmm.msg.Error(node.id, error);
				} else {
					throw error;
				}
			}
		} else if (typeof variable.value === 'object' && variable.value.type === 'functionPointer') {
			throw new jsmm.msg.Error(node.id, 'Cannot assign a new value to function <var>' + variable.value.name + '</var>');
		} else {
			variable.value = value;
		}
	};

	jsmm.nodes.PostfixStatement.prototype.runFunc = function(context, variable, symbol) {
		context.addCommand(this, 'jsmm.arithmetic.increment');
		var value = getValue(context, this.identifier, variable);

		if (typeof value !== 'number') {
			throw new jsmm.msg.Error(this.id, '<var>' + symbol + '</var> not possible since <var>' + jsmm.stringify(value) + '</var> is not a number');
		} else {
			if (symbol === '++') {
				value++;
			} else {
				value--;
			}
			setVariable(context, this, this.identifier, variable, value);
			context.addAssignment(this, this.identifier.getCode());
			context.pushStep(new jsmm.msg.Inline(this.id, '<var>' + this.identifier.getCode() + '</var> = <var>' + jsmm.stringify(value) + '</var>'));
		}
	};

	var runBinaryExpression = function(context, node, value1, symbol, value2) {
		if ((symbol === '+' || symbol === '+=') && (typeof value1 === 'string' || typeof value2 === 'string')) {
			context.addCommand(node, 'jsmm.arithmetic.strings');
		} else if (['+', '-', '*', '/', '%'].indexOf(symbol) >= 0) {
			context.addCommand(node, 'jsmm.arithmetic.numbers');
		} else if (['+=', '-=', '*=', '/=', '%='].indexOf(symbol) >= 0) {
			context.addCommand(node, 'jsmm.arithmetic.assignment');
		} else if (['>', '>=', '<', '<='].indexOf(symbol) >= 0) {
			context.addCommand(node, 'jsmm.logic.comparison');
		} else if (['==', '!='].indexOf(symbol) >= 0) {
			context.addCommand(node, 'jsmm.logic.equality');
		} else if (['&&', '||'].indexOf(symbol) >= 0) {
			context.addCommand(node, 'jsmm.logic.booleans');
		}

		if (['-', '*', '/', '%', '-=', '*=', '/=', '%=', '>', '>=', '<', '<='].indexOf(symbol) >= 0) {
			if (typeof value1 !== 'number' || !isFinite(value1)) {
				throw new jsmm.msg.Error(node.id, '<var>' + symbol + '</var> not possible since <var>' + jsmm.stringify(value1) + '</var> is not a number');
			} else if (typeof value2 !== 'number' || !isFinite(value2)) {
				throw new jsmm.msg.Error(node.id, '<var>' + symbol + '</var> not possible since <var>' + jsmm.stringify(value2) + '</var> is not a number');
			} else if (['/', '/=', '%', '%='].indexOf(symbol) >= 0 && value2 === 0) {
				throw new jsmm.msg.Error(node.id, '<var>' + symbol + '</var> not possible since it is a division by zero');
			}
		} else if (['+', '+='].indexOf(symbol) >= 0) {
			if ([typeof value1, typeof value2].indexOf('string') >= 0) {
				if (['number', 'boolean', 'string'].indexOf(typeof value1) < 0) {
					throw new jsmm.msg.Error(node.id, '<var>' + symbol + '</var> not possible since <var>' + jsmm.stringify(value1) + '</var> is not a number, string, or boolean');
				} else if (['number', 'boolean', 'string'].indexOf(typeof value2) < 0) {
					throw new jsmm.msg.Error(node.id, '<var>' + symbol + '</var> not possible since <var>' + jsmm.stringify(value2) + '</var> is not a number, string, or boolean');
				}
			} else {
				if (typeof value1 !== 'number') {
					throw new jsmm.msg.Error(node.id, '<var>' + symbol + '</var> not possible since <var>' + jsmm.stringify(value1) + '</var> is not a number or string');
				} else if (typeof value2 !== 'number') {
					throw new jsmm.msg.Error(node.id, '<var>' + symbol + '</var> not possible since <var>' + jsmm.stringify(value2) + '</var> is not a number or string');
				}
			}
		} else if (['&&', '||'].indexOf(symbol) >= 0) {
			if (typeof value1 !== 'boolean') {
				throw new jsmm.msg.Error(node.id, '<var>' + symbol + '</var> not possible since <var>' + jsmm.stringify(value1) + '</var> is not a boolean');
			} else if (typeof value2 !== 'boolean') {
				throw new jsmm.msg.Error(node.id, '<var>' + symbol + '</var> not possible since <var>' + jsmm.stringify(value2) + '</var> is not a boolean');
			}
		} else if (['==', '!='].indexOf(symbol) >= 0) {
			if (['boolean', 'number', 'string'].indexOf(typeof value1) < 0) {
				throw new jsmm.msg.Error(node.id, '<var>' + symbol + '</var> not possible since <var>' + jsmm.stringify(value1) + '</var> is not a number, string, or boolean');
			} else if (['boolean', 'number', 'string'].indexOf(typeof value2) < 0) {
				throw new jsmm.msg.Error(node.id, '<var>' + symbol + '</var> not possible since <var>' + jsmm.stringify(value2) + '</var> is not a number, string, or boolean');
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
			context.addCommand(this, 'jsmm.=');
			value = getValue(context, this.expression, expression);
		} else {
			value = runBinaryExpression(context, this, getValue(context, this.identifier, variable), symbol, getValue(context, this.expression, expression));
		}

		if (variable.type === 'newArrayValue') {
			variable.array.setArrayValue(variable.index, value);
		} else {
			setVariable(context, this, this.identifier, variable, value);
		}
		context.addAssignment(this, this.identifier.getBaseName());
		context.pushStep(new jsmm.msg.Inline(this.id, '<var>' + this.identifier.getCode() + '</var> = <var>' + jsmm.stringify(value) + '</var>'));
	};
	
	jsmm.nodes.VarItem.prototype.runFunc = function(context, name) {
		context.addCommand(this, 'jsmm.var');
		context.scope.vars[name] = {type: 'local', value: undefined};

		if (this.assignment === null) {
			context.addAssignment(this, name);
			context.pushStep(new jsmm.msg.Inline(this.id, '<var>' + this.name + '</var> = <var>undefined</var>'));
		}
	};
	
	jsmm.nodes.BinaryExpression.prototype.runFunc = function(context, expression1, symbol, expression2) {
		var value1 = getValue(context, this.expression1, expression1);
		var value2 = getValue(context, this.expression2, expression2);
		var result = runBinaryExpression(context, this, value1, symbol, value2);
		context.pushStep(new jsmm.msg.Inline(this.id, '<var>' + jsmm.stringify(value1) + '</var> ' + symbol + ' <var>' + jsmm.stringify(value2) + '</var> = <var>' + jsmm.stringify(result) + '</var>'));
		return result;
	};
	
	jsmm.nodes.UnaryExpression.prototype.runFunc = function(context, symbol, expression) {
		var value = getValue(context, this.expression, expression);
		var result;

		if (symbol === '!') {
			context.addCommand(this, 'jsmm.logic.inversion');
			if (typeof value !== 'boolean') {
				throw new jsmm.msg.Error(this.id, '<var>' + symbol + '</var> not possible since <var>' + jsmm.stringify(value) + '</var> is not a boolean');
			} else {
				result = !value;
			}
		} else {
			context.addCommand(this, 'jsmm.arithmetic.numbers');
			if (typeof value !== 'number') {
				throw new jsmm.msg.Error(this.id, '<var>' + symbol + '</var> not possible since <var>' + jsmm.stringify(value) + '</var> is not a number');
			} else {
				result = (symbol === '+' ? value : -value);
			}
		}

		if (symbol === '!' || this.expression.type !== 'NumberLiteral') {
			context.pushStep(new jsmm.msg.Inline(this.id, '<var>' + symbol + jsmm.stringify(value) + '</var> = <var>' + jsmm.stringify(result) + '</var>'));
		}
		return result;
	};

	jsmm.nodes.NumberLiteral.prototype.runFunc = function(context, val) {
		context.addCommand(this, 'jsmm.number');
		return val;
	};
	
	jsmm.nodes.StringLiteral.prototype.runFunc = function(context, val) {
		context.addCommand(this, 'jsmm.string');
		return val;
	};
	
	jsmm.nodes.BooleanLiteral.prototype.runFunc = function(context, val) {
		context.addCommand(this, 'jsmm.boolean');
		return val;
	};

	jsmm.nodes.NameIdentifier.prototype.runFunc = function(context, name) {
		var val = context.scope.find(name);
		if (val === undefined) {
			throw new jsmm.msg.Error(this.id, 'Variable <var>' + name + '</var> could not be found');
		} else {
			return val;
		}
	};
	
	jsmm.nodes.ObjectIdentifier.prototype.runFunc = function(context, identifier, property) {
		var identifierValue = getValue(context, this.identifier, identifier);
		identifierValue = dereferenceArray(context, identifierValue);

		if (typeof identifierValue !== 'object' || ['object', 'array'].indexOf(identifierValue.type) < 0) {
			throw new jsmm.msg.Error(this.id, 'Variable <var>' + this.identifier.getCode() + '</var> is not an object</var>');
		} else if (identifierValue.properties[property] === undefined) {
			throw new jsmm.msg.Error(this.id, 'Variable <var>' + this.identifier.getCode() + '</var> does not have property <var>' + property + '</var>');
		} else {
			return identifierValue.properties[property];
		}
	};
	
	jsmm.nodes.ArrayIdentifier.prototype.runFunc = function(context, identifier, expression) {
		var identifierValue = getValue(context, this.identifier, identifier);
		identifierValue = dereferenceArray(context, identifierValue);
		var expressionValue = getValue(context, this.expression, expression);

		if (typeof identifierValue !== 'object' || identifierValue.type !== 'array') {
			throw new jsmm.msg.Error(this.id, 'Variable <var>' + this.identifier.getCode() + '</var> is not an array');
		} else if (typeof expressionValue !== 'number' && expressionValue % 1 !== 0) {
			throw new jsmm.msg.Error(this.id, 'Index <var>' + this.expression.getCode() + '</var> is not an integer');
		} else {
			context.addCommand(this, 'jsmm.array.access');
			return identifierValue.getArrayValue(expressionValue);
		}
	};
	
	jsmm.nodes.FunctionCall.prototype.runFunc = function(context, funcObject, args) {
		var funcValue = getValue(context, this.identifier, funcObject), funcArgs = [], msgFuncArgs = [], appFunc;

		for (var i=0; i<args.length; i++) {
			var value = getValue(context, this.expressionArgs[i], args[i]);
			funcArgs.push(value);
			msgFuncArgs.push(jsmm.stringify(value));
		}

		var retVal;
		context.enterCall(this);
		if (typeof funcValue === 'object' && funcValue.type === 'function') {
			context.addCommand(this, funcValue.info);
			retVal = context.externalCall(this, funcValue, funcArgs);
		} else if (typeof funcValue === 'object' && funcValue.type === 'functionPointer') {
			context.pushStep(new jsmm.msg.Inline(this.id, 'calling <var>' + this.identifier.getCode() + '(' + msgFuncArgs.join(', ') + ')' + '</var>'));
			var func = context.scope.getFunction(funcValue.name);
			if (func === undefined) throw new jsmm.msg.Error(this.id, 'Function <var>' + funcValue.name + '</var> could not be found');
			retVal = func.call(null, context, funcArgs);
		} else {
			throw new jsmm.msg.Error(this.id, 'Variable <var>' + this.identifier.getCode() + '</var> is not a function');
		}
		context.leaveCall();

		if (retVal === null) retVal = undefined;

		if (retVal !== undefined) {
			context.pushStep(new jsmm.msg.Inline(this.id, '<var>' + this.identifier.getCode() + '(' + msgFuncArgs.join(', ') + ')' + '</var> = <var>' + jsmm.stringify(retVal) + '</var>'));
		} else {
			context.pushStep(new jsmm.msg.Inline(this.id, 'called <var>' + this.identifier.getCode() + '(' + msgFuncArgs.join(', ') + ')'));
		}

		return retVal;
	};

	jsmm.nodes.ArrayDefinition.prototype.runFunc = function(context, expressions) {
		var values = [];
		for (var i=0; i<this.expressions.length; i++) {
			values[i] = getValue(context, this.expressions[i], expressions[i]);
		}
		context.addCommand(this, 'jsmm.array.creation');
		var array = new jsmm.Array(values);
		return {type: 'arrayPointer', string: '[array]', id: context.scope.registerArray(array), properties: array.properties}; // properties only for examples!
	};
	
	jsmm.nodes.IfBlock.prototype.runFunc =
	jsmm.nodes.WhileBlock.prototype.runFunc =
	jsmm.nodes.ForBlock.prototype.runFunc = function(context, expression) {
		var type = (this.type === 'IfBlock' ? 'if' : (this.type === 'WhileBlock' ? 'while' : 'for'));
		context.addCommand(this, 'jsmm.' + type);
		var value = getValue(context, this.expression, expression);
		if (typeof value !== 'boolean') {
			throw new jsmm.msg.Error(this.id, '<var>' + type + '</var> is not possible since <var>' + jsmm.stringify(value) + '</var> is not a boolean');
		} else {
			return value;
		}
	};

	jsmm.nodes.ElseIfBlock.prototype.runFunc =
	jsmm.nodes.ElseBlock.prototype.runFunc = function(context) {
		context.addCommand(this, 'jsmm.else');
	};
	
	jsmm.nodes.FunctionDeclaration.prototype.runFuncDecl = function(context, name, func) {
		context.addCommand(this, 'jsmm.function');

		// only check local scope for conflicts
		if (context.scope.vars[name] !== undefined) {
			if (typeof context.scope.vars[name] === 'object' && ['function', 'functionPointer'].indexOf(context.scope.vars[name].type) >= 0) {
				throw new jsmm.msg.Error(this.id, 'Function <var>' + name + '</var> cannot be declared since there already is a function with that name');
			} else {
				throw new jsmm.msg.Error(this.id, 'Function <var>' + name + '</var> cannot be declared since there already is a variable with that name');
			}
		} else {
			context.scope.declareFunction(name, func);
			context.addAssignment(this, name);
			context.pushStep(new jsmm.msg.Inline(this.id, 'declaring <var>' + this.name + this.getArgList() + '</var>', 'blockLoc'));
		}
	};
	
	jsmm.nodes.FunctionDeclaration.prototype.runFuncEnter = function(context, args) {
		if (args.length < this.nameArgs.length) {
			var but = 'only <var>' + args.length + '</var> are given';
			if (args.length <= 0) {
				but = 'none are given';
			} else if (args.length === 1) {
				but = 'only <var>1</var> is given';
			}
			throw new jsmm.msg.Error(context.leaveCall().id, 'Function expects <var>' + this.nameArgs.length + '</var> arguments, but ' + but);
		}

		var scopeVars = {}, msgFuncArgs = [];
		for (var i=0; i<this.nameArgs.length; i++) {
			if (args[i] === undefined) {
				throw new jsmm.msg.Error(context.leaveCall().id, 'Argument <var>' + this.nameArgs[i] + '</var> is <var>undefined</var>');
			} else if (args[i] === null) {
				throw new jsmm.msg.Error(context.leaveCall().id, 'Argument <var>' + this.nameArgs[i] + '</var> is <var>null</var>');
			} else {
				scopeVars[this.nameArgs[i]] = args[i];
				msgFuncArgs.push(jsmm.stringify(args[i]));
			}
		}

		var fullName = this.name + '(' + msgFuncArgs.join(', ') + ')';
		context.pushStep(new jsmm.msg.Inline(this.id, 'entering <var>' + fullName + '</var>'));
		context.enterFunction(this, scopeVars, fullName);
	};
	
	jsmm.nodes.ReturnStatement.prototype.runFunc = function(context, expression) {
		context.addCommand(this, 'jsmm.return');
		if (!context.inFunction()) {
			throw new jsmm.msg.Error(this.id, 'Cannot return if not inside a function');
		}

		var retVal;
		if (this.expression !== undefined && expression !== undefined) {
			retVal = getValue(context, this.expression, expression);
			context.pushStep(new jsmm.msg.Inline(this.id, 'returning <var>' + jsmm.stringify(retVal) + '</var>'));
		} else {
			context.pushStep(new jsmm.msg.Inline(this.id, 'returning nothing'));
		}

		context.leaveFunction(this);
		return retVal;
	};

	jsmm.nodes.FunctionDeclaration.prototype.runFuncLeave = function(context, expression) {
		context.leaveFunction(this);
	};
};

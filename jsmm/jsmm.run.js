/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	require('./jsmm.func')(jsmm);
	
	var getNode = function(obj) {
		return 'jsmmContext.tree.nodes[' + obj.id + ']';
	};

	var getScope = function() {
		return '(jsmmScope || jsmmContext.scope)';
	};

	var hooksBefore = function(node) {
		if (node.hooksBefore.length > 0) {
			return getNode(node) + '.runHooksBefore(jsmmContext, ' + getScope() + ');';
		} else {
			return '';
		}
	};

	var hooksAfter = function(node) {
		if (node.hooksAfter.length > 0) {
			return getNode(node) + '.runHooksAfter(jsmmContext, ' + getScope() + ');';
		} else {
			return '';
		}
	};

	jsmm.RunContext = function() { return this.init.apply(this, arguments); };
	jsmm.RunContext.prototype = {
		init: function(tree, scope) {
			this.tree = tree;
			this.scope = new jsmm.func.Scope(scope);
			this.executionCounter = 0;
			this.callStackDepth = 0;
			this.steps = [];
			this.calls = [];
			this.callStack = [];
			this.temp = undefined;
		},
		enterFunction: function(node) {
			this.callStackDepth++;

			if (this.callStackDepth > jsmm.func.maxCallStackDepth) { // TODO
				throw new jsmm.msg.Error(node, function(f){ return 'Too many nested function calls have been made already, perhaps there is infinite recursion somewhere'; });
			}
		},
		leaveFunction: function(node) {
			this.callStackDepth--;
		},
		increaseExecutionCounter: function(node, amount) {
			this.executionCounter += amount;
			if (this.executionCounter > jsmm.func.maxExecutionCounter) { // TODO
				throw new jsmm.msg.Error(node, function(f){ return 'Program takes too long to run'; });
			}
		},
		enterInternalCall: function(node) {
			this.callStack.push(node);
		},
		leaveInternalCall: function(node) {
			this.callStack.pop();
		},
		enterExternalCall: function(node, funcValue, args) {
			this.calls.push({node: node, funcValue: funcValue, args: args});
		},
		leaveExternalCall: function(node) {

		}
	};
	
	/* statementList */
	jsmm.nodes.Program.prototype.getRunCode = function() {
		var output = 'new function() {';
		output += 'return function(jsmmContext) {';
		output += 'return function() {\n';
		output += 'var jsmmScope;\n';
		output += this.statementList.getRunCode() + ' return jsmmContext}; }; }';
		return output;
	};
	
	jsmm.nodes.Program.prototype.getRunFunction = function(scope) {
		/*jshint evil:true*/
		return eval(this.getRunCode())(new jsmm.RunContext(this.tree, scope));
	};
	
	/* statements */
	jsmm.nodes.StatementList.prototype.getRunCode = function() {
		var output = 'jsmmContext.increaseExecutionCounter(' + getNode(this) + ', ' + (this.statements.length+1) + ');\n';
		for (var i=0; i<this.statements.length; i++) {
			output += '/* line : ' + this.statements[i].lineLoc.line + ' */ ';
			output += this.statements[i].getRunCode() + '\n\n\n';
			// if (jsmm.verbose) {
				// output += 'console.log("after line ' + this.statements[i].endPos.line + ':");\n';
				// output += 'console.log(jsmmContext);\n';
				// output += 'console.log(" ");\n';
			// }
		}
		return output;
	};
	
	/* statement */
	jsmm.nodes.CommonSimpleStatement.prototype.getRunCode = function() {
		return hooksBefore(this) + this.statement.getRunCode() + ";" + hooksAfter(this);
	};
	
	/* identifier, symbol */
	jsmm.nodes.PostfixStatement.prototype.getRunCode = function() {
		return getNode(this) + '.runFunc(jsmmContext, ' + this.identifier.getRunCode() + ', "' + this.symbol + '")';
	};
	
	/* identifier, symbol, expression */
	jsmm.nodes.AssignmentStatement.prototype.getRunCode = function() {
		return getNode(this) + '.runFunc(jsmmContext, ' + this.identifier.getRunCode() + ', "' + this.symbol + '", ' + this.expression.getRunCode() + ')';
	};
	
	/* items */
	jsmm.nodes.VarStatement.prototype.getRunCode = function() {
		var output = this.items[0].getRunCode();
		for (var i=1; i<this.items.length; i++) {
			output += ', ' + this.items[i].getRunCode();
		}
		return output;
	};
	
	/* name, assignment */
	jsmm.nodes.VarItem.prototype.getRunCode = function() {
		var output = getNode(this) + '.runFunc(jsmmContext, ' + getScope() + ', "' + this.name + '")';
		if (this.assignment !== null) {
			// ; is invalid in for loops
			// this should be possible in JS for normal statements as well
			output += ', ' + this.assignment.getRunCode();
		}
		return output;
	};
	
	/* expression */
	jsmm.nodes.ReturnStatement.prototype.getRunCode = function() {
		var output = hooksBefore(this);
		if (this.expression === null) {
			output += 'jsmmContext.temp = undefined;';
		} else {
			output += 'jsmmContext.temp = ' + getNode(this) + '.runFunc(jsmmContext, ' + this.expression.getRunCode() + ');';
		}
		output += getNode(this) + '.iterateRunHooksAfter(jsmmContext);';
		output += 'return jsmmContext.temp';
		return output;
	};
	
	/* expression1, symbol, expression2 */
	jsmm.nodes.BinaryExpression.prototype.getRunCode = function() {
		return getNode(this) + '.runFunc(jsmmContext, ' + this.expression1.getRunCode() + ', "' + this.symbol + '", ' + this.expression2.getRunCode() + ')';
	};
	
	/* symbol, expression */
	jsmm.nodes.UnaryExpression.prototype.getRunCode = function() {
		return getNode(this) + '.runFunc(jsmmContext, "' + this.symbol + '", ' + this.expression.getRunCode() + ')';
	};

	/* expression */
	jsmm.nodes.ParenExpression.prototype.getRunCode = function() {
		return '(' + this.expression.getRunCode() + ')';
	};
	
	/* number */
	jsmm.nodes.NumberLiteral.prototype.getRunCode = function() {
		return this.number;
	};
	
	/* str */
	jsmm.nodes.StringLiteral.prototype.getRunCode = function() {
		return JSON.stringify(this.str);
	};
	
	/* bool */
	jsmm.nodes.BooleanLiteral.prototype.getRunCode = function() {
		return this.bool ? 'true' : 'false';
	};
	
	/* name */
	jsmm.nodes.NameIdentifier.prototype.getRunCode = function() {
		return getNode(this) + '.runFunc(jsmmContext, ' + getScope() + ', "' + this.name + '")';
	};
	
	/* identifier, prop */
	jsmm.nodes.ObjectIdentifier.prototype.getRunCode = function() {
		return getNode(this) + '.runFunc(jsmmContext, ' + this.identifier.getRunCode() + ', "' + this.prop + '")';
	};
	
	/* identifier, expression */
	jsmm.nodes.ArrayIdentifier.prototype.getRunCode = function() {
		return getNode(this) + '.runFunc(jsmmContext, ' + this.identifier.getRunCode() + ', ' + this.expression.getRunCode() + ')';
	};
	
	/* identifier, expressionArgs */
	jsmm.nodes.FunctionCall.prototype.getRunCode = function() {
		var output = getNode(this) + '.runFunc(jsmmContext, ' + this.identifier.getRunCode() + ', [';
		if (this.expressionArgs.length > 0) output += this.expressionArgs[0].getRunCode();
		for (var i=1; i<this.expressionArgs.length; i++) {
			output += ", " + this.expressionArgs[i].getRunCode();
		}
		return output + '])';
	};
	
	/* functionCall */
	jsmm.nodes.CallStatement.prototype.getRunCode = function() {
		return this.functionCall.getRunCode();
	};
	
	/* expression, statementList, elseBlock */
	jsmm.nodes.IfBlock.prototype.getRunCode = function() {
		var output = hooksBefore(this);
		output += 'if (' + getNode(this) + '.runFunc(jsmmContext, ' + this.expression.getRunCode() + ')) {\n';
		output += this.statementList.getRunCode() + hooksAfter(this) + '}';
		output += ' else {\n'  + hooksAfter(this) + '\n';
		if (this.elseBlock !== null) {
			output += this.elseBlock.getRunCode() + '\n';
		}
		output += '}';
		return output;
	};
	
	/* ifBlock */
	jsmm.nodes.ElseIfBlock.prototype.getRunCode = function() {
		return this.ifBlock.getRunCode();
	};
	
	/* statementList */
	jsmm.nodes.ElseBlock.prototype.getRunCode = function() {
		return hooksBefore(this) + '\n' + this.statementList.getRunCode() + hooksAfter(this);
	};
	
	/* expression, statementList */
	jsmm.nodes.WhileBlock.prototype.getRunCode = function() {
		var output = hooksBefore(this) + '\n';
		output += 'while (' + getNode(this) + '.runFunc(jsmmContext, '  + this.expression.getRunCode() + '))';
		output += '{\n' + this.statementList.getRunCode() + '}\n' + hooksAfter(this);
		return output;
	};
	
	/* statement1, expression, statement2, statementList */
	jsmm.nodes.ForBlock.prototype.getRunCode = function() {
		var output = hooksBefore(this) + '\n';
		output += 'for (' + this.statement1.getRunCode() + '; ';
		output += getNode(this) + '.runFunc(jsmmContext, '  + this.expression.getRunCode() + '); ';
		output += this.statement2.getRunCode() + ') {\n' + this.statementList.getRunCode() + '}\n';
		output += hooksAfter(this);
		return output;
	};
	
	/* name, nameArgs, statementList */
	jsmm.nodes.FunctionDeclaration.prototype.getRunCode = function() {
		var output = getNode(this) + '.runFuncDecl(jsmmContext, ' + getScope() + ', "' + this.name + '", ';
		output += 'function (jsmmContext, args) {\n';
		output += 'var jsmmScope = ' + getNode(this) + '.runFuncEnter(jsmmContext, args);\n';
		output += hooksBefore(this) + '\n';
		/*
		if (jsmm.verbose) {
			output += 'console.log("after entering ' + this.name + ':");\n';
			output += 'console.log(jsmmscopeInner);\n';
			output += 'console.log(" ");\n';
		}
		*/
		output += this.statementList.getRunCode();
		output += hooksAfter(this) + '\n';
		output += 'return ' + getNode(this) + '.runFuncLeave(jsmmContext);\n';
		output += '});';
		return output;
	};
};

/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	require('./jsmm.func')(jsmm);
	
	var getNode = function(obj) {
		//return '{line: ' + obj.startPos.line + ', column: ' + obj.startPos.column + '}';
		return 'jsmmtree.nodes[' + obj.id + ']';
	};
	
	var getScope = function() {
		return '(jsmmscopeInner||jsmmscopeOuter)';
	};

	var hooksBefore = function(node) {
		if (node.hooksBefore.length > 0) {
			return getNode(node) + '.runHooksBefore(' + getScope() + ');';
		} else {
			return '';
		}
	};

	var hooksAfter = function(node) {
		if (node.hooksAfter.length > 0) {
			return getNode(node) + '.runHooksAfter(' + getScope() + ');';
		} else {
			return '';
		}
	};
	
	/* statementList */
	jsmm.nodes.Program.prototype.getSafeCode = function() {
		var output = 'new function() {';
		output += 'return function(jsmm, jsmmtree, jsmmscope) {';
		output += 'return function() { var jsmmscopeInner, jsmmscopeOuter = new jsmm.func.Scope(jsmmscope);\n';
		output += 'var jsmmExecutionCounter = 0;\n';
		output += 'var jsmmCallStackDepth = 0;\n';
		output += this.statementList.getSafeCode() + 'return jsmmscopeOuter; }; }; }';
		return output;
	};
	
	jsmm.nodes.Program.prototype.getSafeFunction = function(scope) {
		/*jshint evil:true*/
		return eval(this.getSafeCode())(jsmm, this.tree, scope);
	};
	
	/* statements */
	jsmm.nodes.StatementList.prototype.getSafeCode = function() {
		var output = 'jsmmExecutionCounter += ' + (this.statements.length+1) + ';\n';
		output += ' jsmm.func.checkExecutionCounter(' + getNode(this) + ', jsmmExecutionCounter);\n';
		for (var i=0; i<this.statements.length; i++) {
			output += this.statements[i].getSafeCode() + '\n';
			if (jsmm.verbose) {
				output += 'console.log("after line ' + this.statements[i].endPos.line + ':");\n';
				output += 'console.log(' +  getScope() + ');\n';
				output += 'console.log(" ");\n';
			}
		}
		return output;
	};
	
	/* statement */
	jsmm.nodes.CommonSimpleStatement.prototype.getSafeCode = function() {
		return hooksBefore(this) + this.statement.getSafeCode() + ";" + hooksAfter(this);
	};
	
	/* identifier, symbol */
	jsmm.nodes.PostfixStatement.prototype.getSafeCode = function() {
		return 'jsmm.func.postfix(' + getNode(this) + ', ' + this.identifier.getSafeCode() + ', "' + this.symbol + '")';
	};
	
	/* identifier, symbol, expression */
	jsmm.nodes.AssignmentStatement.prototype.getSafeCode = function() {
		return 'jsmm.func.assignment(' + getNode(this) + ', ' + this.identifier.getSafeCode() + ', "' + this.symbol + '", ' + this.expression.getSafeCode() + ')';
	};
	
	/* items */
	jsmm.nodes.VarStatement.prototype.getSafeCode = function() {
		var output = this.items[0].getSafeCode();
		for (var i=1; i<this.items.length; i++) {
			output += ', ' + this.items[i].getSafeCode();
		}
		return output;
	};
	
	/* name, assignment */
	jsmm.nodes.VarItem.prototype.getSafeCode = function() {
		var output = 'jsmm.func.varItem(' + getNode(this) + ', ' +  getScope() + ', "' + this.name + '")';
		if (this.assignment !== null) {
			// ; is invalid in for loops
			// this should be possible in JS for normal statements as well
			output += ', ' + this.assignment.getSafeCode();
		}
		return output;
	};
	
	/* expression */
	jsmm.nodes.ReturnStatement.prototype.getSafeCode = function() {
		var output = hooksBefore(this);
		if (this.expression === null) {
			output += 'var jsmmtemp = undefined';
		} else {
			output += 'var jsmmtemp = ' + this.expression.getSafeCode() + ';';
		}
		output += getNode(this) + '.iterateRunHooksAfter(' + getScope() + ');';
		output += 'jsmmCallStackDepth--;';
		output += 'return jsmm.func.funcReturn(' + getNode(this) + ', jsmmtemp);';
		return output;
	};
	
	/* expression1, symbol, expression2 */
	jsmm.nodes.BinaryExpression.prototype.getSafeCode = function() {
		return 'jsmm.func.binary(' + getNode(this) + ', ' + this.expression1.getSafeCode() + ', "' + this.symbol + '", ' + this.expression2.getSafeCode() + ')';
	};
	
	/* symbol, expression */
	jsmm.nodes.UnaryExpression.prototype.getSafeCode = function() {
		return 'jsmm.func.unary(' + getNode(this) + ', "' + this.symbol + '", ' + this.expression.getSafeCode() + ')';
	};
	
	/* number */
	jsmm.nodes.NumberLiteral.prototype.getSafeCode = function() {
		return 'jsmm.func.number(' + getNode(this) + ', ' + this.number + ')';
	};
	
	/* str */
	jsmm.nodes.StringLiteral.prototype.getSafeCode = function() {
		return 'jsmm.func.string(' + getNode(this) + ', ' + JSON.stringify(this.str) + ')';
	};
	
	/* bool */
	jsmm.nodes.BooleanLiteral.prototype.getSafeCode = function() {
		return 'jsmm.func.bool(' + getNode(this) + ', ' + (this.bool ? 'true' : 'false') + ')';
	};
	
	/* name */
	jsmm.nodes.NameIdentifier.prototype.getSafeCode = function() {
		return 'jsmm.func.name(' + getNode(this) + ', ' +  getScope() + ', "' + this.name + '")';
	};
	
	/* identifier, prop */
	jsmm.nodes.ObjectIdentifier.prototype.getSafeCode = function() {
		return 'jsmm.func.object(' + getNode(this) + ', ' + this.identifier.getSafeCode() + ', "' + this.prop + '")';
	};
	
	/* identifier, expression */
	jsmm.nodes.ArrayIdentifier.prototype.getSafeCode = function() {
		return 'jsmm.func.array(' + getNode(this) + ', ' + this.identifier.getSafeCode() + ', ' + this.expression.getSafeCode() + ')';
	};
	
	/* identifier, expressionArgs */
	jsmm.nodes.FunctionCall.prototype.getSafeCode = function() {
		var output = 'jsmm.func.funcCall(' + getNode(this) + ', ' + this.identifier.getSafeCode() + ', [';
		if (this.expressionArgs.length > 0) output += this.expressionArgs[0].getSafeCode();
		for (var i=1; i<this.expressionArgs.length; i++) {
			output += ", " + this.expressionArgs[i].getSafeCode();
		}
		return output + '])';
	};
	
	/* functionCall */
	jsmm.nodes.CallStatement.prototype.getSafeCode = function() {
		return this.functionCall.getSafeCode();
	};
	
	/* expression, statementList, elseBlock */
	jsmm.nodes.IfBlock.prototype.getSafeCode = function() {
		var output = hooksBefore(this);
		output += "if (jsmm.func.conditional(" + getNode(this) + ', "if", ' + this.expression.getSafeCode() + ")) {\n";
		output += this.statementList.getSafeCode() + hooksAfter(this) + '}';
		output += ' else {\n'  + hooksAfter(this) + '\n';
		if (this.elseBlock !== null) {
			output += this.elseBlock.getSafeCode() + '\n';
		}
		output += '}';
		return output;
	};
	
	/* ifBlock */
	jsmm.nodes.ElseIfBlock.prototype.getSafeCode = function() {
		return this.ifBlock.getSafeCode();
	};
	
	/* statementList */
	jsmm.nodes.ElseBlock.prototype.getSafeCode = function() {
		return hooksBefore(this) + '\n' + this.statementList.getSafeCode() + hooksAfter(this);
	};
	
	/* expression, statementList */
	jsmm.nodes.WhileBlock.prototype.getSafeCode = function() {
		var output = hooksBefore(this) + '\n';
		output += 'while (jsmm.func.conditional(' + getNode(this) + ', "while", ' + this.expression.getSafeCode() + '))';
		output += '{\n' + this.statementList.getSafeCode() + "}\n" + hooksAfter(this);
		return output;
	};
	
	/* statement1, expression, statement2, statementList */
	jsmm.nodes.ForBlock.prototype.getSafeCode = function() {
		var output = hooksBefore(this) + '\n';
		output += "for (" + this.statement1.getSafeCode() + '; ';
		output += 'jsmm.func.conditional(' + getNode(this) + ', "for", ' + this.expression.getSafeCode() + "); ";
		output += this.statement2.getSafeCode() + ") {\n" + this.statementList.getSafeCode() + "}\n";
		output += hooksAfter(this);
		return output;
	};
	
	/* name, nameArgs, statementList */
	jsmm.nodes.FunctionDeclaration.prototype.getSafeCode = function() {
		var output = 'jsmm.func.funcDecl(' + getNode(this) + ', jsmmscopeOuter, "' + this.name + '", ';
		output += 'function' + this.getArgList() + "{\n";
		output += 'var jsmmscopeInner = new jsmm.func.Scope({';
		if (this.nameArgs.length > 0) output += '"' + this.nameArgs[0] + '": ' + this.nameArgs[0];
		for (var i=1; i<this.nameArgs.length; i++) {
			output += ', "' + this.nameArgs[i] + '": ' + this.nameArgs[i];
		}
		output += '}, jsmmscopeOuter);\n';
		output += 'jsmmCallStackDepth++;';
		output += 'jsmm.func.funcEnter(' + getNode(this) + ', ' + getScope() + ', jsmmCallStackDepth);\n';
		output += hooksBefore(this) + '\n';
		if (jsmm.verbose) {
			output += 'console.log("after entering ' + this.name + ':");\n';
			output += 'console.log(jsmmscopeInner);\n';
			output += 'console.log(" ");\n';
		}
		output += this.statementList.getSafeCode();
		output += hooksAfter(this) + '\n';
		output += 'jsmmCallStackDepth--;';
		output += 'return jsmm.func.funcReturn(' + getNode(this) + ');\n';
		output += '});';
		return output;
	};
};

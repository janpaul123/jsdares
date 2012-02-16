module.exports = function(jsmm) {
	require('./jsmm.func')(jsmm);
	
	var getPos = function(obj) {
		return '{line: ' + obj.startPos.line + ', column: ' + obj.startPos.column + '}';
	}
	
	var getScope = function() {
		return '(jsmmscopeInner||jsmmscopeOuter)';
	}
	
	/* statementList */
	jsmm.yy.Program.prototype.getSafeCode = function() {
		var output = 'new function() { return function(jsmm, jsmmscope) { var jsmmscopeInner, jsmmscopeOuter = new jsmm.func.Scope(jsmmscope);\n'
		output += 'jsmm.func.resetExecutionCounter();\n';
		output += this.statementList.getSafeCode() + 'return jsmmscopeOuter; }; }';
		return output;
	};
	
	jsmm.yy.Program.prototype.getSafeFunction = function() {
		return eval(this.getSafeCode());
	};
	
	/* statements */
	jsmm.yy.StatementList.prototype.getSafeCode = function() {
		var output = 'jsmm.func.increaseExecutionCounter(' + getPos(this) + ');\n';
		for (var i=0; i<this.statements.length; i++) {
			output += this.statements[i].getSafeCode();
			output += ' jsmm.func.increaseExecutionCounter(' + getPos(this.statements[i]) + ');\n';
			if (jsmm.verbose) {
				output += 'console.log("after line ' + this.statements[i].endPos.line + ':");\n';
				output += 'console.log(' +  getScope() + ');\n';
				output += 'console.log(" ");\n';
			}
		}
		return output;
	};
	
	/* statement */
	jsmm.yy.CommonSimpleStatement.prototype.getSafeCode = function() {
		return this.statement.getSafeCode() + ";";
	};
	
	/* identifier, symbol */
	jsmm.yy.PostfixStatement.prototype.getSafeCode = function() {
		return 'jsmm.func.postfix(' + getPos(this) + ', ' + this.identifier.getSafeCode() + ', "' + this.symbol + '")';
	};
	
	/* identifier, symbol, expression */
	jsmm.yy.AssignmentStatement.prototype.getSafeCode = function() {
		return 'jsmm.func.assignment(' + getPos(this) + ', ' + this.identifier.getSafeCode() + ', "' + this.symbol + '", ' + this.expression.getSafeCode() + ')';
	};
	
	/* items */
	jsmm.yy.VarStatement.prototype.getSafeCode = function() {
		var output = this.items[0].getSafeCode();
		for (var i=1; i<this.items.length; i++) {
			output += ', ' + this.items[i].getSafeCode();
		}
		return output;
	};
	
	/* name, assignment */
	jsmm.yy.VarItem.prototype.getSafeCode = function() {
		var output = 'jsmm.func.varItem(' + getPos(this) + ', ' +  getScope() + ', "' + this.name + '")';
		if (this.assignment !== null) {
			// ; is invalid in for loops
			// this should be possible in JS for normal statements as well
			output += ', ' + this.assignment.getSafeCode();
		}
		return output;
	};
	
	/* expression */
	jsmm.yy.ReturnStatement.prototype.getSafeCode = function() {
		if (this.expression === null) {
			return 'return jsmm.func.funcReturn(' + getPos(this) + ');';
		} else {
			return 'return jsmm.func.funcReturn(' + getPos(this) + ', ' + this.expression.getSafeCode() + ");";
		}
	};
	
	/* expression1, symbol, expression2 */
	jsmm.yy.BinaryExpression.prototype.getSafeCode = function() {
		return 'jsmm.func.binary(' + getPos(this) + ', ' + this.expression1.getSafeCode() + ', "' + this.symbol + '", ' + this.expression2.getSafeCode() + ')';
	};
	
	/* symbol, expression */
	jsmm.yy.UnaryExpression.prototype.getSafeCode = function() {
		return 'jsmm.func.unary(' + getPos(this) + ', "' + this.symbol + '", ' + this.expression.getSafeCode() + ')';
	};
	
	/* number */
	jsmm.yy.NumberLiteral.prototype.getSafeCode = function() {
		return 'jsmm.func.number(' + getPos(this) + ', ' + this.number + ')';
	};
	
	/* str */
	jsmm.yy.StringLiteral.prototype.getSafeCode = function() {
		return 'jsmm.func.string(' + getPos(this) + ', ' + JSON.stringify(this.str) + ')';
	};
	
	/* bool */
	jsmm.yy.BooleanLiteral.prototype.getSafeCode = function() {
		return 'jsmm.func.bool(' + getPos(this) + ', ' + (this.bool ? 'true' : 'false') + ')';
	};
	
	/* name */
	jsmm.yy.NameIdentifier.prototype.getSafeCode = function() {
		return 'jsmm.func.name(' + getPos(this) + ', ' +  getScope() + ', "' + this.name + '")';
	};
	
	/* identifier, prop */
	jsmm.yy.ObjectIdentifier.prototype.getSafeCode = function() {
		return 'jsmm.func.object(' + getPos(this) + ', ' + this.identifier.getSafeCode() + ', "' + this.prop + '")';
	};
	
	/* identifier, expression */
	jsmm.yy.ArrayIdentifier.prototype.getSafeCode = function() {
		return 'jsmm.func.object(' + getPos(this) + ', ' + this.identifier.getSafeCode() + ', ' + this.expression.getSafeCode() + ')';
	};
	
	/* identifier, expressionArgs */
	jsmm.yy.FunctionCall.prototype.getSafeCode = function() {
		var output = 'jsmm.func.funcCall(' + getPos(this) + ', ' + this.identifier.getSafeCode() + ', ['
		if (this.expressionArgs.length > 0) output += this.expressionArgs[0].getSafeCode();
		for (var i=1; i<this.expressionArgs.length; i++) {
			output += ", " + this.expressionArgs[1].getSafeCode();
		}
		return output + '])';
	};
	
	/* expression, statementList, elseBlock */
	jsmm.yy.IfBlock.prototype.getSafeCode = function() {
		var output = "if (jsmm.func.conditional(" + getPos(this) + ', "if", ' + this.expression.getSafeCode() + ")) {\n";
		output += this.statementList.getSafeCode() + "}";
		if (this.elseBlock !== null) {
			output += this.elseBlock.getSafeCode();
		}
		return output;
	};
	
	/* ifBlock */
	jsmm.yy.ElseIfBlock.prototype.getSafeCode = function() {
		return " else " + this.ifBlock.getSafeCode();
	};
	
	/* statementList */
	jsmm.yy.ElseBlock.prototype.getSafeCode = function() {
		return " else {\n" + this.statementList.getSafeCode() + "}";
	};
	
	/* expression, statementList */
	jsmm.yy.WhileBlock.prototype.getSafeCode = function() {
		return "while (jsmm.func.conditional(" + getPos(this) + ', "while", ' + this.expression.getSafeCode() + ")) {\n" + this.statementList.getSafeCode() + "}";
	};
	
	/* statement1, expression, statement2, statementList */
	jsmm.yy.ForBlock.prototype.getSafeCode = function() {
		var output = "for (" + this.statement1.getSafeCode() + '; ' 
		output += 'jsmm.func.conditional(' + getPos(this) + ', "for", ' + this.expression.getSafeCode() + "); ";
		output += this.statement2.getSafeCode() + ") {\n" + this.statementList.getSafeCode() + "}";
		return output;
	};
	
	/* name, nameArgs, statementList */
	jsmm.yy.FunctionDeclaration.prototype.getSafeCode = function() {
		var output = 'jsmm.func.funcDecl(' + getPos(this) + ', jsmmscopeOuter, "' + this.name + '", ';
		output += 'function' + this.getArgList() + "{\n";
		output += 'var jsmmscopeInner = new jsmm.func.Scope({';
		if (this.nameArgs.length > 0) output += '"' + this.nameArgs[0] + '": ' + this.nameArgs[0];
		for (var i=1; i<this.nameArgs.length; i++) {
			output += ', "' + this.nameArgs[i] + '": ' + this.nameArgs[i];
		}
		output += '}, jsmmscopeOuter);\n';
		output += 'jsmm.func.funcEnter(' + getPos(this) + ');\n';
		if (jsmm.verbose) {
			output += 'console.log("after entering ' + this.name + ':");\n';
			output += 'console.log(jsmmscopeInner);\n';
			output += 'console.log(" ");\n';
		}
		output += this.statementList.getSafeCode();
		output += 'return jsmm.func.funcReturn(' + getPos(this) + ');\n';
		output += '});';
		return output;
	};
};

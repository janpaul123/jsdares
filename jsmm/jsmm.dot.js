module.exports = function(jsmm) {
	var makeEdge = function(from, to) {
		return from + "->" + to + ";";
	};
	
	var makeNode = function(id, label, shape) {
		label = label.replace(/\"/g, '&quot;');
		label = label.replace(/\\/g, '\\\\');
		shape = shape || "";
		return id + '[label="' + label + '"shape="' + shape + '"];';
	};
	
	/* statementList */
	jsmm.yy.Program.prototype.getDot = function() {
		return 'digraph{graph[ordering="in"];' + makeNode(this.id, "PROGRAM") + this.statementList.getDot(this.id) + "}";
	};
	
	/* statements */
	jsmm.yy.StatementList.prototype.getDot = function(fromId) {
		var output = makeEdge(fromId, this.id);
		output += "subgraph cluster" + this.id + "{color=lightgrey;";
		output += makeNode(this.id, "", "point");
		for (var i=0; i<this.statements.length; i++) {
			output += this.statements[i].getDot(this.id);
		}
		output += "}";
		return output;
	};
	
	/* statement */
	jsmm.yy.CommonSimpleStatement.prototype.getDot = function(fromId) {
		return this.statement.getDot(fromId);
	};
	
	/* items */
	jsmm.yy.VarStatement.prototype.getDot = function(fromId) {
		var output = makeEdge(fromId, this.id);
		output += "subgraph cluster" + this.id + "{color=transparent;";
		output += makeNode(this.id, "var");
		for (var i=0; i<this.items.length; i++) {
			output += this.items[i].getDot(this.id);
		}
		output += "}";
		return output;
	};
	
	/* name, assignment */
	jsmm.yy.VarItem.prototype.getDot = function(fromId) {
		var output = "";
		if (this.assignment === null) {
			output += makeEdge(fromId, this.id);
			output += makeNode(this.id, this.name);
		}
		else {
			output += this.assignment.getDot(fromId);
		}
		return output;
	};
	
	jsmm.yy.PostfixStatement.prototype.getDot = 
	jsmm.yy.AssignmentStatement.prototype.getDot =
	jsmm.yy.ReturnStatement.prototype.getDot =
	jsmm.yy.BinaryExpression.prototype.getDot =
	jsmm.yy.UnaryExpression.prototype.getDot =
	jsmm.yy.NumberLiteral.prototype.getDot =
	jsmm.yy.StringLiteral.prototype.getDot = 
	jsmm.yy.BooleanLiteral.prototype.getDot = 
	jsmm.yy.NameIdentifier.prototype.getDot =
	jsmm.yy.ObjectIdentifier.prototype.getDot =
	jsmm.yy.ArrayIdentifier.prototype.getDot =
	jsmm.yy.FunctionCall.prototype.getDot = function(fromId) {
		return makeEdge(fromId, this.id) + makeNode(this.id, this.getCode());
	};
	
	/* functionCall */
	jsmm.yy.CallStatement.prototype.getDot = function(fromId) {
		return this.functionCall.getDot(fromId);
	};
	
	/* expression, statementList, elseBlock */
	jsmm.yy.IfBlock.prototype.getDot = function(fromId) {
		var output = makeEdge(fromId, this.id);
		output += makeNode(this.id, "if (" + this.expression.getCode() + ")", "box");
		output += this.statementList.getDot(this.id);
		if (this.elseBlock !== null) {
			output += this.elseBlock.getDot(this.id);
		}
		return output;
	};
	
	/* ifBlock */
	jsmm.yy.ElseIfBlock.prototype.getDot = function(fromId) {
		var output = makeEdge(fromId, this.id);
		output += makeNode(this.id, "else", "box");
		output += this.ifBlock.getDot(this.id);
		return output;
	};
	
	/* statementList */
	jsmm.yy.ElseBlock.prototype.getDot = function(fromId) {
		var output = makeEdge(fromId, this.id);
		output += makeNode(this.id, "else", "box");
		output += this.statementList.getDot(this.id);
		return output;
	};
	
	/* expression, statementList */
	jsmm.yy.WhileBlock.prototype.getDot = function(fromId) {
		var output = makeEdge(fromId, this.id);
		output += makeNode(this.id, "while (" + this.expression.getCode() + ")", "box");
		output += this.statementList.getDot(this.id);
		return output;
	};
	
	/* statement1, expression, statement2, statementList */
	jsmm.yy.ForBlock.prototype.getDot = function(fromId) {
		var output = makeEdge(fromId, this.id);
		output += makeNode(this.id, "for ( ; " + this.expression.getCode() + " ; )", "box");
		output += this.statement1.getDot(this.id);
		output += this.statementList.getDot(this.id);
		output += this.statement2.getDot(this.id);
		return output;
	};
	
	/* name, nameArgs, statementList */
	jsmm.yy.FunctionDeclaration.prototype.getDot = function(fromId) {
		var output = makeEdge(fromId, this.id);
		output += makeNode(this.id, "function " + this.name + this.getArgList(), "octagon");
		output += this.statementList.getDot(this.id);
		return output;
	};
};

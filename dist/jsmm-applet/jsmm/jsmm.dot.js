/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	var makeEdge = function(from, to) {
		return from + '->' + to + ';';
	};
	
	var makeNode = function(id, label, shape) {
		label = label.replace(/\"/g, '&quot;');
		label = label.replace(/\\/g, '\\\\');
		shape = shape || '';
		return id + '[label="' + label + '"shape="' + shape + '"];';
	};
	
	/* statementList */
	jsmm.nodes.Program.prototype.getDot = function() {
		return 'digraph{graph[ordering='in'];' + makeNode(this.id, 'PROGRAM') + this.statementList.getDot(this.id) + '}';
	};
	
	/* statements */
	jsmm.nodes.StatementList.prototype.getDot = function(fromId) {
		var output = makeEdge(fromId, this.id);
		output += 'subgraph cluster' + this.id + '{color=lightgrey;';
		output += makeNode(this.id, '', 'point');
		for (var i=0; i<this.statements.length; i++) {
			output += this.statements[i].getDot(this.id);
		}
		output += '}';
		return output;
	};
	
	/* statement */
	jsmm.nodes.CommonSimpleStatement.prototype.getDot = function(fromId) {
		return this.statement.getDot(fromId);
	};
	
	/* items */
	jsmm.nodes.VarStatement.prototype.getDot = function(fromId) {
		var output = makeEdge(fromId, this.id);
		output += 'subgraph cluster' + this.id + '{color=transparent;';
		output += makeNode(this.id, 'var');
		for (var i=0; i<this.items.length; i++) {
			output += this.items[i].getDot(this.id);
		}
		output += '}';
		return output;
	};
	
	/* name, assignment */
	jsmm.nodes.VarItem.prototype.getDot = function(fromId) {
		var output = '';
		if (this.assignment === null) {
			output += makeEdge(fromId, this.id);
			output += makeNode(this.id, this.name);
		}
		else {
			output += this.assignment.getDot(fromId);
		}
		return output;
	};
	
	jsmm.nodes.PostfixStatement.prototype.getDot =
	jsmm.nodes.AssignmentStatement.prototype.getDot =
	jsmm.nodes.ReturnStatement.prototype.getDot =
	jsmm.nodes.BinaryExpression.prototype.getDot =
	jsmm.nodes.UnaryExpression.prototype.getDot =
	jsmm.nodes.NumberLiteral.prototype.getDot =
	jsmm.nodes.StringLiteral.prototype.getDot =
	jsmm.nodes.BooleanLiteral.prototype.getDot =
	jsmm.nodes.NameIdentifier.prototype.getDot =
	jsmm.nodes.ObjectIdentifier.prototype.getDot =
	jsmm.nodes.ArrayIdentifier.prototype.getDot =
	jsmm.nodes.FunctionCall.prototype.getDot = function(fromId) {
		return makeEdge(fromId, this.id) + makeNode(this.id, this.getCode());
	};

	/* expressions */
	jsmm.nodes.ArrayDefinition.prototype.getDot = function(fromId) {
		var output = makeEdge(fromId, this.id);
		output += makeNode(this.id, '[]');
		for (var i=0; i<this.expressions.length; i++) {
			output += this.expressions[i].getDot(this.id);
		}
		return output;
	};
	
	/* expression, statementList, elseBlock */
	jsmm.nodes.IfBlock.prototype.getDot = function(fromId) {
		var output = makeEdge(fromId, this.id);
		output += makeNode(this.id, 'if (' + this.expression.getCode() + ')', 'box');
		output += this.statementList.getDot(this.id);
		if (this.elseBlock !== null) {
			output += this.elseBlock.getDot(this.id);
		}
		return output;
	};
	
	/* ifBlock */
	jsmm.nodes.ElseIfBlock.prototype.getDot = function(fromId) {
		var output = makeEdge(fromId, this.id);
		output += makeNode(this.id, 'else', 'box');
		output += this.ifBlock.getDot(this.id);
		return output;
	};
	
	/* statementList */
	jsmm.nodes.ElseBlock.prototype.getDot = function(fromId) {
		var output = makeEdge(fromId, this.id);
		output += makeNode(this.id, 'else', 'box');
		output += this.statementList.getDot(this.id);
		return output;
	};
	
	/* expression, statementList */
	jsmm.nodes.WhileBlock.prototype.getDot = function(fromId) {
		var output = makeEdge(fromId, this.id);
		output += makeNode(this.id, 'while (' + this.expression.getCode() + ')', 'box');
		output += this.statementList.getDot(this.id);
		return output;
	};
	
	/* statement1, expression, statement2, statementList */
	jsmm.nodes.ForBlock.prototype.getDot = function(fromId) {
		var output = makeEdge(fromId, this.id);
		output += makeNode(this.id, 'for ( ; ' + this.expression.getCode() + ' ; )', 'box');
		output += this.statement1.getDot(this.id);
		output += this.statementList.getDot(this.id);
		output += this.statement2.getDot(this.id);
		return output;
	};
	
	/* name, nameArgs, statementList */
	jsmm.nodes.FunctionDeclaration.prototype.getDot = function(fromId) {
		var output = makeEdge(fromId, this.id);
		output += makeNode(this.id, 'function ' + this.name + this.getArgList(), 'octagon');
		output += this.statementList.getDot(this.id);
		return output;
	};
};

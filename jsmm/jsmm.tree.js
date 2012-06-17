/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	jsmm.Tree = function() { return this.init.apply(this, arguments); };
	jsmm.Tree.prototype = {
		init: function(code) {
			this.genId = 1;
			this.nodes = [];
			this.nodesByType = { Program: [], StatementList: [], CommonSimpleStatement: [], PostfixStatement: [],
				AssignmentStatement: [], VarStatement: [], VarItem: [], ReturnStatement: [], BinaryExpression: [],
				UnaryExpression: [], ParenExpression: [], NumberLiteral: [], StringLiteral: [], BooleanLiteral: [], NameIdentifier: [],
				ObjectIdentifier: [], ArrayIdentifier: [], FunctionCall: [], IfBlock: [], ElseIfBlock: [],
				ElseBlock: [], WhileBlock: [], ForBlock: [], FunctionDeclaration: []
			};
			this.nodesByLine = {};
			this.error = null;
			jsmm.parser.yy.tree = this;
			try {
				this.programNode = jsmm.parser.parse(code + '\n');
			} catch (error) {
				if (error.type === 'Error') {
					this.error = error;
				} else {
					throw error;
					this.error = new jsmm.msg.Error(0, 'An unknown error has occurred', error);
				}
			}
		},
		hasError: function() {
			return this.error !== null;
		},
		compareMain: function(context) {
			if (this.hasError() || context.tree.hasError() || context.hasError()) {
				return false;
			} else {
				return context.tree.programNode.getCompareCode(context.getCalledFunctions()) === this.programNode.getCompareCode(context.getCalledFunctions());
			}
		},
		compareAll: function(context) {
			if (this.hasError() || context.tree.hasError() || context.hasError()) {
				return false;
			} else {
				return context.tree.programNode.getRunCode() === this.programNode.getRunCode();
			}
		},
		getError: function() {
			return this.error;
		},
		getNewId: function() {
			return this.genId++;
		},
		getNodeByLine: function(line) {
			if (this.nodesByLine[line] === undefined) return null;
			else return this.nodesByLine[line];
		},
		getNodeLines: function() {
			var lines = [];
			for (var line in this.nodesByLine) {
				lines.push(line);
			}
			return lines;
		},
		getNodesByType: function(type) {
			return this.nodesByType[type];
		},
		getNodeById: function(nodeId) {
			if (this.nodes[nodeId] !== undefined) return this.nodes[nodeId];
			else return null;
		}
	};
};
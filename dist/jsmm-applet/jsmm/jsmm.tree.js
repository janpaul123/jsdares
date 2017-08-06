/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	jsmm.Tree = function() { return this.init.apply(this, arguments); };
	jsmm.Tree.prototype = {
		init: function(code, options) {
			this.options = options || {};

			this.genIds = {base: 1, functions: 1};
			this.nodes = [];
			this.nodesByType = { Program: [], StatementList: [], CommonSimpleStatement: [], PostfixStatement: [],
				AssignmentStatement: [], VarStatement: [], VarItem: [], ReturnStatement: [], BinaryExpression: [],
				UnaryExpression: [], ParenExpression: [], NumberLiteral: [], StringLiteral: [], BooleanLiteral: [], NameIdentifier: [],
				ObjectIdentifier: [], ArrayIdentifier: [], FunctionCall: [], ArrayDefinition: [], IfBlock: [], ElseIfBlock: [],
				ElseBlock: [], WhileBlock: [], ForBlock: [], FunctionDeclaration: []
			};
			this.nodesByLine = {};
			this.functionNodes = {};
			this.error = null;
			jsmm.parser.yy.tree = this;

			try {
				var lines = code.split(/\n/);
				for (var i=0; i<lines.length; i++) {
					if (lines[i].length > (this.options.maxWidth || jsmm.maxWidth)) {
						throw new jsmm.msg.CriticalError({line: i+1, column: jsmm.maxWidth}, 'This line is too long, please split it into separate statements');
					}
				}

				this.programNode = jsmm.parser.parse(code + '\n');
			} catch (error) {
				if (error.type === 'Error') {
					this.error = error;
				} else {
					this.error = new jsmm.msg.Error(0, 'An unknown error has occurred', error);
					if (jsmm.debug) {
						throw error;
					}
				}
			}
		},
		hasError: function() {
			return this.error !== null;
		},
		compareBase: function(context) {
			if (this.hasError() || context.tree.hasError() || context.hasError()) {
				return true;
			} else {
				return context.tree.programNode.getCompareBaseCode(context.getCalledFunctions()) !== this.programNode.getCompareBaseCode(context.getCalledFunctions());
			}
		},
		compareFunctions: function(context) {
			if (this.hasError() || context.tree.hasError() || context.hasError()) {
				return true;
			} else {
				return context.tree.programNode.getCompareFunctionCode() !== this.programNode.getCompareFunctionCode();
			}
		},
		compareAll: function(context) {
			if (this.hasError() || context.tree.hasError() || context.hasError()) {
				return true;
			} else {
				return context.tree.programNode.getRunCode() !== this.programNode.getRunCode();
			}
		},
		getError: function() {
			return this.error;
		},
		getNewId: function(type) {
			return type + '-' + this.genIds[type]++;
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
		},
		getFunctionNode: function(funcName) {
			if (this.functionNodes[funcName] !== undefined) return this.functionNodes[funcName];
			else return null;
		},
		getNodeIdsByRange: function(line1, line2) {
			var nodeIds = [];
			for (var line=line1; line<=line2; line++) {
				if (this.nodesByLine[line] !== undefined) {
					nodeIds.push(this.nodesByLine[line].id);
				}
			}
			return nodeIds;
		}
	};
};
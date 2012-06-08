/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	jsmm.Tree = function() { return this.init.apply(this, arguments); };

	jsmm.nodes = {};
	jsmm.nodes.Program = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.StatementList = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.CommonSimpleStatement = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.PostfixStatement = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.AssignmentStatement = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.VarStatement = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.VarItem = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ReturnStatement = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.BinaryExpression = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.UnaryExpression = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ParenExpression = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.NumberLiteral = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.StringLiteral = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.BooleanLiteral = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.NameIdentifier = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ObjectIdentifier = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ArrayIdentifier = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.FunctionCall = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.IfBlock = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ElseIfBlock = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ElseBlock = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.WhileBlock = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ForBlock = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.FunctionDeclaration = function() { return this.build.apply(this, arguments); };

	jsmm.Tree.prototype = {
		init: function(code) {
			this.genId = 1;
			this.nodes = [];
			//this.code = code;
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
				if (error instanceof jsmm.msg.Error) {
					this.error = error;
				} else {
					throw error;
					this.error = new jsmm.msg.Error({}, 'An unknown error has occurred', '', error);
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

	jsmm.addCommonNodeMethods = function(type, children, topNode, node) {
		node.children = children;
		node.build = function(_$, column2) {
			this.tree = jsmm.parser.yy.tree;
			this.tree.nodesByType[type].push(this);
			this.type = type;
			this.lineLoc = {line: _$.first_line, column: _$.first_column, column2 : (column2 || _$.last_column)};
			this.blockLoc = {line: _$.first_line, line2: _$.last_line};
			this.textLoc = {line: _$.first_line, column: _$.first_column, line2: _$.last_line, column2: _$.last_column};
			this.parent = null;
			this.topNode = topNode;
			if (this.topNode) {
				this.tree.nodesByLine[this.lineLoc.line] = this;
			}
			var i=2;
			for (var name in this.children) {
				this[name] = arguments[i++];
				if (this.children[name] && this[name] !== null) { // it is a node
					this[name].parent = this;
				}
			}
			if (this.init !== undefined) {
				this.init.apply(this, [].slice.call(arguments, 2));
			}
		};

		node.getTopNode = function() {
			return this.tree.nodesByLine[this.lineLoc.line];
			// var node = this;
			// while (node !== null && !node.topNode) {
			// 	node = node.parent;
			// }
			// return node;
		};

		if (node.getChildren === undefined) {
			node.getChildren = function() {
				var children = [];
				for (var name in this.children) {
					if (this.children[name] && this[name] !== null) { // it is a node
						children.push(this[name]);
					}
				}
				return children;
			};
		}

		if (node.makeId === undefined) {
			node.makeId = function() {
				this.id = this.tree.getNewId();
				this.tree.nodes[this.id] = this;
				var children = this.getChildren();
				for (var i=0; i<children.length; i++) {
					children[i].makeId();
				}
			};
		}

		return node;
	};

	jsmm.nodes.Program.prototype = jsmm.addCommonNodeMethods('Program', {statementList: true}, false, {
		init: function() {
			this.makeId();
		},
		getCode: function() {
			return this.statementList.getCode();
		},
		getFunction: function(scope) {
			/*jshint evil:true*/
			var args = [jsmm];
			var output = 'new function() {';
			output += 'return function(jsmm';
			for (var name in scope) {
				output += ', ' + name;
				args.push(scope[name]);
			}
			output += ') { return function() { \n';
			output += this.statementList.getCode() + 'return; }; }; }';
			//console.log(output);
			return eval(output).apply(null, args);
		}
	});

	jsmm.nodes.StatementList.prototype = jsmm.addCommonNodeMethods('StatementList', {}, false, {
		init: function() {
			this.statements = [];
		},
		addStatement: function(statement) {
			this.statements.push(statement);
			statement.parent = this;
		},
		getCode: function() {
			var output = '';
			for (var i=0; i<this.statements.length; i++) {
				output += this.statements[i].getCode() + '\n';
			}
			return output;
		},
		getChildren: function() {
			return this.statements;
		},
		makeId: function() {
			this.id = this.tree.getNewId();
			this.tree.nodes[this.id] = this;
			for (var i=0; i<this.statements.length; i++) {
				this.statements[i].makeId();
			}
			for (i=0; i<this.statements.length; i++) {
				if (this.statements[i].type === 'FunctionDeclaration') {
					var children = this.statements[i].getChildren();
					for (var j=0; j<children.length; j++) {
						children[j].makeId();
					}
				}
			}
		}
	});

	jsmm.nodes.CommonSimpleStatement.prototype = jsmm.addCommonNodeMethods('CommonSimpleStatement', {statement: true}, true, {
		getCode: function() {
			return this.statement.getCode() + ';';
		}
	});

	jsmm.nodes.PostfixStatement.prototype = jsmm.addCommonNodeMethods('PostfixStatement', {identifier: true, symbol: false}, false, {
		getCode: function() {
			return this.identifier.getCode() + this.symbol;
		}
	});

	jsmm.nodes.AssignmentStatement.prototype = jsmm.addCommonNodeMethods('AssignmentStatement', {identifier: true, symbol: false, expression: true}, false, {
		getCode: function() {
			return this.identifier.getCode() + ' ' + this.symbol + ' ' + this.expression.getCode();
		}
	});

	jsmm.nodes.VarStatement.prototype = jsmm.addCommonNodeMethods('VarStatement', {}, false, {
		init: function() {
			this.items = [];
		},
		addVarItem: function(item) {
			this.items.push(item);
			item.parent = this;
		},
		getCode: function() {
			var output = 'var ' + this.items[0].getCode();
			for (var i=1; i<this.items.length; i++) {
				output += ', ' + this.items[i].getCode();
			}
			return output;
		},
		getChildren: function() {
			return this.items;
		}
	});

	jsmm.nodes.VarItem.prototype = jsmm.addCommonNodeMethods('VarItem', {name: false, assignment: true}, false, {
		getCode: function() {
			if (this.assignment === null) {
				return this.name;
			} else {
				return this.assignment.getCode();
			}
		}
	});

	jsmm.nodes.ReturnStatement.prototype = jsmm.addCommonNodeMethods('ReturnStatement', {expression: true}, true, {
		getCode: function() {
			if (this.expression === null) {
				return 'return;';
			} else {
				return 'return ' + this.expression.getCode() + ';';
			}
		}
	});

	jsmm.nodes.BinaryExpression.prototype = jsmm.addCommonNodeMethods('BinaryExpression', {expression1: true, symbol: false, expression2: true}, false, {
		getCode: function() {
			return this.expression1.getCode() + ' ' + this.symbol + ' ' + this.expression2.getCode();
		}
	});

	jsmm.nodes.UnaryExpression.prototype = jsmm.addCommonNodeMethods('UnaryExpression', {symbol: false, expression: true}, false, {
		getCode: function() {
			return this.symbol + this.expression.getCode();
		}
	});

	jsmm.nodes.ParenExpression.prototype = jsmm.addCommonNodeMethods('ParenExpression', {expression: true}, false, {
		getCode: function() {
			return '(' + this.expression.getCode() + ')';
		}
	});

	jsmm.nodes.NumberLiteral.prototype = jsmm.addCommonNodeMethods('NumberLiteral', {number: false}, false, {
		init: function() {
			this.number = parseFloat(this.number);
		},
		getCode: function() {
			return this.number;
		}
	});

	jsmm.nodes.StringLiteral.prototype = jsmm.addCommonNodeMethods('StringLiteral', {str: false}, false, {
		init: function() {
			this.str = JSON.parse(this.str);
		},
		getCode: function() {
			return JSON.stringify(this.str);
		}
	});

	jsmm.nodes.BooleanLiteral.prototype = jsmm.addCommonNodeMethods('BooleanLiteral', {bool: false}, false, {
		getCode: function() {
			return this.bool ? 'true' : 'false';
		}
	});

	jsmm.nodes.NameIdentifier.prototype = jsmm.addCommonNodeMethods('NameIdentifier', {name: false}, false, {
		getCode: function() {
			return this.name;
		}
	});

	jsmm.nodes.ObjectIdentifier.prototype = jsmm.addCommonNodeMethods('ObjectIdentifier', {identifier: true, prop: false}, false, {
		getCode: function() {
			return this.identifier.getCode() + '.' + this.prop;
		}
	});

	jsmm.nodes.ArrayIdentifier.prototype = jsmm.addCommonNodeMethods('ArrayIdentifier', {identifier: true, expression: true}, false, {
		getCode: function() {
			return this.identifier.getCode() + '[' + this.expression.getCode() + ']';
		}
	});

	jsmm.nodes.FunctionCall.prototype = jsmm.addCommonNodeMethods('FunctionCall', {identifier: true, expressionArgs: false}, false, {
		init: function() {
			for (var i=0; i<this.expressionArgs.length; i++) {
				this.expressionArgs[i].parent = this;
			}
		},
		getCode: function() {
			var output = this.identifier.getCode() + '(';
			if (this.expressionArgs.length > 0) output += this.expressionArgs[0].getCode();
			for (var i=1; i<this.expressionArgs.length; i++) {
				output += ", " + this.expressionArgs[i].getCode();
			}
			return output + ')';
		},
		getChildren: function() {
			return this.expressionArgs.concat([this.identifier]);
		}
	});

	jsmm.nodes.IfBlock.prototype = jsmm.addCommonNodeMethods('IfBlock', {expression: true, statementList: true, elseBlock: true}, true, {
		init: function() {
			if (this.elseBlock !== null) {
				this.blockLoc.line2 = this.elseBlock.blockLoc.line-1;
			}
		},
		getCode: function() {
			var output = 'if (' + this.expression.getCode() + ') {\n' + this.statementList.getCode() + '}';
			if (this.elseBlock !== null) {
				output += this.elseBlock.getCode();
			}
			return output;
		}
	});

	jsmm.nodes.ElseIfBlock.prototype = jsmm.addCommonNodeMethods('ElseIfBlock', {ifBlock: true}, false, {
		getCode: function() {
			return ' else ' + this.ifBlock.getCode();
		}
	});

	jsmm.nodes.ElseBlock.prototype = jsmm.addCommonNodeMethods('ElseBlock', {statementList: true}, true, {
		getCode: function() {
			return ' else {\n' + this.statementList.getCode() + '}';
		}
	});

	jsmm.nodes.WhileBlock.prototype = jsmm.addCommonNodeMethods('WhileBlock', {expression: true, statementList: true}, true, {
		getCode: function() {
			return 'while (' + this.expression.getCode() + ') {\n' + this.statementList.getCode() + '}';
		}
	});

	jsmm.nodes.ForBlock.prototype = jsmm.addCommonNodeMethods('ForBlock', {statement1: true, expression: true, statement2: true, statementList: true}, true, {
		getCode: function() {
			var output = 'for (' + this.statement1.getCode() + ';' + this.expression.getCode() + ';';
			output += this.statement2.getCode() + ') {\n' + this.statementList.getCode() + '}';
			return output;
		}
	});

	jsmm.nodes.FunctionDeclaration.prototype = jsmm.addCommonNodeMethods('FunctionDeclaration', {name: false, nameArgs: false, statementList: true}, true, {
		getArgList: function() {
			return '(' + this.nameArgs.join(', ') + ')';
		},
		getCode: function() {
			var output = 'function ' + this.name + this.getArgList() + '{\n' + this.statementList.getCode() + '}';
			return output;
		},
		makeId: function() {
			this.id = this.tree.getNewId();
			this.tree.nodes[this.id] = this;
		}
	});
};
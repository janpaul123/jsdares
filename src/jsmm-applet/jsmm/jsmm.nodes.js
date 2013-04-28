/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	var addCommonNodeMethods = function(type, children, topNode, node) {
		node.children = children;
		node.build = function(_$, column2) {
			this.tree = jsmm.parser.yy.tree;
			this.tree.nodesByType[type].push(this);
			this.type = type;
			// this.id = this.tree.getNewId();
			// this.tree.nodes[this.id] = this;
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

		node.makeNodeIdsBase = function(type) {
			this.id = this.tree.getNewId(type);
			this.tree.nodes[this.id] = this;
			var children = this.getChildren();
			for (var i=0; i<children.length; i++) {
				children[i].makeNodeIds(type);
			}
		};

		if (node.makeNodeIds === undefined) {
			node.makeNodeIds = node.makeNodeIdsBase;
		}

		return node;
	};

	jsmm.nodes = {};
	
	jsmm.nodes.Program = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.Program.prototype = addCommonNodeMethods('Program', {statementList: true}, false, {
		init: function() {
			this.makeNodeIds('base');
			this.lineLoc = {line: 0, column: 0, column2: 0};
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

	jsmm.nodes.StatementList = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.StatementList.prototype = addCommonNodeMethods('StatementList', {}, false, {
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
		}
	});

	jsmm.nodes.CommonSimpleStatement = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.CommonSimpleStatement.prototype = addCommonNodeMethods('CommonSimpleStatement', {statement: true}, true, {
		getCode: function() {
			return this.statement.getCode() + ';';
		}
	});

	jsmm.nodes.PostfixStatement = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.PostfixStatement.prototype = addCommonNodeMethods('PostfixStatement', {identifier: true, symbol: false}, false, {
		getCode: function() {
			return this.identifier.getCode() + this.symbol;
		}
	});

	jsmm.nodes.AssignmentStatement = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.AssignmentStatement.prototype = addCommonNodeMethods('AssignmentStatement', {identifier: true, symbol: false, expression: true}, false, {
		getCode: function() {
			return this.identifier.getCode() + ' ' + this.symbol + ' ' + this.expression.getCode();
		}
	});

	jsmm.nodes.VarStatement = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.VarStatement.prototype = addCommonNodeMethods('VarStatement', {}, false, {
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

	jsmm.nodes.VarItem = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.VarItem.prototype = addCommonNodeMethods('VarItem', {name: false, assignment: true}, false, {
		getCode: function() {
			if (this.assignment === null) {
				return this.name;
			} else {
				return this.assignment.getCode();
			}
		}
	});

	jsmm.nodes.ReturnStatement = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ReturnStatement.prototype = addCommonNodeMethods('ReturnStatement', {expression: true}, true, {
		getCode: function() {
			if (this.expression === null) {
				return 'return;';
			} else {
				return 'return ' + this.expression.getCode() + ';';
			}
		}
	});

	jsmm.nodes.BinaryExpression = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.BinaryExpression.prototype = addCommonNodeMethods('BinaryExpression', {expression1: true, symbol: false, expression2: true}, false, {
		getCode: function() {
			return this.expression1.getCode() + ' ' + this.symbol + ' ' + this.expression2.getCode();
		}
	});

	jsmm.nodes.UnaryExpression = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.UnaryExpression.prototype = addCommonNodeMethods('UnaryExpression', {symbol: false, expression: true}, false, {
		getCode: function() {
			return this.symbol + this.expression.getCode();
		}
	});

	jsmm.nodes.ParenExpression = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ParenExpression.prototype = addCommonNodeMethods('ParenExpression', {expression: true}, false, {
		getCode: function() {
			return '(' + this.expression.getCode() + ')';
		}
	});

	jsmm.nodes.NumberLiteral = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.NumberLiteral.prototype = addCommonNodeMethods('NumberLiteral', {number: false}, false, {
		init: function() {
			this.number = parseFloat(this.number);
		},
		getCode: function() {
			return this.number;
		}
	});

	jsmm.nodes.StringLiteral = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.StringLiteral.prototype = addCommonNodeMethods('StringLiteral', {str: false}, false, {
		init: function() {
			try {
				this.str = JSON.parse(this.str);
			} catch (e) {
				throw new jsmm.msg.Error(this.id, 'String contains invalid characters');
			}
		},
		getCode: function() {
			return JSON.stringify(this.str);
		}
	});

	jsmm.nodes.BooleanLiteral = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.BooleanLiteral.prototype = addCommonNodeMethods('BooleanLiteral', {bool: false}, false, {
		getCode: function() {
			return this.bool ? 'true' : 'false';
		}
	});

	jsmm.nodes.NameIdentifier = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.NameIdentifier.prototype = addCommonNodeMethods('NameIdentifier', {name: false}, false, {
		getCode: function() {
			return this.name;
		},
		getBaseName: function() {
			return this.name;
		}
	});

	jsmm.nodes.ObjectIdentifier = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ObjectIdentifier.prototype = addCommonNodeMethods('ObjectIdentifier', {identifier: true, prop: false}, false, {
		getCode: function() {
			return this.identifier.getCode() + '.' + this.prop;
		},
		getBaseName: function() {
			return this.identifier.getBaseName();
		}
	});

	jsmm.nodes.ArrayIdentifier = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ArrayIdentifier.prototype = addCommonNodeMethods('ArrayIdentifier', {identifier: true, expression: true}, false, {
		getCode: function() {
			return this.identifier.getCode() + '[' + this.expression.getCode() + ']';
		},
		getBaseName: function() {
			return this.identifier.getBaseName();
		}
	});

	jsmm.nodes.FunctionCall = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.FunctionCall.prototype = addCommonNodeMethods('FunctionCall', {identifier: true, expressionArgs: false}, false, {
		init: function() {
			for (var i=0; i<this.expressionArgs.length; i++) {
				this.expressionArgs[i].parent = this;
			}
		},
		getCode: function() {
			var output = this.identifier.getCode() + '(';
			if (this.expressionArgs.length > 0) output += this.expressionArgs[0].getCode();
			for (var i=1; i<this.expressionArgs.length; i++) {
				output += ', ' + this.expressionArgs[i].getCode();
			}
			return output + ')';
		},
		getChildren: function() {
			return this.expressionArgs.concat([this.identifier]);
		}
	});

	jsmm.nodes.ArrayDefinition = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ArrayDefinition.prototype = addCommonNodeMethods('ArrayDefinition', {expressions: false}, false, {
		init: function() {
			for (var i=0; i<this.expressions.length; i++) {
				this.expressions[i].parent = this;
			}
		},
		getCode: function() {
			var output = '[';
			if (this.expressions.length > 0) output += this.expressions[0].getCode();
			for (var i=1; i<this.expressions.length; i++) {
				output += ', ' + this.expressions[i].getCode();
			}
			return output + ']';
		},
		getChildren: function() {
			return this.expressions;
		}
	});

	jsmm.nodes.IfBlock = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.IfBlock.prototype = addCommonNodeMethods('IfBlock', {expression: true, statementList: true, elseBlock: true}, true, {
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

	jsmm.nodes.ElseIfBlock = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ElseIfBlock.prototype = addCommonNodeMethods('ElseIfBlock', {ifBlock: true}, false, {
		getCode: function() {
			return ' else ' + this.ifBlock.getCode();
		}
	});

	jsmm.nodes.ElseBlock = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ElseBlock.prototype = addCommonNodeMethods('ElseBlock', {statementList: true}, true, {
		getCode: function() {
			return ' else {\n' + this.statementList.getCode() + '}';
		}
	});

	jsmm.nodes.WhileBlock = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.WhileBlock.prototype = addCommonNodeMethods('WhileBlock', {expression: true, statementList: true}, true, {
		getCode: function() {
			return 'while (' + this.expression.getCode() + ') {\n' + this.statementList.getCode() + '}';
		}
	});

	jsmm.nodes.ForBlock = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ForBlock.prototype = addCommonNodeMethods('ForBlock', {statement1: true, expression: true, statement2: true, statementList: true}, true, {
		getCode: function() {
			var output = 'for (' + this.statement1.getCode() + ';' + this.expression.getCode() + ';';
			output += this.statement2.getCode() + ') {\n' + this.statementList.getCode() + '}';
			return output;
		}
	});

	jsmm.nodes.FunctionDeclaration = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.FunctionDeclaration.prototype = addCommonNodeMethods('FunctionDeclaration', {name: false, nameArgs: false, statementList: true}, true, {
		init: function() {
			this.tree.functionNodes[this.name] = this;
		},
		getArgList: function() {
			return '(' + this.nameArgs.join(', ') + ')';
		},
		getCode: function() {
			var output = 'function ' + this.name + this.getArgList() + '{\n' + this.statementList.getCode() + '}';
			return output;
		},
		makeNodeIds: function(type) {
			this.makeNodeIdsBase('functions');
		}
	});
};
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
	jsmm.nodes.NumberLiteral = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.StringLiteral = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.BooleanLiteral = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.NameIdentifier = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ObjectIdentifier = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ArrayIdentifier = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.FunctionCall = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.CallStatement = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.IfBlock = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ElseIfBlock = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ElseBlock = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.WhileBlock = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.ForBlock = function() { return this.build.apply(this, arguments); };
	jsmm.nodes.FunctionDeclaration = function() { return this.build.apply(this, arguments); };

	jsmm.Tree.prototype = {
		init: function(code) {
			this.genId = 0;
			this.nodes = [];
			//this.code = code;
			this.nodesByType = { Program: [], StatementList: [], CommonSimpleStatement: [], PostfixStatement: [],
				AssignmentStatement: [], VarStatement: [], VarItem: [], ReturnStatement: [], BinaryExpression: [],
				UnaryExpression: [], NumberLiteral: [], StringLiteral: [], BooleanLiteral: [], NameIdentifier: [],
				ObjectIdentifier: [], ArrayIdentifier: [], FunctionCall: [], CallStatement: [], IfBlock: [], ElseIfBlock: [],
				ElseBlock: [], WhileBlock: [], ForBlock: [], FunctionDeclaration: []
			};
			this.nodesByLine = {};
			this.nodesWithHook = [];
			this.error = null;
			jsmm.parser.yy.tree = this;
			try {
				this.programNode = jsmm.parser.parse(code + "\n");
			} catch (error) {
				if (error instanceof jsmm.msg.Error) {
					this.error = error;
				} else {
					//throw error;
					this.error = new jsmm.msg.Error({}, 'An unknown error has occurred', '', error);
				}
			}
		},
		hasError: function() {
			return this.error !== null;
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
		addHookBeforeNode: function(node, func) {
			if (node.hooksBefore === undefined) {
				throw new Error('Trying to add a hook to an unhookable node');
			} else {
				node.hooksBefore.push(func);
				this.nodesWithHook.push(node);
				return true;
			}
		},
		addHookAfterNode: function(node, func) {
			if (node.hooksAfter === undefined) {
				throw new Error('Trying to add a hook to an unhookable node');
			} else {
				node.hooksAfter.push(func);
				this.nodesWithHook.push(node);
				return true;
			}
		},
		clearHooks: function() {
			for (var i=0; i<this.nodesWithHook.length; i++) {
				this.nodesWithHook[i].hooksBefore = [];
				this.nodesWithHook[i].hooksAfter = [];
			}
			this.nodesWithHook = [];
		}
	};

	jsmm.addCommonNodeMethods = function(type, node) {
		node.build = function(_$, column2) {
			this.tree = jsmm.parser.yy.tree;
			this.id = this.tree.getNewId();
			this.tree.nodes[this.id] = this;
			this.tree.nodesByType[type].push(this);
			this.type = type;
			this.lineLoc = {line: _$.first_line, column: _$.first_column, column2 : (column2 || _$.last_column)};
			this.blockLoc = {line: _$.first_line, line2: _$.last_line};
			this.textLoc = {line: _$.first_line, column: _$.first_column, line2: _$.last_line, column2: _$.last_column};
			this.parent = null;
			this.init.apply(this, [].slice.call(arguments, 2));
		};
		node.runHooksBefore = function(context, scope) {
			if (this.hooksBefore === undefined) throw new Error('runHooksBefore on unhookable node');
			for (var i=0; i<this.hooksBefore.length; i++) {
				this.hooksBefore[i](this, context, scope);
			}
		};
		node.runHooksAfter = function(context, scope) {
			if (this.hooksAfter === undefined) throw new Error('runHooksAfter on unhookable node');
			for (var i=0; i<this.hooksAfter.length; i++) {
				this.hooksAfter[i](this, context, scope);
			}
		};
		return node;
	};

	jsmm.nodes.Program.prototype = jsmm.addCommonNodeMethods('Program', {
		init: function(statementList) {
			this.statementList = statementList;
			statementList.parent = this;
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

	jsmm.nodes.StatementList.prototype = jsmm.addCommonNodeMethods('StatementList', {
		init: function() {
			this.statements = [];
		},
		addStatement: function(statement) {
			this.statements.push(statement);
			statement.parent = this;
		},
		getCode: function() {
			var output = "";
			for (var i=0; i<this.statements.length; i++) {
				output += this.statements[i].getCode() + "\n";
			}
			return output;
		},
		getChildren: function() {
			return this.statements;
		}
	});

	jsmm.nodes.CommonSimpleStatement.prototype = jsmm.addCommonNodeMethods('CommonSimpleStatement', {
		init: function(statement) {
			this.statement = statement;
			statement.parent = this;
			this.tree.nodesByLine[this.lineLoc.line] = this;
			this.hooksBefore = [];
			this.hooksAfter = [];
			//console.log(this);
		},
		getCode: function() {
			return this.statement.getCode() + ";";
		},
		getChildren: function() {
			return [this.statement];
		}
	});

	jsmm.nodes.PostfixStatement.prototype = jsmm.addCommonNodeMethods('PostfixStatement', {
		init: function(identifier, symbol) {
			this.identifier = identifier;
			this.symbol = symbol;
			identifier.parent = this;
			symbol.parent = this;
		},
		getCode: function() {
			return this.identifier.getCode() + this.symbol;
		},
		getChildren: function() {
			return [this.identifier];
		}
	});

	jsmm.nodes.AssignmentStatement.prototype = jsmm.addCommonNodeMethods('AssignmentStatement', {
		init: function(identifier, symbol, expression) {
			this.identifier = identifier;
			this.symbol = symbol;
			this.expression = expression;
			identifier.parent = this;
			expression.parent = this;
		},
		getCode: function() {
			return this.identifier.getCode() + " " + this.symbol + " " + this.expression.getCode();
		},
		getChildren: function() {
			return [this.identifier, this.expression];
		}
	});

	jsmm.nodes.VarStatement.prototype = jsmm.addCommonNodeMethods('VarStatement', {
		init: function() {
			this.items = [];
		},
		addVarItem: function(item) {
			this.items.push(item);
			item.parent = this;
		},
		getCode: function() {
			var output = "var " + this.items[0].getCode();
			for (var i=1; i<this.items.length; i++) {
				output += ", " + this.items[i].getCode();
			}
			return output;
		},
		getChildren: function() {
			return this.items;
		}
	});

	jsmm.nodes.VarItem.prototype = jsmm.addCommonNodeMethods('VarItem', {
		init: function(name, assignment) {
			this.name = name;
			this.assignment = assignment;
			if (assignment !== null) assignment.parent = this;
		},
		getCode: function() {
			if (this.assignment === null) {
				return this.name;
			} else {
				return this.assignment.getCode();
			}
		},
		getChildren: function() {
			return [this.assignment];
		}
	});

	jsmm.nodes.ReturnStatement.prototype = jsmm.addCommonNodeMethods('ReturnStatement', {
		init: function(expression) {
			this.expression = expression;
			expression.parent = this;
			this.tree.nodesByLine[this.lineLoc.line] = this;
			this.hooksBefore = [];
			this.hooksAfter = [];
		},
		getCode: function() {
			if (this.expression === null) {
				return "return;";
			} else {
				return "return " + this.expression.getCode() + ";";
			}
		},
		iterateRunHooksAfter: function(scope) {
			var node = this;
			while (!(node.type === 'Program' || node.type === 'FunctionDeclaration')) {
				if (node.hooksAfter !== undefined) node.runHooksAfter(scope);
				node = node.parent;
			}
			if (node.hooksAfter !== undefined) node.runHooksAfter(scope);
		}
	});

	jsmm.nodes.BinaryExpression.prototype = jsmm.addCommonNodeMethods('BinaryExpression', {
		init: function(expression1, symbol, expression2) {
			this.expression1 = expression1;
			this.symbol = symbol;
			this.expression2 = expression2;
			expression1.parent = this;
			expression2.parent = this;
		},
		getCode: function() {
			return "(" + this.expression1.getCode() + this.symbol + this.expression2.getCode() + ")";
		}
	});

	jsmm.nodes.UnaryExpression.prototype = jsmm.addCommonNodeMethods('UnaryExpression', {
		init: function(symbol, expression) {
			this.symbol = symbol;
			this.expression = expression;
			expression.parent = this;
		},
		getCode: function() {
			return "(" + this.symbol + this.expression.getCode() + ")";
		}
	});

	jsmm.nodes.NumberLiteral.prototype = jsmm.addCommonNodeMethods('NumberLiteral', {
		init: function(number) {
			this.number = parseFloat(number);
		},
		getCode: function() {
			return this.number;
		}
	});

	jsmm.nodes.StringLiteral.prototype = jsmm.addCommonNodeMethods('StringLiteral', {
		init: function(str) {
			this.str = JSON.parse(str);
		},
		getCode: function() {
			return JSON.stringify(this.str);
		}
	});

	jsmm.nodes.BooleanLiteral.prototype = jsmm.addCommonNodeMethods('BooleanLiteral', {
		init: function(bool) {
			this.bool = bool;
		},
		getCode: function() {
			return this.bool ? "true" : "false";
		}
	});

	jsmm.nodes.NameIdentifier.prototype = jsmm.addCommonNodeMethods('NameIdentifier', {
		init: function(name) {
			this.name = name;
		},
		getCode: function() {
			return this.name;
		}
	});

	jsmm.nodes.ObjectIdentifier.prototype = jsmm.addCommonNodeMethods('ObjectIdentifier', {
		init: function(identifier, prop) {
			this.identifier = identifier;
			this.prop = prop;
			identifier.parent = this;
		},
		getCode: function() {
			return this.identifier.getCode() + "." + this.prop;
		}
	});

	jsmm.nodes.ArrayIdentifier.prototype = jsmm.addCommonNodeMethods('ArrayIdentifier', {
		init: function(identifier, expression) {
			this.identifier = identifier;
			this.expression = expression;
			identifier.parent = this;
			expression.parent = this;
		},
		getCode: function() {
			return this.identifier.getCode() + "[" + this.expression.getCode() + "]";
		}
	});

	jsmm.nodes.FunctionCall.prototype = jsmm.addCommonNodeMethods('FunctionCall', {
		init: function(identifier, expressionArgs) {
			this.identifier = identifier;
			this.expressionArgs = expressionArgs;
			identifier.parent = this;
			for (var i=0; i<this.expressionArgs.length; i++) {
				expressionArgs[i].parent = this;
			}
		},
		getCode: function() {
			var output = this.identifier.getCode() + "(";
			if (this.expressionArgs.length > 0) output += this.expressionArgs[0].getCode();
			for (var i=1; i<this.expressionArgs.length; i++) {
				output += ", " + this.expressionArgs[i].getCode();
			}
			return output + ")";
		}
	});

	jsmm.nodes.CallStatement.prototype = jsmm.addCommonNodeMethods('CallStatement', {
		init: function(functionCall) {
			this.functionCall = functionCall;
			functionCall.parent = this;
		},
		getCode: function() {
			return this.functionCall.getCode();
		}
	});

	jsmm.nodes.IfBlock.prototype = jsmm.addCommonNodeMethods('IfBlock', {
		init: function(expression, statementList, elseBlock) {
			this.expression = expression;
			this.statementList = statementList;
			this.elseBlock = elseBlock;
			expression.parent = this;
			statementList.parent = this;
			if (elseBlock !== null) elseBlock.parent = this;
			this.tree.nodesByLine[this.lineLoc.line] = this;
			this.hooksBefore = [];
			this.hooksAfter = [];
		},
		getCode: function() {
			var output = "if (" + this.expression.getCode() + ") {\n" + this.statementList.getCode() + "}";
			if (this.elseBlock !== null) {
				output += this.elseBlock.getCode();
			}
			return output;
		}
	});

	jsmm.nodes.ElseIfBlock.prototype = jsmm.addCommonNodeMethods('ElseIfBlock', {
		init: function(ifBlock) {
			this.ifBlock = ifBlock;
			ifBlock.parent = this;
		},
		getCode: function() {
			return " else " + this.ifBlock.getCode();
		}
	});

	jsmm.nodes.ElseBlock.prototype = jsmm.addCommonNodeMethods('ElseBlock', {
		init: function(statementList) {
			this.statementList = statementList;
			statementList.parent = this;
			this.tree.nodesByLine[this.lineLoc.line] = this;
			this.hooksBefore = [];
			this.hooksAfter = [];
		},
		getCode: function() {
			return " else {\n" + this.statementList.getCode() + "}";
		}
	});

	jsmm.nodes.WhileBlock.prototype = jsmm.addCommonNodeMethods('WhileBlock', {
		init: function(expression, statementList) {
			this.expression = expression;
			this.statementList = statementList;
			expression.parent = this;
			statementList.parent = this;
			this.tree.nodesByLine[this.lineLoc.line] = this;
			this.hooksBefore = [];
			this.hooksAfter = [];
		},
		getCode: function() {
			return "while (" + this.expression.getCode() + ") {\n" + this.statementList.getCode() + "}";
		}
	});

	jsmm.nodes.ForBlock.prototype = jsmm.addCommonNodeMethods('ForBlock', {
		init: function(statement1, expression, statement2, statementList) {
			this.statement1 = statement1;
			this.expression = expression;
			this.statement2 = statement2;
			this.statementList = statementList;
			statement1.parent = this;
			expression.parent = this;
			statement2.parent = this;
			statementList.parent = this;
			this.tree.nodesByLine[this.lineLoc.line] = this;
			this.hooksBefore = [];
			this.hooksAfter = [];
		},
		getCode: function() {
			var output = "for (" + this.statement1.getCode() + ";" + this.expression.getCode() + ";";
			output += this.statement2.getCode() + ") {\n" + this.statementList.getCode() + "}";
			return output;
		}
	});

	jsmm.nodes.FunctionDeclaration.prototype = jsmm.addCommonNodeMethods('FunctionDeclaration', {
		init: function(name, nameArgs, statementList) {
			this.name = name;
			this.nameArgs = nameArgs;
			this.statementList = statementList;
			statementList.parent = this;
			this.tree.nodesByLine[this.lineLoc.line] = this;
			this.hooksBefore = [];
			this.hooksAfter = [];
		},
		getArgList: function() {
			var output = '(';
			if (this.nameArgs.length > 0) output += this.nameArgs[0];
			for (var i=1; i<this.nameArgs.length; i++) {
				output += ', ' + this.nameArgs[i];
			}
			return output + ')';
		},
		getCode: function() {
			var output = "function " + this.name + this.getArgList() + "{\n" + this.statementList.getCode() + "}";
			return output;
		}
	});
};
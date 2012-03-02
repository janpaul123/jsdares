var jsmm = {};

jsmm.verbose = false;

jsmm.Context = function() { return this.init.apply(this, arguments); };
jsmm.yy = {};
jsmm.yy.Program = function() { return this.build.apply(this, arguments); };
jsmm.yy.StatementList = function() { return this.build.apply(this, arguments); };
jsmm.yy.CommonSimpleStatement = function() { return this.build.apply(this, arguments); };
jsmm.yy.PostfixStatement = function() { return this.build.apply(this, arguments); };
jsmm.yy.AssignmentStatement = function() { return this.build.apply(this, arguments); };
jsmm.yy.VarStatement = function() { return this.build.apply(this, arguments); };
jsmm.yy.VarItem = function() { return this.build.apply(this, arguments); };
jsmm.yy.ReturnStatement = function() { return this.build.apply(this, arguments); };
jsmm.yy.BinaryExpression = function() { return this.build.apply(this, arguments); };
jsmm.yy.UnaryExpression = function() { return this.build.apply(this, arguments); };
jsmm.yy.NumberLiteral = function() { return this.build.apply(this, arguments); };
jsmm.yy.StringLiteral = function() { return this.build.apply(this, arguments); };
jsmm.yy.BooleanLiteral = function() { return this.build.apply(this, arguments); };
jsmm.yy.NameIdentifier = function() { return this.build.apply(this, arguments); };
jsmm.yy.ObjectIdentifier = function() { return this.build.apply(this, arguments); };
jsmm.yy.ArrayIdentifier = function() { return this.build.apply(this, arguments); };
jsmm.yy.FunctionCall = function() { return this.build.apply(this, arguments); };
jsmm.yy.IfBlock = function() { return this.build.apply(this, arguments); };
jsmm.yy.ElseIfBlock = function() { return this.build.apply(this, arguments); };
jsmm.yy.ElseBlock = function() { return this.build.apply(this, arguments); };
jsmm.yy.WhileBlock = function() { return this.build.apply(this, arguments); };
jsmm.yy.ForBlock = function() { return this.build.apply(this, arguments); };
jsmm.yy.FunctionDeclaration = function() { return this.build.apply(this, arguments); };

jsmm.Context.prototype = {
	init: function(code) {
		this.genId = 0;
		this.elements = {};
		this.code = code;
		this.program = null;
	},
	getNewId: function() {
		return this.genId++;
	},
};

jsmm.addCommonElementMethods = function(element) {
	element.build = function(_$) {
		this.context = jsmm.yy.context;
		this.id = this.context.getNewId();
		this.context.elements[this.id] = this;
		this.startPos = {line: _$.first_line, column: _$.first_column};
		this.endPos = {line: _$.last_line, column: _$.last_column};
		this.text = jsmm.parser.lexer.yytext;
		this.init.apply(this, [].slice.call(arguments, 1));
	};
	return element;
};

jsmm.yy.Program.prototype = jsmm.addCommonElementMethods({
	init: function(statementList) {
		this.statementList = statementList;
	},
	getCode: function() {
		return this.statementList.getCode();
	},
	getFunction: function(scope) {
		var args = [jsmm];
		var output = 'new function() {';
		output += 'return function(jsmm'
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

jsmm.yy.StatementList.prototype = jsmm.addCommonElementMethods({
	init: function() {
		this.statements = [];
	},
	addStatement: function(statement) {
		this.statements.push(statement);
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

jsmm.yy.CommonSimpleStatement.prototype = jsmm.addCommonElementMethods({
	init: function(statement) {
		this.statement = statement;
	},
	getCode: function() {
		return this.statement.getCode() + ";";
	},
	getChildren: function() {
		return [this.statement];
	}
});

jsmm.yy.PostfixStatement.prototype = jsmm.addCommonElementMethods({
	init: function(identifier, symbol) {
		this.identifier = identifier;
		this.symbol = symbol;
	},
	getCode: function() {
		return this.identifier.getCode() + this.symbol;
	},
	getChildren: function() {
		return [this.identifier];
	}
});

jsmm.yy.AssignmentStatement.prototype = jsmm.addCommonElementMethods({
	init: function(identifier, symbol, expression) {
		this.identifier = identifier;
		this.symbol = symbol;
		this.expression = expression;
	},
	getCode: function() {
		return this.identifier.getCode() + " " + this.symbol + " " + this.expression.getCode();
	},
	getChildren: function() {
		return [this.identifier, this.expression];
	}
});

jsmm.yy.VarStatement.prototype = jsmm.addCommonElementMethods({
	init: function() {
		this.items = [];
	},
	addVarItem: function(item) {
		this.items.push(item);
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

jsmm.yy.VarItem.prototype = jsmm.addCommonElementMethods({
	init: function(name, assignment) {
		this.name = name;
		this.assignment = assignment;
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

jsmm.yy.ReturnStatement.prototype = jsmm.addCommonElementMethods({
	init: function(expression) {
		this.expression = expression;
	},
	getCode: function() {
		if (this.expression === null) {
			return "return;";
		} else {
			return "return " + this.expression.getCode() + ";";
		}
	}
});

jsmm.yy.BinaryExpression.prototype = jsmm.addCommonElementMethods({
	init: function(expression1, symbol, expression2) {
		this.expression1 = expression1;
		this.symbol = symbol;
		this.expression2 = expression2;
	},
	getCode: function() {
		return "(" + this.expression1.getCode() + " " + this.symbol + " " + this.expression2.getCode() + ")";
	}
});

jsmm.yy.UnaryExpression.prototype = jsmm.addCommonElementMethods({
	init: function(symbol, expression) {
		this.symbol = symbol;
		this.expression = expression;
	},
	getCode: function() {
		return "(" + this.symbol + this.expression.getCode() + ")";
	}
});

jsmm.yy.NumberLiteral.prototype = jsmm.addCommonElementMethods({
	init: function(number) {
		this.number = parseFloat(number);
	},
	getCode: function() {
		return this.number;
	}
});

jsmm.yy.StringLiteral.prototype = jsmm.addCommonElementMethods({
	init: function(str) {
		this.str = JSON.parse(str);
	},
	getCode: function() {
		return JSON.stringify(this.str);
	}
});

jsmm.yy.BooleanLiteral.prototype = jsmm.addCommonElementMethods({
	init: function(bool) {
		this.bool = bool;
	},
	getCode: function() {
		return this.bool ? "true" : "false";
	}
});

jsmm.yy.NameIdentifier.prototype = jsmm.addCommonElementMethods({
	init: function(name) {
		this.name = name;
	},
	getCode: function() {
		return this.name;
	}
});

jsmm.yy.ObjectIdentifier.prototype = jsmm.addCommonElementMethods({
	init: function(identifier, prop) {
		this.identifier = identifier;
		this.prop = prop;
	},
	getCode: function() {
		return this.identifier.getCode() + "." + this.prop;
	}
});

jsmm.yy.ArrayIdentifier.prototype = jsmm.addCommonElementMethods({
	init: function(identifier, expression) {
		this.identifier = identifier;
		this.expression = expression;
	},
	getCode: function() {
		return this.identifier.getCode() + "[" + this.expression.getCode() + "]";
	}
});

jsmm.yy.FunctionCall.prototype = jsmm.addCommonElementMethods({
	init: function(identifier, expressionArgs) {
		this.identifier = identifier;
		this.expressionArgs = expressionArgs;
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

jsmm.yy.IfBlock.prototype = jsmm.addCommonElementMethods({
	init: function(expression, statementList, elseBlock) {
		this.expression = expression;
		this.statementList = statementList;
		this.elseBlock = elseBlock;
	},
	getCode: function() {
		var output = "if (" + this.expression.getCode() + ") {\n" + this.statementList.getCode() + "}";
		if (this.elseBlock !== null) {
			output += this.elseBlock.getCode();
		}
		return output;
	}
});

jsmm.yy.ElseIfBlock.prototype = jsmm.addCommonElementMethods({
	init: function(ifBlock) {
		this.ifBlock = ifBlock;
	},
	getCode: function() {
		return " else " + this.ifBlock.getCode();
	}
});

jsmm.yy.ElseBlock.prototype = jsmm.addCommonElementMethods({
	init: function(statementList) {
		this.statementList = statementList;
	},
	getCode: function() {
		return " else {\n" + this.statementList.getCode() + "}";
	}
});

jsmm.yy.WhileBlock.prototype = jsmm.addCommonElementMethods({
	init: function(expression, statementList) {
		this.expression = expression;
		this.statementList = statementList;
	},
	getCode: function() {
		return "while (" + this.expression.getCode() + ") {\n" + this.statementList.getCode() + "}";
	}
});

jsmm.yy.ForBlock.prototype = jsmm.addCommonElementMethods({
	init: function(statement1, expression, statement2, statementList) {
		this.statement1 = statement1;
		this.expression = expression;
		this.statement2 = statement2;
		this.statementList = statementList;
	},
	getCode: function() {
		var output = "for (" + this.statement1.getCode() + ";" + this.expression.getCode() + ";";
		output += this.statement2.getCode() + ") {\n" + this.statementList.getCode() + "}";
		return output;
	}
});

jsmm.yy.FunctionDeclaration.prototype = jsmm.addCommonElementMethods({
	init: function(name, nameArgs, statementList, startPos, endPos) {
		this.name = name;
		this.nameArgs = nameArgs;
		this.statementList = statementList;
		this.startPos = {line: startPos.first_line, column: startPos.first_column};
		this.endPos = {line: endPos.last_line, column: endPos.last_column};
	},
	getArgList: function() {
		var output = "(";
		if (this.nameArgs.length > 0) output += this.nameArgs[0];
		for (var i=1; i<this.nameArgs.length; i++) {
			output += ', ' + this.nameArgs[i];
		}
		return output + ")";
	},
	getCode: function() {
		var output = "function " + this.name + this.getArgList() + "{\n" + this.statementList.getCode() + "}";
		return output;
	}
});

// function used by the parser to throw errors
// also used below by catching tokenizer errors
jsmm.yy.parseError = function(errStr, hash) {
	hash = hash || {};
	var token = hash.token || '';
	var expected = hash.expected || [];
	var pos = {
		startPos: {
			line: jsmm.parser.lexer.yylloc.first_line,
			column: jsmm.parser.lexer.yylloc.first_column
		}
	};
	
	// if there are no newlines, give a range instead of a single position
	if (hash.text.match(/\n/) === null) pos.column2 = pos.column + hash.text.length;
	
	// entries are in the form "'FOR'", remove the extra quotes
	token = token.replace(/[']/g, "");
	for (var i=0; i<expected.length; i++) {
		expected[i] = expected[i].replace(/[']/g, "");
	}
	
	var makeNear = function(text, f) {
		if (text.replace(/\s*/, '').length > 0) {
			return ' near ' + f(text);
		} else {
			return '';
		}
	};
	
	//console.log(hash.text);
	var suggestionError = function(suggestion) {
		throw new jsmm.msg.Error(pos, function(f) {
			return 'Invalid syntax encountered' + makeNear(hash.text, f) + ', perhaps there is a ' + f(suggestion) + ' missing';
		}, errStr);
	};
	
	if (token === "RESERVED") {
		// special case: passing on the information that the word is reserved
		throw new jsmm.msg.Error(pos, function(f) { return 'Unfortunately ' + f(hash.text) + ' is a reserved word, which means you cannot use it as a variable name'; }, errStr);
	} else if (hash.token === null) {
		// lexer error
		pos = {line: hash.line+1, column: 0};
		throw new jsmm.msg.Error(pos, 'Invalid syntax encountered', errStr);
	} else if (expected.length === 1 && expected[0] === 'NEWLINE') {
		throw new jsmm.msg.Error(pos, function(f) {
			return 'Invalid syntax encountered, perhaps some code' + makeNear(hash.text, f) + ' should be put on a new line.';
		}, errStr);
	} else if (expected.length == 1) {
		// if only one thing can be expected, pass it on
		if (expected[0] === 'NAME') {
			expected[0] = 'variable name';
		}
		suggestionError(expected[0]);		
	} else if (expected.indexOf(";") >= 0 && token === "NEWLINE") {
		// ; expected before of newline is usually forgotten
		suggestionError(';');
	} else if (expected.indexOf("}") >= 0 && ["FUNCTION", "EOF"].indexOf(token) >= 0) {
		// } expected before function declaration or eof is usually forgotten
		suggestionError('}');
	} else if (expected.indexOf(")") >= 0 && ["{", ";", "NEWLINE"].indexOf(token) >= 0) {
		// ) expected before { or ; is usually forgotten
		suggestionError(')');
	} else {
		throw new jsmm.msg.Error(pos, function(f) { return 'Invalid syntax encountered' + makeNear(hash.text, f); }, errStr);
	}
};

jsmm.parse = function(input) {
	jsmm.yy.context = new jsmm.Context(input);
	jsmm.yy.context.program = jsmm.parser.parse(input + "\n");
	return jsmm.yy.context;
};

jsmm.parser = require('./jsmmparser').parser;
jsmm.parser.yy = jsmm.yy;

require('./jsmm.dot')(jsmm);
require('./jsmm.safe')(jsmm);
require('./jsmm.step')(jsmm);
require('./jsmm.browser')(jsmm);
require('./jsmm.test')(jsmm);

module.exports = jsmm;
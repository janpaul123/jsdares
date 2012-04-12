/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	require('./jsmm.func')(jsmm);
	require('./jsmm.msg')(jsmm);
	
	jsmm.step = {};
	jsmm.step.Stack = function() { return this.init.apply(this, arguments); };
	jsmm.step.StackElement = function() { return this.init.apply(this, arguments); };
	
	jsmm.step.Stack.prototype = {
		init: function(tree, scope) {
			this.elements = [new jsmm.step.StackElement(this, tree.programNode, new jsmm.func.Scope(scope))];
			this.executionCounter = 0;
		},
		hasNext: function() {
			return this.getLastStackElement() !== undefined;
		},
		stepNext: function(stack, se) {
			return this.getLastStackElement().node.stepNext(this, this.getLastStackElement());
		},
		/// INTERNAL FUNCTIONS ///
		getLastStackElement: function() {
			if (this.elements.length > 0) {
				return this.elements[this.elements.length-1];
			} else {
				return undefined;
			}
		},
		// not strictly a pop since it returns the last element instead of the popped element
		up: function(arg) {
			this.elements.pop();
			this.getLastStackElement().args.push(arg);
			return this.getLastStackElement();
		},
		upNext: function(arg) {
			var se = this.up(arg);
			return se.node.stepNext(this, se);
		},
		pushNode: function(node, scope) {
			this.elements.push(new jsmm.step.StackElement(this, node, scope));
			return node;
		},
		pushNodeNext: function(node, scope) {
			var se = new jsmm.step.StackElement(this, node, scope);
			this.elements.push(se);
			return node.stepNext(this, se);
		}
	};
	
	jsmm.step.StackElement.prototype = {
		init: function(stack, node, scope) {
			this.stack = stack;
			this.node = node;
			this.scope = scope;
			this.args = [];
		}
	};
	
	/* statementList */
	jsmm.nodes.Program.prototype.stepNext = function(stack, se) {
		switch (se.args.length) {
			case 0:
				stack.executionCounter = 0;
				return stack.pushNodeNext(this.statementList, se.scope);
			case 1:
				stack.elements = [];
				return [];
		}
	};
	
	/* statements */
	jsmm.nodes.StatementList.prototype.stepNext = function(stack, se) {
		if (jsmm.verbose && se.args.length > 0) {
			console.log('after line ' + this.statements[se.args.length-1].endPos.line + ':');
			console.log(se.scope);
			console.log(' ');
		}
		
		if (se.args.length === 0) {
			stack.executionCounter += this.statements.length+1;
			jsmm.func.checkExecutionCounter(this, stack.executionCounter);
		}
		
		if (se.args.length < this.statements.length) {
			return stack.pushNodeNext(this.statements[se.args.length], se.scope);
		} else {
			return stack.upNext(null);
		}
	};
	
	/* statement */
	jsmm.nodes.CommonSimpleStatement.prototype.stepNext = function(stack, se) {
		switch (se.args.length) {
			case 0:
				this.runHooksBefore(se.scope);
				return stack.pushNodeNext(this.statement, se.scope);
			case 1:
				this.runHooksAfter(se.scope);
				return stack.upNext(null);
		}
	};
	
	/* identifier, symbol */
	jsmm.nodes.PostfixStatement.prototype.stepNext = function(stack, se) {
		switch (se.args.length) {
			case 0:
				return stack.pushNodeNext(this.identifier, se.scope);
			case 1:
				var result = jsmm.func.postfix(this, se.args[0], this.symbol);
				stack.up(null);
				var message = function(f) { return f(se.args[0].name) + ' = ' + f(result.str); };
				return [new jsmm.msg.Inline(this, message), new jsmm.msg.Line(this, message)];
		}
	};
	
	/* identifier, symbol, expression */
	jsmm.nodes.AssignmentStatement.prototype.stepNext = function(stack, se) {
		switch (se.args.length) {
			case 0:
				return stack.pushNodeNext(this.identifier, se.scope);
			case 1:
				return stack.pushNodeNext(this.expression, se.scope);
			case 2:
				var result = jsmm.func.assignment(this, se.args[0], this.symbol, se.args[1]);
				var up = stack.up(result);
				var append = (up.node.type === 'VarItem');
				var message = function(f) { return f(se.args[0].name) + ' = ' + f(result.str); };
				return [new jsmm.msg.Inline(this, message), new jsmm.msg.Line(this, message, append)];
		}
	};
	
	/* items */
	jsmm.nodes.VarStatement.prototype.stepNext = function(stack, se) {
		if (se.args.length === 0) {
			se.args.push(null);
			return [new jsmm.msg.Line(this, ''),
				new jsmm.msg.Continue(this)];
		} else if (se.args.length-1 < this.items.length) {
			return stack.pushNodeNext(this.items[se.args.length-1], se.scope);
		} else {
			return stack.upNext(null);
		}
	};
	
	/* name, assignment */
	jsmm.nodes.VarItem.prototype.stepNext = function(stack, se) {
		if (this.assignment === null) {
			jsmm.func.varItem(this, se.scope, this.name);
			var ret = stack.upNext(null);
			ret.push(new jsmm.msg.Line(this, 'undefined', true));
			return ret;
		} else {
			switch (se.args.length) {
				case 0:
					jsmm.func.varItem(this, se.scope, this.name);
					return stack.pushNodeNext(this.assignment, se.scope);
				case 1:
					return stack.upNext(null);
			}
		}
	};
	
	/* expression */
	jsmm.nodes.ReturnStatement.prototype.stepNext = function(stack, se) {
		if (this.expression === null) {
			jsmm.func.funcReturn(this);
			return stack.upNext(null);
		} else {
			switch (se.args.length) {
				case 0:
					return stack.pushNodeNext(this.expression, se.scope);
				case 1:
					this.iterateRunHooksAfter(se.scope);
					var lastStackElement = stack.getLastStackElement();
					var result = jsmm.func.funcReturn(this, se.args[0]);
					while (!(lastStackElement.node.type === 'FunctionCall' ||
							lastStackElement.node.type === 'Program')) {
						lastStackElement = stack.up(result);
					}
					// Postcondition: lastStackElement is a FunctionCall or a Program
					return [new jsmm.msg.Line(this, 'return ' + se.args[0].str),
						new jsmm.msg.Continue(this)];
			}
		}
	};
	
	/* expression1, symbol, expression2 */
	jsmm.nodes.BinaryExpression.prototype.stepNext = function(stack, se) {
		switch (se.args.length) {
			case 0:
				return stack.pushNodeNext(this.expression1, se.scope);
			case 1:
				return stack.pushNodeNext(this.expression2, se.scope);
			case 2:
				var result = jsmm.func.binary(this, se.args[0], this.symbol, se.args[1]);
				stack.up(result);
				var that = this;
				return [new jsmm.msg.Inline(this, function(f) {
					return f(se.args[0].str) + ' ' + that.symbol + ' ' + f(se.args[1].str) + ' = ' + f(result.str);
				})];
		}
	};
	
	/* symbol, expression */
	jsmm.nodes.UnaryExpression.prototype.stepNext = function(stack, se) {
		switch (se.args.length) {
			case 0:
				return stack.pushNodeNext(this.expression, se.scope);
			case 1:
				var result = jsmm.func.unary(this, this.symbol, se.args[0]);
				stack.up(result);
				var that = this;
				return [new jsmm.msg.Inline(this, function(f) {
					return that.symbol + f(se.args[0].str) + ' = ' + f(result.str);
				})];
		}
	};
	
	/* number */
	jsmm.nodes.NumberLiteral.prototype.stepNext = function(stack, se) {
		return stack.upNext(jsmm.func.number(this, this.number));
	};
	
	/* str */
	jsmm.nodes.StringLiteral.prototype.stepNext = function(stack, se) {
		return stack.upNext(jsmm.func.string(this, this.str));
	};
	
	/* bool */
	jsmm.nodes.BooleanLiteral.prototype.stepNext = function(stack, se) {
		return stack.upNext(jsmm.func.bool(this, this.bool));
	};
	
	/* name */
	jsmm.nodes.NameIdentifier.prototype.stepNext = function(stack, se) {
		return stack.upNext(jsmm.func.name(this, se.scope, this.name));
	};
	
	/* identifier, prop */
	jsmm.nodes.ObjectIdentifier.prototype.stepNext = function(stack, se) {
		switch (se.args.length) {
			case 0:
				return stack.pushNodeNext(this.identifier, se.scope);
			case 1:
				return stack.upNext(jsmm.func.object(this, se.args[0], this.prop));
		}
	};
	
	/* identifier, expression */
	jsmm.nodes.ArrayIdentifier.prototype.stepNext = function(stack, se) {
		switch (se.args.length) {
			case 0:
				return stack.pushNodeNext(this.identifier, se.scope);
			case 1:
				return stack.pushNodeNext(this.expression, se.scope);
			case 2:
				return stack.upNext(jsmm.func.array(this, se.args[0], se.args[1]));
		}
	};
	
	/* identifier, expressionArgs */
	jsmm.nodes.FunctionCall.prototype.stepNext = function(stack, se) {
		// calculate function name once all the arguments are known
		if (se.args.length > this.expressionArgs.length) {
			var name = se.args[0].name + '(';
			if (this.expressionArgs.length > 0) name += se.args[1].str;
			for (var i=1; i<this.expressionArgs.length; i++) {
				name += ', ' + se.args[i+1].str;
			}
			name += ')';
		}
		
		var result, up;
		if (se.args.length === 0) {
			return stack.pushNodeNext(this.identifier, se.scope);
		} else if (se.args.length < this.expressionArgs.length+1) {
			return stack.pushNodeNext(this.expressionArgs[se.args.length-1], se.scope);
		} else if (se.args.length === this.expressionArgs.length+1) {
			se.args.push(null);
			
			return [new jsmm.msg.Inline(this, function(f) {
				return 'calling ' + f(name);
			})];
		} else if (se.args.length === this.expressionArgs.length+2) {
			// first actual function call (all arguments are evaluated)
			result = jsmm.func.funcCall(this, se.args[0], se.args.slice(1, se.args.length-1));
			
			if (result.value !== undefined && result.value[0] !== undefined && result.value[0] instanceof jsmm.msg.Inline) {
				// in this case the local function has been placed on the stack, so no moving up
				return result.value;
			} else {
				up = stack.up(result);
				// fall through
			}
		} else {
			// in case of a user defined function, the result will be pushed on args
			// NOTE: this line is not used entirely correctly, as it is normally
			// called in the context of a function declaration, not a call
			result = jsmm.func.funcWrapResult(this, se.args[0], se.args.pop());
			up = stack.up(result);
			// fall through
		}
		
		if (up.node.type === 'CallStatement') {
			return [
				new jsmm.msg.Line(this, function(f) { return f(name); }),
				new jsmm.msg.Continue(this)
			];
		} else {
			return [new jsmm.msg.Inline(this, function(f) { return f(name) + ' = ' + f(result.str); })];
		}
	};
	
	/* functionCall */
	jsmm.nodes.CallStatement.prototype.stepNext = function(stack, se) {
		switch (se.args.length) {
			case 0:
				return stack.pushNodeNext(this.functionCall, se.scope);
			case 1:
				return stack.upNext(null);
		}
	};
	
	/* expression, statementList, elseBlock */
	jsmm.nodes.IfBlock.prototype.stepNext = function(stack, se) {
		switch (se.args.length) {
			case 0:
				this.runHooksBefore(se.scope);
				return stack.pushNodeNext(this.expression, se.scope);
			case 1:
				if (jsmm.func.conditional(this, 'if', se.args[0])) {
					return stack.pushNodeNext(this.statementList, se.scope);
				} else {
					this.runHooksAfter(se.scope);
					if(this.elseBlock !== null) {
						return stack.pushNodeNext(this.elseBlock, se.scope);
					} else {
						return stack.upNext(null);
					}
				}
				break;
			case 2:
				if (se.args[1] !== 'else') this.runHooksAfter(this, se.scope);
				return stack.upNext(null);
		}
	};
	
	/* ifBlock */
	jsmm.nodes.ElseIfBlock.prototype.stepNext = function(stack, se) {
		switch (se.args.length) {
			case 0:
				return stack.pushNodeNext(this.ifBlock, se.scope);
			case 1:
				return stack.upNext('else');
		}
	};
	
	/* statementList */
	jsmm.nodes.ElseBlock.prototype.stepNext = function(stack, se) {
		switch (se.args.length) {
			case 0:
				this.runHooksBefore(se.scope);
				return stack.pushNodeNext(this.statementList, se.scope);
			case 1:
				this.runHooksAfter(se.scope);
				return stack.upNext('else');
		}
	};
	
	/* expression, statementList */
	jsmm.nodes.WhileBlock.prototype.stepNext = function(stack, se) {
		switch (se.args.length) {
			case 0:
				// dummy value for runHooksBefore
				this.runHooksBefore(se.scope);
				se.args.push(null);
				/* falls through */
			case 1:
				return stack.pushNodeNext(this.expression, se.scope);
			case 2:
				if (jsmm.func.conditional(this, 'while', se.args[1])) {
					return stack.pushNodeNext(this.statementList, se.scope);
				} else {
					this.runHooksAfter(se.scope);
					return stack.upNext(null);
				}
				break;
			case 3:
				se.args.pop(); // pop statementList
				se.args.pop(); // pop expression
				return this.stepNext(stack, se);
		}
	};
	
	/* statement1, expression, statement2, statementList */
	jsmm.nodes.ForBlock.prototype.stepNext = function(stack, se) {
		switch (se.args.length) {
			case 0:
				this.runHooksBefore(se.scope);
				return stack.pushNodeNext(this.statement1, se.scope);
			case 1:
				return stack.pushNodeNext(this.expression, se.scope);
			case 2:
				if (jsmm.func.conditional(this, 'for', se.args[1])) {
					return stack.pushNodeNext(this.statementList, se.scope);
				} else {
					this.runHooksAfter(se.scope);
					return stack.upNext(null);
				}
				break;
			case 3:
				return stack.pushNodeNext(this.statement2, se.scope);
			case 4:
				se.args.pop(); // pop statement2
				se.args.pop(); // pop statementList
				se.args.pop(); // pop expression
				return this.stepNext(stack, se);
		}
	};
	
	/* name, nameArgs, statementList */
	jsmm.nodes.FunctionDeclaration.prototype.stepNext = function(stack, se) {
		var that = this;
		switch (se.args.length) {
			case 0:
				// actual function declaration
				jsmm.func.funcDecl(this, se.scope, this.name, function() {
					var vars = {};
					for (var i=0; i<that.nameArgs.length; i++) {
						vars[that.nameArgs[i]] = arguments[i];
					}
					var scope = new jsmm.func.Scope(vars, se.scope);
					jsmm.func.funcEnter(that, scope);
					that.runHooksBefore(that, se.scope);

					// get back to the original function declaration for runHooksAfter
					stack.pushNode(that, scope);
					stack.pushNode(that.statementList, scope);
					
					var args = [];
					for(var name in scope.vars) {
						args.push(scope.vars[name].str);
					}
					var message = that.name + '(' + args.join(', ') + ')';
					return [new jsmm.msg.Inline(that, function(f) { return f(message); }),
						new jsmm.msg.Line(that, message)];
				});
				return stack.upNext(null);
			case 1:
				// when reached the end of the function (i.e. there was no return statement)
				this.runHooksAfter(se.scope);
				return stack.upNext(null);
		}

		/*
		output += 'function' + this.getArgList() + "{\n";
		output += 'var jsmmscopeInner = new jsmm.func.Scope({';
		if (this.nameArgs.length > 0) output += '"' + this.nameArgs[0] + '": ' + this.nameArgs[0];
		for (var i=1; i<this.nameArgs.length; i++) {
			output += ', "' + this.nameArgs[i] + '": ' + this.nameArgs[i];
		}
		output += '}, jsmmscopeOuter);\n';
		output += 'jsmm.func.funcEnter(' + getEl(this) + ');\n';
		if (jsmm.verbose) {
			output += 'console.log("after entering ' + this.name + ':");\n';
			output += 'console.log(jsmmscopeInner);\n';
			output += 'console.log(" ");\n';
		}
		output += this.statementList.stepNext();
		//output += 'return jsmm.func.funcReturn(' + getEl(this) + ');\n';
		output += '});';
		return output;
		*/
	};
};

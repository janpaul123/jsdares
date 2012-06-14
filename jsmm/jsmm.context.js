/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	var stringify = function(value) { // TODO: remove double functionality
		if (typeof value === 'function') return '[function]';
		else if (typeof value === 'object' && value.type === 'function') return '[function]';
		else if (Object.prototype.toString.call(value) === '[object Array]') return '[array]';
		else if (typeof value === 'object') return '[object]';
		else if (value === undefined) return 'undefined';
		else return JSON.stringify(value);
	};

	jsmm.CommandTracker = function() { return this.init.apply(this, arguments); };
	jsmm.CommandTracker.prototype = {
		init: function() {
			this.idsByNodeId = {};
			this.nodeIdsById = {};
		},

		addCommand: function(node, id) {
			this.idsByNodeId[node.getTopNode().id] = this.idsByNodeId[node.getTopNode().id] || [];
			this.idsByNodeId[node.getTopNode().id].push(id);

			this.nodeIdsById[id] = this.nodeIdsById[id] || [];
			if (this.nodeIdsById[id].indexOf(node.id) < 0) this.nodeIdsById[id].push(node.id);
		},

		getHighlightIdsByNodeId: function(line) {
			return this.idsByNodeId[line] || [];
		},

		getHighlightNodeIdsById: function(id) {
			return this.nodeIdsById[id] || [];
		}
	};

	jsmm.ScopeTracker = function() { return this.init.apply(this, arguments); };
	jsmm.ScopeTracker.prototype = {
		init: function() {
			this.scopes = [];
			this.nodeIds = {};
			this.calls = [];
		},

		logScope: function(stepNum, node, data) {
			if (data.type === 'assignment') {
				var obj = data.scope.find(data.name);
				if (obj !== undefined) {
					if (data.scope.parent === null || data.scope.vars[data.name] === undefined) {
						this.addAssignment(stepNum, node, 0, data.name, obj.value, true);
					} else {
						this.addAssignment(stepNum, node, this.scopes.length-1, data.name, obj.value, true);
					}
				}
			} else if (data.type === 'return') {
				this.calls.push({type: 'return', stepNum: stepNum});
			} else { // data.type === 'enter'
				this.scopes.push({});
				this.calls.push({type: 'enter', stepNum: stepNum, name: data.name, position: this.scopes.length-1});

				for (var name in data.scope.vars) {
					this.addAssignment(stepNum, node, this.scopes.length-1, name, data.scope.vars[name].value, data.name !== 'global');
				}
			}
		},

		getState: function(stepNum) {
			var stack = [];

			for (var i=0; i<this.calls.length; i++) {
				var call = this.calls[i];
				if (call.stepNum > stepNum) break;

				if (call.type === 'assignment') {
					var level = stack[call.position === 0 ? 0 : stack.length-1];
					var scope = level.scope;
					if (scope[call.name] === undefined) {
						scope[call.name] = {id: call.position + '-' + call.name, name: call.name, value: call.value};
						level.names.push(call.name);
					}
					scope[call.name].value = call.value;
				} else if (call.type === 'return') {
					stack.pop();
				} else { // call.type === 'enter'
					stack.push({id: '' + call.position, name: call.name, names: [], scope: {}});
				}
			}
			return stack;
		},

		getHighlightNodeIdsById: function(id) {
			var split = id.split('-');
			if (split.length < 2) return [];
			var scope = this.scopes[split[0]];
			if (scope === undefined) return [];
			return scope[split[1]] || [];
		},

		getHighlightIdsByNodeId: function(nodeId) {
			return this.nodeIds[nodeId] || [];
		},

		/// INTERNAL FUNCTIONS ///
		addAssignment: function(stepNum, node, position, name, value, highlight) {
			if (highlight) {
				this.scopes[position][name] = this.scopes[position][name] || [];
				if (this.scopes[position][name].indexOf(node.id) < 0) this.scopes[position][name].push(node.id);

				var topNodeId = node.getTopNode().id;
				this.nodeIds[topNodeId] = this.nodeIds[topNodeId] || [];
				this.nodeIds[topNodeId].push(position + '-' + name);
			}

			this.calls.push({type: 'assignment', stepNum: stepNum, position: position, name: name, value: stringify(value)});
		}
	};

	jsmm.Scope = function() { return this.init.apply(this, arguments); };
	jsmm.Scope.prototype = {
		init: function(vars, parent) {
			this.vars = {};
			for (var name in vars) {
				this.vars[name] = {type: 'local', value: vars[name]};
			}
			this.parent = parent || null;
		},
		find: function(name) {
			var scope = this;
			do {
				if (scope.vars[name] !== undefined) {
					return scope.vars[name];
				}
				scope = scope.parent;
			} while(scope !== null);
			return undefined;
		},
		getVars: function() {
			var vars = {};
			for (var name in this.vars) {
				vars[name] = this.vars[name].value;
			}
			return vars;
		}
	};

	jsmm.RunContext = function() { return this.init.apply(this, arguments); };
	jsmm.RunContext.prototype = {
		init: function(tree, scope) {
			this.tree = tree;
			this.startScope = new jsmm.Scope(scope);
			this.scope = new jsmm.Scope(scope);
			this.executionCounter = 0;
			this.steps = [];
			this.callStack = [];
			this.callNodesByNodes = {};
			this.commandTracker = new jsmm.CommandTracker();
			this.scopeTracker = new jsmm.ScopeTracker();
			this.outputStates = {};
			this.calledFunctions = [];
			this.callNodeId = null;
			this.error = null;
		},
		runProgram: function() {
			this.run(this.tree.programNode.getRunFunction(), null);
		},
		runFunction: function(funcName, args) {
			this.callScope(this.tree.programNode, {type: 'enter', scope: this.scope, name: 'global'});
			this.run(this.scope.find(funcName).value.func, args);
		},
		run: function(func, args) {
			this.error = null;
			
			try {
				func(this, args);
			} catch (error) {
				if (error.type === 'Error') {
					this.error = error;
				} else {
					throw error;
					//this.error = new jsmm.msg.Error({}, 'An unknown error has occurred', '', error);
				}
			}
		},
		hasError: function() {
			return this.error !== null;
		},
		getError: function() {
			return this.error;
		},
		setOutputState: function(output, state) {
			this.outputStates[output] = state;
		},
		getOutputState: function(output) {
			return this.outputStates[output];
		},
		externalCall: function(node, funcValue, args) {
			this.callNodeId = node.id;
			for (var i=0; i<this.callStack.length; i++) {
				var nodeId = this.callStack[i].getTopNode().id;
				if (this.callNodesByNodes[nodeId] === undefined) {
					this.callNodesByNodes[nodeId] = [];
				}
				if (this.callNodesByNodes[nodeId].indexOf(node.id) < 0) {
					this.callNodesByNodes[nodeId].push(node.id);
				}
			}
			try {
				return funcValue.func.call(null, this, funcValue.name, args);
			} catch (error) {
				// augmented functions should do their own error handling, so wrap the resulting strings in jsmm messages
				if (typeof error === 'string') {
					throw new jsmm.msg.Error(node, error);
				} else {
					throw error;
				}
			}
		},
		enterCall: function(node) {
			// copy callstack
			this.callStack = this.callStack.slice(0);
			this.callStack.push(node);

			if (this.callStack.length > jsmm.func.maxCallStackDepth) { // TODO
				throw new jsmm.msg.Error(node, 'Too many nested function calls have been made already, perhaps there is infinite recursion somewhere');
			}
		},
		leaveCall: function() {
			// copy callstack
			this.callStack = this.callStack.slice(0);
			this.callStack.pop();
		},
		inFunction: function() {
			return this.callStack.length > 0;
		},
		increaseExecutionCounter: function(node, amount) {
			this.executionCounter += amount;
			if (this.executionCounter > jsmm.func.maxExecutionCounter) { // TODO
				throw new jsmm.msg.Error(node, 'Program takes too long to run');
			}
		},
		newStep: function(array) {
			this.steps.push(array || []);
		},
		addToStep: function(msg) {
			this.steps[this.steps.length-1].push(msg);
		},
		getStepNum: function() {
			return this.steps.length;
		},
		addCommand: function(node, command) {
			this.commandTracker.addCommand(node, command);
		},
		callScope: function(node, data) {
			this.scopeTracker.logScope(this.getStepNum(), node, data);
		},
		getCallNodesByRange: function(line1, line2) {
			var nodeIds = [];
			for (var line=line1; line<=line2; line++) {
				var node = this.tree.getNodeByLine(line);
				if (node !== null) {
					nodeIds.push(node.id);
					if (this.callNodesByNodes[node.id] !== undefined) {
						for (var i=0; i<this.callNodesByNodes[node.id].length; i++) {
							if (nodeIds.indexOf(this.callNodesByNodes[node.id][i]) < 0) {
								nodeIds.push(this.callNodesByNodes[node.id][i]);
							}
						}
					}
				}
			}
			return nodeIds;
		},
		getCallNodeId: function() {
			return this.callNodeId;
		},
		getCommandTracker: function() {
			return this.commandTracker;
		},
		getScopeTracker: function() {
			return this.scopeTracker;
		},
		addCalledFunction: function(name) {
			this.calledFunctions.push(name);
		},
		getCalledFunctions: function() {
			return this.calledFunctions;
		}
	};
};

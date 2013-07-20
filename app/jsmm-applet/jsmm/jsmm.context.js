/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	jsmm.CommandTracker = function() { return this.init.apply(this, arguments); };
	jsmm.CommandTracker.prototype = {
		init: function() {
			this.idsByTopNodeId = {};
			this.idsByNodeId = {};
			this.nodeIdsById = {};
		},

		addCommand: function(node, id) {
			this.idsByNodeId[node.id] = this.idsByNodeId[node.id] || [];
			this.idsByNodeId[node.id].push(id);

			this.idsByTopNodeId[node.getTopNode().id] = this.idsByTopNodeId[node.getTopNode().id] || [];
			this.idsByTopNodeId[node.getTopNode().id].push(id);

			if (this.nodeIdsById[id] === undefined) this.nodeIdsById[id] = {};
			this.nodeIdsById[id][node.id] = true;
		},

		getHighlightIdsByNodeId: function(id) {
			return this.idsByNodeId[id] || [];
		},

		getHighlightIdsByTopNodeId: function(id) {
			return this.idsByTopNodeId[id] || [];
		},

		getHighlightNodeIdsById: function(id) {
			return Object.keys(this.nodeIdsById[id] || []);
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
						this.addAssignment(stepNum, node, 0, data.name, jsmm.stringify(obj.value, data.scope), true);
					} else {
						this.addAssignment(stepNum, node, this.scopes.length-1, data.name, jsmm.stringify(obj.value, data.scope), true);
					}
				}
			} else if (data.type === 'return') {
				this.calls.push({type: 'return', stepNum: stepNum});
			} else { // data.type === 'enter'
				this.scopes.push({});
				this.calls.push({type: 'enter', stepNum: stepNum, name: data.name, position: this.scopes.length-1});

				for (var name in data.scope.vars) {
					this.addAssignment(stepNum, node, this.scopes.length-1, name, jsmm.stringify(data.scope.vars[name].value, data.scope), data.name !== 'global');
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
					if (call.stepNum === stepNum) scope[call.name].highlight = true;
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
			return Object.keys(scope[split[1]] || []);
		},

		getHighlightIdsByNodeId: function(nodeId) {
			return this.nodeIds[nodeId] || [];
		},

		/// INTERNAL FUNCTIONS ///
		addAssignment: function(stepNum, node, position, name, value, highlight) {
			if (highlight) {
				if (this.scopes[position][name] === undefined) this.scopes[position][name] = {};
				this.scopes[position][name][node.id] = true;

				var topNodeId = node.getTopNode().id;
				if (this.nodeIds[topNodeId] === undefined) this.nodeIds[topNodeId] = [];
				this.nodeIds[topNodeId].push(position + '-' + name);
			}

			this.calls.push({type: 'assignment', stepNum: stepNum, position: position, name: name, value: value});
		}
	};

	jsmm.Array = function() { return this.init.apply(this, arguments); };
	jsmm.Array.prototype = {
		type: 'array',
		string: '[array]',
		init: function(values) {
			this.values = [];
			for (var i=0; i<values.length; i++) {
				this.values[i] = {type: 'local', value: values[i]};
			}

			var that = this;
			this.properties = {
				length: {
					name: 'length',
					info: 'array.length',
					type: 'variable',
					example: 'length',
					get: function() { return that.getLength.apply(that, arguments); },
					set: function() { return that.setLength.apply(that, arguments); }
				}
			};
		},

		getLength: function(name) {
			return this.values.length;
		},

		setLength: function(context, name, value) {
			this.values.length = value;
		},

		getArrayValue: function(index) {
			if (index < this.values.length) {
				if (this.values[index] === undefined) {
					this.values[index] = {type: 'local', value: undefined};
				}
				return this.values[index];
			} else {
				return {type: 'newArrayValue', array: this, index: index};
			}
		},

		setArrayValue: function(index, value) {
			this.values[index] = {type: 'local', value: value};
		},

		getCopy: function() {
			var values = [];
			for (var i=0; i<this.values.length; i++) {
				if (this.values[i] !== undefined) {
					values[i] = this.values[i].value;
				}
			}
			return new jsmm.Array(values);
		},

		serialize: function(scope) {
			var output = '[';
			for (var i=0; i<this.values.length; i++) {
				if (i>0) output += ', ';
				if (this.values[i] === undefined) output += 'undefined';
				else output += jsmm.stringify(this.values[i].value, scope);
			}
			return output + ']';
		}
	};

	jsmm.Scope = function() { return this.init.apply(this, arguments); };
	jsmm.Scope.prototype = {
		init: function(vars, parent, copyScope) {
			this.vars = {};
			this.arrays = [];
			this.functions = {};
			for (var name in vars) {
				this.vars[name] = {type: 'local', value: vars[name]};
				if (copyScope) {
					if (typeof vars[name] === 'object' && vars[name].type === 'arrayPointer') {
						this.addArrayItems(copyScope, vars[name].id);
					}
					if (typeof vars[name] === 'object' && vars[name].type === 'functionPointer') {
						this.functions[vars[name].name] = copyScope.functions[vars[name].name];
					}
				}
			}
			this.parent = parent || null;
			this.topParent = this;
			while (this.topParent.parent !== null) {
				this.topParent = this.topParent.parent;
			}
		},

		addArrayItems: function(copyScope, id) {
			this.arrays[id] = copyScope.arrays[id].getCopy();
			for (var i=0; i<copyScope.arrays[id].values.length; i++) {
				var value = copyScope.arrays[id].values[i];
				if (value !== undefined && typeof value.value === 'object' && value.value.type === 'arrayPointer') {
					this.addArrayItems(copyScope, value.value.id);
				}
			}
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

		getCopy: function() {
			var vars = {}, arrays = [];
			for (var name in this.vars) {
				vars[name] = this.vars[name].value;
			}
			return new jsmm.Scope(vars, this.parent, this.topParent);
		},

		registerArray: function(array) {
			this.topParent.arrays.push(array);
			return this.topParent.arrays.length-1;
		},

		getArray: function(id) {
			return this.topParent.arrays[id];
		},

		clearFunctions: function() {
			this.topParent.functions = [];
		},

		declareFunction: function(name, func) {
			this.topParent.functions[name] = func;
			this.vars[name] = {type: 'local', value: {type: 'functionPointer', name: name, string: '[function ' + name + ']'}};
		},

		getFunction: function(name) {
			return this.topParent.functions[name];
		}
	};

	// scope is optional, only for verbose output, such as content of arrays
	jsmm.stringify = function(value, scope) {
		if (value === undefined) return 'undefined';
		else if (scope !== undefined && typeof value === 'object' && value.type === 'arrayPointer') return scope.getArray(value.id).serialize(scope);
		else if (typeof value === 'object') return value.string;
		else return JSON.stringify(value);
	};

	jsmm.Context = function() { return this.init.apply(this, arguments); };
	jsmm.Context.prototype = {
		init: function(tree, scope, limits) {
			this.tree = tree;
			this.scope = scope;
			this.scopeStack = [this.scope];
			this.startScope = scope.getCopy();

			this.limits = limits;
			this.executionCounter = 0;
			this.costCounter = 0;

			this.steps = [];
			this.callStackNodes = [];
			this.callIdsByNodeIds = {};
			this.commandTracker = new jsmm.CommandTracker();
			this.scopeTracker = new jsmm.ScopeTracker();
			this.calledFunctions = [];
			this.callNodeId = null;
			this.callId = null;
			this.error = null;
		},

		/// OUTPUT FUNCTIONS ///
		getCallNodeId: function() {
			return this.callNodeId;
		},

		getCallId: function() {
			return this.callId;
		},

		getCommandTracker: function() {
			return this.commandTracker;
		},

		getScopeTracker: function() {
			return this.scopeTracker;
		},

		throwTimeout: function(nodeId) {
			throw new jsmm.msg.Error(nodeId || this.callNodeId, 'Program takes too long to run');
		},

		/// TREE/RUNNER FUNCTIONS ///
		run: function(funcName, args) {
			this.scopeTracker.logScope(-1, this.tree.programNode, {type: 'enter', scope: this.scope, name: 'global'});

			var func;
			if (funcName !== undefined) {
				func = this.scope.getFunction(funcName);
				if (func === undefined) {
					this.error = new jsmm.msg.Error(0, 'Function <var>' + funcName + '</var> could not be found');
					this.pushStep(this.error);
					return;
				}
				this.isFunctionContext = true;
			} else {
				func = this.tree.programNode.getRunFunction();
				this.isFunctionContext = false;
			}

			try {
				func(this, args);
			} catch (error) {
				if (error.type === 'Error') {
					this.error = error;
				} else {
					this.error = new jsmm.msg.Error(0, 'An unknown error has occurred', error);
					if (jsmm.debug) {
						throw error;
					}
				}
				this.pushStep(this.error);
			}
		},

		hasError: function() {
			return this.error !== null;
		},

		getError: function() {
			return this.error;
		},

		getBaseScope: function() {
			return this.scopeStack[0];
		},

		getStartScope: function() {
			return this.startScope;
		},

		getCalledFunctions: function() {
			return this.calledFunctions;
		},

		getCallIdsByNodeIds: function(nodeIds) {
			var callIds = {};
			for (var i=0; i<nodeIds.length; i++) {
				var id = nodeIds[i];
				if (this.callIdsByNodeIds[id] !== undefined) {
					for (var j=0; j<this.callIdsByNodeIds[id].length; j++) {
						callIds[this.callIdsByNodeIds[id][j]] = true;
					}
				}
			}
			return Object.keys(callIds);
		},

		getNodeIdByStepNum: function(stepNum) {
			if (stepNum >= this.steps.length) return 0;
			else {
				return this.steps[stepNum].nodeId;
			}
		},

		/// JS-- PROGRAM FUNCTIONS ///
		enterCall: function(node) {
			this.callStackNodes.push(node);
			if (this.callStackNodes.length > this.limits.callStackDepth) {
				//throw new jsmm.msg.Error(node.id, 'Too many nested function calls have been made already, perhaps there is infinite recursion somewhere');
				this.throwTimeout(node.id);
			}
		},

		leaveCall: function() {
			return this.callStackNodes.pop();
		},

		enterFunction: function(node, vars, fullName) {
			this.scope = new jsmm.Scope(vars, this.scopeStack[0]);
			this.scopeStack.push(this.scope);
			this.scopeTracker.logScope(this.getStepNum(), node, {type: 'enter', scope: this.scope, name: fullName});
			this.calledFunctions.push(node.name);
		},

		leaveFunction: function(node) {
			this.scopeStack.pop();
			this.scope = this.scopeStack[this.scopeStack.length-1];
			this.scopeTracker.logScope(this.getStepNum(), node, {type: 'return', scope: this.scope});
		},

		addAssignment: function(node, name) {
			this.scopeTracker.logScope(this.getStepNum(), node, {type: 'assignment', scope: this.scope, name: name});
		},

		externalCall: function(node, funcValue, args) {
			this.callNodeId = node.id;
			this.callId = node.id;
			for (var i=0; i<this.callStackNodes.length; i++) {
				this.callId += '-' + this.callStackNodes[i].getTopNode().id;
			}

			for (i=0; i<this.callStackNodes.length; i++) {
				var nodeId = this.callStackNodes[i].getTopNode().id;
				if (this.callIdsByNodeIds[nodeId] === undefined) {
					this.callIdsByNodeIds[nodeId] = [];
				}
				if (this.callIdsByNodeIds[nodeId].indexOf(this.callId) < 0) {
					this.callIdsByNodeIds[nodeId].push(this.callId);
				}
			}

			this.costCounter += funcValue.cost || 1;
			if (this.costCounter > this.limits.costCounter) {
				this.throwTimeout(node.id);
			}

			try {
				return funcValue.func.call(null, this, funcValue.name, args);
			} catch (error) {
				// augmented functions should do their own error handling, so wrap the resulting strings in jsmm messages
				if (typeof error === 'string') {
					throw new jsmm.msg.Error(node.id, error);
				} else {
					throw error;
				}
			}
		},

		inFunction: function() {
			return this.isFunctionContext || this.callStackNodes.length > 0;
		},

		increaseExecutionCounter: function(node, amount) {
			this.executionCounter += amount;
			if (this.executionCounter > this.limits.executionCounter) {
				this.throwTimeout(node.id);
			}
		},

		pushStep: function(step) {
			this.steps.push(step);
		},

		getStepNum: function() {
			return this.steps.length;
		},

		addCommand: function(node, command) {
			this.commandTracker.addCommand(node, command);
		},

		getAllSteps: function() {
			return this.steps;
		}
	};
};

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

	jsmm.Context = function() { return this.init.apply(this, arguments); };
	jsmm.Context.prototype = {
		init: function(tree, scope, limits, funcName, args) {
			this.tree = tree;
			this.startScopeVars = scope;
			this.scope = new jsmm.Scope(scope);
			this.scopeStack = [this.scope];

			this.limits = limits;
			this.executionCounter = 0;
			this.costCounter = 0;

			this.steps = [];
			this.callStackNodes = [];
			this.callNodesByNodes = {};
			this.commandTracker = new jsmm.CommandTracker();
			this.scopeTracker = new jsmm.ScopeTracker();
			this.calledFunctions = [];
			this.callNodeId = null;
			this.error = null;
		},

		/// OUTPUT FUNCTIONS ///
		getCallNodeId: function() {
			return this.callNodeId;
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
			this.scopeTracker.logScope(0, this.tree.programNode, {type: 'enter', scope: this.scope, name: 'global'});

			var func;
			if (funcName !== undefined) {
				func = this.scope.find(funcName).value.func;
			} else {
				func = this.tree.programNode.getRunFunction();
			}

			try {
				func(this, args);
			} catch (error) {
				if (error.type === 'Error') {
					this.error = error;
				} else {
					//throw error;
					this.error = new jsmm.msg.Error(0, 'An unknown error has occurred', error);
				}
			}
		},

		hasError: function() {
			return this.error !== null;
		},

		getError: function() {
			return this.error;
		},

		getStartScopeVars: function() {
			return this.startScopeVars;
		},

		getCalledFunctions: function() {
			return this.calledFunctions;
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

		/// JS-- PROGRAM FUNCTIONS ///
		enterCall: function(node) {
			this.callStackNodes.push(node);
			if (this.callStackNodes.length > this.limits.callStackDepth) {
				//throw new jsmm.msg.Error(node.id, 'Too many nested function calls have been made already, perhaps there is infinite recursion somewhere');
				this.throwTimeout(node.id);
			}
		},

		leaveCall: function() {
			this.callStackNodes.pop();
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
			for (var i=0; i<this.callStackNodes.length; i++) {
				var nodeId = this.callStackNodes[i].getTopNode().id;
				if (this.callNodesByNodes[nodeId] === undefined) {
					this.callNodesByNodes[nodeId] = [];
				}
				if (this.callNodesByNodes[nodeId].indexOf(node.id) < 0) {
					this.callNodesByNodes[nodeId].push(node.id);
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
			return this.callStackNodes.length > 0;
		},

		increaseExecutionCounter: function(node, amount) {
			this.executionCounter += amount;
			if (this.executionCounter > this.limits.executionCounter) {
				this.throwTimeout(node.id);
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
		}
	};
};

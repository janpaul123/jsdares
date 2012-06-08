/*jshint node:true jquery:true*/
"use strict";

var robot = require('../robot');

module.exports = function(info) {
	info.commands = [];

	info.consoleExample = function($content, example, sampText) {
		var $dfn = $('<dfn></dfn>');
		$content.append($('<div class="info-table-content-wrapper"></div>').append($dfn));

		var $samp = $('<samp></samp>');
		$dfn.append($samp);

		var $code = $('<code>' + example + '</code>');
		$dfn.append($code);

		if (sampText === undefined) {
			sampText = '';
			var console = {
				log: function(string) {
					if (typeof string === 'object') string = '[object]';
					sampText += string + '\n';
				},
				clear: function() {
					sampText = '';
				}
			};
			eval(example);
		}
		$samp.html(sampText);
	};

	info.canvasExample = function($content, example) {
		var $wrapper = $('<div class="info-table-content-wrapper"></div>');
		$content.append($wrapper);

		var $container = $('<div class="canvas-container info-table-content-container"></div>');
		$wrapper.append($container);

		var $canvas = $('<canvas class="canvas-canvas" width="150" height="150"></canvas>');
		$container.append($canvas);

		$wrapper.append('<code>var context = canvas.getContext("2d");\n' + example + '</code>');

		var context = $canvas[0].getContext('2d');
		eval(example);
	};

	info.robotExample = function($content, example, state) {
		var $wrapper = $('<div class="info-table-content-wrapper"></div>');
		$content.append($wrapper);

		var $container = $('<div class="robot-container info-table-content-container"></div>');
		$wrapper.append($container);

		var consoleText = '';
		var console = {
			log: function(string) {
				if (typeof string === 'object') string = '[object]';
				consoleText += string + '\n';
			},
			clear: function() {
				consoleText = '';
			}
		};

		var rob = new robot.Robot($container, true, 48);
		rob.setState(state || '{"columns":4,"rows":4,"initialX":1,"initialY":3,"initialAngle":90,"mazeObjects":0,"verticalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]],"horizontalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]],"blockGoal":[[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]],"numGoals":0}');
		rob.clear();
		rob.insertDelay(100000);
		(function(robot) { eval(example); }(rob));
		rob.playAll();

		if (consoleText.length > 0) {
			$wrapper.append('<dfn><samp>' + consoleText + '</samp><code>' + example + '</code></dfn>');
		} else {
			$wrapper.append('<code>' + example + '</code>');
		}
	};

	info.InfoScope = function() { return this.init.apply(this, arguments); };
	info.InfoTable = function() { return this.init.apply(this, arguments); };
	info.Info = function() { return this.init.apply(this, arguments); };

	info.InfoScope.prototype = {
		init: function($div, info) {
			this.info = info;
			this.$scope = $('<div class="info-scope"></div>');
			$div.append(this.$scope);
			this.highlighting = false;
			this.scopeTracker = null;
		},

		remove: function() {
			this.clear();
			this.$scope.remove();
		},

		update: function(scopeTracker, stepNum) {
			this.scopeTracker = scopeTracker;
			var state = this.scopeTracker.getState(stepNum);
			this.clear();
			var enabled = true;
			for (var i=state.length-1; i>0; i--) {
				this.makeItem(state[i], enabled);
				enabled = false;
			}
			this.makeItem(state[0], true);
		},

		enableHighlighting: function() {
			this.highlighting = true;
			this.$scope.on('mouseleave', $.proxy(this.mouseLeave, this));
		},

		disableHighlighting: function() {
			this.highlighting = false;
			this.$scope.off('mouseleave');
			this.removeHighlights();
		},

		highlightCallNodes: function(nodeIds) {
			this.removeHighlights();
			if (this.scopeTracker !== null) {
				for (var i=0; i<nodeIds.length; i++) {
					var ids = this.scopeTracker.getHighlightIdsByNodeId(nodeIds[i]);
					for (var j=0; j<ids.length; j++) {
						if (this.$variables[ids[j]] !== undefined) {
							this.$variables[ids[j]].addClass('info-scope-variable-highlight');
						}
					}
				}
			}
		},

		/// INTERNAL FUNCTIONS ///
		clear: function() {
			this.$scope.find('.info-scope-variable').remove(); // to prevent $.data leaks
			this.$scope.children('.info-scope-item').remove(); // to prevent $.data leaks
			this.$variables = {};
		},

		makeItem: function(level, enabled) {
			var $item = $('<div class="info-scope-item"></div>');
			$item.data('id', level.id);
			$item.on('click', $.proxy(this.itemClick, this));
			this.$scope.append($item);

			var $cell = $('<div class="info-scope-cell"></div>');
			$item.append($cell);

			var $arrow = $('<span class="info-scope-cell-arrow"></span>');
			$cell.append($arrow);
			var $name = $('<span class="info-scope-cell-name">' + level.name + ':</span>');
			$cell.append($name);
			var $content = $('<div class="info-scope-content"></div>');
			$item.append($content);

			for (var i=0; i<level.names.length; i++) {
				var name = level.names[i];
				var variable = level.scope[name];
				var $variable = $('<div class="info-scope-variable">' + variable.name + ' = ' + variable.value + '</div>');
				$variable.on('mousemove', $.proxy(this.mouseMove, this));
				$variable.data('id', variable.id);
				$content.append($variable);
				this.$variables[variable.id] = $variable;
			}

			if (!enabled) {
				$item.addClass('info-scope-item-disabled');
				$content.hide();
			} else {
				$item.addClass('info-scope-item-active');
				$content.show();
			}
		},

		itemClick: function(event) {
			var $target = $(event.delegateTarget);
			var $content = $target.children('.info-scope-content');
			if ($target.hasClass('info-scope-item-active')) {
				$target.removeClass('info-scope-item-active');
				$content.slideUp(200);
			} else {
				$target.addClass('info-scope-item-active');
				$content.slideDown(200);
			}
		},

		removeHighlights: function() {
			this.$scope.find('.info-scope-variable-highlight').removeClass('info-scope-variable-highlight');
		},

		mouseMove: function(event) {
			event.stopPropagation();
			if (this.highlighting && this.commandTracker !== null) {
				this.removeHighlights();
				var $target = $(event.delegateTarget);
				if ($target.data('id') !== undefined) {
					$target.addClass('info-scope-variable-highlight');
					this.info.editor.highlightNodeIds(this.scopeTracker.getHighlightNodeIdsById($target.data('id')));
				} else {
					this.info.editor.highlightNodeId(0);
				}
			}
		},

		mouseLeave: function(event) {
			this.removeHighlights();
			this.info.editor.highlightNodeId(0);
		}
	};

	info.InfoTable.prototype = {
		icons: {console: 'icon-list-alt', canvas: 'icon-picture', robot: 'icon-th'},

		init: function($div, info) {
			this.info = info;
			this.$table = $('<div class="info-table">');
			this.$table.on('mouseleave', $.proxy(this.mouseLeave, this));
			$div.append(this.$table);
			this.commands = {};
			this.highlighting = false;
			this.commandTracker = null;
		},

		addCommands: function(commands) {
			for (var i=0; i<commands.length; i++) {
				var command = commands[i];

				var $item = $('<div class="info-table-item"></div>');
				var $cell = $('<div class="info-table-cell"></div>');
				this.makeCell(command, $cell);
				$item.append($cell);

				var $content = $('<div class="info-table-content"></div>');
				$content.hide();
				$item.append($content);

				$item.data('command', command);
				$item.on('click', $.proxy(this.itemClick, this));
				$item.on('mousemove', $.proxy(this.mouseMove, this));

				this.$table.append($item);
				this.commands[command.id] = {command: command, $item: $item};
			}
		},

		remove: function() {
			this.$table.children('.info-table-item').remove(); // to prevent $.data leaks
			this.$table.remove();
		},

		update: function(commandTracker) {
			this.commandTracker = commandTracker;
		},

		highlightCallNodes: function(nodeIds) {
			if (this.commandTracker !== null) {
				this.removeHighlights();
				for (var i=0; i<nodeIds.length; i++) {
					var ids = this.commandTracker.getHighlightIdsByNodeId(nodeIds[i]);
					for (var j=0; j<ids.length; j++) {
						if (this.commands[ids[j]] !== undefined) {
							this.commands[ids[j]].$item.addClass('info-table-item-highlight');
						}
					}
				}
			}
		},

		enableHighlighting: function() {
			this.highlighting = true;
		},

		disableHighlighting: function() {
			this.highlighting = false;
			this.removeHighlights();
		},

		/// INTERNAL FUNCTIONS ///
		makeCell: function(command, $cell) {
			var $arrow = $('<span class="info-table-cell-arrow"></span>');
			$cell.append($arrow);
			var $name = $('<span class="info-table-cell-name">' + command.name + ' </span>');
			for (var j=0; j<command.outputs.length; j++) {
				var output = command.outputs[j];
				$name.append('<span class="info-table-output"><i class="' + this.icons[output] + ' icon-white"></i> ' + output + '</span>');
			}
			$cell.append($name);
		},

		itemClick: function(event) {
			var $target = $(event.delegateTarget);
			var command = $target.data('command');
			var $content = $target.children('.info-table-content');
			if ($target.hasClass('info-table-item-active')) {
				$target.removeClass('info-table-item-active');
				$content.slideUp(200);
			} else {
				this.$table.children('.info-table-item-active').removeClass('info-table-item-active').children('.info-table-content').slideUp(200);
				$content.show();
				command.makeContent($content);
				$target.addClass('info-table-item-active');
				$content.hide();
				$content.slideDown(200);
			}
		},

		removeHighlights: function() {
			this.$table.children('.info-table-item-highlight').removeClass('info-table-item-highlight');
		},

		mouseMove: function(event) {
			if (this.highlighting && this.commandTracker !== null) {
				this.removeHighlights();
				var $target = $(event.delegateTarget);
				if ($target.data('command') !== undefined) {
					$target.addClass('info-table-item-highlight');
					this.info.editor.highlightNodeIds(this.commandTracker.getHighlightNodeIdsById($target.data('command').id));
				} else {
					this.info.editor.highlightNodeId(0);
				}
			}
		},

		mouseLeave: function(event) {
			if (this.highlighting) {
				this.removeHighlights();
				this.info.editor.highlightNodeId(0);
			}
		}
	};

	info.Info.prototype = {
		init: function($div, editor, commandFilter) {
			this.$div = $div;
			this.$div.addClass('output info');
			
			this.scope = new info.InfoScope(this.$div, this);
			this.table = new info.InfoTable(this.$div, this);
			this.table.addCommands(this.filterCommands(commandFilter));

			this.editor = editor;
			this.editor.addOutput(this);
		},

		remove: function() {
			this.$div.removeClass('output info');
		},

		outputClearAll: function() {
			this.events = [];
		},

		outputStartEvent: function(context) {
			this.currentEvent = {
				scopeTracker: context.getScopeTracker(),
				commandTracker: context.getCommandTracker()
			};
			this.events.push(this.currentEvent);
		},

		outputPopFront: function() {
			this.events.shift();
		},

		outputClearEventsFrom: function(eventNum) {
			this.events = this.events.slice(0, eventNum);
		},

		outputClearToEnd: function() {
			this.events = [];
		},

		outputSetEventStep: function(eventNum, stepNum) {
			this.currentEvent = this.events[eventNum];
			this.scope.update(this.currentEvent.scopeTracker, stepNum);
			this.table.update(this.currentEvent.commandTracker);
		},

		highlightCallNodes: function(nodeIds) {
			this.scope.highlightCallNodes(nodeIds);
			this.table.highlightCallNodes(nodeIds);
		},

		enableHighlighting: function() {
			this.$div.addClass('info-highlighting');
			this.scope.enableHighlighting();
			this.table.enableHighlighting();
		},

		disableHighlighting: function() {
			this.$div.removeClass('info-highlighting');
			this.scope.disableHighlighting();
			this.table.disableHighlighting();
		},

		/// INTERNAL FUNCTIONS ///
		filterCommands: function(filter) {
			if (filter === undefined || filter === null) {
				return info.commands;
			} else {
				var commands = [];
				for (var i=0; i<info.commands.length; i++) {
					var command = info.commands[i];
					for (var j=0; j<filter.length; j++) {
						if (command.id.indexOf(filter[j]) === 0) {
							commands[command.id] = command;
						}
					}
				}
				return commands;
			}
		}
	};
};

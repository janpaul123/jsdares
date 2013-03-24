/*jshint node:true jquery:true*/
"use strict";

var robot = require('../robot');
var output = require('../output');
var jsmm = require('../jsmm');

module.exports = function(info) {
	info.tables = [];

	info.consoleExample = function(infoTable, $content, example, sampText) {
		var $dfn = $('<dfn></dfn>');
		$content.append($('<div class="info-table-content-wrapper"></div>').append($dfn));

		var $samp = $('<samp></samp>');
		$dfn.append($samp);

		var $code = $('<code>' + example + '</code>');
		$dfn.append($code);

		if (sampText === undefined) {
			var console = {
				log: function(string) {
					if (typeof string === 'object') string = '[object]';
					$samp.text($samp.text() + string + '\n');
				},
				clear: function() {
					$samp.text('');
				}
			};
			var localDocument = {};
			(function(document) { eval(example); })(localDocument);
			if (localDocument.onkeydown !== undefined) {
				infoTable.addGlobalEvent($(document), 'keydown', localDocument.onkeydown);
			}
			if (localDocument.onkeyup !== undefined) {
				infoTable.addGlobalEvent($(document), 'keyup', localDocument.onkeyup);
			}
		} else {
			$samp.html(sampText);
		}
	};

	var canvasEventWrapper = function($canvas, func) {
		return function(e) {
			var offset = $canvas.offset();
			var event = {
				layerX: e.pageX	- offset.left,
				layerY: e.pageY - offset.top
			};
			func(event);
			return false;
		};
	};

	info.canvasExample = function(infoTable, $content, example) {
		var $wrapper = $('<div class="info-table-content-wrapper"></div>');
		$content.append($wrapper);

		var $container = $('<div class="canvas-container info-table-content-container"></div>');
		$wrapper.append($container);

		var $canvas = $('<canvas class="canvas-canvas" width="130" height="130"></canvas>');
		$container.append($canvas);

		$wrapper.append('<code>var context = canvas.getContext("2d");\n' + example + '</code>');

		var canvas = {};
		var context = $canvas[0].getContext('2d');
		var interval = null;
		var window = { setInterval: function(func, time) { interval = {func: func, time: time}; } };

		eval(example);

		if (canvas.onmousemove !== undefined) {
			infoTable.addGlobalEvent($canvas, 'mousemove', canvasEventWrapper($canvas, canvas.onmousemove));
		}
		if (canvas.onmousedown !== undefined) {
			infoTable.addGlobalEvent($canvas, 'mousedown', canvasEventWrapper($canvas, canvas.onmousedown));
		}
		if (canvas.onmouseup !== undefined) {
			infoTable.addGlobalEvent($canvas, 'mouseup', canvasEventWrapper($canvas, canvas.onmouseup));
		}
		if (canvas.onmousedown !== undefined || canvas.onmouseup !== undefined) {
			$canvas.addClass('info-table-content-clickable');
			infoTable.addGlobalEvent($canvas, 'click', function(e) { e.stopPropagation(); });
		}
		if (interval !== null) {
			infoTable.addGlobalEvent(null, 'interval', interval);
		}
	};

	info.robotExample = function(infoTable, $content, example, state) {
		var $wrapper = $('<div class="info-table-content-wrapper"></div>');
		$content.append($wrapper);

		var $container = $('<div class="robot-container info-table-content-container"></div>');
		$wrapper.append($container);

		state = state || '{"columns":4,"rows":4,"initialX":1,"initialY":3,"initialAngle":90,"mazeObjects":0,"verticalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]],"horizontalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]],"blockGoal":[[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]],"numGoals":0}';
		var rob = new robot.Robot($container, true, 48, state);
		rob.insertDelay(100000);

		var simpleRobot = new output.SimpleRobot(state);
		var simpleConsole = new output.SimpleConsole();
		var runner = new jsmm.SimpleRunner({console: simpleConsole.getAugmentedObject(), robot: simpleRobot.getAugmentedObject()});
		runner.run(example);
		simpleRobot.play(rob);
		rob.playAll();

		if (simpleConsole.getText().length > 0) {
			$wrapper.append('<dfn><samp>' + simpleConsole.getText() + '</samp><code>' + example + '</code></dfn>');
		} else {
			$wrapper.append('<code>' + example + '</code>');
		}
	};

	info.InfoScope = function() { return this.init.apply(this, arguments); };
	info.InfoScope.prototype = {
		init: function($div, info) {
			this.info = info;
			this.$scopeContainer = $('<div class="info-scope-container"></div>');
			$div.append(this.$scopeContainer);

			this.$scopeContainer.append('<p><span class="info-output"><i class="icon icon-eye-open icon-white"></i> scope</span></p><p>This list shows the variables that are declared in your <a href="#arrow-right,575,57">program</a>, along with their values. At the beginning the only variables are those that we provide, such as <var>robot</var> or <var>canvas</var>. You can add your own variables and functions using <var>var</var> and <var>function</var>.</p>');
			this.info.prepareTextElement(this.$scopeContainer);

			this.$scope = $('<div class="info-scope"></div>');
			this.$scopeContainer.append(this.$scope);

			this.highlighting = false;
			this.scopeTracker = null;

			this.itemClick = _(this.itemClick).bind(this);
			this.mouseMove = _(this.mouseMove).bind(this);
			this.mouseLeave = _(this.mouseLeave).bind(this);
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
			this.$scope.on('mouseleave', this.mouseLeave);
		},

		disableHighlighting: function() {
			this.highlighting = false;
			this.$scope.off('mouseleave');
			this.removeHighlights();
		},

		highlightNodes: function(nodeIds) {
			this.nodeIds = nodeIds;
			if (this.visible) {
				this.renderHighlights();
			}
		},

		renderHighlights: function() {
			this.removeHighlights();
			var nodeIds = this.nodeIds;
			if (this.scopeTracker !== null && nodeIds) {
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

		setFocus: function() {
			this.visible = true;
			this.renderHighlights();
		},

		unsetFocus: function() {
			this.visible = false;
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
			$item.on('click', this.itemClick);
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
				if (variable.highlight) $variable.addClass('info-scope-variable-highlight-step');
				$variable.on('mousemove', this.mouseMove);
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

	info.InfoTable = function() { return this.init.apply(this, arguments); };
	info.InfoTable.prototype = {
		icons: {console: 'icon-list-alt', canvas: 'icon-picture', robot: 'icon-th'},

		init: function($div, info) {
			this.info = info;
			this.$tables = $('<div class="info-tables">');
			$div.append(this.$tables);
			this.commands = {};
			this.highlighting = false;
			this.commandTracker = null;
			this.globalEvents = [];

			this.itemClick = _(this.itemClick).bind(this);
			this.mouseMove = _(this.mouseMove).bind(this);
			this.mouseLeave = _(this.mouseLeave).bind(this);
		},

		addCommands: function(tables) {
			for (var i=0; i<tables.length; i++) {
				this.addTable(tables[i]);
			}
		},

		addTable: function(table) {
			var $table = $('<div class="info-table"></div>');
			$table.html(table.html);
			this.$tables.append($table);

			for (var id in table.list) {
				var command = table.list[id];

				var $item = $('<div class="info-table-item"></div>');
				var $cell = $('<div class="info-table-cell"></div>');
				this.makeCell(command, $cell);
				$item.append($cell);

				var $content = $('<div class="info-table-content"></div>');
				$content.hide();
				$item.append($content);

				$item.data('id', id);
				$item.data('command', command);
				$item.on('click', this.itemClick);
				$item.on('mousemove', this.mouseMove);

				$table.append($item);
				this.commands[id] = {command: command, $item: $item};
			}

			this.info.prepareTextElement($table);
		},

		remove: function() {
			this.removeGlobalEvents();
			this.$tables.find('.info-table-item').remove(); // to prevent $.data leaks
			this.$tables.remove();
		},

		update: function(commandTracker, highlightStepNodeId) {
			this.commandTracker = commandTracker;
			this.$tables.find('.info-table-item-highlight-step').removeClass('info-table-item-highlight-step');
			var ids = this.commandTracker.getHighlightIdsByNodeId(highlightStepNodeId);
			for (var j=0; j<ids.length; j++) {
				if (this.commands[ids[j]] !== undefined) {
					this.commands[ids[j]].$item.addClass('info-table-item-highlight-step');
				}
			}
		},

		highlightNodes: function(nodeIds) {
			this.nodeIds = nodeIds;
			if (this.visible) {
				this.renderHighlights();
			}
		},

		renderHighlights: function() {
			this.removeHighlights();
			var nodeIds = this.nodeIds;
			if (this.commandTracker !== null && nodeIds) {
				for (var i=0; i<nodeIds.length; i++) {
					var ids = this.commandTracker.getHighlightIdsByTopNodeId(nodeIds[i]);
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
			this.$tables.on('mouseleave', this.mouseLeave);
		},

		disableHighlighting: function() {
			this.highlighting = false;
			this.removeHighlights();
			this.$tables.off('mouseleave');
		},

		addGlobalEvent: function($element, type, func) {
			if (type === 'interval') {
				this.globalEvents.push({type: type, interval: window.setInterval(func.func, func.time)});
			} else {
				$element.on(type, func);
				this.globalEvents.push({$element: $element, type: type, func: func});
			}
		},

		removeGlobalEvents: function() {
			for (var i=0; i<this.globalEvents.length; i++) {
				var event = this.globalEvents[i];
				if (event.type === 'interval') {
					window.clearInterval(event.interval);
				} else {
					event.$element.off(event.type, event.func);
				}
			}
		},

		setFocus: function() {
			this.visible = true;
			this.renderHighlights();
		},

		unsetFocus: function() {
			this.visible = false;
		},

		/// INTERNAL FUNCTIONS ///
		makeCell: function(command, $cell) {
			var $arrow = $('<span class="info-table-cell-arrow"></span>');
			$cell.append($arrow);
			var $name = $('<span class="info-table-cell-name">' + command.name + ' </span>');
			$cell.append($name);
		},

		itemClick: function(event) {
			var $target = $(event.delegateTarget);
			var command = $target.data('command');
			var $content = $target.children('.info-table-content');
			this.removeGlobalEvents();
			if ($target.hasClass('info-table-item-active')) {
				$target.removeClass('info-table-item-active');
				$content.slideUp(200);
			} else {
				this.$tables.find('.info-table-item-active').removeClass('info-table-item-active').children('.info-table-content').slideUp(200);
				$content.show();
				this.makeContent(command, $content);
				$target.addClass('info-table-item-active');
				$content.hide();
				$content.slideDown(200);
			}
		},

		makeContent: function(command, $content) {
			$content.html(command.text);
			for (var i=0; i<command.examples.length; i++) {
				var example = command.examples[i];
				if (example.type === 'robot') {
					info.robotExample(this, $content, example.code, example.state);
				} else if (example.type === 'canvas') {
					info.canvasExample(this, $content, example.code);
				} else if (example.type === 'console') {
					info.consoleExample(this, $content, example.code, example.result);
				}
			}
		},

		removeHighlights: function() {
			this.$tables.find('.info-table-item-highlight').removeClass('info-table-item-highlight');
		},

		mouseMove: function(event) {
			if (this.highlighting && this.commandTracker !== null) {
				this.removeHighlights();
				var $target = $(event.delegateTarget);
				if ($target.data('id') !== undefined) {
					$target.addClass('info-table-item-highlight');
					this.info.editor.highlightNodeIds(this.commandTracker.getHighlightNodeIdsById($target.data('id')));
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

	info.Info = function() { return this.init.apply(this, arguments); };
	info.Info.prototype = {
		init: function(editor, options, $div) {
			this.$div = $div;
			this.$div.addClass('output info');
			this.prepareTextElement = options.prepareTextElement;
			
			if (options.scope === undefined || options.scope) {
				this.scope = new info.InfoScope(this.$div, this);
			} else {
				this.scope = null;
			}

			this.table = new info.InfoTable(this.$div, this);
			this.table.addCommands(this.filterCommands(options.commands || ''));

			this.editor = editor;
		},

		remove: function() {
			this.$div.removeClass('output info');
			if (this.scope !== null) this.scope.remove();
			this.table.remove();
		},

		getScopeObjects: function() {
			return {};
		},

		outputClearAllEvents: function() {
			this.events = [];
			this.currentEvent = null;
			this.lastEvent = null;
		},

		outputStartEvent: function(context) {
			this.lastEvent = {
				context: context
			};
			this.events.push(this.lastEvent);
			this.stepNum = Infinity;
		},

		outputEndEvent: function(context) {
		},

		outputPopFront: function() {
			this.events.shift();
		},

		outputClearEventsFrom: function(eventNum) {
			this.events = this.events.slice(0, eventNum);
			// always followed by appropriate outputSetEventStep
		},

		outputClearEventsToEnd: function() {
			if (this.scope !== null) this.scope.update(this.lastEvent.context.getScopeTracker(), Infinity);
			this.table.update(this.lastEvent.context.getCommandTracker(), 0);
			this.events = [];
		},

		outputSetEventStep: function(eventNum, stepNum) {
			if (eventNum >= 0 && (this.currentEvent !== this.events[eventNum] || this.stepNum !== stepNum)) {
				this.currentEvent = this.events[eventNum];
				this.stepNum = stepNum;
				if (this.scope !== null) this.scope.update(this.currentEvent.context.getScopeTracker(), this.stepNum);
				this.table.update(this.lastEvent.context.getCommandTracker(), this.currentEvent.context.getNodeIdByStepNum(this.stepNum));
			}
		},

		highlightNodes: function(nodeIds) {
			if (this.scope !== null) this.scope.highlightNodes(nodeIds);
			this.table.highlightNodes(nodeIds);
		},

		enableHighlighting: function() {
			this.$div.addClass('info-highlighting');
			if (this.scope !== null) this.scope.enableHighlighting();
			this.table.enableHighlighting();
		},

		disableHighlighting: function() {
			this.$div.removeClass('info-highlighting');
			if (this.scope !== null) this.scope.disableHighlighting();
			this.table.disableHighlighting();
		},

		setFocus: function() {
			if (this.scope !== null) this.scope.setFocus();
			this.table.setFocus();
		},

		unsetFocus: function() {
			if (this.scope !== null) this.scope.unsetFocus();
			this.table.unsetFocus();
		},

		/// INTERNAL FUNCTIONS ///
		filterCommands: function(string) {
			var regex = /^(([^.\[]*[.]?)*)(\[([0-9]*)\])?/;

			if (string.length <= 0) {
				return this.buildTable();
			} else {
				var commands = string.split(',');
				var filter = [];
				for (var i=0; i<commands.length; i++) {
					var command = commands[i];
					var matches = regex.exec(command);

					var id = matches[1];
					var example = matches[4];

					filter[id] = filter[id] || [];

					if (example !== undefined) {
						filter[id].push(example);
					}
				}
				return this.buildTable(filter);
			}
		},

		buildTable: function(filter) {
			if (filter === undefined || filter === null) {
				return info.tables;
			} else {
				var tables = [];
				for (var i=0; i<info.tables.length; i++) {
					var table = null;
					for (var id in filter) {
						var item = info.tables[i].list[id];

						if (item !== undefined) {
							if (table === null) {
								table = {html: info.tables[i].html, list: {}};
								tables.push(table);
							}

							if (table.list[id] === undefined) {
								table.list[id] = {name: item.name, text: item.text, examples: item.examples};
							}

							if (filter[id].length > 0) {
								table.list[id].examples = [];
								for (var k=0; k<filter[id].length; k++) {
									table.list[id].examples.push(item.examples[filter[id][k]]);
								}
							}
						}
					}
				}
				return tables;
			}
		}
	};
};

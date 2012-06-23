/*jshint node:true jquery:true*/
"use strict";

var robot = require('../robot');

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

		var $canvas = $('<canvas class="canvas-canvas" width="150" height="150"></canvas>');
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

		highlightNodes: function(nodeIds) {
			this.removeHighlights();
			if (this.scopeTracker !== null && nodeIds !== null) {
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

	info.InfoTable = function() { return this.init.apply(this, arguments); };
	info.InfoTable.prototype = {
		icons: {console: 'icon-list-alt', canvas: 'icon-picture', robot: 'icon-th'},

		init: function($div, info) {
			this.info = info;
			this.$tables = $('<div class="info-tables">');
			this.$tables.on('mouseleave', $.proxy(this.mouseLeave, this));
			$div.append(this.$tables);
			this.commands = {};
			this.highlighting = false;
			this.commandTracker = null;
			this.globalEvents = [];
		},

		addCommands: function(tables) {
			for (var i=0; i<tables.length; i++) {
				this.addTable(tables[i]);
			}
		},

		addTable: function(table) {
			if (table.list.length > 0) {
				var $table = $('<div class="info-table"></div>');
				$table.html(table.html);
				this.$tables.append($table);

				for (var i=0; i<table.list.length; i++) {
					var command = table.list[i];

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

					$table.append($item);
					this.commands[command.id] = {command: command, $item: $item};
				}
			}
		},

		remove: function() {
			this.removeGlobalEvents();
			this.$tables.find('.info-table-item').remove(); // to prevent $.data leaks
			this.$tables.remove();
		},

		update: function(commandTracker) {
			this.commandTracker = commandTracker;
		},

		highlightNodes: function(nodeIds) {
			this.removeHighlights();
			if (this.commandTracker !== null && nodeIds !== null) {
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
			this.removeGlobalEvents();
			if ($target.hasClass('info-table-item-active')) {
				$target.removeClass('info-table-item-active');
				$content.slideUp(200);
			} else {
				this.$tables.find('.info-table-item-active').removeClass('info-table-item-active').children('.info-table-content').slideUp(200);
				$content.show();
				command.makeContent(this, $content);
				$target.addClass('info-table-item-active');
				$content.hide();
				$content.slideDown(200);
			}
		},

		removeHighlights: function() {
			this.$tables.find('.info-table-item-highlight').removeClass('info-table-item-highlight');
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

	info.Info = function() { return this.init.apply(this, arguments); };
	info.Info.prototype = {
		init: function($div, editor, commandFilter) {
			this.$div = $div;
			this.$div.addClass('output info');
			
			this.scope = new info.InfoScope(this.$div, this);
			this.table = new info.InfoTable(this.$div, this);
			this.table.addCommands(this.filterCommands(commandFilter));

			this.editor = editor;
		},

		remove: function() {
			this.$div.removeClass('output info');
			this.scope.remove();
			this.table.remove();
		},

		outputClearAllEvents: function() {
			this.events = [];
			this.currentEvent = null;
			this.lastEvent = null;
		},

		outputStartEvent: function(context) {
			this.lastEvent = {
				scopeTracker: context.getScopeTracker(),
				commandTracker: context.getCommandTracker()
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
			this.scope.update(this.events[eventNum].scopeTracker, Infinity);
			this.table.update(this.events[eventNum].commandTracker);
			this.events = this.events.slice(0, eventNum);
		},

		outputClearEventsToEnd: function() {
			this.scope.update(this.lastEvent.scopeTracker, Infinity);
			this.table.update(this.lastEvent.commandTracker);
			this.events = [];
		},

		outputSetEventStep: function(eventNum, stepNum) {
			if (eventNum >= 0 && (this.currentEvent !== this.events[eventNum] || this.stepNum !== stepNum)) {
				this.currentEvent = this.events[eventNum];
				this.stepNum = stepNum;
				this.scope.update(this.currentEvent.scopeTracker, this.stepNum);
				this.table.update(this.currentEvent.commandTracker);
			}
		},

		highlightNodes: function(nodeIds) {
			this.scope.highlightNodes(nodeIds);
			this.table.highlightNodes(nodeIds);
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
				return info.tables;
			} else {
				var tables = [];
				for (var i=0; i<info.tables.length; i++) {
					tables[i] = {html: info.tables[i].html, list: []};
					for (var j=0; j<info.tables[i].list.length; j++) {
						var command = info.tables[i].list[j];
						for (var k=0; k<filter.length; k++) {
							if (command.id.indexOf(filter[k]) === 0) {
								tables[i].list.push(command);
								break;
							}
						}
					}
				}
				return tables;
			}
		}
	};
};

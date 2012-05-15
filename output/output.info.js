/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.InfoScope = function() { return this.init.apply(this, arguments); };
	output.InfoTable = function() { return this.init.apply(this, arguments); };
	output.Info = function() { return this.init.apply(this, arguments); };

	output.InfoScope.prototype = {
		init: function($div, info) {
			this.info = info;
			this.$scope = $('<div class="info-scope"></div>');
			$div.append(this.$scope);
			this.highlighting = false;
		},

		remove: function() {
			this.clear();
			this.$scope.remove();
		},

		update: function(scopeTracker, callNr) {
			this.scopeTracker = scopeTracker;
			var state = this.scopeTracker.getState(callNr);
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

		highlightLine: function(line) {
			this.removeHighlights();
			var ids = this.scopeTracker.getHighlightIdsByLine(line);
			for (var i=0; i<ids.length; i++) {
				if (this.$variables[ids[i]] !== undefined) {
					this.$variables[ids[i]].addClass('info-scope-variable-highlight');
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
			if (this.highlighting) {
				this.removeHighlights();
				var $target = $(event.delegateTarget);
				if ($target.data('id') !== undefined) {
					$target.addClass('info-scope-variable-highlight');
					this.info.editor.highlightNodes(this.scopeTracker.getHighlightNodesById($target.data('id')));
				} else {
					this.info.editor.highlightNode(null);
				}
			}
		},

		mouseLeave: function(event) {
			this.removeHighlights();
			this.info.editor.highlightNode(null);
		}
	};

	output.InfoTable.prototype = {
		icons: {console: 'icon-list-alt', canvas: 'icon-picture', robot: 'icon-th'},

		init: function($div, info, commands) {
			this.info = info;
			this.$table = $('<div class="info-table">');
			this.$table.on('mouseleave', $.proxy(this.mouseLeave, this));
			this.commands = {};
			this.highlighting = false;

			for (var i=0; i<commands.length; i++) {
				var command = commands[i];

				var $item = $('<div class="info-table-item"></div>');
				var $cell = $('<div class="info-table-cell"></div>');
				this.makeCell(command, $cell);
				$item.append($cell);
				$item.append('<div class="info-table-content"></div>');

				$item.data('command', command);
				$item.on('click', $.proxy(this.itemClick, this));
				$item.on('mousemove', $.proxy(this.mouseMove, this));

				this.$table.append($item);
				this.commands[command.id] = {command: command, $item: $item};
			}

			$div.append(this.$table);
		},

		remove: function() {
			this.$table.children('.info-table-item').remove(); // to prevent $.data leaks
			this.$table.remove();
		},

		update: function(commandTracker) {
			this.commandTracker = commandTracker;
		},

		highlightLine: function(line) {
			var ids = this.commandTracker.getHighlightIdsByLine(line);
			this.removeHighlights();
			for (var i=0; i<ids.length; i++) {
				var id = ids[i];
				if (this.commands[id] !== undefined) {
					//this.commands[id].$item.click();
					this.commands[id].$item.addClass('info-table-item-highlight');
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
			if (this.highlighting) {
				this.removeHighlights();
				var $target = $(event.delegateTarget);
				if ($target.data('command') !== undefined) {
					$target.addClass('info-table-item-highlight');
					this.info.editor.highlightNodes(this.commandTracker.getHighlightNodesById($target.data('command').id));
				} else {
					this.info.editor.highlightNode(null);
				}
			}
		},

		mouseLeave: function(event) {
			if (this.highlighting) {
				this.removeHighlights();
				this.info.editor.highlightNode(null);
			}
		}
	};

	output.Info.prototype = {
		init: function($div, editor) {
			this.$div = $div;
			this.$div.addClass('output info');
			this.editor = editor;
			this.editor.addOutput(this);

			this.scope = new output.InfoScope(this.$div, this);
			this.table = new output.InfoTable(this.$div, this, output.getConsoleInfo());
		},

		remove: function() {
			this.$div.removeClass('output info');
		},

		highlightCodeLine: function(line) {
			this.scope.highlightLine(line);
			this.table.highlightLine(line);
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

		setCallNr: function(context, callNr) {
			this.scope.update(context.getScopeTracker(), callNr);
			this.table.update(context.getCommandTracker());
		}
	};
};

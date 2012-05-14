/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.InfoTable = function() { return this.init.apply(this, arguments); };
	output.InfoScope = function() { return this.init.apply(this, arguments); };
	output.Info = function() { return this.init.apply(this, arguments); };

	output.InfoTable.prototype = {
		icons: {console: 'icon-list-alt', canvas: 'icon-picture', robot: 'icon-th'},

		init: function($div, commands) {
			this.$table = $('<div class="info-table">');
			this.commands = {};

			for (var i=0; i<commands.length; i++) {
				var command = commands[i];

				var $item = $('<div class="info-table-item"></div>');
				var $cell = $('<div class="info-table-cell"></div>');
				this.makeCell(command, $cell);
				$item.append($cell);
				$item.append('<div class="info-table-content"></div>');

				$item.data('command', command);
				$item.on('click', $.proxy(this.itemClick, this));

				this.$table.append($item);
				this.commands[command.id] = {command: command, $item: $item};
			}

			$div.append(this.$table);
		},

		remove: function() {
			this.$table.children('.info-table-item').remove(); // to prevent $.data leaks
			this.$table.remove();
		},

		makeCell: function(command, $cell) {
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

		highlightCommands: function(ids) {
			this.$table.children('.info-table-item-highlight').removeClass('info-table-item-highlight');
			for (var i=0; i<ids.length; i++) {
				var id = ids[i];
				if (this.commands[id] !== undefined) {
					//this.commands[id].$item.click();
					this.commands[id].$item.addClass('info-table-item-highlight');
				}
			}
		}
	};

	output.InfoScope.prototype = {
		init: function($div) {
			this.$scope = $('<div class="info-scope"></div>');
			$div.append(this.$scope);
		},

		remove: function() {
			this.clear();
			this.$scope.remove();
		},

		update: function(state) {
			this.clear();
			var enabled = true;
			for (var i=state.length-1; i>0; i--) {
				this.makeCell(state[i], enabled);
				enabled = false;
			}
			this.makeCell(state[0], true);
		},

		/// INTERNAL FUNCTIONS ///
		clear: function() {
			this.$scope.find('.info-scope-variable').remove(); // to prevent $.data leaks
			this.$scope.children('.info-scope-cell').remove(); // to prevent $.data leaks
		},

		makeCell: function(level, enabled) {
			console.log(level);
			var $cell = $('<div class="info-scope-cell"><div class="info-scope-name">' + level.name + ':</div></div>');
			$cell.data('id', level.id);
			if (!enabled) $cell.addClass('disabled');
			this.$scope.append($cell);

			for (var i=0; i<level.names.length; i++) {
				var name = level.names[i];
				var variable = level.scope[name];
				var $variable = $('<div class="info-scope-variable">' + variable.name + ' = ' + variable.value + '</div>');
				$variable.data('id', variable.id);
				$cell.append($variable);
			}
		}
	};

	output.Info.prototype = {
		init: function($div, editor) {
			this.$div = $div;
			this.$div.addClass('output info');
			this.editor = editor;
			this.editor.addOutput(this);
			this.editor.setInfo(this);

			this.scope = new output.InfoScope(this.$div);
			this.table = new output.InfoTable(this.$div, output.getConsoleInfo());
		},

		remove: function() {
			this.$div.removeClass('output info');
		},

		highlightCommands: function(ids) {
			this.table.highlightCommands(ids);
		},

		disableHighlighting: function() {
			this.table.highlightCommands([]);
		},

		setCallNr: function(context, callNr) {
			this.scope.update(context.getScopeTracker().getState(callNr));
		}
	};
};

/*jshint node:true jquery:true*/
"use strict";

module.exports = function(dares) {
	dares.Dares = function() { return this.init.apply(this, arguments); };

	dares.Dares.prototype = {
		init: function($popup, list) {
			this.list = list;
			this.$popup = $popup;
			this.$popup.addClass('dares-popup');
			this.$popup.modal({show: false});

			this.$header = $('<div class="modal-header"><a href="#" class="close" data-dismiss="modal">&times;</a><h3>Select a Dare</h3></div>');
			this.$popup.append(this.$header);

			this.$body = $('<div class="modal-body">');
			this.$popup.append(this.$body);

			for (var i=0; i<list.tables.length; i++) {
				this.addTable(list.tables[i]);
			}
		},

		icons: {console: 'icon-list-alt', canvas: 'icon-picture', robot: 'icon-th'},

		addTable: function(table) {
			var $table = $('<div class="dares-table">');

			var $title = $('<h2>' + table.title + '</h2>');
			$table.append($title);

			for (var i=0; i<table.dares.length; i++) {
				var dare = table.dares[i];

				var $item = $('<div class="dares-table-item"></div>');
				var $cell = $('<div class="dares-table-cell"></div>');
				$item.append($cell);
				$item.append('<div class="dares-table-preview"></div>');

				$item.data('dare', dare);
				$item.on('click', $.proxy(this.itemClick, this));

				$table.append($item);
			}

			this.$body.append($table);
		},

		updateCells: function() {
			this.$body.find('.dares-table-item').each($.proxy(function(index, element) {
				var $item = $(element);
				var $cell = $item.children('.dares-table-cell');
				$cell.html('');
				var dare = $item.data('dare');

				var $arrow = $('<span class="dares-table-cell-arrow"></span>');
				$cell.append($arrow);

				var $name = $('<span class="dares-table-cell-name">' + dare.name + ' </span>');
				for (var j=0; j<dare.outputs.length; j++) {
					var output = dare.outputs[j];
					$name.append('<span class="dares-table-output"><i class="' + this.icons[output] + ' icon-white"></i> ' + output + '</span>');
				}
				$cell.append($name);

				var $difficulty = $('<span class="dares-table-cell-difficulty"></span>');
				for (j=0; j<5; j++) {
					$difficulty.append('<i class="icon-star' + (dare.difficulty <= j ? '-empty' : '') + ' icon-white"></i>');
				}
				$cell.append($difficulty);

				//$cell.append('<span class="dares-table-cell-completed"><i class="icon-user icon-white"></i> ' + dare.completed +'</span>');
				$cell.append('<span class="dares-table-cell-highscore"><i class="icon-trophy icon-white"></i> ' + dare.highscore +'</span>');
				$cell.append('<span class="dares-table-cell-completed">' + (dare.completed ? '<i class="icon-ok icon-white"></i>' : '') + '</span>');
			}, this));
		},

		itemClick: function(event) {
			var $target = $(event.delegateTarget);
			var dare = $target.data('dare');
			var $preview = $target.children('.dares-table-preview');
			if ($target.hasClass('dares-table-item-active')) {
				$target.removeClass('dares-table-item-active');
				$preview.slideUp(200);
			} else {
				this.$body.find('.dares-table-item-active').removeClass('dares-table-item-active').children('.dares-table-preview').slideUp(200);
				dare.setPreview($preview);
				$target.addClass('dares-table-item-active');
				$preview.hide();
				$preview.slideDown(200);
			}
		},

		show: function() {
			this.updateCells();
			this.$popup.modal('show');
		},

		hide: function() {
			this.$popup.modal('hide');
		},

		selectDare: function(table, number) {
			this.list.tables[table].dares[number].selectDare();
		}
	};
};
/*jshint node:true jquery:true*/
"use strict";

var jsmm = require('../jsmm');
var editor = require('../editor');

module.exports = function(output) {
	output.Dares = function() { return this.init.apply(this, arguments); };

	output.Dares.prototype = {
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
				var $name = $('<span class="dares-table-cell-name">' + dare.name + ' </span>');
				for (var j=0; j<dare.outputs.length; j++) {
					var output = dare.outputs[j];
					$name.append('<span class="dares-table-output"><i class="' + this.icons[output] + ' icon-white"></i> ' + output + '</span>');
				}
				$item.append($name);

				var $difficulty = $('<span class="dares-table-cell-difficulty"></span>');
				for (j=0; j<5; j++) {
					$difficulty.append('<i class="icon-star' + (dare.difficulty <= j ? '-empty' : '') + ' icon-white"></i>');
				}
				$item.append($difficulty);

				//$item.append('<span class="dares-table-cell-completed"><i class="icon-user icon-white"></i> ' + dare.completed +'</span>');
				$item.append('<span class="dares-table-cell-highscore"><i class="icon-trophy icon-white"></i> ' + dare.highscore +'</span>');
				$item.append('<span class="dares-table-cell-preview"></span>');

				$item.data('dare', dare);
				$item.on('click', $.proxy(this.itemClick, this));

				$table.append($item);
			}

			this.$body.append($table);
		},

		itemClick: function(event) {
			var $target = $(event.delegateTarget);
			var dare = $target.data('dare');
			var $preview = $target.children('.dares-table-cell-preview');
			if ($target.hasClass('dares-table-item-active')) {
				$preview.slideUp(200);
				$target.removeClass('dares-table-item-active');
			} else {
				dare.setPreview($preview);
				$target.addClass('dares-table-item-active');
				$preview.hide();
				$preview.slideDown(200);
			}
		},

		show: function() {
			this.$popup.modal('show');
		},

		hide: function() {
			this.$popup.modal('hide');
		},

		selectDare: function(table, number) {
			this.list.tables[table].dares[number].selectDare();
		}
	};

	output.Dare = function() { return this.init.apply(this, arguments); };

	output.Dare.prototype = {
		init: function(content, $div, ui) {
			if (content.type === 'image') {

			}
		}
	};

	output.UI = function() { return this.init.apply(this, arguments); };

	output.UI.prototype = {
		icons: {dare: 'icon-file', console: 'icon-list-alt', canvas: 'icon-picture', robot: 'icon-th'},

		init: function() {
			this.editor = this.console = this.canvas = this.robot = this.dare = null;
			this.$main = $('#main');
			this.initTabs();
			this.loadInitial();

			$('#robot-link').click($.proxy(function() {
				setTimeout($.proxy(function() {
					this.robot.makeActive();
				}, this), 0);
			}, this));

			this.dares = new output.Dares($('#dares-popup'), {
				tables: [{
					title: 'I',
					dares: [
						new output.ImageDare({
							name: 'Gravity',
							description: 'A block is thrown in the air and then accelerates back down. The position of the block is drawn every few seconds, resulting in the image on the right. Your task is to copy this image as good as possible, in as few lines of code as you can.',
							original: function(anim) {
								var drawBlock = function(i) {
									return function(context) {
										context.fillRect(10+i*25, 270+i*-65+i*i*4, 50, 50);
									};
								};
								for (var i=0; i<20; i++) {
									anim.push(drawBlock(i));
								}
							}
						}, this),
						new output.ImageDare({
							name: 'Gravity',
							description: 'A block is thrown in the air and then accelerates back down. The position of the block is drawn every few seconds, resulting in the image on the right. Your task is to copy this image as good as possible, in as few lines of code as you can.',
							original: function(anim) {
								var drawBlock = function(i) {
									return function(context) {
										context.fillRect(10+i*25, 270+i*-65+i*i*4, 50, 50);
									};
								};
								for (var i=0; i<20; i++) {
									anim.push(drawBlock(i));
								}
							}
						}, this),
						new output.ImageDare({
							name: 'Gravity',
							description: 'A block is thrown in the air and then accelerates back down. The position of the block is drawn every few seconds, resulting in the image on the right. Your task is to copy this image as good as possible, in as few lines of code as you can.',
							original: function(anim) {
								var drawBlock = function(i) {
									return function(context) {
										context.fillRect(10+i*25, 270+i*-65+i*i*4, 50, 50);
									};
								};
								for (var i=0; i<20; i++) {
									anim.push(drawBlock(i));
								}
							}
						}, this),
						new output.ImageDare({
							name: 'Gravity',
							description: 'A block is thrown in the air and then accelerates back down. The position of the block is drawn every few seconds, resulting in the image on the right. Your task is to copy this image as good as possible, in as few lines of code as you can.',
							original: function(anim) {
								var drawBlock = function(i) {
									return function(context) {
										context.fillRect(10+i*25, 270+i*-65+i*i*4, 50, 50);
									};
								};
								for (var i=0; i<20; i++) {
									anim.push(drawBlock(i));
								}
							}
						}, this),
						new output.ImageDare({
							name: 'Gravity',
							description: 'A block is thrown in the air and then accelerates back down. The position of the block is drawn every few seconds, resulting in the image on the right. Your task is to copy this image as good as possible, in as few lines of code as you can.',
							original: function(anim) {
								var drawBlock = function(i) {
									return function(context) {
										context.fillRect(10+i*25, 270+i*-65+i*i*4, 50, 50);
									};
								};
								for (var i=0; i<20; i++) {
									anim.push(drawBlock(i));
								}
							}
						}, this),
						new output.ImageDare({
							name: 'Gravity',
							description: 'A block is thrown in the air and then accelerates back down. The position of the block is drawn every few seconds, resulting in the image on the right. Your task is to copy this image as good as possible, in as few lines of code as you can.',
							original: function(anim) {
								var drawBlock = function(i) {
									return function(context) {
										context.fillRect(10+i*25, 270+i*-65+i*i*4, 50, 50);
									};
								};
								for (var i=0; i<20; i++) {
									anim.push(drawBlock(i));
								}
							}
						}, this)
					]
				}]
			});

			$('#start-dare, #switch-dare').click($.proxy(function() {
				this.dares.show();
			}, this));

			$('#abort-dare').click($.proxy(function() {
				this.loadInitial();
			}, this));
		},

		initTabs: function() {
			this.$output = $('#output');
			this.$output.addClass('tabbable');
			this.$tabs = $('<ul class="nav nav-tabs"></ul>');
			this.$output.append(this.$tabs);
			this.$content = $('<div class="tab-content">');
			this.$output.append(this.$content);
		},

		removeAll: function() {
			if (this.console !== null) {
				this.console.remove();
				this.console = null;
			}
			if (this.canvas !== null) {
				this.canvas.remove();
				this.canvas = null;
			}
			if (this.robot !== null) {
				this.robot.remove();
				this.robot = null;
			}
			if (this.dare !== null) {
				this.dare.remove();
				this.dare = null;
			}
			if (this.editor !== null) {
				this.editor.remove();
				this.editor = null;
			}
			this.scope = {};
			this.$tabs.children('li').remove();
			this.$content.children('div').remove();
			this.$main.removeClass('ui-dares-active');
			this.tabNumber = 0;
		},

		addTab: function(name) {
			var $tab = $('<li id="tab-button-' + name + '"><a href="#tab-' + name + '" data-toggle="tab"><i class="' + this.icons[name] + ' icon-white"></i> ' + name + '</a></li>');
			setTimeout(function() { $tab.addClass('tab-button-enabled'); }, 50*this.tabNumber);
			this.$tabs.append($tab);

			var $pane = $('<div class="tab-pane" id="tab-' + name + '"><div id="' + name + '" class="tab-output"></div></div>');
			this.$content.append($pane);

			if (this.tabNumber === 0) {
				$tab.children('a').tab('show');
			}
			this.tabNumber++;
		},

		addEditor: function() {
			this.editor = new editor.Editor(jsmm, $('#editor'), $('#editor-bar'));
			this.editor.setText(window.localStorage.getItem('program-3'));
			return this.editor;
		},

		addConsole: function() {
			this.addTab('console');
			this.console = new output.Console($('#console'), this.editor);
			this.scope.console = this.console.getAugmentedObject();
			this.editor.setScope(this.scope);
			return this.console;
		},

		addCanvas: function() {
			this.addTab('canvas');
			this.canvas = new output.Canvas($('#canvas'), this.editor);
			this.scope.canvas = this.canvas.getAugmentedObject();
			this.editor.setScope(this.scope);
			return this.canvas;
		},

		addRobot: function() {
			this.addTab('robot');
			this.robot = new output.Robot($('#robot'), this.editor, 8, 8);
			this.scope.robot = this.robot.getAugmentedObject();
			this.editor.setScope(this.scope);
			return this.robot;
		},

		addDare: function(dare) {
			this.addTab('dare');
			this.dare = dare;
			dare.makeActive($('#dare'), this);
			this.$main.addClass('ui-dares-active');
			return this.dare;
		},

		loadInitial: function() {
			this.removeAll();
			this.addEditor();
			this.addConsole();
			this.addCanvas();
			this.addRobot();
		},

		hideDares: function() {
			this.dares.hide();
		},

		getCanvas: function() {
			return this.canvas;
		},

		
		textChanged: function(code) {
			window.localStorage.setItem('program-3', code.text);
		}

		
	};
};
/*jshint node:true jquery:true*/
"use strict";

var jsmm = require('../jsmm');
var editor = require('../editor');
var dares = require('../dares');

module.exports = function(output) {
	output.UI = function() { return this.init.apply(this, arguments); };

	output.UI.prototype = {
		icons: {dare: 'icon-file', console: 'icon-list-alt', canvas: 'icon-picture', robot: 'icon-th'},

		init: function() {
			this.editor = this.console = this.canvas = this.robot = this.dare = null;
			this.$main = $('#main');
			this.initTabs();
			this.loadInitial();

			this.dares = new dares.Dares($('#dares-popup'), {
				tables: [{
					title: 'I',
					dares: [
						new dares.ImageMatchDare({
							name: 'Gravity',
							description: 'A block is thrown in the air and then accelerates back down. The position of the block is drawn every few seconds, resulting in the image on the right. Your task is to copy this image as good as possible, in as few lines of code as you can.',
							threshold: 270000,
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
						new dares.ImageMatchDare({
							name: 'Gravity 2',
							description: 'A block is thrown in the air and then accelerates back down. The position of the block is drawn every few seconds, resulting in the image on the right. Your task is to copy this image as good as possible, in as few lines of code as you can.',
							threshold: 270000,
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
						new dares.ImageMatchDare({
							name: 'Gravity 3',
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
						new dares.ConsoleMatchDare({
							name: 'Multiplication Tables',
							description: 'A block is thrown in the air and then accelerates back down. The position of the block is drawn every few seconds, resulting in the image on the right. Your task is to copy this image as good as possible, in as few lines of code as you can.',
							speed: 100,
							original: function(anim) {
								for (var y=1; y<=10; y++) {
									var text = '';
									for (var x=1; x<=5; x++) {
										text += (x*y) + '\t';
									}
									anim.push(text + '\n');
								}
								return anim;
							}
						}, this),
						new dares.ImageMatchDare({
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
						new dares.ImageMatchDare({
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
			var $tab = $('<li id="tab-button-' + name + '"><a href="#tab-' + name + '" id="tab-link-' + name + '" data-toggle="tab"><i class="' + this.icons[name] + ' icon-white"></i> ' + name + '</a></li>');
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
			this.canvas = new output.Canvas($('#canvas'), this.editor, 540);
			this.scope.canvas = this.canvas.getAugmentedObject();
			this.editor.setScope(this.scope);
			return this.canvas;
		},

		addRobot: function() {
			this.addTab('robot');
			this.robot = new output.Robot($('#robot'), this.editor, 8, 8);
			this.scope.robot = this.robot.getAugmentedObject();
			this.editor.setScope(this.scope);

			$('#tab-link-robot').click($.proxy(function() {
				setTimeout($.proxy(function() {
					this.robot.makeActive();
				}, this), 0);
			}, this));

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
			if (window.localStorage.getItem('initial-robot') !== null) {
				this.robot.setState(window.localStorage.getItem('initial-robot'));
			}
			this.robot.setStateChangedCallback(function(state) {
				window.localStorage.setItem('initial-robot', state);
			});
			this.editor.setText(window.localStorage.getItem('initial-code') || '');
			this.editor.setTextChangeCallback(function(text) {
				window.localStorage.setItem('initial-code', text);
			});
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
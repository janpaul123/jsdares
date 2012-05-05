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

			this.dares = new dares.Dares($('#dares-popup'), dares.getContent(this));

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

			$('#tab-link-console').click($.proxy(function() {
				setTimeout($.proxy(function() {
					this.console.makeActive();
				}, this), 0);
			}, this));

			return this.console;
		},

		addCanvas: function(size) {
			this.addTab('canvas');
			this.canvas = new output.Canvas($('#canvas'), this.editor, size || 540);
			this.scope.canvas = this.canvas.getAugmentedObject();
			this.editor.setScope(this.scope);
			return this.canvas;
		},

		addRobot: function(width, height) {
			this.addTab('robot');
			this.robot = new output.Robot($('#robot'), this.editor, width || 8, height || 8);
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
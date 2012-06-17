/*jshint node:true jquery:true*/
"use strict";

var jsmm = require('../jsmm');
var editor = require('../editor');
var dares = require('../dares');
var info = require('../info');

module.exports = function(output) {
	output.UI = function() { return this.init.apply(this, arguments); };
	output.UI.prototype = {
		icons: {dare: 'icon-file', console: 'icon-list-alt', canvas: 'icon-picture', robot: 'icon-th', info: 'icon-info-sign'},
		outputNames: ['robot', 'console', 'canvas', 'info', 'dare', 'input', 'math', 'editor'],

		init: function() {
			for (var i=0; i<this.outputNames.length; i++) {
				this[this.outputNames[i]] = null;
			}

			this.$main = $('#main');
			this.initTabs();
			this.loadInitial();

			/*
			this.dares = new dares.Dares($('#dares-popup'), dares.getContent(this));

			$('#start-dare, #switch-dare').click($.proxy(function() {
				this.dares.show();
			}, this));

			$('#abort-dare').click($.proxy(function() {
				this.loadInitial();
			}, this));
			*/
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
			for (var i=0; i<this.outputNames.length; i++) {
				if (this[this.outputNames[i]] !== null) {
					this[this.outputNames[i]].remove();
					this[this.outputNames[i]] = null;
				}
			}
			this.scope = {};
			this.outputs = [];
			this.$tabs.children('li').remove();
			this.$content.children('div').remove();
			this.$main.removeClass('ui-dares-active');
			this.tabs = [];
		},

		addTab: function(name) {
			var $tab = $('<li id="tab-button-' + name + '"><a href="#tab-' + name + '" id="tab-link-' + name + '"><i class="' + this.icons[name] + ' icon-white"></i> ' + name + '</a></li>');
			setTimeout(function() { $tab.addClass('tab-button-enabled'); }, 50*this.tabs.length);
			this.$tabs.append($tab);

			var $pane = $('<div class="tab-pane" id="tab-' + name + '"><div id="' + name + '" class="tab-output"></div></div>');
			this.$content.append($pane);

			$('#tab-link-' + name).click($.proxy(function(event) {
				event.preventDefault();
				this.selectTab(name);
			}, this));

			if (this.tabs.length === 0) {
				$pane.addClass('active');
			}

			this.tabs.push(name);
		},

		addEditor: function() {
			this.editor = new editor.Editor(jsmm, $('#editor'), $('#editor-bar'));
			return this.editor;
		},

		addRobot: function(readOnly, width, height) {
			this.addTab('robot');
			this.robot = new output.Robot($('#robot'), this.editor, readOnly, width, height);
			this.outputs.push(this.robot);
			this.scope.robot = this.robot.getAugmentedObject();
			return this.robot;
		},

		addConsole: function() {
			this.addTab('console');
			this.console = new output.Console($('#console'), this.editor);
			this.outputs.push(this.console);
			this.scope.console = this.console.getAugmentedObject();
			return this.console;
		},

		addCanvas: function(size) {
			this.addTab('canvas');
			this.canvas = new output.Canvas($('#canvas'), this.editor, size || 540);
			this.outputs.push(this.canvas);
			this.scope.canvas = this.canvas.getAugmentedObject();
			return this.canvas;
		},

		addInfo: function(commandFilter) {
			this.addTab('info');
			this.info = new info.Info($('#info'), this.editor, commandFilter);
			this.outputs.push(this.info);
			return this.robot;
		},

		addDare: function(dare) {
			this.addTab('dare');
			this.dare = dare;
			dare.makeActive($('#dare'), this);
			this.$main.addClass('ui-dares-active');
			return this.dare;
		},

		addInput: function(mouseObjects) {
			this.input = new output.Input(this.editor);
			this.outputs.push(this.input);
			this.scope.document = this.input.getAugmentedDocumentObject();
			this.scope.window = this.input.getAugmentedWindowObject();

			mouseObjects = mouseObjects || [];
			for (var i=0; i<mouseObjects.length; i++) {
				var name = mouseObjects[i];
				this.input.addMouseEvents(this[name].getMouseElement(), name, this.scope[name]);
			}

			return this.input;
		},

		addMath: function() {
			this.math = new output.Math();
			this.outputs.push(this.math);
			this.scope.Math = this.math.getAugmentedObject();
			return this.math;
		},

		finish: function() {
			var runner = new jsmm.Runner(this.editor, this.scope, {});
			this.editor.updateSettings(runner, this.outputs);
			this.selectTab(this.tabs[0]);
		},

		selectTab: function(name) {
			this.$content.children('.active').removeClass('active');
			this.$tabs.children('ul li.active').removeClass('active');
			$('#tab-button-' + name).addClass('active');
			$('#tab-' + name).addClass('active');
			if (this[name].setFocus !== undefined) this[name].setFocus();
		},

		loadInitial: function() {
			this.removeAll();
			this.addEditor();
			this.addRobot();
			this.addConsole();
			this.addCanvas();
			this.addInfo();
			this.addInput(['robot', 'console', 'canvas']);
			this.addMath();
			this.finish();

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
		}
	};
};
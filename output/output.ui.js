/*jshint node:true jquery:true*/
"use strict";

var jsmm = require('../jsmm');
var editor = require('../editor');
var dares = require('../dares');
var info = require('../info');

module.exports = function(output) {
	output.Home = function() { return this.init.apply(this, arguments); };
	output.Home.prototype = {
		init: function(ui, $div) {
			this.ui = ui;
			this.$div = $div;
			this.$content = $('<div class="home-content"></div>');
			this.$div.append(this.$content);

			this.$content.append('<h2>JSdare prototype</h2>');

			this.$content.append('<p><strong>Hello my friend!</strong> What you see here is an attempt to realise a vision of programming eduction. A vision of children learning programming by building what they like: games. In a way that can be used outside of this platform as well. In a way that lets them truly experience the deep connection between the code and its meaning. </p>');

			this.$dareButton = $('<button class="btn btn-success">Try some dares</button>');
			this.$dareButton.on('click', $.proxy(this.ui.dares.show, this.ui.dares));

			this.$content.append($('<p>The exercises are called <strong>dares</strong>, and you can try a few of them. The idea is to be able to turn every piece of code into a dare, and share this.</p>').append($('<div></div>').append(this.$dareButton)));

			this.$example1 = $('<button class="btn btn-inverse">Robot example</button>');
			this.$example1.on('click', $.proxy(function() {
				this.ui.editor.setText(this.ui.editor.getText() + '\n\nwhile(!robot.detectGoal()) {\n  robot.turnLeft();\n  while (robot.detectWall()) {\n    robot.turnRight();\n  }\n  robot.drive();\n}');
			}, this));
			this.$example2 = $('<button class="btn btn-inverse">Canvas example</button>');
			this.$example2.on('click', $.proxy(function() {
				this.ui.editor.setText(this.ui.editor.getText() + '\n\n');
			}, this));
			this.$example3 = $('<button class="btn btn-inverse">Console example</button>');
			this.$example3.on('click', $.proxy(function() {
				this.ui.editor.setText(this.ui.editor.getText() + '\n\nfunction printLine(n) {\n  var text = "";\n  for (var i=1; i<10; i++) {\n    text += (i*n) + "\t";\n  }\n  console.log(text);\n}\nfor (var i=1; i<25; i++) { \n  console.setColor("hsla(" + i*15 + ", 75%, 50%, 1)");\n  printLine(i);\n}');
			}, this));

			this.$exampleBar = $('<div class="btn-group"></div>');
			this.$exampleBar.append(this.$example1).append(this.$example2).append(this.$example3);

			this.$content.append($('<p>You can also load up some examples. They are inserted at the bottom of code.</p>').append(this.$exampleBar));

			this.$content.append('<p class="upline">A lot here comes from the first part of Bret Victor\'s recent talk, <a hreft="http://www.youtube.com/watch?v=PUv66718DII" target="_blank">Inventing on Principle</a>, with immediate results, manipulation, highlighting, and abstraction. While his vision is aimed at a general set of applications, it applies to education very well. Here you find a complete implementation of this, running in your browser. I also stole his jumping slider, by the way. ;-) Besides this, you\'ll see a powerful stepping tool, for both debugging, and better understanding. There is also a visualisation of the current scope, and a command reference. The error messages should hopefully be quite friendly. Besides the standard console and canvas environment, you can use the robot environment, based on the <a href="http://en.wikipedia.org/wiki/Turtle_graphics" target="_blank">LOGO turtle</a> and <a href="http://en.wikipedia.org/wiki/Karel_(programming_language)" target="_blank">Karel the robot</a>. Finally, you can do some exercises, inspired on <a href="http://en.wikipedia.org/wiki/Code_golf" target="_blank">code golf</a>.</p>');
		},

		remove: function() {
			this.$div.remove();
		}
	};

	output.UI = function() { return this.init.apply(this, arguments); };
	output.UI.prototype = {
		icons: {dare: 'icon-file', console: 'icon-list-alt', canvas: 'icon-picture', robot: 'icon-th', info: 'icon-info-sign', home: 'icon-home'},
		outputNames: ['robot', 'console', 'canvas', 'info', 'dare', 'input', 'math', 'home', 'editor'],

		init: function() {
			for (var i=0; i<this.outputNames.length; i++) {
				this[this.outputNames[i]] = null;
			}

			this.$main = $('#main');
			this.initTabs();

			this.dares = new dares.Dares($('#dares-popup'), dares.getContent(this));

			$('#switch-dare').click($.proxy(function() {
				this.dares.show();
			}, this));

			$('#abort-dare').click($.proxy(function() {
				this.loadInitial();
			}, this));

			this.loadInitial();
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

		addHome: function() {
			this.addTab('home');
			this.home = new output.Home(this, $('#home'));
			return this.home;
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
			this.addHome();
			this.addRobot();
			this.addConsole();
			this.addCanvas();
			this.addInfo();
			this.addInput(['canvas']);
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
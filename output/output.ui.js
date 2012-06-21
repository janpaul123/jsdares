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

			this.$content.append('<h2>Javascript Dare prototype</h2>');

			this.$content.append('<p><strong>Hello my friend!</strong> What you see here is an attempt to realise a vision of programming eduction. A vision of children learning programming by building what they like: games. The process to get there is by doing small programming exercises, themselves presented as games. We call them <strong>dares</strong>.</p>');

			this.$dareButton = $('<button class="btn btn-success">Example dares</button>');
			this.$dareButton.on('click', $.proxy(this.ui.dares.show, this.ui.dares));

			this.$content.append($('<p>You can try a few dares here, although these are just simple examples. The idea is to be able to turn every piece of code into a dare, and share this.</p>').append($('<div></div>').append(this.$dareButton)));

			this.$example1 = $('<button class="btn btn-inverse"><i class="icon-th icon-white"></i> Robot example</button>');
			this.$example1.on('click', $.proxy(function() {
				this.ui.editor.setText(this.ui.editor.getText() + '\n\n// ROBOT EXAMPLE\nwhile(!robot.detectGoal()) {\n  robot.turnLeft();\n  while (robot.detectWall()) {\n    robot.turnRight();\n  }\n  robot.drive();\n}');
			}, this));
			this.$example2 = $('<button class="btn btn-inverse"><i class="icon-picture icon-white"></i> Canvas example</button>');
			this.$example2.on('click', $.proxy(function() {
				this.ui.editor.setText(this.ui.editor.getText() + '\n\n// CANVAS EXAMPLE\n// Adapted from billmill.org/static/canvastutorial\nvar context = canvas.getContext("2d");\nvar paddleX = canvas.width/2;\nvar paddleDirection = 0;\nvar paddleWidth = 80;\nvar paddleHeight = 12;\nvar paddleSpeed = 5;\nvar ballX = 110;\nvar ballY = 150;\nvar ballVx = 7;\nvar ballVy = 12;\nvar gameOver = false;\nvar bricks = [];\nvar bricksNumX = 7;\nvar bricksNumY = 5;\nvar brickWidth = canvas.width / bricksNumX;\nvar brickHeight = 20;\nvar brickMargin = 4;\nvar brickCount = bricksNumX*bricksNumY;\n\nfunction clear() {\n  context.clearRect(0, 0, canvas.width, canvas.height);  \n}\n\nfunction circle(x, y) {\n  context.beginPath();\n  context.arc(x, y, 10, 0, 2*Math.PI);\n  context.fill();\n}\n\nfunction drawPaddle() {\n  var x = paddleX - paddleWidth/2;\n  var y = canvas.height - paddleHeight;\n  context.fillRect(x, y, paddleWidth, paddleHeight);\n}\n\nfunction mouseMove(event) {\n  paddleX = event.layerX;\n}\n\nfunction hitHorizontal() {\n  if (ballX < 0) {\n    ballVx = -ballVx;\n  } else if (ballX >= canvas.width) {\n    ballVx = -ballVx;\n  }\n}\n\nfunction hitVertical() {\n  if (ballY < 0) {\n    ballVy = -ballVy;\n  } else if (ballY < brickHeight*bricksNumY) {\n    var bx = Math.floor(ballX/brickWidth);\n    var by = Math.floor(ballY/brickHeight);\n    \n    if (bx >= 0 && bx < bricksNumX) {\n      if (bricks[by][bx]) {\n        bricks[by][bx] = false;\n        ballVy = -ballVy;\n        brickCount--;\n        if (brickCount <= 0) {\n          finish(true);\n        }\n      }\n    }\n  } else if (ballY >= canvas.height-paddleHeight) {\n    var paddleLeft = paddleX-paddleWidth/2;\n    var paddleRight = paddleX+paddleWidth/2;\n    if (ballX >= paddleLeft && ballX <= paddleRight) {\n      ballVy = -ballVy;\n    } else {\n      finish(false);\n    }\n  }\n}\n\nfunction initBricks() {\n  for (var y=0; y<bricksNumY; y++) {\n    bricks[y] = [];\n    for (var x=0; x<bricksNumX; x++) {\n      bricks[y][x] = true;\n    }\n  }\n}\n\nfunction drawBricks() {\n  for (var by=0; by<bricksNumY; by++) {\n    for (var bx=0; bx<bricksNumX; bx++) {\n      if (bricks[by][bx]) {\n        var x = bx * brickWidth + brickMargin/2;\n        var y = by * brickHeight + brickMargin/2;\n        var width = brickWidth - brickMargin;\n        var height = brickHeight - brickMargin;\n        context.fillRect(x, y, width, height);\n      }\n    }\n  }\n}\n\nfunction finish(won) {\n  gameOver = true;\n  context.font = "40pt Calibri";\n  if (won) {\n    context.strokeStyle = "#0a0";\n    context.strokeText("Well done!", 130, 200);\n  } else {\n    context.strokeStyle = "#a00";\n    context.strokeText("GAME OVER", 130, 200);\n  }\n}\n\nfunction tick() {\n  if (gameOver) {\n    return;\n  }\n  clear();\n  drawPaddle();\n  \n  ballX += ballVx;\n  ballY += ballVy;\n  hitHorizontal();\n  hitVertical();\n  \n  circle(ballX, ballY);\n  drawBricks();\n}\n\ninitBricks();\ncanvas.onmousemove = mouseMove;\nwindow.setInterval(tick, 30);');
			}, this));
			this.$example3 = $('<button class="btn btn-inverse"><i class="icon-list-alt icon-white"></i> Console example</button>');
			this.$example3.on('click', $.proxy(function() {
				this.ui.editor.setText(this.ui.editor.getText() + '\n\n//CONSOLE EXAMPLE\n\nfunction printLine(n) {\n  var text = "";\n  for (var i=1; i<=8; i++) {\n    text += (i*n) + "\\t";\n  }\n  console.log(text);\n}\nfor (var i=1; i<=20; i++) { \n  console.setColor("hsla(" + i*15 + ", 75%, 50%, 1)");\n  printLine(i);\n}');
			}, this));

			this.$exampleBar = $('<div class="btn-group"></div>');
			this.$exampleBar.append(this.$example1).append(this.$example2).append(this.$example3);

			this.$content.append($('<p>You can also load up some <strong>examples</strong>. They are inserted at the bottom of code.</p>').append(this.$exampleBar));

			this.$mazeOn = $('<button class="btn btn-inverse"><i class="icon-th icon-white"></i> Insert robot maze</button>');
			this.$mazeOn.on('click', $.proxy(function() {
				this.ui.robot.setState("{\"columns\":8,\"rows\":8,\"initialX\":3,\"initialY\":4,\"initialAngle\":90,\"mazeObjects\":50,\"verticalActive\":[[false,false,false,false,false,false,false,false],[false,false,true,true,true,false,true,false],[false,true,false,false,true,false,false,true],[false,false,true,true,false,false,true,false],[false,true,true,false,false,false,false,false],[false,false,false,true,false,true,true,false],[false,false,true,false,true,true,false,false],[false,false,false,true,true,true,true,false]],\"horizontalActive\":[[false,true,false,false,true,false,false,true],[false,true,false,true,false,false,true,false],[false,true,true,false,true,false,true,false],[false,true,false,false,true,true,true,false],[false,false,true,true,false,true,false,true],[false,true,false,false,true,false,false,true],[false,true,true,true,false,false,false,true],[false,true,true,false,false,false,false,false]],\"blockGoal\":[[false,false,false,true,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],\"numGoals\":1}");
			}, this));
			this.$mazeOff = $('<button class="btn btn-inverse"><i class="icon-ban-circle icon-white"></i> Clear robot maze</button>');
			this.$mazeOff.on('click', $.proxy(function() {
				this.ui.robot.setState("{\"columns\":8,\"rows\":8,\"initialX\":3,\"initialY\":4,\"initialAngle\":90,\"mazeObjects\":0,\"verticalActive\":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],\"horizontalActive\":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],\"blockGoal\":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],\"numGoals\":0}");
			}, this));

			this.$mazeBar = $('<div class="btn-group"></div>');
			this.$mazeBar.append(this.$mazeOn).append(this.$mazeOff);

			this.$content.append($('<p>The <strong>robot example</strong> works best if you put a nice maze in place.</p>').append(this.$mazeBar));

			this.$content.append('<p>This works best on the latest versions of <strong>Chrome</strong> and <strong>Firefox</strong>. Please send any bugs, suggestions, and other comments to <a href="mailto:jsdare@janpaulposma.nl">jsdare@janpaulposma.nl</a>. <strong>Thanks!</strong></p>');

			this.$content.append('<h3>Principles</h3><p>There are a few principles underlying this project. First, I believe that building <strong>games</strong> is one of the most motivating things children can do to learn programming. For us it is not directly the goal, however, but merely a <strong>tool</strong>. It allows us to seamlessly <strong>connect</strong> to other fields, such as maths and physics, in a context that is <strong>meaningful</strong> for children. To teach the basics, an interesting and engaging environment can be by simulating <strong>robots</strong>, which can also connect with actual robot classes being given at some schools.</p> <p>Also important is that they learn a <strong>real skill</strong>, something that can be used outside of this platform as well. On the other hand the language is somewhat <strong>restricted</strong>, to avoid them feeling overwhelmed. And, in the case of Javascript, to avoid the really bad parts of the language.</p> <p>Another real skill is being able to <strong>search</strong> for documentation and examples online, which is why only a concise command reference is given. Teachers and children should be <strong>in charge</strong>, which means that they should be able to design dares themselves and <strong>share</strong> them with peers.</p> <p>And all this in a way that lets them truly <strong>experience</strong> the deep connection between the code and its meaning. This means they must have tools to <strong>explore</strong> the language and computational space, even though in real life this is (unfortunately) not always possible. It is most important that students develop an accurate <strong>intuition</strong>.</p>');

			this.$content.append('<h3>Features</h3><p>A lot of features come from the first part of <strong>Bret Victor\'s</strong> recent talk, <a href="http://www.youtube.com/watch?v=PUv66718DII" target="_blank">Inventing on Principle</a>, with immediate results, manipulation, highlighting, and abstraction. While his vision is aimed at a general set of applications, it applies to education very well. Here you find a complete <strong>implementation</strong> of this, running in your browser.<br><small>(By the way, I also stole his jumping slider.)</small></p> <p>Also, you\'ll find a <strong>stepping</strong> tool, for both debugging, and better understanding. There is a visualisation of the current <strong>scope</strong>, and a command <strong>reference</strong>. The <strong>error messages</strong> should hopefully be quite friendly.</p> <p>Besides the standard console and canvas environment, you can use the <strong>robot</strong> environment, based on the <a href="http://en.wikipedia.org/wiki/Turtle_graphics" target="_blank">LOGO turtle</a> and <a href="http://en.wikipedia.org/wiki/Karel_(programming_language)" target="_blank">Karel the robot</a>. Finally, you can do some <strong>dares</strong>, inspired on <a href="http://en.wikipedia.org/wiki/Code_golf" target="_blank">code golf</a>.</p>');

			this.$content.append('<h3>Roadmap</h3><p><ul><li>Sharing programs and dares, collaborating on them, etc.</li><li>Develop more predefined dares.</li><li>Performance optimisations.</li><li>Better manipulation and abstraction features for exploring programs.</li><li>History of code; undo/redo.<li>&#8230;? For any ideas please contact me at <a href="mailto:jsdare@janpaulposma.nl">jsdare@janpaulposma.nl</a>.</li></ul></p>');
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
			this.outputs.push(this.dare);
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

			this.editor.setText(window.localStorage.getItem('initial-code') || '');
			this.editor.setTextChangeCallback(function(text) {
				window.localStorage.setItem('initial-code', text);
			});
			if (window.localStorage.getItem('initial-robot') !== null) {
				this.robot.setState(window.localStorage.getItem('initial-robot'));
			}
			this.robot.setStateChangedCallback(function(state) {
				window.localStorage.setItem('initial-robot', state);
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
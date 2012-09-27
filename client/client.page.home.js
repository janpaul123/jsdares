/*jshint node:true jquery:true*/
"use strict";

var applet = require('../jsmm-applet');
var dares = require('../dares');

module.exports = function(client) {
	client.PageHome = function() { return this.init.apply(this, arguments); };
	client.PageHome.prototype = {
		type: 'PageHome',

		init: function(delegate, $div) {
			this.delegate = delegate;
			this.$div = $div;

			this.modalUI = new applet.UI();
			this.modalUI.setCloseCallback(this.closeCallback.bind(this));
			
			this.$example = $('<div class="example"><div class="example-text-top"><div class="example-arrow"></div>Make your own <strong>games</strong> by learning Javascript programming!</div><div class="example-text-bottom"><div class="example-arrow"></div><strong>Anyone</strong> can learn how to write code like this.</div></div>');
			this.$exampleGame = $('<div class="example-game"></div>');
			this.$example.append(this.$exampleGame);
			this.$div.append(this.$example);

			this.exampleUI = new applet.UI(this.$exampleGame, {hideTabs: true});
			var exampleText = '// Adapted from billmill.org/static/canvastutorial\nvar context = canvas.getContext("2d");\n\nvar paddleWidth = 80;\nvar paddleHeight = 12;\nvar bricks = [];\nvar bricksNumX = 7;\nvar bricksNumY = 5;\nvar brickWidth = canvas.width / bricksNumX;\nvar brickHeight = 20;\nvar brickMargin = 4;\nvar paddleX;\nvar ballX, ballY, ballVx, ballVy;\n\nfor (var y=0; y<bricksNumY; y++) {\n  bricks[y] = [];\n  for (var x=0; x<bricksNumX; x++) {\n    bricks[y][x] = true;\n  }\n}\n\nfunction init() {\n  paddleX = canvas.width/2;\n  ballX = 40;\n  ballY = 150;\n  ballVx = 7;\n  ballVy = 12;\n  for (var y=0; y<bricksNumY; y++) {\n    for (var x=0; x<bricksNumX; x++) {\n      bricks[y][x] = true;\n    }\n  }\n}\n\nfunction clear() {\n  context.clearRect(0, 0, canvas.width, canvas.height);  \n}\n\nfunction circle(x, y) {\n  context.beginPath();\n  context.arc(x, y, 10, 0, 2*Math.PI);\n  context.fill();\n}\n\nfunction drawPaddle() {\n  var x = paddleX - paddleWidth/2;\n  var y = canvas.height - paddleHeight;\n  context.fillRect(x, y, paddleWidth, paddleHeight);\n}\n\nfunction mouseMove(event) {\n  paddleX = event.layerX;\n}\n\nfunction hitHorizontal() {\n  if (ballX < 0) {\n    ballVx = -ballVx;\n  } else if (ballX >= canvas.width) {\n    ballVx = -ballVx;\n  }\n}\n\nfunction hitVertical() {\n  if (ballY < 0) {\n    ballVy = -ballVy;\n  } else if (ballY < brickHeight*bricksNumY) {\n    var bx = Math.floor(ballX/brickWidth);\n    var by = Math.floor(ballY/brickHeight);\n    \n    if (bx >= 0 && bx < bricksNumX) {\n      if (bricks[by][bx]) {\n        bricks[by][bx] = false;\n        ballVy = -ballVy;\n      }\n    }\n  } else if (ballY >= canvas.height-paddleHeight) {\n    var paddleLeft = paddleX-paddleWidth/2;\n    var paddleRight = paddleX+paddleWidth/2;\n    if (ballX >= paddleLeft && ballX <= paddleRight) {\n      ballVy = -ballVy;\n    } else {\n      init();\n      return false;\n    }\n  }\n  return true;\n}\n\nfunction drawBricks() {\n  for (var by=0; by<bricksNumY; by++) {\n    for (var bx=0; bx<bricksNumX; bx++) {\n      if (bricks[by][bx]) {\n        var x = bx * brickWidth + brickMargin/2;\n        var y = by * brickHeight + brickMargin/2;\n        var width = brickWidth - brickMargin;\n        var height = brickHeight - brickMargin;\n        context.fillRect(x, y, width, height);\n      }\n    }\n  }\n}\n\nfunction tick() {\n  clear();\n  drawPaddle();\n  \n  ballX += ballVx;\n  ballY += ballVy;\n  \n  hitHorizontal();\n  if (hitVertical()) {\n    circle(ballX, ballY);\n    drawBricks();\n  } else {\n    clear();\n  }\n}\n\ninit();\ncanvas.onmousemove = mouseMove;\nwindow.setInterval(tick, 30);';
			this.exampleEditor = this.exampleUI.addEditor({text: exampleText});
			this.exampleUI.loadOutputs(['canvas', 'events', 'math'], { canvas: {}, events: {mouseObjects: ['canvas']}, math: {} });
			this.exampleUI.selectTab('canvas');

			$('.example-text-top').css('margin-left', -$('.example-text-top').width()/2);
			$('.example-text-bottom').css('margin-left', -$('.example-text-bottom').width()/2);

			this.$how = $('<div class="how"><div class="how-header">getting started</div><div class="how-text"><div class="how-text-1">You learn programming by completing <strong>dares</strong>. These are short puzzles in which you have to copy the example, in as few lines of code as possible. They start simple, and become more difficult as you progress.</div><div class="how-text-2"><!-- Get started with learning the <strong>basics</strong> of programming. If you already know some programming, you can take an <strong>interface</strong> crash course. Or just <strong>discover</strong> all the dares! --> For now we only provide a number of <strong>examples</strong>. In the future we will provide some collections of dares to start with, and you will also be able to make and share your own dares. You can also play around in the <strong>full editor</strong>.</div></div></div>');
			this.$div.append(this.$how);

			this.$intro = $('<div class="intro"></div>');
			this.$arrow = $('<div class="arrow arrow-left arrow-animate-infinity intro-arrow"><div class="arrow-head"></div><div class="arrow-body"></div></div>');
			this.$intro.append(this.$arrow);
			this.$arrow.hide();

			var $collection1 = $('<div class="intro-collection1"></div>');
			this.collection1 = new dares.Collection(this, $collection1);
			this.$intro.append($collection1);

			var $collection2 = $('<div class="intro-collection2"></div>');
			this.collection2 = new dares.Collection(this, $collection2);
			this.$intro.append($collection2);

			this.$introButton = $('<button class="intro-full-editor btn btn-large">Open full editor</button>');
			this.$introButton.on('click', (function(event) { this.delegate.navigateTo('/full'); }).bind(this));
			this.$intro.append(this.$introButton);
			this.$div.append(this.$intro);

			this.fullEditor = null;

			this.updateCollections();
		},

		remove: function() {
			this.exampleUI.remove();
			this.collection1.remove();
			this.collection2.remove();
			this.$example.remove();
			this.$how.remove();
			this.$intro.remove();
		},

		getSync: function() {
			return this.delegate.getSync();
		},

		viewDare: function(_id) {
			this.delegate.navigateTo('/dare/' + _id);
		},

		editDare: function(_id) {
			this.delegate.navigateTo('/edit/' + _id);
		},

		updateCollections: function() {
			this.delegate.getSync().getCollectionAndDaresAndInstances('5009684ce78955fbcf405844', (function(content) {
				this.collection1.update(content, this.delegate.getUserId());
				if (!content.dares[0].instance || !content.dares[0].instance.completed) {
					if (this.$arrow !== null) this.$arrow.show();
				}
			}).bind(this));
			this.delegate.getSync().getCollectionAndDaresAndInstances('30000000078955fbcf405844', (function(content) {
				this.collection2.update(content, this.delegate.getUserId());
			}).bind(this));
		},

		closeCallback: function() {
			this.delegate.navigateTo('/');
		},

		navigateTo: function(splitUrl) {
			if (this.$arrow !== null && splitUrl[0] !== '') {
				this.$arrow.remove();
				this.$arrow = null;
			}

			window.bla = this.exampleEditor;

			if (splitUrl[0] === 'dare' || splitUrl[0] === 'edit') {
				this.exampleEditor.disable();
				this.closeModal();
			} else if (splitUrl[0] === 'full') {
				this.exampleEditor.disable();
				this.navigateFullEditor();
			} else {
				this.exampleEditor.enable();
				this.closeModal();
				this.updateCollections();
			}
		},

		navigateFullEditor: function() {
			if (localStorage.getItem('initial-code') === null) {
				localStorage.setItem('initial-code', '// ROBOT EXAMPLE\nwhile(!robot.detectGoal()) {\n  robot.turnLeft();\n  while (robot.detectWall()) {\n    robot.turnRight();\n  }\n  robot.drive();\n}\n\n//CONSOLE EXAMPLE\nconsole.setColor("#fff");\nconsole.log("A colourful multiplication table:");\nconsole.log();\n\nfunction printLine(n) {\n  var text = "";\n  for (var i=1; i<=8; i++) {\n    text += (i*n) + "\\t";\n  }\n  console.log(text);\n}\n\nfor (var i=1; i<=20; i++) { \n  console.setColor("hsla(" + i*15 + ", 75%, 50%, 1)");\n  printLine(i);\n}\n\nconsole.setColor("#ed7032");\nconsole.log();\nconsole.log(":-D");\n\n');
			}

			if (localStorage.getItem('initial-robot') === null) {
				localStorage.setItem('initial-robot', '{"columns":8,"rows":8,"initialX":3,"initialY":4,"initialAngle":90,"mazeObjects":50,"verticalActive":[[false,false,false,false,false,false,false,false],[false,false,true,true,true,false,true,false],[false,true,false,false,true,false,false,true],[false,false,true,true,false,false,true,false],[false,true,true,false,false,false,false,false],[false,false,false,true,false,true,true,false],[false,false,true,false,true,true,false,false],[false,false,false,true,true,true,true,false]],"horizontalActive":[[false,true,false,false,true,false,false,true],[false,true,false,true,false,false,true,false],[false,true,true,false,true,false,true,false],[false,true,false,false,true,true,true,false],[false,false,true,true,false,true,false,true],[false,true,false,false,true,false,false,true],[false,true,true,true,false,false,false,true],[false,true,true,false,false,false,false,false]],"blockGoal":[[false,false,false,true,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"numGoals":1}');
			}

			this.modalUI.openModal();
			this.fullEditor = this.modalUI.addEditor({text: localStorage.getItem('initial-code')});
			this.fullEditor.setTextChangeCallback(function(text) {
				localStorage.setItem('initial-code', text);
			});
			this.modalUI.loadOutputs(['robot', 'canvas', 'console', 'info', 'events', 'math'], {
				robot: {state: localStorage.getItem('initial-robot')}, canvas: {}, console: {}, info: {}, events: {mouseObjects: ['canvas']}, math: {}
			});
			this.modalUI.getOutput('robot').setStateChangeCallback(function(state) {
				localStorage.setItem('initial-robot', state);
			});
			this.modalUI.selectTab('robot');
		},

		closeModal: function() {
			if (this.fullEditor !== null) {
				this.fullEditor = null;
				this.modalUI.closeModal();
			}
		}
	};
};
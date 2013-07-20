/*jshint node:true jquery:true*/
"use strict";

module.exports = function(client) {
	client.getPageHomeHtml = function() {
		return client.PageHome.prototype.about + client.PageHome.prototype.how + client.PageHome.prototype.now;
	};

	client.PageHome = function() { return this.init.apply(this, arguments); };
	client.PageHome.prototype = {
		type: 'PageHome',

		init: function(delegate, $div) {
			var applet = require('../jsmm-applet');
			var dares = require('../dares');

			this.delegate = delegate;
			this.$div = $div;

			this.$aboutText = $(this.about);
			this.$aboutText.find('.homepage-blindfold-link').on('click', _(function(e) { e.preventDefault(); this.delegate.navigateTo('/blindfold'); }).bind(this));
			this.$div.append(this.$aboutText);

			this.modalUI = new applet.UI();
			this.modalUI.setCloseCallback(_(this.closeCallback).bind(this));

			this.$example = $('<div class="example"></div>');
			this.$div.append(this.$example);

			this.exampleUI = new applet.UI(this.$example, {hideTabs: true});
			var exampleText = '// Adapted from billmill.org/static/canvastutorial\n// This code is still relatively complicated -- if you\n// can come up with a nice game for on the front page\n// which is fun, simple, and shows off the capabilities\n// of the interface, then contact me at jp@jsdares.com :)\n\nvar context = canvas.getContext("2d");\n\nvar bricks = [];\nvar paddleWidth, paddleHeight, bricksNumX, bricksNumY;\nvar brickWidth, brickHeight, brickMargin, paddleX;\nvar ballX, ballY, ballVx, ballVy, ballDirx, ballDiry;\nvar restart = true;\n\nfor (var y=0; y<20; y++) {\n  bricks[y] = [];\n  for (var x=0; x<20; x++) {\n    bricks[y][x] = true;\n  }\n}\n\nfunction setValues() {\n  paddleWidth = 80;\n  paddleHeight = 12;\n  bricksNumX = 7;\n  bricksNumY = 5;\n  brickWidth = canvas.width / bricksNumX;\n  brickHeight = 20;\n  brickMargin = 4;\n  ballVx = 7;\n  ballVy = 12;\n}\n\nfunction init() {\n  restart = false;\n  paddleX = canvas.width/2;\n  ballX = 40;\n  ballY = 150;\n  ballDirx = 1;\n  ballDiry = 1;\n  for (var y=0; y<13; y++) {\n    for (var x=0; x<13; x++) {\n      bricks[y][x] = true;\n    }\n  }\n}\n\nfunction clear() {\n  context.clearRect(0, 0, canvas.width, canvas.height);  \n}\n\nfunction circle(x, y) {\n  context.beginPath();\n  context.arc(x, y, 10, 0, 2*Math.PI);\n  context.fill();\n}\n\nfunction drawPaddle() {\n  var x = paddleX - paddleWidth/2;\n  var y = canvas.height - paddleHeight;\n  context.fillRect(x, y, paddleWidth, paddleHeight);\n}\n\nfunction mouseMove(event) {\n  paddleX = event.layerX;\n}\n\nfunction hitHorizontal() {\n  if (ballX < 0) {\n    ballDirx = -ballDirx;\n  } else if (ballX >= canvas.width) {\n    ballDirx = -ballDirx;\n  }\n}\n\nfunction hitVertical() {\n  if (ballY < 0) {\n    ballDiry = -ballDiry;\n  } else if (ballY < brickHeight*bricksNumY) {\n    var bx = Math.floor(ballX/brickWidth);\n    var by = Math.floor(ballY/brickHeight);\n    \n    if (bx >= 0 && bx < bricksNumX) {\n      if (bricks[by][bx]) {\n        bricks[by][bx] = false;\n        ballDiry = -ballDiry;\n      }\n    }\n  } else if (ballY >= canvas.height-paddleHeight) {\n    var paddleLeft = paddleX-paddleWidth/2;\n    var paddleRight = paddleX+paddleWidth/2;\n    if (ballX >= paddleLeft && ballX <= paddleRight) {\n      ballDiry = -ballDiry;\n    } else {\n      restart = true;\n      return false;\n    }\n  }\n  return true;\n}\n\nfunction drawBricks() {\n  for (var by=0; by<bricksNumY; by++) {\n    for (var bx=0; bx<bricksNumX; bx++) {\n      if (bricks[by][bx]) {\n        var x = bx * brickWidth + brickMargin/2;\n        var y = by * brickHeight + brickMargin/2;\n        var width = brickWidth - brickMargin;\n        var height = brickHeight - brickMargin;\n        context.fillRect(x, y, width, height);\n      }\n    }\n  }\n}\n\nfunction tick() {\n  if (restart) {\n    init();\n    return;\n  }\n  setValues();\n  clear();\n  drawPaddle();\n  \n  ballX += ballVx*ballDirx;\n  ballY += ballVy*ballDiry;\n  \n  hitHorizontal();\n  if (hitVertical()) {\n    circle(ballX, ballY);\n    drawBricks();\n  } else {\n    clear();\n  }\n}\n\ncanvas.onmousemove = mouseMove;\nwindow.setInterval(tick, 30);';
			this.exampleEditor = this.exampleUI.addEditor({text: exampleText});
			this.exampleUI.loadOutputs({ canvas: {enabled: true}, events: {enabled: true, mouseObjects: ['canvas']}, math: {enabled: true} });
			this.exampleUI.selectTab('canvas');

			$('.example-text-top').css('margin-left', -$('.example-text-top').width()/2);
			$('.example-text-bottom').css('margin-left', -$('.example-text-bottom').width()/2);

			this.$how = $(this.how);
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
			this.$introButton.on('click', _(function(event) { this.delegate.navigateTo('/full'); }).bind(this));
			this.$intro.append(this.$introButton);
			this.$div.append(this.$intro);

			this.$div.append(this.now);

			this.fullEditor = null;

			this.updateCollections();
		},

		about: '<div class="homepage-title">Make your own <strong>games</strong> by learning <strong>JavaScript</strong> programming!</div><p class="homepage-about-text"><strong>jsdares</strong> is an open source proof-of-concept. <a href="/blindfold" class="homepage-blindfold-link">Learn more&hellip;</a><span></p>',
		how: '<div class="how"><div class="how-header">Getting started</div><div class="how-text"><div class="how-text-1">You learn programming by completing <strong>dares</strong>. These are short puzzles in which you have to copy the example, in as few lines of code as possible. They start simple, and become more difficult as you progress.</div><div class="how-text-2"><!-- Get started with learning the <strong>basics</strong> of programming. If you already know some programming, you can take an <strong>interface</strong> crash course. Or just <strong>discover</strong> all the dares! --> For now we only provide a number of <strong>examples</strong>. In the future we will provide some collections of dares to start with, and you will also be able to make and share your own dares. You can also play around in the <strong>full editor</strong>.</div></div></div>',
		now: '<div class="how"><div class="how-header">Now what?</div><div class="how-text"><div class="how-text-1">When are we going to make games? Well, <strong>you have been tricked</strong>. We don\'t have the dares yet to learn how to program games. But feel free to play around with the game at the top of the page: try pausing the game, understanding how it works, and modifying it.</div><div class="how-text-2">If you\'re already an advanced programmer, please <strong>help us</strong> create more dares! It would be great if one day we would have the entire path from learning fundamentals to making games.</div></div></div>',

		remove: function() {
			this.$aboutText.remove();
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
			this.delegate.getSync().getCollectionAndDaresAndInstances('5009684ce78955fbcf405844', _(function(content) {
				this.collection1.update(content, this.delegate.getUserId(), this.delegate.getAdmin());
				if (!content.dares[0].instance || !content.dares[0].instance.completed) {
					if (this.$arrow !== null) this.$arrow.show();
				}
			}).bind(this));
			this.delegate.getSync().getCollectionAndDaresAndInstances('30000000078955fbcf405844', _(function(content) {
				this.collection2.update(content, this.delegate.getUserId(), this.delegate.getAdmin());
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
			this.modalUI.loadOutputs({
				robot: {enabled: true, state: localStorage.getItem('initial-robot')}, canvas: {enabled: true}, console: {enabled: true}, info: {enabled: true}, events: {enabled: true, mouseObjects: ['canvas']}, math: {enabled: true}
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

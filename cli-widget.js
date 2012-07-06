/*jshint node:true jquery:true*/
"use strict";

$(function() {
	var applet = require('jsmm-applet');
	window.applet = applet;

	var dares = require('./dares');

	var $main = $('.example-game');

	var ui = new applet.UI($main, {hideTabs: true});
	window.ui = ui;

	var text = '// CANVAS EXAMPLE\n// Adapted from billmill.org/static/canvastutorial\nvar context = canvas.getContext("2d");\nvar paddleX = canvas.width/2;\nvar paddleDirection = 0;\nvar paddleWidth = 80;\nvar paddleHeight = 12;\nvar paddleSpeed = 5;\nvar ballX = 110;\nvar ballY = 150;\nvar ballVx = 7;\nvar ballVy = 12;\nvar gameOver = false;\nvar bricks = [];\nvar bricksNumX = 7;\nvar bricksNumY = 5;\nvar brickWidth = canvas.width / bricksNumX;\nvar brickHeight = 20;\nvar brickMargin = 4;\nvar brickCount = bricksNumX*bricksNumY;\n\nfunction clear() {\n  context.clearRect(0, 0, canvas.width, canvas.height);  \n}\n\nfunction circle(x, y) {\n  context.beginPath();\n  context.arc(x, y, 10, 0, 2*Math.PI);\n  context.fill();\n}\n\nfunction drawPaddle() {\n  var x = paddleX - paddleWidth/2;\n  var y = canvas.height - paddleHeight;\n  context.fillRect(x, y, paddleWidth, paddleHeight);\n}\n\nfunction mouseMove(event) {\n  paddleX = event.layerX;\n}\n\nfunction hitHorizontal() {\n  if (ballX < 0) {\n    ballVx = -ballVx;\n  } else if (ballX >= canvas.width) {\n    ballVx = -ballVx;\n  }\n}\n\nfunction hitVertical() {\n  if (ballY < 0) {\n    ballVy = -ballVy;\n  } else if (ballY < brickHeight*bricksNumY) {\n    var bx = Math.floor(ballX/brickWidth);\n    var by = Math.floor(ballY/brickHeight);\n    \n    if (bx >= 0 && bx < bricksNumX) {\n      if (bricks[by][bx]) {\n        bricks[by][bx] = false;\n        ballVy = -ballVy;\n        brickCount--;\n        if (brickCount <= 0) {\n          finish(true);\n        }\n      }\n    }\n  } else if (ballY >= canvas.height-paddleHeight) {\n    var paddleLeft = paddleX-paddleWidth/2;\n    var paddleRight = paddleX+paddleWidth/2;\n    if (ballX >= paddleLeft && ballX <= paddleRight) {\n      ballVy = -ballVy;\n    } else {\n      finish(false);\n    }\n  }\n}\n\nfunction initBricks() {\n  for (var y=0; y<bricksNumY; y++) {\n    bricks[y] = [];\n    for (var x=0; x<bricksNumX; x++) {\n      bricks[y][x] = true;\n    }\n  }\n}\n\nfunction drawBricks() {\n  for (var by=0; by<bricksNumY; by++) {\n    for (var bx=0; bx<bricksNumX; bx++) {\n      if (bricks[by][bx]) {\n        var x = bx * brickWidth + brickMargin/2;\n        var y = by * brickHeight + brickMargin/2;\n        var width = brickWidth - brickMargin;\n        var height = brickHeight - brickMargin;\n        context.fillRect(x, y, width, height);\n      }\n    }\n  }\n}\n\nfunction finish(won) {\n  gameOver = true;\n  context.font = "40pt Calibri";\n  if (won) {\n    context.strokeStyle = "#0a0";\n    context.strokeText("Well done!", 130, 200);\n  } else {\n    context.strokeStyle = "#a00";\n    context.strokeText("GAME OVER", 130, 200);\n  }\n}\n\nfunction tick() {\n  if (gameOver) {\n    return;\n  }\n  clear();\n  drawPaddle();\n  \n  ballX += ballVx;\n  ballY += ballVy;\n  hitHorizontal();\n  hitVertical();\n  \n  circle(ballX, ballY);\n  drawBricks();\n}\n\ninitBricks();\ncanvas.onmousemove = mouseMove;\nwindow.setInterval(tick, 30);';

	ui.addEditor({
			hideToolbar: true,
			text: text
		});

	ui.loadOutputs({
			canvas: {},
			input: {mouseObjects: ['canvas']},
			Math: {}
		});

	ui.selectTab('canvas');

	$('.example-text-top').css('margin-left', -$('.example-text-top').width()/2);
	$('.example-text-bottom').css('margin-left', -$('.example-text-bottom').width()/2);

	var $dares = $('.intro-dares');

	var DaresManager = function() { return this.init.apply(this, arguments); };
	DaresManager.prototype = {
		init: function() {

		},

		updateContent: function(content) {
			localStorage[content.title] = JSON.stringify(content);
		},

		loadContent: function(content) {
			if (localStorage[content.title] !== undefined) {
				var ret = JSON.parse(localStorage[content.title]);
				for (var i=0; i<content.dares.length; i++) {
					ret.dares[i].original = content.dares[i].original; // not serialisable
				}
				return ret;
			} else {
				return content;
			}
		}
	};
	var dm = new DaresManager();

	var $rollinrobots = $('<div></div>');
	$dares.append($rollinrobots);
	var rollinrobots = new dares.Dares(dm, $rollinrobots, dm.loadContent({
		title: "Rollin' Robots",
		difficulty: 3,
		dares: [
			{
				name: 'Knight Jump',
				description: '<p>Move the robot to the <strong>green square</strong>. In chess this is known as a <strong>knight jump</strong>.</p>',
				speed: 100,
				maxLines: 5,
				outputs: ['robot'],
				linePenalty: 0,
				goalReward: 50,
				numGoals: 1,
				robotState: '{"columns":4,"rows":4,"initialX":2,"initialY":2,"initialAngle":90,"mazeObjects":1,"verticalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]],"horizontalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]],"blockGoal":[[false,false,false,false],[true,false,false,false],[false,false,false,false],[false,false,false,false]],"numGoals":1}',
				original: function(robot) {
					robot.drive(2);
					robot.turnLeft();
					robot.drive(1);
				},
				infoCommandFilter: ['robot.drive', 'robot.turnLeft', 'robot.turnRight'],
				outputOptions: {
					robot: {readOnly: true},
					input: {}
				},
				type: 'RobotGoalDare',
				editor: {}
			}
		]
	}));

	var stressTime = function(n, f) {
		var start = (new Date()).getTime();
		for (var i=0; i<n; i++) {
			f();
		}
		return ((new Date()).getTime() - start)/n;
	};

	var log = function(text) {
		console.log(text);
	};

	var clear = function() {

	};

	var tree, func;
	
	//$('#extra-stress').click(function(e) {
	window.stress = function() {
		clear();
		var parseAvg = stressTime(200, function() { tree = new window.ui.editor.language.Tree(window.ui.editor.code.text); });
		var parseGenAvg = stressTime(200, function() { func = window.ui.editor.tree.programNode.getRunFunction(); });
		var runAvg = stressTime(200, function() { window.ui.editor.run(); });
		clear();
		log('Program average parse time: ' + parseAvg + 'ms (out of 200 trials)');
		log('Program average code generation time: ' + parseGenAvg + 'ms (out of 200 trials)');
		log('Program average run time: ' + runAvg + 'ms (out of 200 trials)');
		log('');
		log('Note: the Javascript time function is not completely reliable...');
	};
});
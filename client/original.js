/*jshint node:true jquery:true*/
"use strict";

module.exports = function() {
	var applet = require('../jsmm-applet');
	window.applet = applet;

	var dares = require('../dares');

	var $main = $('.example-game');

	var ui = new applet.UI($main, {hideTabs: true});
	window.ui = ui;

	var text = '// Adapted from billmill.org/static/canvastutorial\nvar context = canvas.getContext("2d");\n\nvar paddleWidth = 80;\nvar paddleHeight = 12;\nvar bricks = [];\nvar bricksNumX = 7;\nvar bricksNumY = 5;\nvar brickWidth = canvas.width / bricksNumX;\nvar brickHeight = 20;\nvar brickMargin = 4;\nvar paddleX;\nvar ballX, ballY, ballVx, ballVy;\n\nfor (var y=0; y<bricksNumY; y++) {\n  bricks[y] = [];\n  for (var x=0; x<bricksNumX; x++) {\n    bricks[y][x] = true;\n  }\n}\n\nfunction init() {\n  paddleX = canvas.width/2;\n  ballX = 40;\n  ballY = 150;\n  ballVx = 7;\n  ballVy = 12;\n  for (var y=0; y<bricksNumY; y++) {\n    for (var x=0; x<bricksNumX; x++) {\n      bricks[y][x] = true;\n    }\n  }\n}\n\nfunction clear() {\n  context.clearRect(0, 0, canvas.width, canvas.height);  \n}\n\nfunction circle(x, y) {\n  context.beginPath();\n  context.arc(x, y, 10, 0, 2*Math.PI);\n  context.fill();\n}\n\nfunction drawPaddle() {\n  var x = paddleX - paddleWidth/2;\n  var y = canvas.height - paddleHeight;\n  context.fillRect(x, y, paddleWidth, paddleHeight);\n}\n\nfunction mouseMove(event) {\n  paddleX = event.layerX;\n}\n\nfunction hitHorizontal() {\n  if (ballX < 0) {\n    ballVx = -ballVx;\n  } else if (ballX >= canvas.width) {\n    ballVx = -ballVx;\n  }\n}\n\nfunction hitVertical() {\n  if (ballY < 0) {\n    ballVy = -ballVy;\n  } else if (ballY < brickHeight*bricksNumY) {\n    var bx = Math.floor(ballX/brickWidth);\n    var by = Math.floor(ballY/brickHeight);\n    \n    if (bx >= 0 && bx < bricksNumX) {\n      if (bricks[by][bx]) {\n        bricks[by][bx] = false;\n        ballVy = -ballVy;\n      }\n    }\n  } else if (ballY >= canvas.height-paddleHeight) {\n    var paddleLeft = paddleX-paddleWidth/2;\n    var paddleRight = paddleX+paddleWidth/2;\n    if (ballX >= paddleLeft && ballX <= paddleRight) {\n      ballVy = -ballVy;\n    } else {\n      init();\n      return false;\n    }\n  }\n  return true;\n}\n\nfunction drawBricks() {\n  for (var by=0; by<bricksNumY; by++) {\n    for (var bx=0; bx<bricksNumX; bx++) {\n      if (bricks[by][bx]) {\n        var x = bx * brickWidth + brickMargin/2;\n        var y = by * brickHeight + brickMargin/2;\n        var width = brickWidth - brickMargin;\n        var height = brickHeight - brickMargin;\n        context.fillRect(x, y, width, height);\n      }\n    }\n  }\n}\n\nfunction tick() {\n  clear();\n  drawPaddle();\n  \n  ballX += ballVx;\n  ballY += ballVy;\n  \n  hitHorizontal();\n  if (hitVertical()) {\n    circle(ballX, ballY);\n    drawBricks();\n  } else {\n    clear();\n  }\n}\n\ninit();\ncanvas.onmousemove = mouseMove;\nwindow.setInterval(tick, 30);';

	var editor = ui.addEditor({
			//hideToolbar: true,
			text: text
		});
	window.editor = editor;

	ui.loadOutputs({
			canvas: {},
			input: {mouseObjects: ['canvas']},
			Math: {}
		});

	ui.selectTab('canvas');

	$('.example-text-top').css('margin-left', -$('.example-text-top').width()/2);
	$('.example-text-bottom').css('margin-left', -$('.example-text-bottom').width()/2);

	var $dares = $('.intro');

	var apiGet = function(name, data, success) {
		return $.ajax({
			url: 'api/get/' + name,
			type: 'get',
			data: JSON.stringify(data),
			dataType: 'json',
			success: success
		});
	};

	var apiPost = function(name, data, success) {
		return $.ajax({
			url: 'api/post/' + name,
			type: 'post',
			data: JSON.stringify(data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success: success,
			error: function() {
				console.log('error', arguments);
			}
		});
	};

	var DaresManager = function() { return this.init.apply(this, arguments); };
	DaresManager.prototype = {
		dares: null,

		init: function(content) {
			this.content = content;

			apiGet('instances', {}, (function(instances) {
				console.log(instances);
				for (var j=0; j<this.content.dares.length; j++) {
					var dare = this.content.dares[j];
					dare.instance = {};
					for (var i=0; i<instances.length; i++) {
						var instance = instances[i];
						if (instance.dareId === this.content.title + '-' + dare.name) {
							dare.instance = instance;
							break;
						}
					}
				}

				if (this.dares !== null) {
					this.dares.updateDares(); // hack hack hack
				}
			}).bind(this));
		},

		getDare: function(index) {
			return this.content.dares[index];
		},

		updateHighscore: function(index, completed, highscore) {
			this.content.dares[index].instance.completed = completed;
			this.content.dares[index].instance.highscore = highscore;
			apiPost('highscore', {dareId: this.content.title + '-' + this.content.dares[index].name, completed: this.content.dares[index].instance.completed, highscore: this.content.dares[index].instance.highscore, text: this.content.dares[index].instance.text}, function(data) {
				console.log(data);
			});
		},

		updateProgram: function(index, text) {
			this.content.dares[index].instance.text = text;
			apiPost('program', {dareId: this.content.title + '-' + this.content.dares[index].name, text: this.content.dares[index].instance.text}, function(data) {
				console.log(data);
			});
		},

		getContent: function() {
			return this.content;
		},

		open: function() {
			editor.disable();
		},

		close: function() {
			editor.enable();
		}
	};

	var exDM = new DaresManager({
		title: "Other examples",
		difficulty: 3,
		dares: [
			{
				name: 'Multiplication table',
				type: 'ConsoleMatchDare',
				description: '<p>A multiplication table shows the result of multiplying any two numbers. Your task is to build a multiplication table of 10 rows and 5 columns, as seen below. For the spacing between the numbers, use the tab character, <var>"\\t"</var>.</p>',
				minPercentage: 95,
				maxLines: 8,
				lineReward: 10,
				original: 'for (var l=1; l<=10; l++) {\n  var text = "";\n  for (var c=1; c<=5; c++) {\n    text += l*c + "\\t";\n  }\n  console.log(text);\n}',
				outputs: {
					console: {},
					info: {commandFilter: ['jsmm', 'console.log']}
				},
				editor: {}
			},
			{
				name: 'Gravity',
				type: 'ImageMatchDare',
				description: '<p>A block is <strong>thrown</strong> in the air and then <strong>accelerates back down</strong>. The position of the block is drawn every few seconds, resulting in the image on the right. Your task is to <strong>copy</strong> this image as good as possible, in as <strong>few lines</strong> of code as you can.</p>',
				speed: 50,
				minPercentage: 95,
				maxLines: 6,
				lineReward: 10,
				original: 'var context = canvas.getContext("2d");\nfor (var i=0; i<20; i++) {\n  context.fillRect(10+i*24, 270+i*-65+i*i*4, 50, 50);\n}',
				outputs: {
					canvas: {},
					info: {commandFilter: ['jsmm', 'canvas.getContext', 'context.fillRect']}
				},
				editor: {}
			}
		]
	});
	var $examples = $('<div></div>');
	$dares.prepend($examples);
	var exDares = new dares.Dares(exDM, $examples);

	var rrDM = new DaresManager({
		title: "Rollin' Robots",
		difficulty: 1,
		dares: [
			{
				name: 'Stepping',
				type: 'RobotGoalDare',
				description: '<p>Before making games, we will go through the <strong>basics</strong> of programming in Javascript. We do this by moving a robot around. The goal is to move the robot to the <strong>green square</strong>.</p><p>On the right you can see a <a href="#arrow-code">program</a>, which makes a robot move. You can see the robot when clicking on the <a href="#arrow-tab-robot">robot tab</a>. You can use the <a href="#arrow-step">step button</a> to see what the program does.</p><p>The program is not finished yet. Try to <strong>complete</strong> the program, and then click the submit button below.</p>',
				totalGoals: 1,
				minGoals: 1,
				goalReward: 50,
				maxLines: 0,
				lineReward: 0,
				original: 'robot.drive(1);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(3);',
				outputs: {
					robot: {readOnly: true, state: '{"columns":5,"rows":5,"initialX":2,"initialY":4,"initialAngle":90,"mazeObjects":4,"verticalActive":[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"horizontalActive":[[false,false,false,false,false],[false,false,false,true,false],[false,false,false,true,false],[false,false,false,true,false],[false,false,false,false,false]],"blockGoal":[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,true,false,false,false],[false,false,false,false,false]]}'}
				},
				editor: {text: 'robot.drive(1);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(2);\n'}
			},
			{
				name: 'Another wall',
				type: 'RobotGoalDare',
				description: '<p>Again, move the robot to the green square. To make it a bit more difficult, try to do it in as <strong>few lines</strong> of code as possible. It does not matter what route you take.</p>',
				totalGoals: 1,
				minGoals: 1,
				goalReward: 50,
				maxLines: 10,
				lineReward: 10,
				original: 'robot.drive(1);\nrobot.turnRight();\nrobot.drive(2);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.turnLeft();\nrobot.drive(3);',
				outputs: {
					robot: {readOnly: true, state: '{"columns":5,"rows":5,"initialX":2,"initialY":4,"initialAngle":90,"mazeObjects":5,"verticalActive":[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"horizontalActive":[[false,false,false,true,false],[false,false,false,true,false],[false,false,false,true,false],[false,false,false,true,false],[false,false,false,false,false]],"blockGoal":[[false,false,false,false,false],[false,true,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]]}'}
				},
				editor: {}
			},
			{
				name: 'Highlighting',
				type: 'RobotGoalDare',
				description: '<p>Stepping is very useful, but to see more quickly which command does what, you can use the <a href="#arrow-highlighting">highlighting button</a>. When using highlighting, move the mouse over the code, or over the path of the robot. After that, move the robot to the green square in as few lines as you can.</p>',
				totalGoals: 1,
				minGoals: 1,
				goalReward: 50,
				maxLines: 16,
				lineReward: 10,
				original: 'robot.drive(4);\nrobot.turnLeft();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(4);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(3);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.turnLeft();\nrobot.drive(2);',
				outputs: {
					robot: {readOnly: true, state: '{"columns":5,"rows":5,"initialX":4,"initialY":4,"initialAngle":90,"mazeObjects":12,"verticalActive":[[false,false,false,false,false],[false,false,false,false,false],[false,false,true,true,true],[true,true,true,true,false],[false,true,true,true,true]],"horizontalActive":[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"blockGoal":[[false,false,false,true,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]]}'}
				},
				editor: {text: 'robot.drive(4);\nrobot.turnLeft();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(2);\n'}
			},
			{
				name: 'Multiple goals',
				type: 'RobotGoalDare',
				description: '<p>This time you have to visit <strong>all three</strong> goals, in any order. Programmers always look for the fastest solution. Can you find a fast route?</p>',
				totalGoals: 3,
				minGoals: 3,
				goalReward: 50,
				maxLines: 20,
				lineReward: 10,
				original: 'robot.drive(2);\nrobot.turnLeft();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(3);\nrobot.turnLeft();\nrobot.drive(1);',
				outputs: {
					robot: {readOnly: true, state: '{"columns":5,"rows":5,"initialX":1,"initialY":4,"initialAngle":90,"mazeObjects":12,"verticalActive":[[false,false,false,false,false],[false,false,false,false,false],[false,false,true,false,false],[false,true,false,true,false],[false,false,true,false,false]],"horizontalActive":[[false,false,false,false,false],[false,false,true,false,false],[false,true,false,true,false],[false,false,true,false,true],[false,false,false,false,false]],"blockGoal":[[false,false,false,false,false],[false,true,false,false,false],[false,false,false,false,false],[true,false,false,false,false],[false,false,false,true,false]]}'}
				},
				editor: {}
			},
			{
				name: 'Manipulation',
				type: 'RobotGoalDare',
				description: '<p>For this dare you just have to edit the numbers in the program. You can use the <a href="#arrow-manipulation">manipulation button</a> to do this easily. Note that you cannot use extra lines of code, but you can get <strong>extra points</strong> by visiting all goals!</p>',
				totalGoals: 7,
				minGoals: 5,
				goalReward: 50,
				maxLines: 11,
				lineReward: 10,
				original: 'robot.drive(7);\nrobot.turnRight();\nrobot.drive(6);\nrobot.turnRight();\nrobot.drive(7);\nrobot.turnRight();\nrobot.drive(4);\nrobot.turnRight();\nrobot.drive(3);\nrobot.turnLeft();\nrobot.drive(1);',
				outputs: {
					robot: {readOnly: true, previewBlockSize: 32, state: '{"columns":8,"rows":8,"initialX":0,"initialY":7,"initialAngle":90,"mazeObjects":7,"verticalActive":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"horizontalActive":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"blockGoal":[[true,false,false,false,false,false,false,false],[false,false,false,false,true,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,true],[false,false,false,false,true,false,false,false],[false,false,false,false,false,false,false,false],[true,false,false,false,false,false,false,true],[false,false,false,false,true,false,false,false]],"numGoals":1}'}
				},
				editor: {text: 'robot.drive(3);\nrobot.turnRight();\nrobot.drive(3);\nrobot.turnRight();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(1);\n'}
			},
			{
				name: 'Knight Jump',
				type: 'RobotGoalDare',
				description: '<p>When programming, you often want to use the same set of commands multiple times. To do this, you can make a <strong>function</strong>, in which you put the commands that you want to use more than once. You can write down the name of this function <strong>instead</strong> of these commands.</p> <p>For this dare, we created a function for you, which moves the robot like a <strong>knight</strong> jumps on a chess board: two blocks forward, and one to the right. Use the <a href="#arrow-step">step button</a> to see what happens. We have also added a new tab, the <a href="#arrow-tab-info">info tab</a>, with more information about functions.</p>',
				totalGoals: 6,
				minGoals: 6,
				goalReward: 50,
				maxLines: 15,
				lineReward: 10,
				original: 'function knightJump() {\n  robot.drive(2);\n  robot.turnRight();\n  robot.drive(1);\n}\n\nknightJump();\nknightJump();\nrobot.turnLeft();\nknightJump();\nrobot.drive(1);\nknightJump();\nknightJump();\nknightJump();\n',
				outputs: {
					robot: {readOnly: true, previewBlockSize: 32, state: '{"columns":6,"rows":6,"initialX":0,"initialY":2,"initialAngle":90,"mazeObjects":15,"verticalActive":[[false,false,false,false,false,false],[false,false,false,false,false,false],[false,false,true,true,true,true],[false,false,false,false,false,false],[false,false,false,false,false,false],[false,false,true,true,false,false]],"horizontalActive":[[false,false,false,false,false,false],[false,false,false,false,false,false],[false,false,true,false,false,false],[false,false,true,false,false,false],[false,false,true,false,false,false],[false,false,false,false,false,false]],"blockGoal":[[false,false,false,false,false,false],[true,false,false,false,false,false],[false,false,false,false,true,false],[false,true,true,false,false,false],[false,false,false,false,false,true],[false,false,true,false,false,false]]}'},
					info: {commandFilter: ['jsmm.function', 'robot.drive', 'robot.turnLeft', 'robot.turnRight'], scope: false}
				},
				editor: {text: 'function knightJump() {\n  robot.drive(2);\n  robot.turnRight();\n  robot.drive(1);\n}\n\nknightJump();'}
			},
			{
				name: 'Zig-zag',
				type: 'RobotGoalDare',
				description: '<p>For this you need to write your <strong>own</strong> function. You can try writing a program without a function, but note that you can only use <strong>20 lines</strong> (not counting empty lines and lines with only <var>}</var>).</p>',
				totalGoals: 9,
				minGoals: 9,
				goalReward: 50,
				maxLines: 20,
				lineReward: 10,
				original: 'function zigzag() {\n  robot.drive(2);\n  robot.turnRight();\n  robot.drive(1);\n  robot.turnLeft();\n  robot.drive(1);\n  robot.turnLeft();\n  robot.drive(1);\n  robot.turnRight();\n}\n\nzigzag();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(1);\nzigzag();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(1);\nzigzag();',
				outputs: {
					robot: {readOnly: true, previewBlockSize: 48, state: '{"columns":6,"rows":6,"initialX":0,"initialY":5,"initialAngle":90,"mazeObjects":26,"verticalActive":[[false,false,false,false,false,false],[false,false,false,false,true,false],[false,false,true,true,false,false],[false,true,false,false,false,false],[true,false,false,true,true,false],[false,true,false,false,false,false]],"horizontalActive":[[false,false,false,true,false,false],[false,false,true,false,true,false],[false,true,false,false,false,false],[false,false,true,false,false,false],[false,false,true,true,false,true],[false,false,false,false,true,false]],"blockGoal":[[false,false,true,false,true,false],[false,false,false,true,false,false],[true,false,false,false,false,false],[false,true,false,false,false,false],[true,false,false,true,false,false],[false,false,true,false,true,false]]}'},
					info: {commandFilter: ['jsmm.function', 'robot.drive', 'robot.turnLeft', 'robot.turnRight'], scope: false}
				},
				editor: {}
			},
			{
				name: 'ForwardRight',
				type: 'RobotGoalDare',
				description: '<p>Sometimes you want to use the same commands, but only slightly different every time. In this dare, you want to move forward and then right, but with a different distance every time.</p><p>For this you can use an <strong>argument</strong> in the function. After the function name you give a name for the argument, and the argument then <strong>contains</strong> the number you put in when calling the function. You can then use this name when calling the commands in the function.</p><p>We have created an example for you, try to see what happens when you <a href="#arrow-step">step</a> through it.</p>',
				totalGoals: 1,
				minGoals: 1,
				goalReward: 50,
				maxLines: 20,
				lineReward: 10,
				original: 'function forwardRight(distance) {\n  robot.drive(distance);\n  robot.turnRight();\n}\n\nforwardRight(7);\nforwardRight(7);\nforwardRight(7);\nforwardRight(6);\nforwardRight(6);\nforwardRight(5);\nforwardRight(5);\nforwardRight(4);\nforwardRight(4);\nforwardRight(3);\nforwardRight(3);\nforwardRight(2);\nforwardRight(2);\nforwardRight(1);\nforwardRight(1);',
				outputs: {
					robot: {readOnly: true, previewBlockSize: 32, state: '{"columns":8,"rows":8,"initialX":0,"initialY":7,"initialAngle":90,"mazeObjects":50,"verticalActive":[[false,false,false,false,false,false,false,false],[false,true,true,true,true,true,true,true],[false,false,true,true,true,true,true,false],[false,false,false,true,true,true,false,false],[false,false,false,false,true,false,false,false],[false,false,false,true,true,false,false,false],[false,false,true,true,true,true,false,false],[false,true,true,true,true,true,true,false]],"horizontalActive":[[false,false,false,false,false,false,false,false],[false,true,false,false,false,false,false,false],[false,true,true,false,false,false,false,true],[false,true,true,true,false,false,true,true],[false,true,true,true,false,true,true,true],[false,true,true,false,false,false,true,true],[false,true,false,false,false,false,false,true],[false,false,false,false,false,false,false,false]],"blockGoal":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,true,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"numGoals":1}'},
					info: {commandFilter: ['jsmm.function', 'robot.drive', 'robot.turnLeft', 'robot.turnRight'], scope: false}
				},
				editor: {text: 'function forwardRight(distance) {\n  robot.drive(distance);\n  robot.turnRight();\n}\n\nforwardRight(7);\n'}
			},
			{
				name: 'More functions',
				type: 'RobotGoalDare',
				description: '<p>For this one you probably need to make one (or more) functions, since you can use no more than <strong>17 lines</strong> of code.</p>',
				totalGoals: 3,
				minGoals: 3,
				goalReward: 50,
				maxLines: 17,
				lineReward: 10,
				original: 'function move(distance) {\n  robot.drive(distance);\n  robot.turnLeft();\n  robot.drive(1);\n  robot.turnLeft();\n  robot.drive(distance);\n  robot.turnRight();\n  robot.drive(1);\n  robot.turnRight();\n}\n\nmove(6);\nmove(4);\nmove(2);',
				outputs: {
					robot: {readOnly: true, previewBlockSize: 32, state: '{"columns":7,"rows":7,"initialX":6,"initialY":6,"initialAngle":90,"mazeObjects":31,"verticalActive":[[false,false,false,false,false,false,false],[false,false,false,false,true,true,false],[false,false,false,false,false,true,true],[false,false,true,true,true,true,false],[false,false,false,true,true,true,true],[true,true,true,true,true,true,false],[false,true,true,true,true,true,true]],"horizontalActive":[[false,false,false,false,false,false,false],[false,false,false,false,true,false,false],[false,false,false,false,true,false,false],[false,false,true,false,false,false,false],[false,false,true,false,false,false,false],[false,false,false,false,false,false,false],[false,false,false,false,false,false,false]],"blockGoal":[[false,false,false,false,false,false,true],[false,false,false,false,false,false,false],[false,false,false,false,false,false,true],[false,false,false,false,false,false,false],[false,false,false,false,false,false,true],[false,false,false,false,false,false,false],[false,false,false,false,false,false,false]]}'},
					info: {commandFilter: ['jsmm.function', 'robot.drive', 'robot.turnLeft', 'robot.turnRight'], scope: false}
				},
				editor: {}
			},
			{
				name: 'Animal',
				type: 'ImageMatchDare',
				description: '<p>You can already apply some stuff you have learned to <strong>drawing shapes</strong> on a canvas. For this dare you have to draw a simple animal using rectangles. We have already drawn the head for you.</p><p>Try to figure out with the <a href="#arrow-manipulation">manipulation button</a> what all the numbers do, and add the rectangles for the <strong>body and legs</strong>. You can also use the <a href="#arrow-tab-info">info tab</a> for more information on drawing commands. Do not worry about the <var>var context = canvas.getContext("2d");</var> line for now. If you like, you can try to give the animal a color.</p>',
				speed: 500,
				minPercentage: 97,
				maxLines: 10,
				lineReward: 10,
				original: 'var context = canvas.getContext("2d");\n\ncontext.fillRect(150, 50, 50, 50);\ncontext.fillRect(50, 100, 100, 50);\ncontext.fillRect(50, 150, 30, 50);\ncontext.fillRect(120, 150, 30, 50);',
				outputs: {
					canvas: {size: 256},
					info: {commandFilter: ['canvas.getContext', 'context.fillRect', 'context.fillStyle'], scope: false}
				},
				editor: {text: 'var context = canvas.getContext("2d");\n\ncontext.fillRect(150, 50, 50, 50);\n'}
			},
			{
				name: 'Zoo',
				type: 'ImageMatchDare',
				description: '<p>When you can draw one animal, you can draw a zoo, using a function. We have again provided you with a program that draws the head of some animals. If you find this dare too hard, you can leave it for now and try it again later.</p>',
				speed: 200,
				minPercentage: 97,
				maxLines: 10,
				lineReward: 10,
				original: 'var context = canvas.getContext("2d");\n\nfunction animal(x, y) {\n  context.fillRect(x+150, y+50, 50, 50);\n  context.fillRect(x+50, y+100, 100, 50);\n  context.fillRect(x+50, y+150, 30, 50);\n  context.fillRect(x+120, y+150, 30, 50);\n}\n\nanimal(0, 0);\nanimal(250, 0);\nanimal(0, 250);\nanimal(250, 250);',
				outputs: {
					canvas: {size: 512},
					info: {commandFilter: ['jsmm.arithmetic.numbers', 'jsmm.function', 'canvas.getContext', 'context.fillRect', 'context.fillStyle'], scope: false}
				},
				editor: {text: 'var context = canvas.getContext("2d");\n\nfunction animal(x, y) {\n  context.fillRect(x+150, y+50, 50, 50);\n}\n\nanimal(0, 0);\nanimal(250, 0);\nanimal(0, 250);\n'}
			}
		]
	});
	var $rollinrobots = $('<div></div>');
	$dares.prepend($rollinrobots);
	var rrDares = new dares.Dares(rrDM, $rollinrobots);

	if (localStorage.getItem('initial-code') === null) {
		localStorage.setItem('initial-code', '// ROBOT EXAMPLE\nwhile(!robot.detectGoal()) {\n  robot.turnLeft();\n  while (robot.detectWall()) {\n    robot.turnRight();\n  }\n  robot.drive();\n}\n\n//CONSOLE EXAMPLE\nconsole.setColor("#fff");\nconsole.log("A colourful multiplication table:");\nconsole.log();\n\nfunction printLine(n) {\n  var text = "";\n  for (var i=1; i<=8; i++) {\n    text += (i*n) + "\\t";\n  }\n  console.log(text);\n}\n\nfor (var i=1; i<=20; i++) { \n  console.setColor("hsla(" + i*15 + ", 75%, 50%, 1)");\n  printLine(i);\n}\n\nconsole.setColor("#ed7032");\nconsole.log();\nconsole.log(":-D");');
	}

	if (localStorage.getItem('initial-robot') === null) {
		localStorage.setItem('initial-robot', '{"columns":8,"rows":8,"initialX":3,"initialY":4,"initialAngle":90,"mazeObjects":50,"verticalActive":[[false,false,false,false,false,false,false,false],[false,false,true,true,true,false,true,false],[false,true,false,false,true,false,false,true],[false,false,true,true,false,false,true,false],[false,true,true,false,false,false,false,false],[false,false,false,true,false,true,true,true],[false,false,true,false,true,true,false,false],[false,false,false,true,false,true,true,false]],"horizontalActive":[[false,true,false,false,true,false,false,true],[false,true,false,true,false,false,true,false],[false,true,true,false,true,false,true,false],[false,true,false,false,true,true,true,false],[false,false,true,true,false,true,false,true],[false,true,false,false,true,false,false,true],[false,true,true,true,false,false,false,true],[false,true,true,false,false,false,false,false]],"blockGoal":[[false,false,false,true,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"numGoals":1}');
	}

	var fullEditorUI = new applet.UI();
	$('#full-editor').on('click', function() {
		editor.disable();
		fullEditorUI.openModal();
		var ed = fullEditorUI.addEditor({text: localStorage.getItem('initial-code')});
		ed.setTextChangeCallback(function(text) {
			localStorage.setItem('initial-code', text);
		});
		fullEditorUI.loadOutputs({
			robot: {state: localStorage.getItem('initial-robot')}, canvas: {}, console: {}, info: {}, input: {mouseObjects: ['canvas']}, Math: {}
		});
		fullEditorUI.getOutput('robot').setStateChangeCallback(function(state) {
			localStorage.setItem('initial-robot', state);
		});
		fullEditorUI.selectTab('robot');
	});

	fullEditorUI.setCloseCallback(function() {
		editor.enable();
	});


	window.fullEditorUI = fullEditorUI;











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
};
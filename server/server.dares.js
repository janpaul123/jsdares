/*jshint node:true*/
"use strict";

var connect = require('connect');
var uuid = require('node-uuid');

module.exports = function(server) {
	server.dares = function(db) {
		db.dares.update({"_id" : new db.ObjectID("50096896e78955fbcf405845")},
			{
				"_id" : new db.ObjectID("50096896e78955fbcf405845"),
				collectionId: new db.ObjectID("5009684ce78955fbcf405844"),
				name: 'Stepping',
				type: 'RobotGoalDare',
				description: '<p>Before making games, we will go through the <strong>basics</strong> of programming in Javascript. We do this by moving a robot around. The goal is to move the robot to the <strong>green square</strong>.</p><p>On the right you can see a <a href="#arrow-left,750,65">program</a>, which makes a robot move. You can see the robot when clicking on the <a href="#arrow-tab-robot">robot tab</a>. You can use the <a href="#arrow-step">step button</a> to see what the program does.</p><p>The program is not finished yet. Try to <strong>complete</strong> the program, and then click the submit button below.</p>',
				totalGoals: 1,
				minGoals: 1,
				goalReward: 50,
				maxLines: 0,
				lineReward: 0,
				original: 'robot.drive(1);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(3);',
				outputs: {
					robot: {readOnly: true, state: '{"columns":5,"rows":5,"initialX":2,"initialY":4,"initialAngle":90,"mazeObjects":4,"verticalActive":[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"horizontalActive":[[false,false,false,false,false],[false,false,false,true,false],[false,false,false,true,false],[false,false,false,true,false],[false,false,false,false,false]],"blockGoal":[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,true,false,false,false],[false,false,false,false,false]]}'}
				},
				editor: {text: 'robot.drive(1);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(2);\n'},
				order: 0
			},
			{upsert: true}
		);

		
		db.dares.update({"_id" : new db.ObjectID("400000000000000000000000")},
			{
				"_id" : new db.ObjectID("400000000000000000000000"),
				collectionId: new db.ObjectID("5009684ce78955fbcf405844"),
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
				editor: {},
				order: 1
			},
			{upsert: true}
		);

		db.dares.update({"_id" : new db.ObjectID("400000000000000000000001")},
			{
				"_id" : new db.ObjectID("400000000000000000000001"),
				collectionId: new db.ObjectID("5009684ce78955fbcf405844"),
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
				editor: {text: 'robot.drive(4);\nrobot.turnLeft();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(2);\n'},
				order: 2
			},
			{upsert: true}
		);

		db.dares.update({"_id" : new db.ObjectID("400000000000000000000002")},
			{
				"_id" : new db.ObjectID("400000000000000000000002"),
				collectionId: new db.ObjectID("5009684ce78955fbcf405844"),
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
				editor: {},
				order: 3
			},
			{upsert: true}
		);

		db.dares.update({"_id" : new db.ObjectID("400000000000000000000003")},
			{
				"_id" : new db.ObjectID("400000000000000000000003"),
				collectionId: new db.ObjectID("5009684ce78955fbcf405844"),
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
				editor: {text: 'robot.drive(3);\nrobot.turnRight();\nrobot.drive(3);\nrobot.turnRight();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(1);\n'},
				order: 4
			},
			{upsert: true}
		);

		db.dares.update({"_id" : new db.ObjectID("400000000000000000000004")},
			{
				"_id" : new db.ObjectID("400000000000000000000004"),
				collectionId: new db.ObjectID("5009684ce78955fbcf405844"),
				name: 'Knight Jump',
				type: 'RobotGoalDare',
				description: '<p>When programming, you often want to use the same set of commands multiple times. To do this, you can make a <strong>function</strong>, in which you put the commands that you want to use more than once. You can write down the name of this function <strong>instead</strong> of these commands. In the provided <a href="#arrow-left,780,58">program</a>, the name of the function is <var>knightJump</var>, and you can call it by writing <var>knightJump();</var>.</p> <p>For this dare, we created a function for you, which moves the robot like a <strong>knight</strong> jumps on a chess board: two blocks forward, and one to the right. Use the <a href="#arrow-step">step button</a> to see what happens. We have also added a new tab, the <a href="#arrow-tab-info">info tab</a>, with more information about functions.</p>',
				totalGoals: 6,
				minGoals: 6,
				goalReward: 50,
				maxLines: 15,
				lineReward: 10,
				original: 'function knightJump() {\n  robot.drive(2);\n  robot.turnRight();\n  robot.drive(1);\n}\n\nknightJump();\nknightJump();\nrobot.turnLeft();\nknightJump();\nrobot.drive(1);\nknightJump();\nknightJump();\nknightJump();\n',
				outputs: {
					robot: {readOnly: true, previewBlockSize: 32, state: '{"columns":6,"rows":6,"initialX":0,"initialY":2,"initialAngle":90,"mazeObjects":15,"verticalActive":[[false,false,false,false,false,false],[false,false,false,false,false,false],[false,false,true,true,true,true],[false,false,false,false,false,false],[false,false,false,false,false,false],[false,false,true,true,false,false]],"horizontalActive":[[false,false,false,false,false,false],[false,false,false,false,false,false],[false,false,true,false,false,false],[false,false,true,false,false,false],[false,false,true,false,false,false],[false,false,false,false,false,false]],"blockGoal":[[false,false,false,false,false,false],[true,false,false,false,false,false],[false,false,false,false,true,false],[false,true,true,false,false,false],[false,false,false,false,false,true],[false,false,true,false,false,false]]}'},
					info: {commands: [{id: 'jsmm.function', examples: [0]}, {id: 'robot.drive'}, {id: 'robot.turnLeft'}, {id: 'robot.turnRight'}], scope: false}
				},
				editor: {text: 'function knightJump() {\n  robot.drive(2);\n  robot.turnRight();\n  robot.drive(1);\n}\n\nknightJump();'},
				order: 5
			},
			{upsert: true}
		);

		db.dares.update({"_id" : new db.ObjectID("400000000000000000000005")},
			{
				"_id" : new db.ObjectID("400000000000000000000005"),
				collectionId: new db.ObjectID("5009684ce78955fbcf405844"),
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
					info: {commands: [{id: 'jsmm.function', examples: [0]}, {id: 'robot.drive'}, {id: 'robot.turnLeft'}, {id: 'robot.turnRight'}], scope: false}
				},
				editor: {},
				order: 6
			},
			{upsert: true}
		);

		db.dares.update({"_id" : new db.ObjectID("400000000000000000000006")},
			{
				"_id" : new db.ObjectID("400000000000000000000006"),
				collectionId: new db.ObjectID("5009684ce78955fbcf405844"),
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
					info: {commands: [{id: 'jsmm.function', examples: [0]}, {id: 'robot.drive'}, {id: 'robot.turnLeft'}, {id: 'robot.turnRight'}], scope: false}
				},
				editor: {text: 'function forwardRight(distance) {\n  robot.drive(distance);\n  robot.turnRight();\n}\n\nforwardRight(7);\n'},
				order: 7
			},
			{upsert: true}
		);

		db.dares.update({"_id" : new db.ObjectID("400000000000000000000007")},
			{
				"_id" : new db.ObjectID("400000000000000000000007"),
				collectionId: new db.ObjectID("5009684ce78955fbcf405844"),
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
					info: {commands: [{id: 'jsmm.function', examples: [0]}, {id: 'robot.drive'}, {id: 'robot.turnLeft'}, {id: 'robot.turnRight'}], scope: false}
				},
				editor: {},
				order: 8
			},
			{upsert: true}
		);

		db.dares.update({"_id" : new db.ObjectID("400000000000000000000008")},
			{
				"_id" : new db.ObjectID("400000000000000000000008"),
				collectionId: new db.ObjectID("5009684ce78955fbcf405844"),
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
					info: {commands: [{id: 'canvas.getContext'}, {id: 'context.fillRect'}, {id: 'context.fillStyle'}], scope: false}
				},
				editor: {text: 'var context = canvas.getContext("2d");\n\ncontext.fillRect(150, 50, 50, 50);\n'},
				order: 9
			},
			{upsert: true}
		);

		db.dares.update({"_id" : new db.ObjectID("400000000000000000000009")},
			{
				"_id" : new db.ObjectID("400000000000000000000009"),
				collectionId: new db.ObjectID("5009684ce78955fbcf405844"),
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
					info: {commands: ['jsmm.arithmetic.numbers', {id: 'jsmm.function', examples: [0]}, {id: 'canvas.getContext'}, {id: 'context.fillRect'}, {id: 'context.fillStyle'}], scope: false}
				},
				editor: {text: 'var context = canvas.getContext("2d");\n\nfunction animal(x, y) {\n  context.fillRect(x+150, y+50, 50, 50);\n}\n\nanimal(0, 0);\nanimal(250, 0);\nanimal(0, 250);\n'},
				order: 10
			},
			{upsert: true}
		);
	};
};

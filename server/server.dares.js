/*jshint node:true*/
"use strict";

var connect = require('connect');
var uuid = require('node-uuid');

module.exports = function(server) {
	server.dares = function(db) {
		db.users.findOne({'auth.local.username': 'janpaul123'}, function(error, user) {
			if (error) throw error;
			else if (!user) console.error('Could not update pre-set values since there is no user "janpaul123"');
			else {
				db.collections.insert([
					{_id: new db.ObjectID('5009684ce78955fbcf405844'), createdTime: new Date()},
					{_id: new db.ObjectID('30000000078955fbcf405844'), createdTime: new Date()}
				], {safe:true}, function(err, doc) {
					db.collections.update({_id : new db.ObjectID('5009684ce78955fbcf405844')},
						{$set: {
							userId: user._id,
							difficulty: 1,
							title: "Rollin' Robots",
							dareIds: [
								new db.ObjectID('300000000000000000000000'),
								new db.ObjectID('300000000000000000000001'),
								new db.ObjectID('300000000000000000000002'),
								new db.ObjectID('300000000000000000000003'),
								new db.ObjectID('300000000000000000000004'),
								new db.ObjectID('300000000000000000000005'),
								new db.ObjectID('300000000000000000000006'),
								new db.ObjectID('300000000000000000000007'),
								new db.ObjectID('300000000000000000000008'),
								new db.ObjectID('300000000000000000000009'),
								new db.ObjectID('300000000000000000000010')
							]
						}}
					);

					db.collections.update({_id : new db.ObjectID('30000000078955fbcf405844')},
						{$set: {
							userId: user._id,
							difficulty: 2,
							title: "Famous people",
							dareIds: [
								new db.ObjectID('300000000000000000000100'),
								new db.ObjectID('300000000000000000000101'),
								new db.ObjectID('300000000000000000000102'),
								new db.ObjectID('300000000000000000000103'),
								new db.ObjectID('300000000000000000000104'),
								new db.ObjectID('300000000000000000000105'),
								new db.ObjectID('300000000000000000000106'),
								new db.ObjectID('300000000000000000000107'),
								new db.ObjectID('300000000000000000000108'),
								new db.ObjectID('300000000000000000000109'),
								new db.ObjectID('300000000000000000000110')
							]
						}}
					);
				});

				db.dares.insert([
					{_id: new db.ObjectID('300000000000000000000000'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000001'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000002'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000003'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000004'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000005'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000006'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000007'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000008'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000009'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000010'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000100'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000101'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000102'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000103'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000104'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000105'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000106'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000107'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000108'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000109'), createdTime: new Date()},
					{_id: new db.ObjectID('300000000000000000000110'), createdTime: new Date()}
				], {safe:true}, function(err, doc) {
					db.dares.update({_id: new db.ObjectID('300000000000000000000000')},
						{ $set: {
							userId: user._id,
							name: 'Stepping',
							type: 'RobotGoal',
							description: '<p>Before making games, we will go through the <strong>basics</strong> of programming in Javascript. We do this by moving a robot around. The goal is to move the robot to the <strong>green square</strong>.</p><p>On the right you can see a <a href="#arrow-left,750,65">program</a>, which makes a robot move. You can see the robot by clicking on the <a href="#arrow-tab-robot">robot tab</a>. You can use the <a href="#arrow-step">step button</a> to see what the program does.</p><p>The program is not finished yet. Try to <strong>complete</strong> the program, and then click the submit button below.</p>',
							allDares: {
								RobotGoal: {
									totalGoals: 1,
									minGoals: 1,
									goalReward: 50,
									maxLines: 0,
									lineReward: 0
								}
							},
							hidePreview: true,
							original: 'robot.drive(1);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(3);',
							outputs: ['robot'],
							allOutputs: {
								robot: {readOnly: true, state: '{"columns":5,"rows":5,"initialX":2,"initialY":4,"initialAngle":90,"mazeObjects":4,"verticalActive":[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"horizontalActive":[[false,false,false,false,false],[false,false,false,true,false],[false,false,false,true,false],[false,false,false,true,false],[false,false,false,false,false]],"blockGoal":[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,true,false,false,false],[false,false,false,false,false]]}'}
							},
							editor: {text: 'robot.drive(1);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(2);\n'}
						}}
					);
					
					db.dares.update({_id: new db.ObjectID('300000000000000000000001')},
						{ $set: {
							userId: user._id,
							name: 'Another wall',
							type: 'RobotGoal',
							description: '<p>Again, move the robot to the green square, as demonstrated in the <a href="#arrow-left,535,180">preview</a>. To make it a bit more difficult, try to do it in as <strong>few lines</strong> of code as possible. It does not matter what route you take.</p><p>Note that the program we provided has an <strong>error</strong>. Click on the <a href="#arrow-up,557,70">error icon</a> to see what is wrong.</p>',
							allDares: {
								RobotGoal: {
									totalGoals: 1,
									minGoals: 1,
									goalReward: 50,
									maxLines: 10,
									lineReward: 10
								}
							},
							original: 'robot.drive(1);\nrobot.turnRight();\nrobot.drive(2);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.turnLeft();\nrobot.drive(3);',
							outputs: ['robot'],
							allOutputs: {
								robot: {readOnly: true, state: '{"columns":5,"rows":5,"initialX":2,"initialY":4,"initialAngle":90,"mazeObjects":5,"verticalActive":[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"horizontalActive":[[false,false,false,true,false],[false,false,false,true,false],[false,false,false,true,false],[false,false,false,true,false],[false,false,false,false,false]],"blockGoal":[[false,false,false,false,false],[false,true,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]]}'}
							},
							editor: {text: 'robot.drive(3);\nrobot.turnRight();\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000002')},
						{ $set: {
							userId: user._id,
							name: 'Highlighting',
							type: 'RobotGoal',
							description: '<p>Stepping is very useful, but to see more quickly which command does what, you can use the <a href="#arrow-highlighting">highlighting button</a>. When using highlighting, move the mouse over the code, or over the path of the robot. After that, move the robot to the green square in as few lines as you can.</p>',
							allDares: {
								RobotGoal: {
									totalGoals: 1,
									minGoals: 1,
									goalReward: 50,
									maxLines: 16,
									lineReward: 10
								}
							},
							original: 'robot.drive(4);\nrobot.turnLeft();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(4);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(3);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.turnLeft();\nrobot.drive(2);',
							outputs: ['robot'],
							allOutputs: {
								robot: {readOnly: true, state: '{"columns":5,"rows":5,"initialX":4,"initialY":4,"initialAngle":90,"mazeObjects":12,"verticalActive":[[false,false,false,false,false],[false,false,false,false,false],[false,false,true,true,true],[true,true,true,true,false],[false,true,true,true,true]],"horizontalActive":[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"blockGoal":[[false,false,false,true,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]]}'}
							},
							editor: {text: 'robot.drive(4);\nrobot.turnLeft();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(2);\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000003')},
						{ $set: {
							userId: user._id,
							name: 'Multiple goals',
							type: 'RobotGoal',
							description: '<p>This time you have to visit <strong>all three</strong> goals, in any order. Programmers always look for the fastest solution. Can you find a fast route?</p>',
							allDares: {
								RobotGoal: {
									totalGoals: 3,
									minGoals: 3,
									goalReward: 50,
									maxLines: 20,
									lineReward: 10
								}
							},
							original: 'robot.drive(2);\nrobot.turnLeft();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(3);\nrobot.turnLeft();\nrobot.drive(1);',
							outputs: ['robot'],
							allOutputs: {
								robot: {readOnly: true, state: '{"columns":5,"rows":5,"initialX":1,"initialY":4,"initialAngle":90,"mazeObjects":12,"verticalActive":[[false,false,false,false,false],[false,false,false,false,false],[false,false,true,false,false],[false,true,false,true,false],[false,false,true,false,false]],"horizontalActive":[[false,false,false,false,false],[false,false,true,false,false],[false,true,false,true,false],[false,false,true,false,true],[false,false,false,false,false]],"blockGoal":[[false,false,false,false,false],[false,true,false,false,false],[false,false,false,false,false],[true,false,false,false,false],[false,false,false,true,false]]}'}
							},
							editor: {}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000004')},
						{ $set: {
							userId: user._id,
							name: 'Manipulation',
							type: 'RobotGoal',
							description: '<p>For this dare you just have to edit the numbers in the program. You can use the <a href="#arrow-manipulation">manipulation button</a> to do this easily. Note that you cannot use extra lines of code, but you can get <strong>extra points</strong> by visiting all goals!</p>',
							allDares: {
								RobotGoal: {
									totalGoals: 7,
									minGoals: 5,
									goalReward: 50,
									maxLines: 11,
									lineReward: 10
								}
							},
							original: 'robot.drive(7);\nrobot.turnRight();\nrobot.drive(6);\nrobot.turnRight();\nrobot.drive(7);\nrobot.turnRight();\nrobot.drive(4);\nrobot.turnRight();\nrobot.drive(3);\nrobot.turnLeft();\nrobot.drive(1);',
							outputs: ['robot'],
							allOutputs: {
								robot: {readOnly: true, previewBlockSize: 32, state: '{"columns":8,"rows":8,"initialX":0,"initialY":7,"initialAngle":90,"mazeObjects":7,"verticalActive":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"horizontalActive":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"blockGoal":[[true,false,false,false,false,false,false,false],[false,false,false,false,true,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,true],[false,false,false,false,true,false,false,false],[false,false,false,false,false,false,false,false],[true,false,false,false,false,false,false,true],[false,false,false,false,true,false,false,false]],"numGoals":1}'}
							},
							editor: {text: 'robot.drive(3);\nrobot.turnRight();\nrobot.drive(3);\nrobot.turnRight();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(1);\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000005')},
						{ $set: {
							userId: user._id,
							name: 'Knight jump',
							type: 'RobotGoal',
							description: '<p>When programming, you often want to use the same set of commands multiple times. To do this, you can make a <strong>function</strong>, in which you put the commands that you want to use more than once. You can write down the name of this function <strong>instead</strong> of these commands. In the provided <a href="#arrow-left,780,58">program</a>, the name of the function is <var>knightJump</var>, and you can call it by writing <var>knightJump();</var>.</p> <p>For this dare, we created a function for you, which moves the robot like a <strong>knight</strong> jumps on a chess board: two blocks forward, and one to the right. Use the <a href="#arrow-step">step button</a> to see what happens. We have also added a new tab, the <a href="#arrow-tab-info">info tab</a>, with more information about functions.</p>',
							allDares: {
								RobotGoal: {
									totalGoals: 6,
									minGoals: 6,
									goalReward: 50,
									maxLines: 15,
									lineReward: 10
								}
							},
							original: 'function knightJump() {\n  robot.drive(2);\n  robot.turnRight();\n  robot.drive(1);\n}\n\nknightJump();\nknightJump();\nrobot.turnLeft();\nknightJump();\nrobot.drive(1);\nknightJump();\nknightJump();\nknightJump();\n',
							outputs: ['robot', 'info'],
							allOutputs: {
								robot: {readOnly: true, previewBlockSize: 32, state: '{"columns":6,"rows":6,"initialX":0,"initialY":2,"initialAngle":90,"mazeObjects":15,"verticalActive":[[false,false,false,false,false,false],[false,false,false,false,false,false],[false,false,true,true,true,true],[false,false,false,false,false,false],[false,false,false,false,false,false],[false,false,true,true,false,false]],"horizontalActive":[[false,false,false,false,false,false],[false,false,false,false,false,false],[false,false,true,false,false,false],[false,false,true,false,false,false],[false,false,true,false,false,false],[false,false,false,false,false,false]],"blockGoal":[[false,false,false,false,false,false],[true,false,false,false,false,false],[false,false,false,false,true,false],[false,true,true,false,false,false],[false,false,false,false,false,true],[false,false,true,false,false,false]]}'},
								info: {commands: [{id: 'jsmm.function', examples: [0]}, {id: 'robot.drive'}, {id: 'robot.turnLeft'}, {id: 'robot.turnRight'}], scope: false}
							},
							editor: {text: 'function knightJump() {\n  robot.drive(2);\n  robot.turnRight();\n  robot.drive(1);\n}\n\nknightJump();'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000006')},
						{ $set: {
							userId: user._id,
							name: 'Zig-zag',
							type: 'RobotGoal',
							description: '<p>For this you need to write your <strong>own</strong> function. You can try writing a program without a function, but note that you can only use <strong>20 lines</strong> (not counting empty lines and lines with only <var>}</var>).</p>',
							allDares: {
								RobotGoal: {
									totalGoals: 9,
									minGoals: 9,
									goalReward: 50,
									maxLines: 20,
									lineReward: 10
								}
							},
							original: 'function zigzag() {\n  robot.drive(2);\n  robot.turnRight();\n  robot.drive(1);\n  robot.turnLeft();\n  robot.drive(1);\n  robot.turnLeft();\n  robot.drive(1);\n  robot.turnRight();\n}\n\nzigzag();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(1);\nzigzag();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(1);\nzigzag();',
							outputs: ['robot', 'info'],
							allOutputs: {
								robot: {readOnly: true, previewBlockSize: 48, state: '{"columns":6,"rows":6,"initialX":0,"initialY":5,"initialAngle":90,"mazeObjects":26,"verticalActive":[[false,false,false,false,false,false],[false,false,false,false,true,false],[false,false,true,true,false,false],[false,true,false,false,false,false],[true,false,false,true,true,false],[false,true,false,false,false,false]],"horizontalActive":[[false,false,false,true,false,false],[false,false,true,false,true,false],[false,true,false,false,false,false],[false,false,true,false,false,false],[false,false,true,true,false,true],[false,false,false,false,true,false]],"blockGoal":[[false,false,true,false,true,false],[false,false,false,true,false,false],[true,false,false,false,false,false],[false,true,false,false,false,false],[true,false,false,true,false,false],[false,false,true,false,true,false]]}'},
								info: {commands: [{id: 'jsmm.function', examples: [0]}, {id: 'robot.drive'}, {id: 'robot.turnLeft'}, {id: 'robot.turnRight'}], scope: false}
							},
							editor: {}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000007')},
						{ $set: {
							userId: user._id,
							name: 'ForwardRight',
							type: 'RobotGoal',
							description: '<p>Sometimes you want to use the same commands, but only slightly different every time. In this dare, you want to move forward and then right, but with a different distance every time.</p><p>For this you can use an <strong>argument</strong> in the function. After the function name you give a name for the argument, and the argument then <strong>contains</strong> the number you put in when calling the function. You can then use this name when calling the commands in the function.</p><p>We have created an example for you, try to see what happens when you <a href="#arrow-step">step</a> through it.</p>',
							allDares: {
								RobotGoal: {
									totalGoals: 1,
									minGoals: 1,
									goalReward: 50,
									maxLines: 20,
									lineReward: 10
								}
							},
							original: 'function forwardRight(distance) {\n  robot.drive(distance);\n  robot.turnRight();\n}\n\nforwardRight(7);\nforwardRight(7);\nforwardRight(7);\nforwardRight(6);\nforwardRight(6);\nforwardRight(5);\nforwardRight(5);\nforwardRight(4);\nforwardRight(4);\nforwardRight(3);\nforwardRight(3);\nforwardRight(2);\nforwardRight(2);\nforwardRight(1);\nforwardRight(1);',
							outputs: ['robot', 'info'],
							allOutputs: {
								robot: {readOnly: true, previewBlockSize: 32, state: '{"columns":8,"rows":8,"initialX":0,"initialY":7,"initialAngle":90,"mazeObjects":50,"verticalActive":[[false,false,false,false,false,false,false,false],[false,true,true,true,true,true,true,true],[false,false,true,true,true,true,true,false],[false,false,false,true,true,true,false,false],[false,false,false,false,true,false,false,false],[false,false,false,true,true,false,false,false],[false,false,true,true,true,true,false,false],[false,true,true,true,true,true,true,false]],"horizontalActive":[[false,false,false,false,false,false,false,false],[false,true,false,false,false,false,false,false],[false,true,true,false,false,false,false,true],[false,true,true,true,false,false,true,true],[false,true,true,true,false,true,true,true],[false,true,true,false,false,false,true,true],[false,true,false,false,false,false,false,true],[false,false,false,false,false,false,false,false]],"blockGoal":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,true,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"numGoals":1}'},
								info: {commands: [{id: 'jsmm.function', examples: [0]}, {id: 'robot.drive'}, {id: 'robot.turnLeft'}, {id: 'robot.turnRight'}], scope: false}
							},
							editor: {text: 'function forwardRight(distance) {\n  robot.drive(distance);\n  robot.turnRight();\n}\n\nforwardRight(7);\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000008')},
						{ $set: {
							userId: user._id,
							name: 'More functions',
							type: 'RobotGoal',
							description: '<p>For this one you probably need to make one (or more) functions, since you can use no more than <strong>17 lines</strong> of code.</p>',
							allDares: {
								RobotGoal: {
									totalGoals: 3,
									minGoals: 3,
									goalReward: 50,
									maxLines: 17,
									lineReward: 10
								}
							},
							original: 'function move(distance) {\n  robot.drive(distance);\n  robot.turnLeft();\n  robot.drive(1);\n  robot.turnLeft();\n  robot.drive(distance);\n  robot.turnRight();\n  robot.drive(1);\n  robot.turnRight();\n}\n\nmove(6);\nmove(4);\nmove(2);',
							outputs: ['robot', 'info'],
							allOutputs: {
								robot: {readOnly: true, previewBlockSize: 32, state: '{"columns":7,"rows":7,"initialX":6,"initialY":6,"initialAngle":90,"mazeObjects":31,"verticalActive":[[false,false,false,false,false,false,false],[false,false,false,false,true,true,false],[false,false,false,false,false,true,true],[false,false,true,true,true,true,false],[false,false,false,true,true,true,true],[true,true,true,true,true,true,false],[false,true,true,true,true,true,true]],"horizontalActive":[[false,false,false,false,false,false,false],[false,false,false,false,true,false,false],[false,false,false,false,true,false,false],[false,false,true,false,false,false,false],[false,false,true,false,false,false,false],[false,false,false,false,false,false,false],[false,false,false,false,false,false,false]],"blockGoal":[[false,false,false,false,false,false,true],[false,false,false,false,false,false,false],[false,false,false,false,false,false,true],[false,false,false,false,false,false,false],[false,false,false,false,false,false,true],[false,false,false,false,false,false,false],[false,false,false,false,false,false,false]]}'},
								info: {commands: [{id: 'jsmm.function', examples: [0]}, {id: 'robot.drive'}, {id: 'robot.turnLeft'}, {id: 'robot.turnRight'}], scope: false}
							},
							editor: {}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000009')},
						{ $set: {
							userId: user._id,
							name: 'Animal',
							type: 'ImageMatch',
							description: '<p>You can already apply some stuff you have learned to <strong>drawing shapes</strong> on a canvas. For this dare you have to draw a simple animal using rectangles. We have already drawn the head for you.</p><p>Try to figure out with the <a href="#arrow-manipulation">manipulation button</a> what all the numbers do, and add the rectangles for the <strong>body and legs</strong>. You can also use the <a href="#arrow-tab-info">info tab</a> for more information on drawing commands. Do not worry about the <var>var context = canvas.getContext("2d");</var> line for now. If you like, you can try to give the animal a color.</p>',
							allDares: {
								ImageMatch: {
									speed: 500,
									minPercentage: 97,
									maxLines: 10,
									lineReward: 10
								}
							},
							original: 'var context = canvas.getContext("2d");\n\ncontext.fillRect(150, 50, 50, 50);\ncontext.fillRect(50, 100, 100, 50);\ncontext.fillRect(50, 150, 30, 50);\ncontext.fillRect(120, 150, 30, 50);',
							outputs: ['canvas', 'info'],
							allOutputs: {
								canvas: {size: 256},
								info: {commands: [{id: 'canvas.getContext'}, {id: 'context.fillRect'}, {id: 'context.fillStyle'}], scope: false}
							},
							editor: {text: 'var context = canvas.getContext("2d");\n\ncontext.fillRect(150, 50, 50, 50);\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000010')},
						{ $set: {
							userId: user._id,
							name: 'Zoo',
							type: 'ImageMatch',
							description: '<p>When you can draw one animal, you can draw a zoo, using a function. We have again provided you with a program that draws the head of some animals. If you find this dare too hard, you can leave it for now and try it again later.</p>',
							allDares: {
								ImageMatch: {
									speed: 200,
									minPercentage: 97,
									maxLines: 10,
									lineReward: 10
								}
							},
							original: 'var context = canvas.getContext("2d");\n\nfunction animal(x, y) {\n  context.fillRect(x+150, y+50, 50, 50);\n  context.fillRect(x+50, y+100, 100, 50);\n  context.fillRect(x+50, y+150, 30, 50);\n  context.fillRect(x+120, y+150, 30, 50);\n}\n\nanimal(0, 0);\nanimal(250, 0);\nanimal(0, 250);\nanimal(250, 250);',
							outputs: ['canvas', 'info'],
							allOutputs: {
								canvas: {size: 512},
								info: {commands: [{id: 'jsmm.arithmetic.numbers', examples: [1]}, {id: 'jsmm.function', examples: [0]}, {id: 'canvas.getContext'}, {id: 'context.fillRect'}, {id: 'context.fillStyle'}], scope: false}
							},
							editor: {text: 'var context = canvas.getContext("2d");\n\nfunction animal(x, y) {\n  context.fillRect(x+150, y+50, 50, 50);\n}\n\nanimal(0, 0);\nanimal(250, 0);\nanimal(0, 250);\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000100')},
						{ $set: {
							userId: user._id,
							name: 'Hello world!',
							type: 'ConsoleMatch',
							description: '<p>In this dare we will use the <a href="#arrow-tab-console">console</a>, which is simply a box that contains text. With <var>console.log</var> you can add any value to the console. For example, <var>console.log(10);</var> adds the number <var>10</var> to the console.</p><p>You can also use strings, which are pieces of text, such as <var>"Hello!"</var>. Strings start and end with quotations (<var>"</var>). For this dare you have to write a few sentences to the console.</p>',
							allDares: {
								ConsoleMatch: {
									speed: 500,
									minPercentage: 97,
									maxLines: 5,
									lineReward: 10
								}
							},
							original: 'console.log("Hello world!");\nconsole.log("Right now I am learning programming.");\nconsole.log("Soon I will make more interesting programs.");',
							outputs: ['console', 'info'],
							allOutputs: {
								console: {},
								info: {commands: [{id: 'jsmm.number'}, {id: 'jsmm.string'}, {id: 'console.log'}], scope: false}
							},
							editor: {text: 'console.log("Hello world!");\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000101')},
						{ $set: {
							userId: user._id,
							name: 'Some people',
							type: 'ConsoleMatch',
							description: '<p>For this dare you need to make a list of some famous people in computing, with their names and birth years, like the example below. We have already added the list for you, but you need to finish the function <var>person</var>.</p><p>In order to combine two strings, you can use <var>+</var>. For example, <var>"Hello " + "world!"</var> gives <var>"Hello world!"</var>.',
							allDares: {
								ConsoleMatch: {
									speed: 50,
									minPercentage: 97,
									maxLines: 20,
									lineReward: 10
								}
							},
							original: 'function person(name, born) {\n  console.log("Name    : " + name);\n  console.log("Born in : " + born);\n  console.log("");\n}\n\nconsole.log("Famous people in computing:");\nconsole.log("");\nperson("Charles Babbage", 1815);\nperson("Ada Lovelace", 1815);\nperson("George Boole", 1815);\nperson("Grace Hopper", 1906);\nperson("Alan Turing", 1912);\nperson("Douglas Engelbart", 1925);\nperson("Bill Gates", 1955);\nperson("Steve Jobs", 1955);\nperson("Linus Torvalds", 1969);\nperson("Tim Berners-Lee", 1955);\nconsole.log("And many more...");',
							outputs: ['console', 'info'],
							allOutputs: {
								console: {},
								info: {commands: [{id: 'jsmm.number'}, {id: 'jsmm.string'}, {id: 'jsmm.arithmetic.strings'}, {id: 'jsmm.function', examples: [0,1]}, {id: 'console.log'}], scope: false}
							},
							editor: {text: 'function person(name, born) {\n  console.log(name + "...");\n}\n\nconsole.log("Famous people in computing:");\nconsole.log("");\nperson("Charles Babbage", 1815);\nperson("Ada Lovelace", 1815);\nperson("George Boole", 1815);\nperson("Grace Hopper", 1906);\nperson("Alan Turing", 1912);\nperson("Douglas Engelbart", 1925);\nperson("Bill Gates", 1955);\nperson("Steve Jobs", 1955);\nperson("Linus Torvalds", 1969);\nperson("Tim Berners-Lee", 1955);\nconsole.log("And many more...");'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000102')},
						{ $set: {
							userId: user._id,
							name: 'Calculating',
							type: 'ConsoleMatch',
							description: '<p>Computers are very good at making calculations. In this dare you have a function <var>calculate</var>, with two arguments, <var>a</var> and <var>b</var>. You have to log the values of these variables, and then their multiplication.</p><p>To multiply two numbers you can use <var>*</var>, for example <var>3*11</var> gives <var>33</var>.</p>',
							allDares: {
								ConsoleMatch: {
									speed: 200,
									minPercentage: 97,
									maxLines: 12,
									lineReward: 10
								}
							},
							original: 'function calculate(a, b) {\n  console.log("a is " + a);\n  console.log("b is " + b);\n  console.log("a times b is " + a*b);\n  console.log("");\n}\n\ncalculate(1, 1);\ncalculate(3, 5);\ncalculate(9, 8);\ncalculate(123456789, 0);\ncalculate(299792458, 3600);',
							outputs: ['console', 'info'],
							allOutputs: {
								console: {},
								info: {commands: [{id: 'jsmm.number'}, {id: 'jsmm.string'}, {id: 'jsmm.arithmetic.numbers'}, {id: 'jsmm.arithmetic.strings'}, {id: 'jsmm.function', examples: [0,1]}, {id: 'console.log'}], scope: false}
							},
							editor: {text: 'function calculate(a, b) {\n}\n\ncalculate(1, 1);\ncalculate(3, 5);\ncalculate(9, 8);\ncalculate(123456789, 0);\ncalculate(299792458, 3600);'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000103')},
						{ $set: {
							userId: user._id,
							name: 'More math',
							type: 'ConsoleMatch',
							description: '<p>For this dare you have to use all the basic math operators: addition, subtraction, multiplication, and division. See the <a href="#arrow-tab-info">info tab</a> to find out which is which. We already added the line for multiplication. For bonus points, you can try to figure out what the last call to <var>calculate</var> should be.</p>',
							allDares: {
								ConsoleMatch: {
									speed: 200,
									minPercentage: 80,
									maxLines: 13,
									lineReward: 10
								}
							},
							original: 'function calculate(a, b) {\n  console.log("a + b = " + (a+b));\n  console.log("a - b = " + (a-b));\n  console.log("a * b = " + (a*b));\n  console.log("a / b = " + (a/b));\n  console.log("");\n}\n\ncalculate(8, 4);\ncalculate(10, 20);\ncalculate(0.5, 0.75);\ncalculate(-500, 500);\ncalculate(5, 4);',
							outputs: ['console', 'info'],
							allOutputs: {
								console: {},
								info: {commands: [{id: 'jsmm.number'}, {id: 'jsmm.string'}, {id: 'jsmm.arithmetic.numbers'}, {id: 'jsmm.arithmetic.strings'}, {id: 'jsmm.function', examples: [0,1]}, {id: 'console.log'}, {id: 'console.clear'}, {id: 'console.setColor'}], scope: false}
							},
							editor: {text: 'function calculate(a, b) {\n  console.log("a * b = " + (a*b));\n}\n\ncalculate(8, 4);\ncalculate(10, 20);\ncalculate(0.5, 0.75);\ncalculate(-500, 500);\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000104')},
						{ $set: {
							userId: user._id,
							name: 'Years ago',
							type: 'ConsoleMatch',
							description: '<p>Using subtraction you can now calculate how many years before 2012 the famous people were born.</p>',
							allDares: {
								ConsoleMatch: {
									speed: 200,
									minPercentage: 97,
									maxLines: 22,
									lineReward: 10
								}
							},
							original: 'function person(name, born) {\n  console.log("Name    : " + name);\n  console.log("Born in : " + born);\n  console.log("(" + (2012-born) + " years ago)");\n  console.log("");\n}\n\nconsole.log("Famous people in computing:");\nconsole.log("");\nperson("Charles Babbage", 1815);\nperson("Ada Lovelace", 1815);\nperson("George Boole", 1815);\nperson("Grace Hopper", 1906);\nperson("Alan Turing", 1912);\nperson("Douglas Engelbart", 1925);\nperson("Bill Gates", 1955);\nperson("Steve Jobs", 1955);\nperson("Linus Torvalds", 1969);\nperson("Tim Berners-Lee", 1955);\nconsole.log("And many more...");',
							outputs: ['console', 'info'],
							allOutputs: {
								console: {},
								info: {commands: [{id: 'jsmm.number'}, {id: 'jsmm.string'}, {id: 'jsmm.arithmetic.numbers'}, {id: 'jsmm.arithmetic.strings'}, {id: 'jsmm.function', examples: [0,1]}, {id: 'console.log'}, {id: 'console.clear'}, {id: 'console.setColor'}], scope: false}
							},
							editor: {text: 'function person(name, born) {\n}\n\nconsole.log("Famous people in computing:");\nconsole.log("");\nperson("Charles Babbage", 1815);\nperson("Ada Lovelace", 1815);\nperson("George Boole", 1815);\nperson("Grace Hopper", 1906);\nperson("Alan Turing", 1912);\nperson("Douglas Engelbart", 1925);\nperson("Bill Gates", 1955);\nperson("Steve Jobs", 1955);\nperson("Linus Torvalds", 1969);\nperson("Tim Berners-Lee", 1955);\nconsole.log("And many more...");'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000105')},
						{ $set: {
							userId: user._id,
							name: 'Comparisons',
							type: 'ConsoleMatch',
							description: '<p>In this dare you have to compare numbers. There are a couple of operators for this, for example <var>a &lt; b</var> compares if <var>a</var> is less than <var>b</var>. See the <a href="#arrow-tab-info">info tab</a> for a full list.</p><p>Every comparison operator returns a <strong>boolean</strong>, which is a value that is either <var>true</var> or <var>false</var>. You can use <var>console.log</var> to print booleans to the console, just as with numbers and strings. For example, <var>5 &lt; 10</var> gives <var>true</var>.</p>',
							allDares: {
								ConsoleMatch: {
									speed: 200,
									minPercentage: 97,
									maxLines: 11,
									lineReward: 10
								}
							},
							original: 'function comparisons(number) {\n  console.log(number + " less than 10: " + (number < 10));\n  console.log(number + " equal to 10: " + (number == 10));\n  console.log(number + " more than 10: " + (number > 10));\n  console.log("");\n}\n\ncomparisons(-10);\ncomparisons(5);\ncomparisons(10);\ncomparisons(15);',
							outputs: ['console', 'info'],
							allOutputs: {
								console: {},
								info: {commands: [{id: 'jsmm.number'}, {id: 'jsmm.string'}, {id: 'jsmm.boolean'}, {id: 'jsmm.arithmetic.numbers'}, {id: 'jsmm.arithmetic.strings'}, {id: 'jsmm.logic.equality'}, {id: 'jsmm.logic.comparison'}, {id: 'jsmm.logic.inversion'}, {id: 'jsmm.logic.booleans'}, {id: 'jsmm.function', examples: [0,1]}, {id: 'console.log'}, {id: 'console.clear'}, {id: 'console.setColor'}], scope: false}
							},
							editor: {}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000106')},
						{ $set: {
							userId: user._id,
							name: 'Counting',
							type: 'ConsoleMatch',
							description: '<p>The provided program prints the powers of 2 to the console. It uses a <strong>variable</strong> named <var>counter</var>, and a <strong>while loop</strong>. Try to figure out how it works by using the <a href="#arrow-step">step button</a> and <a href="#arrow-tab-info">info tab</a>. Then modify the program so that instead it prints the numbers from 1 to 20.</p><p>',
							allDares: {
								ConsoleMatch: {
									speed: 200,
									minPercentage: 97,
									maxLines: 5,
									lineReward: 10
								}
							},
							original: 'var counter = 1;\nwhile(counter <= 20) {\n  console.log(counter);\n  counter = counter+1;\n}\n',
							outputs: ['console', 'info'],
							allOutputs: {
								console: {},
								info: {commands: [{id: 'jsmm.number'}, {id: 'jsmm.string'}, {id: 'jsmm.boolean'}, {id: 'jsmm.var'}, {id: 'jsmm.assignment'}, {id: 'jsmm.arithmetic.numbers'}, {id: 'jsmm.arithmetic.strings'}, {id: 'jsmm.logic.equality'}, {id: 'jsmm.logic.comparison'}, {id: 'jsmm.logic.inversion'}, {id: 'jsmm.logic.booleans'}, {id: 'jsmm.while'}, {id: 'jsmm.function', examples: [0,1]}, {id: 'console.log'}, {id: 'console.clear'}, {id: 'console.setColor'}], scope: true}
							},
							editor: {text: 'var counter = 1;\nwhile(counter < 300) {\n  console.log(counter);\n  counter = counter*2;\n}\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000107')},
						{ $set: {
							userId: user._id,
							name: 'Spiraling out of control',
							type: 'RobotGoal',
							description: '<p>The robot has to follow a certain pattern, as you can see in the program. However, the current program is a bit long and repetitive. Make it shorter by using a counter and a while loop.</p>',
							allDares: {
								RobotGoal: {
									totalGoals: 1,
									minGoals: 1,
									goalReward: 50,
									maxLines: 7,
									lineReward: 10
								}
							},
							original: 'var counter = 1;\nwhile(counter <= 7) {\n  robot.drive(counter);\n  robot.turnLeft();\n  counter++;\n}',
							outputs: ['robot', 'info'],
							allOutputs: {
								robot: {readOnly: true, previewBlockSize: 32, state: '{"columns":8,"rows":8,"initialX":4,"initialY":3,"initialAngle":90,"mazeObjects":45,"verticalActive":[[false,false,false,false,false,false,false,false],[false,true,true,true,true,true,true,true],[false,false,true,true,true,true,false,false],[false,false,false,true,true,false,false,false],[false,false,false,true,false,false,false,false],[false,false,true,true,false,false,false,false],[false,true,true,true,true,false,false,false],[true,true,true,true,true,true,false,false]],"horizontalActive":[[false,false,false,false,false,false,false,false],[false,true,false,false,false,false,false,false],[false,true,true,false,false,false,true,false],[false,true,true,true,false,true,true,false],[false,true,true,false,true,true,true,false],[false,true,false,false,false,true,true,false],[false,false,false,false,false,false,true,false],[false,false,false,false,false,false,false,false]],"blockGoal":[[false,false,false,false,false,false,false,true],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"numGoals":1}'},
								info: {commands: [{id: 'jsmm.number'}, {id: 'jsmm.string'}, {id: 'jsmm.boolean'}, {id: 'jsmm.var'}, {id: 'jsmm.assignment'}, {id: 'jsmm.arithmetic.numbers'}, {id: 'jsmm.arithmetic.strings'}, {id: 'jsmm.logic.equality'}, {id: 'jsmm.logic.comparison'}, {id: 'jsmm.logic.inversion'}, {id: 'jsmm.logic.booleans'}, {id: 'jsmm.while'}, {id: 'jsmm.function', examples: [0,1]}, {id: 'robot.drive'}, {id: 'robot.turnLeft'}, {id: 'robot.turnRight'}], scope: true}
							},
							editor: {text: 'robot.drive(1);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.turnLeft();\nrobot.drive(3);\nrobot.turnLeft();\nrobot.drive(4);\nrobot.turnLeft();\nrobot.drive(5);\nrobot.turnLeft();\nrobot.drive(6);\nrobot.turnLeft();\nrobot.drive(7);\nrobot.turnLeft();\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000108')},
						{ $set: {
							userId: user._id,
							name: 'Good morning, good afternoon',
							type: 'ConsoleMatch',
							description: '<p>The while-loop is used to keep repeating while some condition is true, but it is also useful to test only once whether some condition is true or false. For this you can use the <strong>if-else-statement</strong>, as seen in the <a href="#arrow-left,740,73">example</a>. If the condition is true, the program continues to the first brackets. Else, it jumps to the <var>else</var> brackets. Complete the program using a while-loop to call the function a number of times.</p>',
							allDares: {
								ConsoleMatch: {
									speed: 200,
									minPercentage: 97,
									maxLines: 10,
									lineReward: 10
								}
							},
							original: 'function hello(hour) {\n  if (hour < 12) {\n    console.log("Good morning at " + hour);\n  } else {\n    console.log("Good afternoon at " + hour);\n  }\n}\n\nvar hour = 5;\nwhile(hour <= 19) {\n  hello(hour);\n  hour = hour + 1;\n}',
							outputs: ['console', 'info'],
							allOutputs: {
								console: {},
								info: {commands: [{id: 'jsmm.number'}, {id: 'jsmm.string'}, {id: 'jsmm.boolean'}, {id: 'jsmm.var'}, {id: 'jsmm.assignment'}, {id: 'jsmm.arithmetic.numbers'}, {id: 'jsmm.arithmetic.strings'}, {id: 'jsmm.logic.equality'}, {id: 'jsmm.logic.comparison'}, {id: 'jsmm.logic.inversion'}, {id: 'jsmm.logic.booleans'}, {id: 'jsmm.if'}, {id: 'jsmm.else'}, {id: 'jsmm.while'}, {id: 'jsmm.function', examples: [0,1]}, {id: 'console.log'}, {id: 'console.clear'}, {id: 'console.setColor'}], scope: true}
							},
							editor: {text: 'function hello(hour) {\n  if (hour < 12) {\n    console.log("Good morning");\n  } else {\n    console.log("");\n  }\n}\n\nhello(10);\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000109')},
						{ $set: {
							userId: user._id,
							name: 'More information',
							type: 'ConsoleMatch',
							description: '<p>Extend the table of famous people to include the year of death for those who have passed away. For those still alive, hide this line entirely.</p>',
							allDares: {
								ConsoleMatch: {
									speed: 50,
									minPercentage: 97,
									maxLines: 22,
									lineReward: 10
								}
							},
							original: 'function person(name, born, died, knownFor) {\n  console.log("Name      : " + name);\n  console.log("Born in   : " + born);\n  if (died > 0) {\n    console.log("Died in   : " + died);\n  }\n  console.log("Known for : " + knownFor);\n  console.log("");\n}\n\nconsole.log("Famous people in computing:");\nconsole.log("");\nperson("Charles Babbage", 1815, 1871, "first computer");\nperson("Ada Lovelace", 1815, 1852, "first programmer");\nperson("George Boole", 1815, 1864, "Boolean logic");\nperson("Grace Hopper", 1906, 1992, "first language");\nperson("Alan Turing", 1912, 1954, "Turing machine");\nperson("Douglas Engelbart", 1925, 0, "Computer mouse");\nperson("Bill Gates", 1955, 0, "Microsoft");\nperson("Steve Jobs", 1955, 2011, "Apple");\nperson("Linus Torvalds", 1969, 0, "Linux");\nperson("Tim Berners-Lee", 1955, 0, "World Wide Web");\nconsole.log("And many more...");',
							outputs: ['console', 'info'],
							allOutputs: {
								console: {},
								info: {commands: [{id: 'jsmm.number'}, {id: 'jsmm.string'}, {id: 'jsmm.boolean'}, {id: 'jsmm.var'}, {id: 'jsmm.assignment'}, {id: 'jsmm.arithmetic.numbers'}, {id: 'jsmm.arithmetic.strings'}, {id: 'jsmm.logic.equality'}, {id: 'jsmm.logic.comparison'}, {id: 'jsmm.logic.inversion'}, {id: 'jsmm.logic.booleans'}, {id: 'jsmm.if'}, {id: 'jsmm.else'}, {id: 'jsmm.while'}, {id: 'jsmm.function', examples: [0,1]}, {id: 'console.log'}, {id: 'console.clear'}, {id: 'console.setColor'}], scope: true}
							},
							editor: {text: 'function person(name, born, died, knownFor) {\n}\n\nconsole.log("Famous people in computing:");\nconsole.log("");\nperson("Charles Babbage", 1815, 1871, "first computer");\nperson("Ada Lovelace", 1815, 1852, "first programmer");\nperson("George Boole", 1815, 1864, "Boolean logic");\nperson("Grace Hopper", 1906, 1992, "first language");\nperson("Alan Turing", 1912, 1954, "Turing machine");\nperson("Douglas Engelbart", 1925, 0, "Computer mouse");\nperson("Bill Gates", 1955, 0, "Microsoft");\nperson("Steve Jobs", 1955, 2011, "Apple");\nperson("Linus Torvalds", 1969, 0, "Linux");\nperson("Tim Berners-Lee", 1955, 0, "World Wide Web");\nconsole.log("And many more...");'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000110')},
						{ $set: {
							userId: user._id,
							name: 'Walls, walls, walls',
							type: 'RobotGoal',
							description: '<p>The robot can detect whether it is facing a wall, using <var>robot.detectWall()</var>. This returns <var>true</var> if there is a wall, and <var>false</var> if there isn\'t, as demonstrated using the <a href="#arrow-tab-console">console</a>. This maze is set up so that at every wall the robot has to turn left. Make the robot navigate the maze using a loop instead of specifying its entire path in advance.</p>',
							allDares: {
								RobotGoal: {
									totalGoals: 7,
									minGoals: 7,
									goalReward: 50,
									maxLines: 10,
									lineReward: 10
								}
							},
							original: 'var counter = 0;\nwhile(counter <= 40) {\n  robot.drive(1);\n  if (robot.detectWall()) {\n    robot.turnLeft();\n  }\n  counter++;\n}',
							outputs: ['robot', 'console', 'info'],
							allOutputs: {
								robot: {readOnly: true, previewBlockSize: 32, state: '{"columns":8,"rows":8,"initialX":7,"initialY":7,"initialAngle":90,"mazeObjects":34,"verticalActive":[[false,false,false,false,false,false,false,false],[false,false,true,false,true,false,false,false],[false,false,true,false,false,false,false,false],[false,true,false,false,false,false,true,false],[false,true,false,false,false,true,true,false],[false,false,false,false,false,true,false,false],[false,false,false,false,false,true,false,false],[false,false,false,true,false,false,true,false]],"horizontalActive":[[false,false,false,false,true,false,false,false],[false,false,true,true,true,false,false,true],[false,true,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,true,false,false,false,false,false,true],[false,false,false,false,true,true,true,false],[false,false,false,true,true,false,false,true],[false,true,false,false,false,false,false,false]],"blockGoal":[[false,true,false,false,false,false,false,false],[false,false,false,false,false,false,true,false],[false,false,false,true,false,false,false,false],[false,false,false,false,false,false,false,false],[false,true,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,true,true,false,true,false],[false,false,false,false,false,false,false,false]],"numGoals":1}'},
								console: {},
								info: {commands: [{id: 'jsmm.number'}, {id: 'jsmm.string'}, {id: 'jsmm.boolean'}, {id: 'jsmm.var'}, {id: 'jsmm.assignment'}, {id: 'jsmm.arithmetic.numbers'}, {id: 'jsmm.arithmetic.strings'}, {id: 'jsmm.logic.equality'}, {id: 'jsmm.logic.comparison'}, {id: 'jsmm.logic.inversion'}, {id: 'jsmm.logic.booleans'}, {id: 'jsmm.if'}, {id: 'jsmm.else'}, {id: 'jsmm.while'}, {id: 'jsmm.function', examples: [0,1]}, {id: 'robot.drive'}, {id: 'robot.turnLeft'}, {id: 'robot.turnRight'}, {id: 'robot.detectWall'}, {id: 'console.log'}, {id: 'console.clear'}, {id: 'console.setColor'}], scope: true}
							},
							editor: {text: 'var counter = 0;\nwhile(counter <= 5) {\n  robot.drive(1);\n  console.log(robot.detectWall());\n  counter++;\n}'}
						}}
					);

					console.log('Pre-set values updated; userId of "janpaul123": ' + user._id);
				});
			}
		});
	};
};

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
				db.users.update({'auth.local.username': 'janpaul123'}, {$set: {admin: true}});

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
							published: true,
							name: 'Driving around',
							description: '<p>Before making games, we will go through the <strong>basics</strong> of programming in Javascript. We do this by moving a robot around. The goal is to move the robot to the <strong>green square</strong>.</p><p>On the right you can see a <a href="#arrow-left,750,65">program</a>, which makes a robot move. You can see the robot by clicking on the <a href="#arrow-tab-robot">robot tab</a>.</p><p>The program is not finished yet. Try to <strong>complete</strong> the program, and then click the submit button below.</p>',
							configProgram: 'config.dare.type = "RobotGoal";\nconfig.dare.RobotGoal.goalReward = 50;\nconfig.dare.maxLines = 0;\nconfig.dare.lineReward = 0;\nconfig.dare.RobotGoal.previewBlockSize = 48;\nconfig.dare.hidePreview = true;\n\nconfig.outputs.robot.enabled = true;\nconfig.outputs.robot.readOnly = true;\n',
							original: 'robot.drive(1);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(3);',
							outputStates: {robot: '{"columns":5,"rows":5,"initialX":2,"initialY":4,"initialAngle":90,"mazeObjects":4,"verticalActive":[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"horizontalActive":[[false,false,false,false,false],[false,false,false,true,false],[false,false,false,true,false],[false,false,false,true,false],[false,false,false,false,false]],"blockGoal":[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,true,false,false,false],[false,false,false,false,false]]}'},
							editor: {text: 'robot.drive(1);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(2);\n'}
						}}
					);
					
					db.dares.update({_id: new db.ObjectID('300000000000000000000001')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'Another wall',
							description: '<p>Again, move the robot to the green square, as demonstrated in the <a href="#arrow-left,535,180">preview</a>. To make it a bit more difficult, try to do it in as <strong>few lines</strong> of code as possible. It does not matter what route you take.</p><p>Note that the program we provided has an <strong>error</strong>. Move over the <a href="#arrow-up,557,70">error icon</a> to see what is wrong.</p>',
							configProgram: 'config.dare.type = "RobotGoal";\nconfig.dare.RobotGoal.goalReward = 50;\nconfig.dare.maxLines = 10;\nconfig.dare.lineReward = 10;\nconfig.dare.RobotGoal.previewBlockSize = 48;\n\nconfig.outputs.robot.enabled = true;\nconfig.outputs.robot.readOnly = true;\n',
							original: 'robot.drive(1);\nrobot.turnRight();\nrobot.drive(2);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.turnLeft();\nrobot.drive(3);',
							outputStates: {robot: '{"columns":5,"rows":5,"initialX":2,"initialY":4,"initialAngle":90,"mazeObjects":5,"verticalActive":[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"horizontalActive":[[false,false,false,true,false],[false,false,false,true,false],[false,false,false,true,false],[false,false,false,true,false],[false,false,false,false,false]],"blockGoal":[[false,false,false,false,false],[false,true,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]]}'},
							editor: {text: 'robot.drive(3);\nrobot.turnRight();\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000002')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'Moving some more',
							description: '<p>Again, move the robot to the green square in as few lines as you can.</p>',
							configProgram: 'config.dare.type = "RobotGoal";\nconfig.dare.RobotGoal.goalReward = 50;\nconfig.dare.maxLines = 16;\nconfig.dare.lineReward = 10;\nconfig.dare.RobotGoal.previewBlockSize = 48;\n\nconfig.outputs.robot.enabled = true;\nconfig.outputs.robot.readOnly = true;\n',
							original: 'robot.drive(4);\nrobot.turnLeft();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(4);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(3);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.turnLeft();\nrobot.drive(2);',
							outputStates: {robot: '{"columns":5,"rows":5,"initialX":4,"initialY":4,"initialAngle":90,"mazeObjects":12,"verticalActive":[[false,false,false,false,false],[false,false,false,false,false],[false,false,true,true,true],[true,true,true,true,false],[false,true,true,true,true]],"horizontalActive":[[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]],"blockGoal":[[false,false,false,true,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]]}'},
							editor: {text: 'robot.drive(4);\nrobot.turnLeft();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(2);\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000003')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'Multiple goals',
							description: '<p>This time you have to visit <strong>all three</strong> goals, in any order. Programmers always look for the fastest solution. Can you find a fast route?</p>',
							configProgram: 'config.dare.type = "RobotGoal";\nconfig.dare.RobotGoal.goalReward = 50;\nconfig.dare.maxLines = 20;\nconfig.dare.lineReward = 10;\nconfig.dare.RobotGoal.previewBlockSize = 48;\n\nconfig.outputs.robot.enabled = true;\nconfig.outputs.robot.readOnly = true;\n',
							original: 'robot.drive(2);\nrobot.turnLeft();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(3);\nrobot.turnLeft();\nrobot.drive(1);',
							outputStates: {robot: '{"columns":5,"rows":5,"initialX":1,"initialY":4,"initialAngle":90,"mazeObjects":12,"verticalActive":[[false,false,false,false,false],[false,false,false,false,false],[false,false,true,false,false],[false,true,false,true,false],[false,false,true,false,false]],"horizontalActive":[[false,false,false,false,false],[false,false,true,false,false],[false,true,false,true,false],[false,false,true,false,true],[false,false,false,false,false]],"blockGoal":[[false,false,false,false,false],[false,true,false,false,false],[false,false,false,false,false],[true,false,false,false,false],[false,false,false,true,false]]}'},
							editor: {}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000004')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'Manipulation',
							description: '<p>For this dare you just have to edit the numbers in the program. Move the mouse over a number and drag it to quickly change its value.</p> <p>You can get <strong>extra points</strong> by visiting all goals!</p>',
							configProgram: 'config.dare.type = "RobotGoal";\nconfig.dare.RobotGoal.optionalGoals = 2;\nconfig.dare.RobotGoal.goalReward = 50;\nconfig.dare.maxLines = 11;\nconfig.dare.lineReward = 10;\nconfig.dare.RobotGoal.previewBlockSize = 32;\n\nconfig.outputs.robot.enabled = true;\nconfig.outputs.robot.readOnly = true;\n',
							original: 'robot.drive(7);\nrobot.turnRight();\nrobot.drive(6);\nrobot.turnRight();\nrobot.drive(7);\nrobot.turnRight();\nrobot.drive(4);\nrobot.turnRight();\nrobot.drive(3);\nrobot.turnLeft();\nrobot.drive(1);',
							outputStates: {robot: '{"columns":8,"rows":8,"initialX":0,"initialY":7,"initialAngle":90,"mazeObjects":7,"verticalActive":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"horizontalActive":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"blockGoal":[[true,false,false,false,false,false,false,false],[false,false,false,false,true,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,true],[false,false,false,false,true,false,false,false],[false,false,false,false,false,false,false,false],[true,false,false,false,false,false,false,true],[false,false,false,false,true,false,false,false]],"numGoals":1}'},
							editor: {text: 'robot.drive(3);\nrobot.turnRight();\nrobot.drive(3);\nrobot.turnRight();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(1);\nrobot.turnLeft();\nrobot.drive(1);\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000005')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'Maze',
							description: '<p>When programming, you often want to use the same set of commands multiple times. To do this, you can make a <strong>function</strong>, in which you put the commands that you want to use more than once. You can write down the name of this function <strong>instead</strong> of these commands.</p> <p>In the provided <a href="#arrow-left,780,58">program</a>, the name of the function is <var>leftright</var>, and you can call it by writing <var>leftright();</var>.</p> <p>Finish the program using <var>leftright();</var> multiple times. Use the <a href="#arrow-step">step bar</a> to see what happens exactly.</p>',
							configProgram: 'config.dare.type = "RobotGoal";\nconfig.dare.RobotGoal.goalReward = 50;\nconfig.dare.maxLines = 22;\nconfig.dare.lineReward = 10;\nconfig.dare.RobotGoal.previewBlockSize = 32;\n\nconfig.outputs.robot.enabled = true;\nconfig.outputs.robot.readOnly = true;\nconfig.outputs.info.enabled = true;\nconfig.outputs.info.commands = "jsmm.function[0],robot.drive,robot.turnLeft,robot.turnRight";\nconfig.outputs.info.scope = false;\n',
							original: 'function leftright() {\n  robot.drive(1);\n  robot.turnLeft();\n  robot.drive(1);\n  robot.turnRight();\n}\n\nleftright();\nleftright();\nleftright();\nleftright();\nleftright();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(4);\nrobot.turnRight();\nleftright();\nleftright();\nleftright();\nrobot.drive(3);',
							outputStates: {robot: '{"columns":8,"rows":8,"initialX":5,"initialY":7,"initialAngle":90,"mazeObjects":48,"verticalActive":[[false,false,false,false,false,false,false,false],[false,false,false,true,false,false,false,false],[false,false,true,false,true,false,false,false],[false,false,false,true,false,true,false,false],[false,false,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[false,false,true,false,true,false,true,true],[false,false,false,true,false,true,true,true]],"horizontalActive":[[false,true,false,true,false,false,false,false],[false,true,true,false,true,false,false,false],[false,true,true,true,false,true,false,false],[false,true,true,false,true,false,true,false],[false,true,false,true,false,true,false,true],[false,false,true,false,true,false,true,false],[false,false,false,true,false,true,false,false],[false,false,false,false,true,false,false,false]],"blockGoal":[[false,false,false,false,false,false,false,false],[false,false,false,true,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,true,false,false],[false,true,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,true,false,false,false,false],[false,false,false,false,false,false,false,true]]}'},
							editor: {text: 'function leftright() {\n  robot.drive(1);\n  robot.turnLeft();\n  robot.drive(1);\n  robot.turnRight();\n}\n\nleftright();\nleftright();\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000006')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'Zig-zag',
							description: '<p>For this you need to write your <strong>own</strong> function. You can try writing a program without a function, but note that you can only use <strong>20 lines</strong> (not counting empty lines and lines with only <var>}</var>).</p>',
							configProgram: 'config.dare.type = "RobotGoal";\nconfig.dare.RobotGoal.goalReward = 50;\nconfig.dare.maxLines = 20;\nconfig.dare.lineReward = 10;\nconfig.dare.RobotGoal.previewBlockSize = 32;\n\nconfig.outputs.robot.enabled = true;\nconfig.outputs.robot.readOnly = true;\nconfig.outputs.info.enabled = true;\nconfig.outputs.info.commands = "jsmm.function[0],robot.drive,robot.turnLeft,robot.turnRight";\nconfig.outputs.info.scope = false;\n',
							original: 'function zigzag() {\n  robot.drive(2);\n  robot.turnRight();\n  robot.drive(1);\n  robot.turnLeft();\n  robot.drive(1);\n  robot.turnLeft();\n  robot.drive(1);\n  robot.turnRight();\n}\n\nzigzag();\nrobot.drive(2);\nrobot.turnRight();\nrobot.drive(1);\nzigzag();\nrobot.drive(1);\nrobot.turnRight();\nrobot.drive(1);\nzigzag();',
							outputStates: {robot: '{"columns":6,"rows":6,"initialX":0,"initialY":5,"initialAngle":90,"mazeObjects":26,"verticalActive":[[false,false,false,false,false,false],[false,false,false,false,true,false],[false,false,true,true,false,false],[false,true,false,false,false,false],[true,false,false,true,true,false],[false,true,false,false,false,false]],"horizontalActive":[[false,false,false,true,false,false],[false,false,true,false,true,false],[false,true,false,false,false,false],[false,false,true,false,false,false],[false,false,true,true,false,true],[false,false,false,false,true,false]],"blockGoal":[[false,false,true,false,true,false],[false,false,false,true,false,false],[true,false,false,false,false,false],[false,true,false,false,false,false],[true,false,false,true,false,false],[false,false,true,false,true,false]]}'},
							editor: {}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000007')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'ForwardRight',
							description: '<p>Sometimes you want to use the same commands, but only slightly different every time. In this dare, you want to move forward and then right, but with a different distance every time.</p><p>For this you can use an <strong>argument</strong> in the function. After the function name you give a name for the argument, and the argument then <strong>contains</strong> the number you put in when calling the function. You can then use this name when calling the commands in the function.</p><p>We have created an example for you, try to see what happens when you <a href="#arrow-step">step</a> through it.</p>',
							configProgram: 'config.dare.type = "RobotGoal";\nconfig.dare.RobotGoal.goalReward = 50;\nconfig.dare.maxLines = 20;\nconfig.dare.lineReward = 10;\nconfig.dare.RobotGoal.previewBlockSize = 32;\n\nconfig.outputs.robot.enabled = true;\nconfig.outputs.robot.readOnly = true;\nconfig.outputs.info.enabled = true;\nconfig.outputs.info.commands = "jsmm.function[0],robot.drive,robot.turnLeft,robot.turnRight";\nconfig.outputs.info.scope = false;\n',
							original: 'function forwardRight(distance) {\n  robot.drive(distance);\n  robot.turnRight();\n}\n\nforwardRight(7);\nforwardRight(7);\nforwardRight(7);\nforwardRight(6);\nforwardRight(6);\nforwardRight(5);\nforwardRight(5);\nforwardRight(4);\nforwardRight(4);\nforwardRight(3);\nforwardRight(3);\nforwardRight(2);\nforwardRight(2);\nforwardRight(1);\nforwardRight(1);',
							outputStates: {robot: '{"columns":8,"rows":8,"initialX":0,"initialY":7,"initialAngle":90,"mazeObjects":50,"verticalActive":[[false,false,false,false,false,false,false,false],[false,true,true,true,true,true,true,true],[false,false,true,true,true,true,true,false],[false,false,false,true,true,true,false,false],[false,false,false,false,true,false,false,false],[false,false,false,true,true,false,false,false],[false,false,true,true,true,true,false,false],[false,true,true,true,true,true,true,false]],"horizontalActive":[[false,false,false,false,false,false,false,false],[false,true,false,false,false,false,false,false],[false,true,true,false,false,false,false,true],[false,true,true,true,false,false,true,true],[false,true,true,true,false,true,true,true],[false,true,true,false,false,false,true,true],[false,true,false,false,false,false,false,true],[false,false,false,false,false,false,false,false]],"blockGoal":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,true,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"numGoals":1}'},
							editor: {text: 'function forwardRight(distance) {\n  robot.drive(distance);\n  robot.turnRight();\n}\n\nforwardRight(7);\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000008')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'More functions',
							description: '<p>For this one you probably need to make one (or more) functions, since you can use no more than <strong>17 lines</strong> of code.</p>',
							configProgram: 'config.dare.type = "RobotGoal";\nconfig.dare.RobotGoal.goalReward = 50;\nconfig.dare.maxLines = 17;\nconfig.dare.lineReward = 10;\nconfig.dare.RobotGoal.previewBlockSize = 32;\n\nconfig.outputs.robot.enabled = true;\nconfig.outputs.robot.readOnly = true;\nconfig.outputs.info.enabled = true;\nconfig.outputs.info.commands = "jsmm.function[0],robot.drive,robot.turnLeft,robot.turnRight";\nconfig.outputs.info.scope = false;\n',
							original: 'function move(distance) {\n  robot.drive(distance);\n  robot.turnLeft();\n  robot.drive(1);\n  robot.turnLeft();\n  robot.drive(distance);\n  robot.turnRight();\n  robot.drive(1);\n  robot.turnRight();\n}\n\nmove(6);\nmove(4);\nmove(2);',
							outputStates: {robot: '{"columns":7,"rows":7,"initialX":6,"initialY":6,"initialAngle":90,"mazeObjects":31,"verticalActive":[[false,false,false,false,false,false,false],[false,false,false,false,true,true,false],[false,false,false,false,false,true,true],[false,false,true,true,true,true,false],[false,false,false,true,true,true,true],[true,true,true,true,true,true,false],[false,true,true,true,true,true,true]],"horizontalActive":[[false,false,false,false,false,false,false],[false,false,false,false,true,false,false],[false,false,false,false,true,false,false],[false,false,true,false,false,false,false],[false,false,true,false,false,false,false],[false,false,false,false,false,false,false],[false,false,false,false,false,false,false]],"blockGoal":[[false,false,false,false,false,false,true],[false,false,false,false,false,false,false],[false,false,false,false,false,false,true],[false,false,false,false,false,false,false],[false,false,false,false,false,false,true],[false,false,false,false,false,false,false],[false,false,false,false,false,false,false]]}'},
							editor: {}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000009')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'Animal',
							description: '<p>You can already apply some stuff you have learned to <strong>drawing shapes</strong> on a canvas. For this dare you have to draw a simple animal using rectangles. We have already drawn the head for you.</p><p>Try <strong>dragging</strong> the numbers left and right to figure out what all the numbers do, and add the rectangles for the <strong>body and legs</strong>. You can also use the <a href="#arrow-tab-info">info tab</a> for more information on drawing commands. Do not worry about the <var>var context = canvas.getContext("2d");</var> line for now. If you like, you can try to give the animal a color.</p>',
							configProgram: 'config.dare.type = "ImageMatch";\nconfig.dare.ImageMatch.speed = 500;\nconfig.dare.ImageMatch.minPercentage = 97;\nconfig.dare.maxLines = 10;\nconfig.dare.lineReward = 10;\nconfig.outputs.canvas.enabled = true;\nconfig.outputs.canvas.size = 256;\nconfig.outputs.info.enabled = true;\nconfig.outputs.info.commands = "canvas.getContext,context.fillRect,context.fillStyle";\nconfig.outputs.info.scope = false;\n',
							original: 'var context = canvas.getContext("2d");\n\ncontext.fillRect(150, 50, 50, 50);\ncontext.fillRect(50, 100, 100, 50);\ncontext.fillRect(50, 150, 30, 50);\ncontext.fillRect(120, 150, 30, 50);',
							editor: {text: 'var context = canvas.getContext("2d");\n\ncontext.fillRect(150, 50, 50, 50);\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000010')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'Zoo',
							description: '<p>When you can draw one animal, you can draw a zoo, using a function. We have again provided you with a program that draws the head of some animals. If you find this dare too hard, you can leave it for now and try it again later.</p>',
							configProgram: 'config.dare.type = "ImageMatch";\nconfig.dare.ImageMatch.speed = 200;\nconfig.dare.ImageMatch.minPercentage = 97;\nconfig.dare.maxLines = 10;\nconfig.dare.lineReward = 10;\nconfig.outputs.canvas.enabled = true;\nconfig.outputs.canvas.size = 512;\nconfig.outputs.info.enabled = true;\nconfig.outputs.info.commands = "jsmm.arithmetic.numbers[1],jsmm.function[0],canvas.getContext,context.fillRect,context.fillStyle";\nconfig.outputs.info.scope = false;\n',
							original: 'var context = canvas.getContext("2d");\n\nfunction animal(x, y) {\n  context.fillRect(x+150, y+50, 50, 50);\n  context.fillRect(x+50, y+100, 100, 50);\n  context.fillRect(x+50, y+150, 30, 50);\n  context.fillRect(x+120, y+150, 30, 50);\n}\n\nanimal(0, 0);\nanimal(250, 0);\nanimal(0, 250);\nanimal(250, 250);',
							editor: {text: 'var context = canvas.getContext("2d");\n\nfunction animal(x, y) {\n  context.fillRect(x+150, y+50, 50, 50);\n}\n\nanimal(0, 0);\nanimal(250, 0);\nanimal(0, 250);\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000100')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'Hello world!',
							description: '<p>In this dare we will use the <a href="#arrow-tab-console">console</a>, which is simply a box that contains text. With <var>console.log</var> you can add any value to the console. For example, <var>console.log(10);</var> adds the number <var>10</var> to the console.</p><p>You can also use strings, which are pieces of text, such as <var>"Hello!"</var>. Strings start and end with quotations (<var>"</var>). For this dare you have to write a few sentences to the console.</p>',
							configProgram: 'config.dare.type = "ConsoleMatch";\nconfig.dare.ConsoleMatch.speed = 500;\nconfig.dare.ConsoleMatch.minPercentage = 97;\nconfig.dare.maxLines = 5;\nconfig.dare.lineReward = 10;\nconfig.outputs.console.enabled = true;\nconfig.outputs.info.enabled = true;\nconfig.outputs.info.commands = "jsmm.number,jsmm.string,console.log";\nconfig.outputs.info.scope = false;\n',
							original: 'console.log("Hello world!");\nconsole.log("Right now I am learning programming.");\nconsole.log("Soon I will make more interesting programs.");',
							editor: {text: 'console.log("Hello world!");\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000101')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'Some people',
							description: '<p>For this dare you need to make a list of some famous people in computing, with their names and birth years, like the example below. We have already added the list for you, but you need to finish the function <var>person</var>.</p><p>In order to combine two strings, you can use <var>+</var>. For example, <var>"Hello " + "world!"</var> gives <var>"Hello world!"</var>.</p>',
							configProgram: 'config.dare.type = "ConsoleMatch";\nconfig.dare.ConsoleMatch.speed = 50;\nconfig.dare.ConsoleMatch.minPercentage = 97;\nconfig.dare.maxLines = 20;\nconfig.dare.lineReward = 10;\nconfig.outputs.console.enabled = true;\nconfig.outputs.info.enabled = true;\nconfig.outputs.info.commands = "jsmm.number,jsmm.string,jsmm.arithmetic.strings,jsmm.function[0],jsmm.function[1],console.log";\nconfig.outputs.info.scope = false;\n',
							original: 'function person(name, born) {\n  console.log("Name    : " + name);\n  console.log("Born in : " + born);\n  console.log("");\n}\n\nconsole.log("Famous people in computing:");\nconsole.log("");\nperson("Charles Babbage", 1815);\nperson("Ada Lovelace", 1815);\nperson("George Boole", 1815);\nperson("Grace Hopper", 1906);\nperson("Alan Turing", 1912);\nperson("Douglas Engelbart", 1925);\nperson("Bill Gates", 1955);\nperson("Steve Jobs", 1955);\nperson("Linus Torvalds", 1969);\nperson("Tim Berners-Lee", 1955);\nconsole.log("And many more...");',
							editor: {text: 'function person(name, born) {\n  console.log(name + "...");\n}\n\nconsole.log("Famous people in computing:");\nconsole.log("");\nperson("Charles Babbage", 1815);\nperson("Ada Lovelace", 1815);\nperson("George Boole", 1815);\nperson("Grace Hopper", 1906);\nperson("Alan Turing", 1912);\nperson("Douglas Engelbart", 1925);\nperson("Bill Gates", 1955);\nperson("Steve Jobs", 1955);\nperson("Linus Torvalds", 1969);\nperson("Tim Berners-Lee", 1955);\nconsole.log("And many more...");'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000102')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'Calculating',
							description: '<p>Computers are very good at making calculations. In this dare you have a function <var>calculate</var>, with two arguments, <var>a</var> and <var>b</var>. You have to log the values of these variables, and then their multiplication.</p><p>To multiply two numbers you can use <var>*</var>, for example <var>3*11</var> gives <var>33</var>.</p>',
							configProgram: 'config.dare.type = "ConsoleMatch";\nconfig.dare.ConsoleMatch.speed = 200;\nconfig.dare.ConsoleMatch.minPercentage = 97;\nconfig.dare.maxLines = 12;\nconfig.dare.lineReward = 10;\nconfig.outputs.console.enabled = true;\nconfig.outputs.info.enabled = true;\nconfig.outputs.info.commands = "jsmm.number,jsmm.string,jsmm.arithmetic.numbers,jsmm.arithmetic.strings,jsmm.function[0],jsmm.function[1],console.log";\nconfig.outputs.info.scope = false;\n',
							original: 'function calculate(a, b) {\n  console.log("a is " + a);\n  console.log("b is " + b);\n  console.log("a times b is " + a*b);\n  console.log("");\n}\n\ncalculate(1, 1);\ncalculate(3, 5);\ncalculate(9, 8);\ncalculate(123456789, 0);\ncalculate(299792458, 3600);',
							editor: {text: 'function calculate(a, b) {\n}\n\ncalculate(1, 1);\ncalculate(3, 5);\ncalculate(9, 8);\ncalculate(123456789, 0);\ncalculate(299792458, 3600);'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000103')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'More math',
							description: '<p>For this dare you have to use all the basic math operators: addition, subtraction, multiplication, and division. See the <a href="#arrow-tab-info">info tab</a> to find out which is which. We already added the line for multiplication. For bonus points, you can try to figure out what the last call to <var>calculate</var> should be.</p>',
							configProgram: 'config.dare.type = "ConsoleMatch";\nconfig.dare.ConsoleMatch.speed = 200;\nconfig.dare.ConsoleMatch.minPercentage = 80;\nconfig.dare.maxLines = 13;\nconfig.dare.lineReward = 10;\nconfig.outputs.console.enabled = true;\nconfig.outputs.info.enabled = true;\nconfig.outputs.info.commands = "jsmm.number,jsmm.string,jsmm.arithmetic.numbers,jsmm.arithmetic.strings,jsmm.function[0],jsmm.function[1],console.log,console.clear,console.setColor";\nconfig.outputs.info.scope = false;\n',
							original: 'function calculate(a, b) {\n  console.log("a + b = " + (a+b));\n  console.log("a - b = " + (a-b));\n  console.log("a * b = " + (a*b));\n  console.log("a / b = " + (a/b));\n  console.log("");\n}\n\ncalculate(8, 4);\ncalculate(10, 20);\ncalculate(0.5, 0.75);\ncalculate(-500, 500);\ncalculate(5, 4);',
							editor: {text: 'function calculate(a, b) {\n  console.log("a * b = " + (a*b));\n}\n\ncalculate(8, 4);\ncalculate(10, 20);\ncalculate(0.5, 0.75);\ncalculate(-500, 500);\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000104')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'Years ago',
							description: '<p>Using subtraction you can now calculate how many years before 2013 the famous people were born.</p>',
							configProgram: 'config.dare.type = "ConsoleMatch";\nconfig.dare.ConsoleMatch.speed = 200;\nconfig.dare.ConsoleMatch.minPercentage = 97;\nconfig.dare.maxLines = 22;\nconfig.dare.lineReward = 10;\nconfig.outputs.console.enabled = true;\nconfig.outputs.info.enabled = true;\nconfig.outputs.info.commands = "jsmm.number,jsmm.string,jsmm.arithmetic.numbers,jsmm.arithmetic.strings,jsmm.function[0],jsmm.function[1],console.log,console.clear,console.setColor";\nconfig.outputs.info.scope = false;\n',
							original: 'function person(name, born) {\n  console.log("Name    : " + name);\n  console.log("Born in : " + born);\n  console.log("(" + (2013-born) + " years ago)");\n  console.log("");\n}\n\nconsole.log("Famous people in computing:");\nconsole.log("");\nperson("Charles Babbage", 1815);\nperson("Ada Lovelace", 1815);\nperson("George Boole", 1815);\nperson("Grace Hopper", 1906);\nperson("Alan Turing", 1912);\nperson("Douglas Engelbart", 1925);\nperson("Bill Gates", 1955);\nperson("Steve Jobs", 1955);\nperson("Linus Torvalds", 1969);\nperson("Tim Berners-Lee", 1955);\nconsole.log("And many more...");',
							editor: {text: 'function person(name, born) {\n}\n\nconsole.log("Famous people in computing:");\nconsole.log("");\nperson("Charles Babbage", 1815);\nperson("Ada Lovelace", 1815);\nperson("George Boole", 1815);\nperson("Grace Hopper", 1906);\nperson("Alan Turing", 1912);\nperson("Douglas Engelbart", 1925);\nperson("Bill Gates", 1955);\nperson("Steve Jobs", 1955);\nperson("Linus Torvalds", 1969);\nperson("Tim Berners-Lee", 1955);\nconsole.log("And many more...");'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000105')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'Comparisons',
							description: '<p>In this dare you have to compare numbers. There are a couple of operators for this, for example <var>a &lt; b</var> compares if <var>a</var> is less than <var>b</var>. See the <a href="#arrow-tab-info">info tab</a> for a full list.</p><p>Every comparison operator returns a <strong>boolean</strong>, which is a value that is either <var>true</var> or <var>false</var>. You can use <var>console.log</var> to print booleans to the console, just as with numbers and strings. For example, <var>5 &lt; 10</var> gives <var>true</var>.</p>',
							configProgram: 'config.dare.type = "ConsoleMatch";\nconfig.dare.ConsoleMatch.speed = 200;\nconfig.dare.ConsoleMatch.minPercentage = 97;\nconfig.dare.maxLines = 11;\nconfig.dare.lineReward = 10;\nconfig.outputs.console.enabled = true;\nconfig.outputs.info.enabled = true;\nconfig.outputs.info.commands = "jsmm.number,jsmm.string,jsmm.boolean,jsmm.arithmetic.numbers,jsmm.arithmetic.strings,jsmm.logic.equality,jsmm.logic.comparison,jsmm.logic.inversion,jsmm.logic.booleans,jsmm.function[0],jsmm.function[1],console.log,console.clear,console.setColor";\nconfig.outputs.info.scope = false;\n',
							original: 'function comparisons(number) {\n  console.log(number + " less than 10: " + (number < 10));\n  console.log(number + " equal to 10: " + (number == 10));\n  console.log(number + " more than 10: " + (number > 10));\n  console.log("");\n}\n\ncomparisons(-10);\ncomparisons(5);\ncomparisons(10);\ncomparisons(15);',
							editor: {text: 'function comparisons(number) {\n  console.log(number + " less than 10: " + (number < 10));\n  console.log(number + " equal to 10: " + (number == 10));\n}\n\ncomparisons(-10);\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000106')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'Counting',
							description: '<p>The provided program prints the powers of 2 to the console. It uses a <strong>variable</strong> named <var>counter</var>, and a <strong>while loop</strong>. Try to figure out how it works by using the <a href="#arrow-step">step button</a> and <a href="#arrow-tab-info">info tab</a>. Then modify the program so that instead it prints the numbers from 1 to 20.</p>',
							configProgram: 'config.dare.type = "ConsoleMatch";\nconfig.dare.ConsoleMatch.speed = 200;\nconfig.dare.ConsoleMatch.minPercentage = 97;\nconfig.dare.maxLines = 5;\nconfig.dare.lineReward = 10;\nconfig.outputs.console.enabled = true;\nconfig.outputs.info.enabled = true;\nconfig.outputs.info.commands = "jsmm.number,jsmm.string,jsmm.boolean,jsmm.var,jsmm.assignment,jsmm.arithmetic.numbers,jsmm.arithmetic.strings,jsmm.logic.equality,jsmm.logic.comparison,jsmm.logic.inversion,jsmm.logic.booleans,jsmm.while,jsmm.function[0],jsmm.function[1],console.log,console.clear,console.setColor";\nconfig.outputs.info.scope = true;\n',
							original: 'var counter = 1;\nwhile(counter <= 20) {\n  console.log(counter);\n  counter = counter+1;\n}\n',
							editor: {text: 'var counter = 1;\nwhile(counter < 300) {\n  console.log(counter);\n  counter = counter*2;\n}\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000107')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'Spiraling out of control',
							description: '<p>The robot has to follow a certain pattern, as you can see in the program. However, the current program is a bit long and repetitive. Make it shorter by using a counter and a while loop.</p>',
							configProgram: 'config.dare.type = "RobotGoal";\nconfig.dare.RobotGoal.goalReward = 50;\nconfig.dare.maxLines = 7;\nconfig.dare.lineReward = 10;\nconfig.dare.RobotGoal.previewBlockSize = 32;\n\nconfig.outputs.robot.enabled = true;\nconfig.outputs.robot.readOnly = true;\nconfig.outputs.info.enabled = true;\nconfig.outputs.info.commands = "jsmm.number,jsmm.string,jsmm.boolean,jsmm.var,jsmm.assignment,jsmm.arithmetic.numbers,jsmm.arithmetic.strings,jsmm.logic.equality,jsmm.logic.comparison,jsmm.logic.inversion,jsmm.logic.booleans,jsmm.while,jsmm.function[0],jsmm.function[1],robot.drive,robot.turnLeft,robot.turnRight";\nconfig.outputs.info.scope = true;\n',
							original: 'var counter = 1;\nwhile(counter <= 7) {\n  robot.drive(counter);\n  robot.turnLeft();\n  counter++;\n}',
							outputStates: {robot: '{"columns":8,"rows":8,"initialX":4,"initialY":3,"initialAngle":90,"mazeObjects":45,"verticalActive":[[false,false,false,false,false,false,false,false],[false,true,true,true,true,true,true,true],[false,false,true,true,true,true,false,false],[false,false,false,true,true,false,false,false],[false,false,false,true,false,false,false,false],[false,false,true,true,false,false,false,false],[false,true,true,true,true,false,false,false],[true,true,true,true,true,true,false,false]],"horizontalActive":[[false,false,false,false,false,false,false,false],[false,true,false,false,false,false,false,false],[false,true,true,false,false,false,true,false],[false,true,true,true,false,true,true,false],[false,true,true,false,true,true,true,false],[false,true,false,false,false,true,true,false],[false,false,false,false,false,false,true,false],[false,false,false,false,false,false,false,false]],"blockGoal":[[false,false,false,false,false,false,false,true],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"numGoals":1}'},
							editor: {text: 'robot.drive(1);\nrobot.turnLeft();\nrobot.drive(2);\nrobot.turnLeft();\nrobot.drive(3);\nrobot.turnLeft();\nrobot.drive(4);\nrobot.turnLeft();\nrobot.drive(5);\nrobot.turnLeft();\nrobot.drive(6);\nrobot.turnLeft();\nrobot.drive(7);\nrobot.turnLeft();\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000108')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'Good morning, good afternoon',
							description: '<p>The while-loop is used to keep repeating while some condition is true, but it is also useful to test only once whether some condition is true or false. For this you can use the <strong>if-else-statement</strong>, as seen in the <a href="#arrow-left,740,73">example</a>. If the condition is true, the program continues to the first brackets. Else, it jumps to the <var>else</var> brackets. Complete the program using a while-loop to call the function a number of times.</p>',
							configProgram: 'config.dare.type = "ConsoleMatch";\nconfig.dare.ConsoleMatch.speed = 200;\nconfig.dare.ConsoleMatch.minPercentage = 97;\nconfig.dare.maxLines = 10;\nconfig.dare.lineReward = 10;\nconfig.outputs.console.enabled = true;\nconfig.outputs.info.enabled = true;\nconfig.outputs.info.commands = "jsmm.number,jsmm.string,jsmm.boolean,jsmm.var,jsmm.assignment,jsmm.arithmetic.numbers,jsmm.arithmetic.strings,jsmm.logic.equality,jsmm.logic.comparison,jsmm.logic.inversion,jsmm.logic.booleans,jsmm.if,jsmm.else,jsmm.while,jsmm.function[0],jsmm.function[1],console.log,console.clear,console.setColor";\nconfig.outputs.info.scope = true;\n',
							original: 'function hello(hour) {\n  if (hour < 12) {\n    console.log("Good morning at " + hour);\n  } else {\n    console.log("Good afternoon at " + hour);\n  }\n}\n\nvar hour = 5;\nwhile(hour <= 19) {\n  hello(hour);\n  hour = hour + 1;\n}',
							editor: {text: 'function hello(hour) {\n  if (hour < 12) {\n    console.log("Good morning");\n  } else {\n    console.log("");\n  }\n}\n\nhello(10);\n'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000109')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'More information',
							description: '<p>Extend the table of famous people to include the year of death for those who have passed away. For those still alive, hide this line entirely.</p>',
							configProgram: 'config.dare.type = "ConsoleMatch";\nconfig.dare.ConsoleMatch.speed = 50;\nconfig.dare.ConsoleMatch.minPercentage = 97;\nconfig.dare.maxLines = 22;\nconfig.dare.lineReward = 10;\nconfig.outputs.console.enabled = true;\nconfig.outputs.info.enabled = true;\nconfig.outputs.info.commands = "jsmm.number,jsmm.string,jsmm.boolean,jsmm.var,jsmm.assignment,jsmm.arithmetic.numbers,jsmm.arithmetic.strings,jsmm.logic.equality,jsmm.logic.comparison,jsmm.logic.inversion,jsmm.logic.booleans,jsmm.if,jsmm.else,jsmm.while,jsmm.function[0],jsmm.function[1],console.log,console.clear,console.setColor";\nconfig.outputs.info.scope = true;\n',
							original: 'function person(name, born, died, knownFor) {\n  console.log("Name      : " + name);\n  console.log("Born in   : " + born);\n  if (died > 0) {\n    console.log("Died in   : " + died);\n  }\n  console.log("Known for : " + knownFor);\n  console.log("");\n}\n\nconsole.log("Famous people in computing:");\nconsole.log("");\nperson("Charles Babbage", 1815, 1871, "first computer");\nperson("Ada Lovelace", 1815, 1852, "first programmer");\nperson("George Boole", 1815, 1864, "Boolean logic");\nperson("Grace Hopper", 1906, 1992, "first language");\nperson("Alan Turing", 1912, 1954, "Turing machine");\nperson("Douglas Engelbart", 1925, 0, "Computer mouse");\nperson("Bill Gates", 1955, 0, "Microsoft");\nperson("Steve Jobs", 1955, 2011, "Apple");\nperson("Linus Torvalds", 1969, 0, "Linux");\nperson("Tim Berners-Lee", 1955, 0, "World Wide Web");\nconsole.log("And many more...");',
							editor: {text: 'function person(name, born, died, knownFor) {\n}\n\nconsole.log("Famous people in computing:");\nconsole.log("");\nperson("Charles Babbage", 1815, 1871, "first computer");\nperson("Ada Lovelace", 1815, 1852, "first programmer");\nperson("George Boole", 1815, 1864, "Boolean logic");\nperson("Grace Hopper", 1906, 1992, "first language");\nperson("Alan Turing", 1912, 1954, "Turing machine");\nperson("Douglas Engelbart", 1925, 0, "Computer mouse");\nperson("Bill Gates", 1955, 0, "Microsoft");\nperson("Steve Jobs", 1955, 2011, "Apple");\nperson("Linus Torvalds", 1969, 0, "Linux");\nperson("Tim Berners-Lee", 1955, 0, "World Wide Web");\nconsole.log("And many more...");'}
						}}
					);

					db.dares.update({_id: new db.ObjectID('300000000000000000000110')},
						{ $set: {
							userId: user._id,
							published: true,
							name: 'Walls, walls, walls',
							description: '<p>The robot can detect whether it is facing a wall, using <var>robot.detectWall()</var>. This returns <var>true</var> if there is a wall, and <var>false</var> if there isn\'t, as demonstrated using the <a href="#arrow-tab-console">console</a>. This maze is set up so that at every wall the robot has to turn left. Make the robot navigate the maze using a loop instead of specifying its entire path in advance.</p>',
							configProgram: 'config.dare.type = "RobotGoal";\nconfig.dare.RobotGoal.goalReward = 50;\nconfig.dare.maxLines = 10;\nconfig.dare.lineReward = 10;\nconfig.dare.RobotGoal.previewBlockSize = 32;\n\nconfig.outputs.robot.enabled = true;\nconfig.outputs.robot.readOnly = true;\nconfig.outputs.robot.enabled = true;\nconfig.outputs.console.enabled = true;\nconfig.outputs.info.enabled = true;\nconfig.outputs.info.commands = "jsmm.number,jsmm.string,jsmm.boolean,jsmm.var,jsmm.assignment,jsmm.arithmetic.numbers,jsmm.arithmetic.strings,jsmm.logic.equality,jsmm.logic.comparison,jsmm.logic.inversion,jsmm.logic.booleans,jsmm.if,jsmm.else,jsmm.while,jsmm.function[0],jsmm.function[1],robot.drive,robot.turnLeft,robot.turnRight,robot.detectWall,console.log,console.clear,console.setColor";\nconfig.outputs.info.scope = true;\n',
							original: 'var counter = 0;\nwhile(counter <= 40) {\n  robot.drive(1);\n  if (robot.detectWall()) {\n    robot.turnLeft();\n  }\n  counter++;\n}',
							outputStates: {robot: '{"columns":8,"rows":8,"initialX":7,"initialY":7,"initialAngle":90,"mazeObjects":34,"verticalActive":[[false,false,false,false,false,false,false,false],[false,false,true,false,true,false,false,false],[false,false,true,false,false,false,false,false],[false,true,false,false,false,false,true,false],[false,true,false,false,false,true,true,false],[false,false,false,false,false,true,false,false],[false,false,false,false,false,true,false,false],[false,false,false,true,false,false,true,false]],"horizontalActive":[[false,false,false,false,true,false,false,false],[false,false,true,true,true,false,false,true],[false,true,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,true,false,false,false,false,false,true],[false,false,false,false,true,true,true,false],[false,false,false,true,true,false,false,true],[false,true,false,false,false,false,false,false]],"blockGoal":[[false,true,false,false,false,false,false,false],[false,false,false,false,false,false,true,false],[false,false,false,true,false,false,false,false],[false,false,false,false,false,false,false,false],[false,true,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,true,true,false,true,false],[false,false,false,false,false,false,false,false]],"numGoals":1}'},
							editor: {text: 'var counter = 0;\nwhile(counter <= 5) {\n  robot.drive(1);\n  console.log(robot.detectWall());\n  counter++;\n}'}
						}}
					);

					console.log('Pre-set values updated; userId of "janpaul123": ' + user._id);
				});
			}
		});
	};
};

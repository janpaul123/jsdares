/*jshint node:true jquery:true*/
"use strict";

module.exports = function(info) {
	info.tables.push({
		html: '<p><span class="info-output"><i class="icon icon-th icon-white"></i> robot</span></p><p>The robot tab provides a simple <strong>simulation</strong> of an actual robot, with commands to drive and turn. Additionally, <strong>walls</strong> can be placed in the environment, which can be detected by the robot. Squares can be coloured green, indicating a <strong>goal</strong> for the robot to go to, and these can also be detected by the robot.</p>',
		list: {
			'robot.drive': {
				name: 'robot.drive(distance)',
				text: '<p>This command makes the robot drive <strong>forward</strong> for a certain distance (or backwards, if distance is negative). For example, to move the robot 3 blocks, use <var>robot.drive(3);</var>. If you don\'t fill in the distance, it just uses distance 1.</p>',
				examples: [
					{type: 'robot', code: 'robot.drive(3);'}
				]
			},
			'robot.turnLeft': {
				name: 'robot.turnLeft(degrees)',
				text: '<p>This command makes the robot turn <strong>left</strong> (counter-clockwise) for a certain number of degrees. If you don\'t fill in the number of degrees, it just uses 90 degrees. If there are walls placed, you can only turn with right angles.</p>',
				examples: [
					{type: 'robot', code: 'robot.drive(2);\nrobot.turnLeft();\nrobot.drive();'}
				]
			},
			'robot.turnRight': {
				name: 'robot.turnRight(degrees)',
				text: '<p>This command makes the robot turn <strong>right</strong> (clockwise) for a certain number of degrees. If you don\'t fill in the number of degrees, it just uses 90 degrees. If there are walls placed, you can only turn with right angles.</p>',
				examples: [
					{type: 'robot', code: 'robot.drive(3);\nrobot.turnRight();\nrobot.drive();\nrobot.turnRight(45);\nrobot.drive();'}
				]
			},
			'robot.detectWall': {
				name: 'robot.detectWall()',
				text: '<p>This function returns a boolean (<var>true</var> or <var>false</var>) depending on whether there is a <strong>wall</strong> right in front of the robot. It is usually used inside other statements, such as <var>if (robot.detectWall())</var>, but you can also print the value to the console.</p>',
				examples: [
					{type: 'robot', code: 'console.log(robot.detectWall());\nrobot.drive();\nconsole.log(robot.detectWall());\nrobot.drive();\nconsole.log(robot.detectWall());\nrobot.turnLeft();\nconsole.log(robot.detectWall());', state: '{"columns":3,"rows":4,"initialX":1,"initialY":3,"initialAngle":90,"mazeObjects":1,"verticalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false]],"horizontalActive":[[false,false,false,false],[false,true,false,false],[false,false,false,false]],"blockGoal":[[false,false,false,false],[false,false,false,false],[false,false,false,false]],"numGoals":0}'},
					{type: 'robot', code: 'while(!robot.detectWall()) {\n  robot.drive();\n}', state: '{"columns":3,"rows":4,"initialX":1,"initialY":3,"initialAngle":90,"mazeObjects":1,"verticalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false]],"horizontalActive":[[false,false,false,false],[false,true,false,false],[false,false,false,false]],"blockGoal":[[false,false,false,false],[false,false,false,false],[false,false,false,false]],"numGoals":0}'}
				]
			},
			'robot.detectGoal': {
				name: 'robot.detectGoal()',
				text: '<p>This function returns a boolean (<var>true</var> or <var>false</var>) depending on whether the robot is standing on top of a <strong>goal</strong> square. It is usually used inside other statements, such as <var>if (robot.detectGoal())</var>, but you can also print the value to the console.</p>',
				examples: [
					{type: 'robot', code: 'while(!robot.detectGoal()) {\n  robot.drive();\n  var goal = robot.detectGoal();\n  console.log(goal);\n}', state: '{"columns":2,"rows":4,"initialX":0,"initialY":3,"initialAngle":90,"mazeObjects":1,"verticalActive":[[false,false,false,false],[false,false,false,false]],"horizontalActive":[[false,false,false,false],[false,false,false,false]],"blockGoal":[[true,false,false,false],[false,false,false,false]],"numGoals":1}'}
				]
			}
		}
	});
};

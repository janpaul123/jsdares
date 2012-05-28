/*jshint node:true jquery:true*/
"use strict";

module.exports = function(info) {
	info.commands = info.commands.concat([
		{
			name: 'robot.drive(distance)',
			id: 'robot.drive',
			outputs: ['robot'],
			makeContent: function($content) {
				$content.html('<p>This command makes the robot drive forward for a certain distance (or backwards, if distance is negative). For example, to move the robot 3 blocks, use <var>robot.drive(3);</var>. If you don\'t fill in the distance, it just uses distance 1.</p>');
				info.robotExample($content, 'robot.drive(3);');
			}
		},
		{
			name: 'robot.turnLeft(degrees)',
			id: 'robot.turnLeft',
			outputs: ['robot'],
			makeContent: function($content) {
				$content.html('<p>This command makes the robot turn left (counter-clockwise) for a certain number of degrees. If you don\'t fill in the number of degrees, it just uses 90 degrees.</p>');
				info.robotExample($content, 'robot.turnLeft();\nrobot.drive();\nrobot.turnLeft(180);\nrobot.drive(2);\nrobot.turnLeft(45);\nrobot.drive();');
			}
		},
		{
			name: 'robot.turnRight(degrees)',
			id: 'robot.turnRight',
			outputs: ['robot'],
			makeContent: function($content) {
				$content.html('<p>This command makes the robot turn right (clockwise) for a certain number of degrees. If you don\'t fill in the number of degrees, it just uses 90 degrees.</p>');
				info.robotExample($content, 'robot.drive(3);\nrobot.turnRight();\nrobot.drive();\nrobot.turnRight();\nrobot.drive(2);');
			}
		},
		{
			name: 'robot.detectWall()',
			id: 'robot.detectWall',
			outputs: ['robot'],
			makeContent: function($content) {
				$content.html('<p>This function returns a boolean (true or false) depending on whether there is a wall right in front of the robot. It is usually used inside other statements, such as <var>if (robot.detectWall())</var>, but you can also print the value to the console.</p>');
				info.robotExample($content, 'console.log(robot.detectWall());\nrobot.drive();\nconsole.log(robot.detectWall());\nrobot.drive();\nconsole.log(robot.detectWall());\nrobot.turnLeft();\nconsole.log(robot.detectWall());', '{"columns":3,"rows":4,"initialX":1,"initialY":3,"initialAngle":90,"mazeObjects":1,"verticalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false]],"horizontalActive":[[false,false,false,false],[false,true,false,false],[false,false,false,false]],"blockGoal":[[false,false,false,false],[false,false,false,false],[false,false,false,false]],"numGoals":0}');

				info.robotExample($content, 'while(!robot.detectWall()) {\n  robot.drive();\n}', '{"columns":3,"rows":4,"initialX":1,"initialY":3,"initialAngle":90,"mazeObjects":1,"verticalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false]],"horizontalActive":[[false,false,false,false],[false,true,false,false],[false,false,false,false]],"blockGoal":[[false,false,false,false],[false,false,false,false],[false,false,false,false]],"numGoals":0}');
			}
		},
		{
			name: 'robot.detectGoal()',
			id: 'robot.detectGoal',
			outputs: ['robot'],
			makeContent: function($content) {
				$content.html('<p>This function returns a boolean (true or false) depending on whether the robot is standing on top of a goal square. It is usually used inside other statements, such as <var>if (robot.detectGoal())</var>, but you can also print the value to the console.</p>');
				info.robotExample($content, 'while(!robot.detectGoal()) {\n  robot.drive();\n  console.log(robot.detectGoal());\n}', '{"columns":3,"rows":4,"initialX":1,"initialY":3,"initialAngle":90,"mazeObjects":1,"verticalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false]],"horizontalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false]],"blockGoal":[[false,false,false,false],[true,false,false,false],[false,false,false,false]],"numGoals":1}');
			}
		}
	]);
};

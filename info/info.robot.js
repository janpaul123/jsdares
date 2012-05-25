/*jshint node:true jquery:true*/
"use strict";

var robot = require('../robot');

var makeExample = function(num, $content, example, func, state, console) {
	var $wrapper = $('<div class="robot-info-wrapper"></div>');
	$content.append($('<p>' + (num > 0 ? 'Another example' : 'Example') +':</p>').append($wrapper));

	var $container = $('<div class="robot-container"></div>');
	$wrapper.append($container);

	if (console === undefined) {
		$wrapper.append('<code>' + example + '</code>');
	} else {
		$wrapper.append('<dfn><samp>' + console + '</samp><code>' + example + '</code></dfn>');
	}

	var rob = new robot.Robot($container, true, 48);
	rob.setState(state || '{"columns":4,"rows":4,"initialX":1,"initialY":3,"initialAngle":90,"mazeObjects":0,"verticalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]],"horizontalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]],"blockGoal":[[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]],"numGoals":0}');
	rob.clear();
	rob.insertDelay(100000);
	func(rob);
	rob.playAll();
};

module.exports = function(info) {
	info.commands = info.commands.concat([
		{
			name: 'robot.drive(distance)',
			id: 'robot.drive',
			outputs: ['robot'],
			makeContent: function($content) {
				$content.html('<p>This command makes the robot drive forward for a certain distance (or backwards, if distance is negative). For example, to move the robot 3 blocks, use <var>robot.drive(3);</var>. If you don\'t fill in the distance, it just uses distance 1.</p>');
				makeExample(0, $content, 'robot.drive(3);', function(robot) { robot.insertLine(1, 0); });
			}
		},
		{
			name: 'robot.turnLeft(degrees)',
			id: 'robot.turnLeft',
			outputs: ['robot'],
			makeContent: function($content) {
				$content.html('<p>This command makes the robot turn left (counter-clockwise) for a certain number of degrees. If you don\'t fill in the number of degrees, it just uses 90 degrees.</p>');
				makeExample(0, $content, 'robot.turnLeft();\nrobot.drive();\nrobot.turnLeft(180);\nrobot.drive(2);\nrobot.turnLeft(45);\nrobot.drive();', function(robot) { robot.insertPoint(90); robot.insertLine(0, 3); robot.insertPoint(180); robot.insertLine(2, 3); robot.insertPoint(45); robot.insertLine(2.7, 2.3); });
			}
		},
		{
			name: 'robot.turnRight(degrees)',
			id: 'robot.turnRight',
			outputs: ['robot'],
			makeContent: function($content) {
				$content.html('<p>This command makes the robot turn right (clockwise) for a certain number of degrees. If you don\'t fill in the number of degrees, it just uses 90 degrees.</p>');
				makeExample(0, $content, 'robot.drive(3);\nrobot.turnRight();\nrobot.drive();\nrobot.turnRight();\nrobot.drive(2);', function(robot) { robot.insertLine(1, 0); robot.insertPoint(-90); robot.insertLine(2, 0); robot.insertPoint(-90); robot.insertLine(2, 2); });
			}
		},
		{
			name: 'robot.detectWall()',
			id: 'robot.detectWall',
			outputs: ['robot'],
			makeContent: function($content) {
				$content.html('<p>This function returns a boolean (true or false) depending on whether there is a wall right in front of the robot. It is usually used inside other statements, such as <var>if (robot.detectWall())</var>, but you can also print the value to the console.</p>');
				makeExample(0, $content, 'console.log(robot.detectWall());\nrobot.drive();\nconsole.log(robot.detectWall());\nrobot.drive();\nconsole.log(robot.detectWall());\nrobot.turnLeft();\nconsole.log(robot.detectWall());', function(robot) { robot.insertDetectWall(false); robot.insertLine(1, 2); robot.insertDetectWall(false); robot.insertLine(1, 1); robot.insertDetectWall(true); robot.insertPoint(90); robot.insertDetectWall(false); }, '{"columns":3,"rows":4,"initialX":1,"initialY":3,"initialAngle":90,"mazeObjects":1,"verticalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false]],"horizontalActive":[[false,false,false,false],[false,true,false,false],[false,false,false,false]],"blockGoal":[[false,false,false,false],[false,false,false,false],[false,false,false,false]],"numGoals":0}', 'false\nfalse\ntrue\nfalse');

				makeExample(1, $content, 'while(!robot.detectWall()) {\n  robot.drive();\n}', function(robot) { robot.insertDetectWall(false); robot.insertLine(1, 2); robot.insertDetectWall(false); robot.insertLine(1, 1); robot.insertDetectWall(true); }, '{"columns":3,"rows":4,"initialX":1,"initialY":3,"initialAngle":90,"mazeObjects":1,"verticalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false]],"horizontalActive":[[false,false,false,false],[false,true,false,false],[false,false,false,false]],"blockGoal":[[false,false,false,false],[false,false,false,false],[false,false,false,false]],"numGoals":0}');
			}
		},
		{
			name: 'robot.detectGoal()',
			id: 'robot.detectGoal',
			outputs: ['robot'],
			makeContent: function($content) {
				$content.html('<p>This function returns a boolean (true or false) depending on whether the robot is standing on top of a goal square. It is usually used inside other statements, such as <var>if (robot.detectGoal())</var>, but you can also print the value to the console.</p>');
				makeExample(0, $content, 'while(!robot.detectGoal());\n  robot.drive();\n  console.log(robot.detectGoal());\n}', function(robot) { robot.insertLine(1, 2); robot.insertLine(1, 1); robot.insertLine(1, 0); }, '{"columns":3,"rows":4,"initialX":1,"initialY":3,"initialAngle":90,"mazeObjects":1,"verticalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false]],"horizontalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false]],"blockGoal":[[false,false,false,false],[true,false,false,false],[false,false,false,false]],"numGoals":1}', 'false\nfalse\nfalse\ntrue');
			}
		}
	]);
};

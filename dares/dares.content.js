/*jshint node:true jquery:true*/
"use strict";

module.exports = function(dares) {
	dares.getContent = function(ui) {
		return {
			tables: [{
				title: 'I',
				dares: [
					new dares.RobotGoalDare({
						name: 'Horse Jump',
						description: '',
						speed: 100,
						maxLines: 5,
						linePenalty: 0,
						goalReward: 50,
						numGoals: 1,
						state: '{"columns":4,"rows":4,"initialX":2,"initialY":2,"initialAngle":90,"mazeObjects":1,"verticalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]],"horizontalActive":[[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]],"blockGoal":[[false,false,false,false],[true,false,false,false],[false,false,false,false],[false,false,false,false]],"numGoals":1}',
						original: function(robot) {
							robot.drive(2);
							robot.turnLeft();
							robot.drive(1);
						}
					}, ui),
					new dares.ConsoleMatchDare({
						name: 'Hello World',
						description: 'A classic exercise is the "Hello World" program, which simply requires you to write "Hello World" to the console.',
						speed: 100,
						maxLines: 1,
						linePenalty: 8,
						original: function(anim) {
							anim.push('Hello World\n');
							return anim;
						}
					}, ui),
					new dares.ImageMatchDare({
						name: 'Gravity',
						description: 'A block is thrown in the air and then accelerates back down. The position of the block is drawn every few seconds, resulting in the image on the right. Your task is to copy this image as good as possible, in as few lines of code as you can.',
						threshold: 270000,
						original: function(anim) {
							var drawBlock = function(i) {
								return function(context) {
									context.fillRect(10+i*24, 270+i*-65+i*i*4, 50, 50);
								};
							};
							for (var i=0; i<20; i++) {
								anim.push(drawBlock(i));
							}
							return anim;
						}
					}, ui),
					new dares.ConsoleMatchDare({
						name: 'Multiplication Tables',
						description: 'A multiplication table shows the result of multiplying numbers. Your task is to create a multiplication table with 10 rows and 5 columns in as few lines as code as possible.',
						speed: 100,
						original: function(anim) {
							for (var y=1; y<=10; y++) {
								var text = '';
								for (var x=1; x<=5; x++) {
									text += (x*y) + '\t';
								}
								anim.push(text + '\n');
							}
							return anim;
						}
					}, ui)
				]
			}]
		};
	};
};

/*jshint node:true jquery:true*/
"use strict";

var robot = require('../robot');

module.exports = function(info) {
	info.commands = info.commands.concat([
		{
			name: 'var',
			id: 'var',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>The <var>var</var> keyword is used for declaring a variable. You specify a name, which can then be used for storing information. For example, after writing <var>var text;</var>, you can use the variable <var>text</var>, for example by assigning a string to it: <var>text = "Hey!";</var>. You can also immediately assign a value to a variable when declaring it, for example <var>var age = 17;</var>. After declaring a variable you can use it in other statements, such as calculations.</p>');

				info.consoleExample($content, 'var number = 5;\nconsole.log(number);\nconsole.log(number+2);\nconsole.log(number*number);\n\nvar text = "Hey!"\nconsole.log(text);');
			}
		},
		{
			name: '=',
			id: '=',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>The <var>=</var> operator is used for assigning a value to a variable, which first has to be declared using <var>var</var>. On the left side you put the name of the variable, and on the right side the value you want to assign to it, for example <var>height = 100;</var>. You can use the variable name itself on the right side as well. An example <var>counter = counter + 1;</var>, which increases the value of <var>counter</var> by one.</p>');

				info.consoleExample($content, 'var counter = 1;\nconsole.log(counter);\ncounter = counter+1;\nconsole.log(counter);\ncounter = counter*3;\nconsole.log(counter);\n\nvar height = 100;\nconsole.log(height);\nheight = height * counter;\nconsole.log(height);');

				info.robotExample($content, 'var distance = 2;\nrobot.drive(distance);');
			}
		},
		{
			name: '+, -, *, /, %',
			id: '+',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>These are the basic arithmetic operators: <var>+</var> is addition, <var>-</var> is subtraction, <var>*</var> is multiplication, and <var>/</var> is division. The last one is <var>%</var>, remainder, which is a bit more uncommon. For more information about these operators, you can search online.</p>');

				info.consoleExample($content, 'console.log(4+6);\nconsole.log(10-3);\nconsole.log(5*10);\nconsole.log(81/9);\nconsole.log(18%5);');

				info.robotExample($content, 'robot.drive(5-2);');
			}
		},
		{
			name: '+, += <small>[with strings]</small>',
			id: '+s',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p><var>+</var> is not only used for addition, but also for concatenating strings with strings, or strings with numbers. For example <var>"Hello " + "World!"</var> results in <var>"Hello World!"</var>. The shortcut <var>+=</var> also works.</p>');

				info.consoleExample($content, 'console.log("Hello " + "World!");\n\nvar text = "Age: ";\ntext += 42;\nconsole.log(text);');
			}
		},
		{
			name: '!',
			id: '!',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>To invert a boolean, you can use <var>!</var>. For example, <var>!true</var> is just false.</p>');

				info.consoleExample($content, 'console.log(!true);\nconsole.log(!(5 == 7));');
			}
		},
		{
			name: '+=, -=, *=, /=, %=',
			id: '+=',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>These operators are basically shortcuts. <var>a += b;</var> is a shortcut for <var>a = a + b;</var>, <var>a -= b;</var> is a shortcut for <var>a = a - b;</var>, and so on.</p>');

				info.consoleExample($content, 'var counter = 1;\nconsole.log(counter);\ncounter += 1;\nconsole.log(counter);\ncounter *= 3;\nconsole.log(counter);\n\nvar height = 100;\nconsole.log(height);\nheight *= counter;\nconsole.log(height);');

				info.canvasExample($content, 'var x = 10;\ncontext.fillRect(x, 70, 10, 10);\nx += 30;\ncontext.fillRect(x, 70, 10, 10);\nx += 30;\ncontext.fillRect(x, 70, 10, 10);');
			}
		},
		{
			name: '++, --',
			id: '++',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>These two are even shorter shortcuts. <var>a++;</var> is the same as writing <var>a = a + 1;</var>, or increasing the variable <var>a</var> by one. <var>a--;</var> means decreasing the variable by one, or <var>a = a - 1;</var>.</p>');

				info.consoleExample($content, 'var counter = 1;\nconsole.log(counter);\ncounter++;\nconsole.log(counter);\ncounter++;\nconsole.log(counter);\ncounter--;\nconsole.log(counter);\ncounter--;\nconsole.log(counter);');
			}
		},
		{
			name: '==, !=',
			id: '==',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>These two operators compare values. <var>==</var> checks if two values are the same, and returns true if they are, and false if they are not. <var>!=</var> is the opposite, it checks if values are not the same.</p>');

				info.consoleExample($content, 'console.log(5 == 5);\nconsole.log(5 == "Hi");\nconsole.log(5 != 5);\nconsole.log(5 != "Hi");');
			}
		},
		{
			name: '>, >=, <, <=',
			id: '>',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>These operators compare numbers. <var>a &gt; b</var> returns true if <var>a</var> is greater than <var>b</var>, and <var>a &gt;= b</var> returns true if <var>a</var> is greater than or equal to <var>b</var>. The other two work the other way around.</p>');

				info.consoleExample($content, 'console.log(10 > 5);\nconsole.log(5 >= 5);\nconsole.log(3 < 5);\nconsole.log(5 < 3);');
			}
		},
		{
			name: '&&, ||',
			id: '&&',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>These operators are used to combine boolean values (true and false). <var>a && b</var> returns true if both <var>a</var> and <var>b</var> are true, so it is also called <em>and</em>. <var>a || b</var> returns true is either of them is true, so it is also called <em>or</em>.</p>');

				info.consoleExample($content, 'console.log(true && true);\nconsole.log(true && false);\nconsole.log(true || false);\nconsole.log(false || !(10 == 11));\nconsole.log(false || false);');
			}
		},
		{
			name: 'if (boolean)',
			id: 'if',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>The if-statement is used to control what parts of the program are run. Only when the boolean is true, is the part between brackets executed.</p>');

				info.consoleExample($content, 'if (false) {\n  console.log("Hello!");\n}\n\nif (true) {\n  console.log("Goodbye!");\n}\n');

				info.robotExample($content, 'while(!robot.detectGoal()) {\n  if (robot.detectWall()) {\n    robot.turnLeft();\n  }\n  robot.drive();\n}', '{"columns":3,"rows":4,"initialX":1,"initialY":3,"initialAngle":90,"mazeObjects":1,"verticalActive":[[false,false,false,false],[false,false,false,false],[false,true,false,false]],"horizontalActive":[[false,true,false,false],[false,true,false,false],[false,false,false,false]],"blockGoal":[[false,true,false,false],[false,false,false,false],[false,false,false,false]],"numGoals":1}');
			}
		},
		{ // am-pm does not work!
			name: 'else',
			id: 'else',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p><var>else</var> is always used in conjunction with <var>if</var>. The part between the brackets after the else-statement is only executed if the boolean in the if-statement is false. Both statements can also be combined into an <var>else if</var>, see the example below.</p>');

				info.consoleExample($content, 'var number = 6;\nif (number == 10) {\n  console.log("Number is 10");\n} else {\n  console.log("Number is not 10");\n}\n\nvar weight = 25;\nvar maximum = 18;\nif (weight <= maximum) {\n  console.log("Bag is allowed");\n} else {\n  console.log("Bag is too heavy");\n}\n\nvar time = 15;\nif (time < 12) {\n  console.log("morning");\n} else if (time < 18) {\n  console.log("afternoon");\n} else {\n  console.log("evening");\n}');
			}
		},
		{
			name: 'while (boolean)',
			id: 'while',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>The while-loop is used to create repetition in a program. Before the part between the brackets is executed, the boolean is checked. If it is true, the part is executed, otherwise the part is skipped, like with an if-statement. After executing the code between brackets, the boolean is checked again, and so on.</p>');

				info.consoleExample($content, 'var i = 0;\nwhile(i < 5) {\n  console.log(i);\n  i = i+1;\n}');
			}
		},
		{
			name: 'for (statement; boolean; statement)',
			id: 'for',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>The for-loop is in fact a shorthand notation for commonly used while-loops. The first statement is executed before the for-loop starts, which is often used for initializing a variable, such as <var>i = 0</var>. The boolean is checked before the part between brackets is executed, just as with while-loops. Finally, the second statement is executed after each loop, for example to increase a counter variable by doing <var>i = i+1</var>. The shorthand version <var>i++</var> is also used a lot.</p>');

				info.consoleExample($content, 'for(var i = 0; i < 5; i++) {\n  console.log(i);\n}\n\n\n');

				info.canvasExample($content, 'for (var i=0; i<10; i++) {\n  var x = 10+i*10;\n  context.fillRect(x, 10+i*15, 5, 5);\n  context.fillRect(x, 145-i*15, 5, 5);\n}');
			}
		},
		{
			name: 'function name(arguments)',
			id: 'function',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>Functions are used to avoid having to write the same code over and over again. They are pieces of code that you can call from other points in the program. Between parentheses you can specify variables that should be passed into the function, these are called <em>arguments</em>. Most of the commands in this list are functions, for example <var>console.log</var> is a function that takes one string variable as argument.</p>');

				info.consoleExample($content, 'function printAmPm(hour) {\n  if (hour == 0) {\n    console.log(\"12am\");\n  } else if (hour < 12) {\n    console.log(hour + \"am\");\n  } else if (hour == 12) {\n    console.log(\"12pm\");\n  } else {\n    console.log((hour-12) + \"pm\");\n  }\n}\n\nprintAmPm(15);\nprintAmPm(0);\nprintAmPm(5);\nprintAmPm(12);');

				info.robotExample($content, 'function forwardRight(distance) {\n  robot.drive(distance);\n  robot.turnRight();\n}\nforwardRight(3);\nforwardRight(2);\nforwardRight(2);\nforwardRight(1);');

				info.canvasExample($content, '\nfunction smiley(x, y) {\n  context.fillRect(x+7, y+6, 5, 5);\n  context.fillRect(x+18, y+6, 5, 5);\n  context.beginPath();\n  context.arc(x+15, y+9, 12, 0.5, -3.6);\n  context.fill();\n}\nsmiley(10, 10);\nsmiley(20, 80);\nsmiley(40, 120);\nsmiley(80, 60);\ncontext.fillStyle = "#0aa";\nsmiley(120, 30);');
			}
		},
		{
			name: 'return value',
			id: 'return',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>Functions can also return some value after they have been run. For example, <var>robot.detectWall()</var> returns true or false depending on whether or not the robot faces a wall. Your functions can return some value, too. For example, to return the number 5 at some point in a function, you write <var>return 5;</var>.</p>');

				info.consoleExample($content, 'function largest(num1, num2) {\n  if (num1 > num2) {\n    return num1;\n  } else {\n    return num2;\n  }\n}\n\nconsole.log(largest(6, 10));\nconsole.log(largest(30, 40) + 2);\nconsole.log(largest(1, 2) - largest(3, 12));');
			}
		}
	]);
};

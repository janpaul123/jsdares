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
				$content.html('<p>The <var>var</var> keyword is used for declaring a variable. You specify a name, which can then be used for storing information. For example, after writing <var>var text;</var>, you can use the variable <var>text</var>, for example by assigning a string to it: <var>text = "Hey!";</var>. You can also assign a value to a variable when declaring it, for example <var>var age = 17;</var>. After declaring a variable you can use it in other statements, such as calculations.</p> <p>Example:<dfn><samp>5\n7\n25</samp><code>var number = 5;\nconsole.log(number);\nconsole.log(number+2);\nconsole.log(number*number);</code></dfn></p>');
			}
		},
		{
			name: '=',
			id: '=',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>The <var>=</var> operator is used for assigning a value to a variable, which first has to be declared using <var>var</var>. On the left side you put the name of the variable, and on the right side the value you want to assign to it, for example <var>height = 100;</var>. You can use the variable name itself on the right side as well. An example <var>counter = counter + 1;</var>, which increases the value of <var>counter</var> by one.</p> <p>Example:<dfn><samp>1\n2\n6\n100\n600</samp><code>var counter = 1;\nconsole.log(counter);\ncounter = counter+1;\nconsole.log(counter);\ncounter = counter*3;\nconsole.log(counter);\n\nvar height = 100;\nconsole.log(height);\nheight = height * counter;\nconsole.log(height);</code></dfn></p>');
			}
		},
		{
			name: '+, -, *, /, %',
			id: '+',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>These are the basic arithmetic operators: <var>+</var> is addition, <var>-</var> is subtraction, <var>*</var> is multiplication, and <var>/</var> is division. The last one is <var>%</var>, remainder, which is a bit more uncommon. For more information about these operators, you can search online.</p> <p>Example:<dfn><samp>10\n7\n50\n9\n3</samp><code>console.log(4+6);\nconsole.log(10-3);\nconsole.log(5*10);\nconsole.log(81/9);\nconsole.log(18%5);</code></dfn></p>');
			}
		},
		{
			name: '+, += (with strings)',
			id: '+s',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p><var>+</var> is not only used for addition, but also for concatenating strings with strings, or strings with numbers. For example <var>"Hello " + "World!"</var> results in <var>"Hello World!"</var>. The shortcut <var>+=</var> also works.</p> <p>Example:<dfn><samp>Hello World!\nAge: 42</samp><code>console.log("Hello " + "World!");\n\nvar text = "Age: ";\ntext += 42;\nconsole.log(text);</code></dfn></p>');
			}
		},
		{
			name: '!',
			id: '!',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>To invert a boolean, you can use <var>!</var>. For example, <var>!true</var> is just false.</p> <p>Example:<dfn><samp>false\ntrue</samp><code>console.log(!true);\nconsole.log(!(5 == 7));</code></dfn></p>');
			}
		},
		{
			name: '+=, -=, *=, /=, %=',
			id: '+=',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>These operators are basically shortcuts. <var>a += b;</var> is a shortcut for <var>a = a + b;</var>, <var>a -= b;</var> is a shortcut for <var>a = a - b;</var>, and so on.</p> <p>Example:<dfn><samp>1\n2\n6\n100\n600</samp><code>var counter = 1;\nconsole.log(counter);\ncounter += 1;\nconsole.log(counter);\ncounter *= 3;\nconsole.log(counter);\n\nvar height = 100;\nconsole.log(height);\nheight *= counter;\nconsole.log(height);</code></dfn></p>');
			}
		},
		{
			name: '++, --',
			id: '++',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>These two are even shorter shortcuts. <var>a++;</var> is the same as writing <var>a = a + 1;</var>, or increasing the variable <var>a</var> by one. <var>a--;</var> means decreasing the variable by one, or <var>a = a - 1;</var>.</p> <p>Example:<dfn><samp>1\n2\n3\n2\n1</samp><code>var counter = 1;\nconsole.log(counter);\ncounter++;\nconsole.log(counter);\ncounter++;\nconsole.log(counter);\ncounter--;\nconsole.log(counter);\ncounter--;\nconsole.log(counter);</code></dfn></p>');
			}
		},
		{
			name: '==, !=',
			id: '==',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>These two operators compare values. <var>==</var> checks if two values are the same, and returns true if they are, and false if they are not. <var>!=</var> is the opposite, it checks if values are not the same.</p> <p>Example:<dfn><samp>true\nfalse\nfalse\ntrue</samp><code>console.log(5 == 5);\nconsole.log(5 == "Hi");\nconsole.log(5 != 5);\nconsole.log(5 != "Hi");</code></dfn></p>');
			}
		},
		{
			name: '>, >=, <, <=',
			id: '>',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>These operators compare numbers. <var>a &gt; b</var> returns true if <var>a</var> is greater than <var>b</var>, and <var>a &gt;= b</var> returns true if <var>a</var> is greater than or equal to <var>b</var>. The other two work the other way around.</p> <p>Example:<dfn><samp>true\ntrue\ntrue\nfalse</samp><code>console.log(10 > 5);\nconsole.log(5 >= 5);\nconsole.log(3 < 5);\nconsole.log(5 < 3);</code></dfn></p>');
			}
		},
		{
			name: '&&, ||',
			id: '&&',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>These operators are used to combine boolean values (true and false). <var>a && b</var> returns true if both <var>a</var> and <var>b</var> are true, so it is also called <em>and</em>. <var>a || b</var> returns true is either of them is true, so it is also called <em>or</em>.</p> <p>Example:<dfn><samp>true\nfalse\ntrue\ntrue\nfalse</samp><code>console.log(true && true);\nconsole.log(true && false);\nconsole.log(true || false);\nconsole.log(false || !(10 == 11));\nconsole.log(false || false);</code></dfn></p>');
			}
		},
		{
			name: 'if (boolean)',
			id: 'if',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>The if-statement is used to control what parts of the program are run. Only when the boolean is true, is the part between brackets executed.</p> <p>Example:<dfn><samp>Goodbye!</samp><code>if (false) {\n  console.log("Hello!");\n}\n\nif (true) {\n  console.log("Goodbye!");\n}\n</code></dfn></p>');
			}
		},
		{ // am-pm does not work!
			name: 'else',
			id: 'else',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p><var>else</var> is always used in conjunction with <var>if</var>. The part between the brackets after the else-statement is only executed if the boolean in the if-statement is false.</p> <p>Example:<dfn><samp>Number is not 10\nBag is too heavy</samp><code>var number = 6;\nif (number == 10) {\n  console.log("Number is 10");\n} else {\n  console.log("Number is not 10");\n}\n\nvar weight = 25;\nvar maximum = 18;\nif (height <= maximum) {\n  console.log("Bag is allowed");\n} else {\n  console.log("Bag is too heavy");\n}</code></dfn></p>');
			}
		},
		{
			name: 'while (boolean)',
			id: 'while',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>The while-loop is used to create repetition in a program. Before the part between the brackets is executed, the boolean is checked. If it is true, the part is executed, otherwise the part is skipped, like with an if-statement. After executing the code between brackets, the boolean is checked again, and so on.</p> <p>Example:<dfn><samp>0\n1\n2\n3\n4</samp><code>var i = 0;\nwhile(i < 5) {\n  console.log(i);\n  i = i+1;\n}</code></dfn></p>');
			}
		},
		{
			name: 'for (statement; boolean; statement)',
			id: 'for',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>The for-loop is in fact a shorthand notation for commonly used while-loops. The first statement is executed before the for-loop starts, which is often used for initializing a variable, such as <var>i = 0</var>. The boolean is checked before the part between brackets is executed, just as with while-loops. Finally, the second statement is executed after each loop, for example to increase a counter variable by doing <var>i = i+1</var>. The shorthand version <var>i++</var> is also used often.</p> <p>Example:<dfn><samp>0\n1\n2\n3\n4</samp><code>for(var i = 0; i < 5; i++) {\n  console.log(i);\n}\n\n\n</code></dfn></p>');
			}
		},
		{
			name: 'function name(arguments)',
			id: 'function',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>Functions are used to avoid having to write the same code over and over again. They are pieces of code that you can call from other points in the program. Between parentheses you can specify variables that should be passed into the function, these are called <em>arguments</em>. Most of the commands in this list are functions, for example <var>console.log</var> is a function that takes one string variable as argument.</p> <p>Example:<dfn><samp>3pm\n12am\n5am\n12pm</samp><code>function printAmPm(hour) {\n  if (hour == 0) {\n    console.log(\"12am\");\n  } else if (hour < 12) {\n    console.log(hour + \"am\");\n  } else if (hour == 12) {\n    console.log(\"12pm\");\n  } else {\n    console.log((hour-12) + \"pm\");\n  }\n}\n\nprintAmPm(15);\nprintAmPm(0);\nprintAmPm(5);\nprintAmPm(12);</code></dfn></p>');
			}
		},
		{
			name: 'return value',
			id: 'return',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>Functions can also return some value after they have been run. For example, <var>robot.detectWall()</var> returns true or false depending on whether or not the robot faces a wall. Your functions can return some value, too. For example, to return the number 5 at some point in a function, you write <var>return 5;</var>.</p> <p>Example:<dfn><samp>10\n42\n-10</samp><code>function largest(num1, num2) {\n  if (num1 > num2) {\n    return num1;\n  } else {\n    return num2;\n  }\n}\n\nconsole.log(largest(6, 10));\nconsole.log(largest(30, 40) + 2);\nconsole.log(largest(1, 2) - largest(3, 12));</code></dfn></p>');
			}
		}
	]);
};

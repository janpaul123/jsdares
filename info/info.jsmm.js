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
				$content.html('<p>The <var>var</var> keyword is used for declaring a variable. You specify a name, which can then be used for storing information. For example, after writing <var>var text;</var>, you can use the variable <var>text</var>, for example by assigning a string to it: <var>text = "Hey!";</var>. You can also assign a value to a variable when declaring it, for example <var>var age = 17;</var>. After declaring a variable you can use it in other statements, such as calculations.</p> <p>Examples:<dfn><samp>5\n7\n25</samp><code>var number = 5;\nconsole.log(number);\nconsole.log(number+2);\nconsole.log(number*number);</code></dfn></p>');
			}
		},
		{
			name: '=',
			id: '=',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>The <var>=</var> operator is used for assigning a value to a variable, which first has to be declared using <var>var</var>. On the left side you put the name of the variable, and on the right side the value you want to assign to it, for example <var>height = 100;</var>. You can use the variable name itself on the right side as well. An example <var>counter = counter + 1;</var>, which increases the value of <var>counter</var> by one.</p> <p>Examples:<dfn><samp>1\n2\n6\n100\n600</samp><code>var counter = 1;\nconsole.log(counter);\ncounter = counter+1;\nconsole.log(counter);\ncounter = counter*3;\nconsole.log(counter);\n\nvar height = 100;\nconsole.log(height);\nheight = height * counter;\nconsole.log(height);</code></dfn></p>');
			}
		},
		{
			name: '+, -, *, /, %',
			id: '+',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>These are the basic arithmetic operators: <var>+</var> is addition, <var>-</var> is subtraction, <var>*</var> is multiplication, and <var>/</var> is division. The last one is <var>%</var>, remainder, which is a bit more uncommon. For more information about these operators, you can search online.</p> <p>Examples:<dfn><samp>10\n7\n50\n9\n3</samp><code>console.log(4+6);\nconsole.log(10-3);\nconsole.log(5*10);\nconsole.log(81/9);\nconsole.log(18%5);</code></dfn></p>');
			}
		},
		{
			name: '+, += (with strings)',
			id: '+s',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p><var>+</var> is not only used for addition, but also for concatenating strings with strings, or strings with numbers. For example <var>"Hello " + "World!"</var> results in <var>"Hello World!"</var>. The shortcut <var>+=</var> also works.</p> <p>Examples:<dfn><samp>Hello World!\nAge: 42</samp><code>console.log("Hello " + "World!");\n\nvar text = "Age: ";\ntext += 42;\nconsole.log(text);</code></dfn></p>');
			}
		},
		{
			name: '+=, -=, *=, /=, %=',
			id: '+=',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>These operators are basically shortcuts. <var>a += b;</var> is a shortcut for <var>a = a + b;</var>, <var>a -= b;</var> is a shortcut for <var>a = a - b;</var>, and so on.</p> <p>Examples:<dfn><samp>1\n2\n6\n100\n600</samp><code>var counter = 1;\nconsole.log(counter);\ncounter += 1;\nconsole.log(counter);\ncounter *= 3;\nconsole.log(counter);\n\nvar height = 100;\nconsole.log(height);\nheight *= counter;\nconsole.log(height);</code></dfn></p>');
			}
		},
		{
			name: '++, --',
			id: '++',
			outputs: [],
			makeContent: function($content) {
				$content.html('<p>These two are even shorter shortcuts. <var>a++;</var> is the same as writing <var>a = a + 1;</var>, or increasing the variable <var>a</var> by one. <var>a--;</var> means decreasing the variable by one, or <var>a = a - 1;</var>.</p> <p>Examples:<dfn><samp>1\n2\n3\n2\n1</samp><code>var counter = 1;\nconsole.log(counter);\ncounter++;\nconsole.log(counter);\ncounter++;\nconsole.log(counter);\ncounter--;\nconsole.log(counter);\ncounter--;\nconsole.log(counter);</code></dfn></p>');
			}
		}
	]);
};

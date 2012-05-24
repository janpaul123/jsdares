/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.Console.prototype.getCommands = function() {
		return [
			{
				name: 'console.log',
				id: 'console.log',
				outputs: ['console'],
				makeContent: function($content) {
					$content.html('<p>Use <var>console.log</var> to write a string or number to the console, for example to write <em>Hello World!</em> to the console, you can type <var>console.log("Hello World!");</var></p> <p>More examples:<dfn><samp>Hello World!<br>42<br>Square of 5 is 25<br>[object]</samp><code>console.log("Hello World!");<br>console.log(7*6);<br>console.log("Square of 5 is " + (5*5));<br>console.log(console);</code></dfn></p>');
				}
			},
			{
				name: 'console.clear',
				id: 'console.clear',
				outputs: ['console'],
				makeContent: function($content) {
					$content.html('<p>This command is used to clear the contents of the console. Everything that has been logged before <var>console.clear();</var> will just be thrown away.</p> <p>Example:<dfn><samp>3</br>4</samp><code>console.log(1);<br>console.log(2);<br>console.clear();<br>console.log(3);<br>console.log(4);</code></dfn></p>');
				}
			},
			{
				name: 'console.setColor',
				id: 'console.setColor',
				outputs: ['console'],
				makeContent: function($content) {
					$content.html('<p>This command changes the color of the next lines of the console. You can use all HTML color formats; please search online to find out how the different formats work.</p> <p>Example:<dfn><samp><span style="color: #a00">we</span></br><span style="color: rgb(200, 170, 0)">can</span></br><span style="color: hsl(120, 100%, 50%)">make</span></br><span style="color: hsla(200, 100%, 50%, 0.7)">colors!</span></br></samp><code>console.setColor("#a00");<br>console.log("we");<br>console.setColor("rgb(200, 170, 0)");<br>console.log("can");<br>console.setColor("hsl(120, 100%, 50%)");<br>console.log("make");<br>console.setColor("hsla(200, 100%, 50%, 0.7)");<br>console.log("colors!");</code></dfn></p>');
				}
			}
		];
	};
};

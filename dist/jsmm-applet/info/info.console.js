/*jshint node:true jquery:true*/
"use strict";

module.exports = function(info) {
	info.tables.push({
		html: '<p><span class="info-output"><i class="icon icon-list-alt icon-white"></i> console</span></p><p>This is used for easily printing any information to the screen, for example when debugging a program, or when calculating something. The console is present in most browsers as an extra tool for developers.</p>',
		list: {
			'console.log': {
				name: 'console.log(text)',
				text: '<p>Use <var>console.log</var> to write a string or number to the console, for example to write <em>Hello World!</em> to the console, you can type <var>console.log("Hello World!");</var></p>',
				examples: [
					{type: 'console', code: 'console.log("Hello World!");\nconsole.log(7*6);\nconsole.log("5 squared: " + (5*5));\nconsole.log(console);', result: 'Hello World!<br>42<br>5 squared: 25<br>[object Console]'}
				]
			},
			'console.clear': {
				name: 'console.clear()',
				text: '<p>This command is used to clear the contents of the console. Everything that has been logged before <var>console.clear();</var> will just be thrown away.</p>',
				examples: [
					{type: 'console', code: 'console.log(1);\nconsole.log(2);\nconsole.clear();\nconsole.log(3);\nconsole.log(4);'}
				]
			},
			'console.setColor': {
				name: 'console.setColor(color)',
				text: '<p>This command changes the color of the next lines of the console. You can use all HTML color formats; please search online to find out how the different formats work.</p>',
				examples: [
					{type: 'console', code: 'console.setColor("#a00");\nconsole.log("we");\nconsole.setColor("rgb(200, 170, 0)");\nconsole.log("can");\nconsole.setColor("hsl(120, 100%, 50%)");\nconsole.log("make");\nconsole.setColor("hsla(200, 100%, 50%, 0.7)");\nconsole.log("colors!");', result: '<span style="color: #a00">we</span></br><span style="color: rgb(200, 170, 0)">can</span></br><span style="color: hsl(120, 100%, 50%)">make</span></br><span style="color: hsla(200, 100%, 50%, 0.7)">colors!</span>'}
				]
			}
		}
	});
};

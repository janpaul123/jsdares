/*jshint node:true jquery:true*/
"use strict";

module.exports = function(info) {
	info.tables.push({
		html: '<p><span class="info-output"><i class="icon icon-play icon-white"></i> events</span></p><p>Events are used to add <strong>interactivity</strong> to your program. A <strong>function</strong> of your choice is executed whenever something happens, like when a button is pressed or the mouse is moved.</p>',
		list: {
			'events.document.onkeydown': {
				name: 'document.onkeydown = functionName',
				text: '<p>This lets you specify a function that is called every time a key is <strong>pressed down</strong>. An <var>event</var> object is passed into the function, which you can use to determine which key is pressed.</p>',
				examples: [
					{type: 'console', code: 'function keyDown(event) {\n  console.log("key is pressed");\n}\ndocument.onkeydown = keyDown;'}
				]
			},
			'events.document.onkeyup': {
				name: 'document.onkeyup = functionName',
				text: '<p>This lets you specify a function that is called every time a key is <strong>released</strong>. An <var>event</var> object is passed into the function, which you can use to determine which key is released.</p>',
				examples: [
					{type: 'console', code: 'function keyUp(event) {\n  console.log("key is released");\n}\ndocument.onkeyup = keyUp;'}
				]
			},
			'events.event.keyCode': {
				name: 'event.keyCode',
				text: '<p>The <strong>keyCode property</strong> of the event object of keyboard events contains a number which specifies which key was pressed or released. You can try yourself which keys correspond to which numbers.</p>',
				examples: [
					{type: 'console', code: 'function keyDown(event) {\n  console.clear();\n  console.log("keyCode=" + event.keyCode);\n}\ndocument.onkeydown = keyDown;'}
				]
			},
			'events.canvas.onmousemove': {
				name: 'canvas.onmousemove = functionName',
				text: '<p>This event makes sure the function is called every time the mouse is <strong>moved</strong> across the canvas. You can use the <var>event</var> object in your function to determine where the mouse is.</p>',
				examples: [
					{type: 'canvas', code: 'function mouseMove(event) {\n  var x = event.layerX;\n  var y = event.layerY;\n  context.fillRect(x, y, 5, 5);\n}\ncanvas.onmousemove = mouseMove;'}
				]
			},
			'events.canvas.onmousedown': {
				name: 'canvas.onmousedown = functionName',
				text: '<p>This event makes sure the function is called every time the mouse is <strong>pressed down</strong>. You can use the <var>event</var> object in your function to determine where the mouse is.</p>',
				examples: [
					{type: 'canvas', code: 'function mouseDown(event) {\n  var x = event.layerX;\n  var y = event.layerY;\n  context.fillRect(x, y, 5, 5);\n}\ncanvas.onmousedown = mouseDown;'}
				]
			},
			'events.canvas.onmouseup': {
				name: 'canvas.onmouseup = functionName',
				text: '<p>This event makes sure the function is called every time the mouse is <strong>released</strong>. You can use the <var>event</var> object in your function to determine where the mouse is.</p>',
				examples: [
					{type: 'canvas', code: 'function mouseUp(event) {\n  var x = event.layerX;\n  var y = event.layerY;\n  context.fillRect(x, y, 5, 5);\n}\ncanvas.onmouseup = mouseUp;'}
				]
			},
			'events.event.layerX': {
				name: 'event.layerX',
				text: '<p>The <var>layerX</var> property of the mouse events contains a number with the <strong>x-position</strong> of the mouse.</p>',
				examples: [
					{type: 'canvas', code: 'function mouseMove(event) {\n  var x = event.layerX;\n  context.fillRect(x, 30, 5, 5);\n}\ncanvas.onmousemove = mouseMove;'}
				]
			},
			'events.event.layerY': {
				name: 'event.layerY',
				text: '<p>The <var>layerY</var> property of the mouse events contains a number with the <strong>y-position</strong> of the mouse.</p>',
				examples: [
					{type: 'canvas', code: 'function mouseMove(event) {\n  var y = event.layerY;\n  context.fillRect(30, y, 5, 5);\n}\ncanvas.onmousemove = mouseMove;'}
				]
			},
			'events.window.setInterval': {
				name: 'window.setInterval(functionName, time)',
				text: '<p>You can have a function execute every <strong>once in a while</strong>, by using this command. The <strong>time</strong> argument specifies the number of <strong>milliseconds</strong> after which the function should be executed again.</p>',
				examples: [
					{type: 'canvas', code: 'var t = 0;\nfunction tick() {\n  context.clearRect(0, 0, 500, 500);\n  context.fillRect(0, 0, t, t);\n  t += 5;\n  if (t > 200) {\n    t = 0;\n  }\n}\nwindow.setInterval(tick, 30);'}
				]
			}
		}
	});
};

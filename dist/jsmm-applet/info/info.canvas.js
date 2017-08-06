/*jshint node:true jquery:true*/
"use strict";

module.exports = function(info) {
	info.tables.push({
		html: '<p><span class="info-output"><i class="icon icon-picture icon-white"></i> canvas</span></p><p>The canvas is used to draw shapes on, and is the actual <strong>HTML</strong> element that is supported by most web browsers. This means that any program you write for this canvas can also be used <strong>outside</strong> of this environment, on any other site. It is also very suitable for programming <strong>games</strong>, by using events.</p>',
		list: {
			'canvas.getContext': {
				name: 'canvas.getContext("2d")',
				text: '<p>This is a command that should always be called <strong>before</strong> using the canvas. It returns a two-dimensional canvas context object, which can be stored in a variable. Then it can be used to <strong>draw</strong> 2d shapes on the canvas. We do not use 3d contexts here, as they are still very experimental and difficult to use.</p>',
				examples: [
					{type: 'canvas', code: '// now we can use the context to draw!\n\ncontext.fillText("Hello!", 10, 10);'}
				]
			},
			'canvas.width': {
				name: 'canvas.width',
				text: '<p>Use <var>canvas.width</var> to get the <strong>width</strong> of the canvas in pixels. This width is read-only; it cannot be changed.</p>',
				examples: [
					{type: 'console', code: 'console.log(canvas.width);', result: '512'}
				]
			},
			'canvas.height': {
				name: 'canvas.height',
				text: '<p>Use <var>canvas.height</var> to get the <strong>height</strong> of the canvas in pixels. This height is read-only; it cannot be changed.</p>',
				examples: [
					{type: 'console', code: 'console.log(canvas.height);', result: '512'}
				]
			},
			'context.fillRect': {
				name: 'context.fillRect(x, y, width, height)',
				text: '<p><var>context.fillRect</var> draws a <strong>filled</strong> rectangle on the canvas. The color set in <var>context.fillStyle</var> is used, by default this is black.</p>',
				examples: [
					{type: 'canvas', code: 'context.fillRect(20, 40, 10, 10);\ncontext.fillStyle="#a00";\ncontext.fillRect(70, 70, 30, 60);'}
				]
			},
			'context.strokeRect': {
				name: 'context.strokeRect(x, y, width, height)',
				text: '<p><var>context.strokeRect</var> draws the <strong>outline</strong> of a rectangle on the canvas. The color set in <var>context.strokeStyle</var> is used, by default this is black.</p>',
				examples: [
					{type: 'canvas', code: 'context.strokeRect(20, 40, 10, 10);\ncontext.strokeStyle="#00a";\ncontext.strokeRect(50, 50, 30, 60);'}
				]
			},
			'context.clearRect': {
				name: 'context.clearRect(x, y, width, height)',
				text: '<p><var>context.clearRect</var> <strong>clears</strong> a rectangle on the canvas. The area that is removes becomes transparent again.</p>',
				examples: [
					{type: 'canvas', code: 'context.fillRect(10, 10, 100, 100);\ncontext.clearRect(40, 40, 30, 60);'}
				]
			},
			'context.fillText': {
				name: 'context.fillText(text, x, y)',
				text: '<p><var>context.fillText</var> draws a <strong>string</strong> at some location. There are also a few commands to change the <strong>style</strong>, such as <var>context.font</var> for the font style and size, and <var>context.fillStyle</var> for the color.</p>',
				examples: [
					{type: 'canvas', code: 'context.fillText("Hello World!", 10, 30);\n\ncontext.fillStyle = "#00a";\ncontext.font = "40pt Verdana";\ncontext.fillText(4*4*4, 50, 80);'}
				]
			},
			'context.beginPath': {
				name: 'context.beginPath()',
				text: '<p>The <strong>path</strong> functionality of the canvas allows you to create <strong>complex</strong> shapes, and then draw an outline using <var>context.stroke</var>, or fill it in using <var>context.fill</var>.</p>',
				examples: [
					{type: 'canvas', code: 'context.beginPath();\ncontext.moveTo(50, 50);\ncontext.lineTo(100, 100);\ncontext.lineTo(50, 100);\ncontext.stroke();'}
				]
			},
			'context.closePath': {
				name: 'context.closePath()',
				text: '<p>When a path is <strong>closed</strong> using <var>context.closePath</var>, this just means a line is drawn to the <strong>beginning</strong> of the path. You can then draw the path using either <var>context.stroke</var> or <var>context.fill</var>.</p>',
				examples: [
					{type: 'canvas', code: 'context.beginPath();\ncontext.moveTo(50, 50);\ncontext.lineTo(100, 100);\ncontext.lineTo(50, 100);\ncontext.closePath();\ncontext.stroke();'}
				]
			},
			'context.moveTo': {
				name: 'context.moveTo(x, y)',
				text: '<p><var>context.moveTo</var> <strong>moves</strong> the current position <strong>without</strong> drawing, when using the path functionality of the canvas.</p>',
				examples: [
					{type: 'canvas', code: 'context.beginPath();\ncontext.moveTo(50, 50);\ncontext.lineTo(100, 100);\ncontext.stroke();'}
				]
			},
			'context.lineTo': {
				name: 'context.lineTo(x, y)',
				text: '<p><var>context.lineTo</var> adds a <strong>line</strong> segment from the previous position, to a new one, when using the path functionality of the canvas.</p>',
				examples: [
					{type: 'canvas', code: 'context.beginPath();\ncontext.moveTo(50, 50);\ncontext.lineTo(100, 100);\ncontext.stroke();'}
				]
			},
			'context.arc': {
				name: 'context.arc(x, y, radius, startAngle, endAngle)',
				text: '<p>You can draw complete <strong>circles</strong> or parts of them, <strong>arcs</strong>, using <var>context.arc</var>. The xy-position defines the <strong>center</strong> of the circle, and <strong>angles</strong> are given in radians, from 0 to 6.28 (2&pi;).</p>',
				examples: [
					{type: 'canvas', code: 'context.beginPath();\ncontext.arc(65, 65, 20, 0.00, 6.28);\ncontext.fill();\n\ncontext.beginPath();\ncontext.arc(85, 65, 20, 1.5, 4.7);\ncontext.strokeStyle = "#a00";\ncontext.stroke();'}
				]
			},
			'context.fill': {
				name: 'context.fill()',
				text: '<p>A path can be <strong>finished</strong> using <var>context.fill</var>, which <strong>fills</strong> the path using the color set in <var>context.fillStyle</var>.</p>',
				examples: [
					{type: 'canvas', code: 'context.beginPath();\ncontext.arc(65, 65, 40, 0.00, 6.28);\ncontext.fillStyle = "#a0a";\ncontext.fill();'}
				]
			},
			'context.stroke': {
				name: 'context.stroke()',
				text: '<p>A path can be <strong>finished</strong> using <var>context.stroke</var>, which <strong>draws</strong> the path using the color set in <var>context.strokeStyle</var>.</p>',
				examples: [
					{type: 'canvas', code: 'context.beginPath();\ncontext.arc(65, 50, 50, 0.00, 3.14);\ncontext.strokeStyle = "#0a0";\ncontext.stroke();'}
				]
			}
		}
	});
};

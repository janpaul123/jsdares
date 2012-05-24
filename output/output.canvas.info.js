/*jshint node:true jquery:true*/
"use strict";

var makeExample = function($content, example) {
	var $wrapper = $('<div class="canvas-info-wrapper"></div>');
	$content.append($('<p>Example:</p>').append($wrapper));

	var $container = $('<div class="canvas-container"></div>');
	$wrapper.append($container);

	var $canvas = $('<canvas class="canvas-canvas" width="150" height="150"></canvas>');
	$container.append($canvas);

	$wrapper.append('<code>var context = canvas.getContext("2d");<br>' + example.replace(/\n/g, '<br>') + '</code>');

	var context = $canvas[0].getContext('2d');
	eval(example);
};

module.exports = function(output) {
	output.Canvas.prototype.getCommands = function() {
		return [
			{
				name: 'canvas.getContext("2d")',
				id: 'canvas.getContext',
				outputs: ['canvas'],
				makeContent: function($content) {
					$content.html('<p>This is a command that should always be called before using the canvas. It returns a two-dimensional canvas context object, which can be stored in a variable. Then it can be used to draw 2d shapes on the canvas. We do not use 3d contexts here, as they are still very experimental and difficult to use.</p>');
					makeExample($content, '// now we can use the context to draw!\n\ncontext.fillText("Hello World!", 10, 50);');
				}
			},
			{
				name: 'canvas.width',
				id: 'canvas.width',
				outputs: ['canvas'],
				makeContent: function($content) {
					$content.html('<p>Use <var>canvas.width</var> to get the width of the canvas in pixels. This width is read-only; it cannot be changed. <p>Example:<dfn><samp>540</samp><code>console.log(canvas.width);</code></dfn></p>');
				}
			},
			{
				name: 'canvas.height',
				id: 'canvas.height',
				outputs: ['canvas'],
				makeContent: function($content) {
					$content.html('<p>Use <var>canvas.height</var> to get the height of the canvas in pixels. This height is read-only; it cannot be changed. <p>Example:<dfn><samp>540</samp><code>console.log(canvas.height);</code></dfn></p>');
				}
			},
			{
				name: 'context.fillRect(x, y, width, height)',
				id: 'context.fillRect',
				outputs: ['canvas'],
				makeContent: function($content) {
					$content.html('<p>The command <var>context.fillRect</var> draws a filled rectangle on the canvas. The color set in <var>context.fillStyle</var> is used, by default this is black.</p>');
					makeExample($content, 'context.fillRect(20, 40, 10, 10);\ncontext.fillRect(70, 70, 30, 60);');
				}
			},
			{
				name: 'context.strokeRect(x, y, width, height)',
				id: 'context.strokeRect',
				outputs: ['canvas'],
				makeContent: function($content) {
					$content.html('<p>The command <var>context.strokeRect</var> draws the outline of a rectangle on the canvas. The color set in <var>context.strokeStyle</var> is used, by default this is black.</p>');
					makeExample($content, 'context.strokeRect(20, 40, 10, 10);\ncontext.strokeRect(70, 70, 30, 60);');
				}
			},
			{
				name: 'context.clearRect(x, y, width, height)',
				id: 'context.clearRect',
				outputs: ['canvas'],
				makeContent: function($content) {
					$content.html('<p>The command <var>context.clearRect</var> clears a rectangle on the canvas. The area that is removes becomes transparent again.</p>');
					makeExample($content, 'context.fillRect(20, 20, 100, 100);\ncontext.clearRect(40, 40, 30, 60);');
				}
			}
		];
	};
};

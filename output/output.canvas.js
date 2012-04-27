/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.Canvas = function() { return this.init.apply(this, arguments); };

	output.Canvas.prototype = {
		init: function($div, editor) {
			this.$div = $div;
			this.$div.addClass('canvas');

			this.$canvas = $('<canvas class="canvas-canvas"></canvas>');
			this.$div.append(this.$canvas);
			this.size = this.$canvas.css('max-width').replace('px', '');
			this.$canvas.attr('width', this.size);
			this.$canvas.attr('height', this.size);
			this.context = this.$canvas[0].getContext('2d');
			this.context.save();

			this.$mirror = $('<canvas class="canvas-mirror"></canvas>');
			this.$div.append(this.$mirror);
			this.$mirror.attr('width', this.size);
			this.$mirror.attr('height', this.size);
			this.mirrorContext = this.$mirror[0].getContext('2d');
			this.mirrorContext.save();

			//this.debugToBrowser = true;
			this.highlighting = false;
			this.highlightNextShapes = false;
			this.highlightCallTarget = 0;
			this.editor = editor;
			this.editor.addOutput(this);

			this.clear();
		},

		remove: function() {
			this.$canvas.remove();
			this.$mirror.remove();
			this.$div.removeClass('canvas');
			this.$div.off('mousemove');
			this.editor.removeOutput(this);
		},

		functions: {
			clearRect: {type: 'method', argsMin: 4, argsMax: 4, example: 'clearRect(100, 100, 100, 100)', draws: true, mirror: true},
			fillRect: {type: 'method', argsMin: 4, argsMax: 4, example: 'fillRect(100, 100, 100, 100)', draws: true, mirror: true},
			strokeRect: {type: 'method', argsMin: 4, argsMax: 4, example: 'strokeRect(100, 100, 100, 100)', draws: true, mirror: true},
			beginPath: {type: 'method', argsMin: 0, argsMax: 0, example: 'beginPath()', draws: false, mirror: true},
			closePath: {type: 'method', argsMin: 0, argsMax: 0, example: 'closePath()', draws: false, mirror: true},
			fill: {type: 'method', argsMin: 0, argsMax: 0, example: 'fill()', draws: true, mirror: true},
			stroke: {type: 'method', argsMin: 0, argsMax: 0, example: 'stroke()', draws: true, mirror: true},
			clip: {type: 'method', argsMin: 0, argsMax: 0, example: 'clip()', draws: false, mirror: true},
			moveTo: {type: 'method', argsMin: 2, argsMax: 2, example: 'moveTo(100, 100)', draws: false, mirror: true},
			lineTo: {type: 'method', argsMin: 2, argsMax: 2, example: 'lineTo(100, 100)', draws: false, mirror: true},
			quadraticCurveTo: {type: 'method', argsMin: 4, argsMax: 4, example: 'quadraticCurveTo(30, 80, 100, 100)', draws: false, mirror: true},
			bezierCurveTo: {type: 'method', argsMin: 6, argsMax: 6, example: 'bezierCurveTo(30, 80, 60, 40, 100, 100)', draws: false, mirror: true},
			arcTo: {type: 'method', argsMin: 5, argsMax: 5, example: 'arcTo(20, 20, 100, 100, 60)', draws: false, mirror: true},
			arc: {type: 'method', argsMin: 5, argsMax: 6, example: 'arc(100, 100, 30, 0, 360)', draws: false, mirror: true},
			rect: {type: 'method', argsMin: 4, argsMax: 4, example: 'rect(100, 100, 100, 100)', draws: false, mirror: true},
			scale: {type: 'method', argsMin: 2, argsMax: 2, example: 'scale(2.0, 3.0)', draws: true, mirror: true},
			rotate: {type: 'method', argsMin: 1, argsMax: 1, example: 'rotate(0.40)', draws: true, mirror: true},
			translate: {type: 'method', argsMin: 2, argsMax: 2, example: 'translate(10, 30)', draws: true, mirror: true},
			transform: {type: 'method', argsMin: 6, argsMax: 6, example: 'transform(0.8, 0.3, 0.5, 1.0, 10, 30)', draws: true, mirror: true},
			fillText: {type: 'method', argsMin: 3, argsMax: 4, example: 'fillText("Hello World!", 100, 100)', draws: true, mirror: true},
			strokeText: {type: 'method', argsMin: 3, argsMax: 4, example: 'strokeText("Hello World!", 100, 100)', draws: true, mirror: true},
			isPointInPath: {type: 'method', argsMin: 2, argsMax: 2, example: 'isPointInPath(150, 150)', draws: false, mirror: true},
			fillStyle: {type: 'attribute', example: 'fillStyle = "#a00"', draws: false, mirror: false},
			strokeStyle: {type: 'attribute', example: 'strokeStyle = "#a00"', draws: false, mirror: false},
			shadowOffsetX: {type: 'attribute', example: 'shadowOffsetX = 10', draws: false, mirror: true},
			shadowOffsetY: {type: 'attribute', example: 'shadowOffsetY = 10', draws: false, mirror: true},
			shadowBlur: {type: 'attribute', example: 'shadowBlur = 5', draws: false, mirror: false},
			shadowColor: {type: 'attribute', example: 'shadowColor = "#3a3"', draws: false, mirror: false},
			globalAlpha: {type: 'attribute', example: 'globalAlpha = 0.5', draws: false, mirror: false},
			lineWidth: {type: 'attribute', example: 'lineWidth = 3', draws: false, mirror: false},
			lineCap: {type: 'attribute', example: 'lineCap = "round"', draws: false, mirror: true},
			lineJoin: {type: 'attribute', example: 'lineJoin = "bevel"', draws: false, mirror: true},
			miterLimit: {type: 'attribute', example: 'miterLimit = 3', draws: false, mirror: true},
			font: {type: 'attribute', example: 'font = "40pt Calibri"', draws: false, mirror: true},
			textAlign: {type: 'attribute', example: 'textAlign = "center"', draws: false, mirror: true},
			textBaseline: {type: 'attribute', example: 'textBaseline = "top"', draws: false, mirror: true}
		},

		getAugmentedObject: function() {
			return {
				width: {
					name: 'width',
					augmented: 'variable',
					example: 'width',
					get: $.proxy(function() {
						return this.size;
					}, this),
					set: function() {
						throw function(f) { return f('width') + ' cannot be set'; };
					}
				},
				height: {
					name: 'height',
					augmented: 'variable',
					example: 'height',
					get: $.proxy(function() {
						return this.size;
					}, this),
					set: function() {
						throw function(f) { return f('height') + ' cannot be set'; };
					}
				},
				getContext: {
					name: 'getContext',
					augmented: 'function',
					example: 'getContext("2d")',
					func: $.proxy(function(node, name, args) {
						if (args.length !== 1) {
							throw function(f) { return f('getContext') + ' takes exactly ' + f('1') + ' argument'; };
						} else if (args[0] !== '2d') {
							throw function(f) { return 'Only the ' + f('2d') + ' context is supported'; };
						}
						return this.getContextObject();
					}, this)
				}
			};
		},

		getContextObject: function() {
			var obj = {};
			for (var name in this.functions) {
				var func = this.functions[name];
				if (func.type === 'method') {
					obj[name] = {
						name: name,
						augmented: 'function',
						func: $.proxy(this.handleMethod, this),
						example: func.example
					};
				} else if (func.type === 'attribute') {
					obj[name] = {
						name: name,
						augmented: 'variable',
						get: $.proxy(this.handleAttributeGet, this),
						set: $.proxy(this.handleAttributeSet, this),
						example: func.example
					};
				}
			}
			this.getContextObject = function() { return obj; };
			return obj;
		},

		handleMethod: function(node, name, args) {
			var min = this.functions[name].argsMin, max = this.functions[name].argsMax;
			if (args.length < min) {
				throw function(f) { return f(name) + ' requires at least ' + f('' + min) + ' arguments'; };
			} else if (args.length > max) {
				throw function(f) { return f(name) + ' accepts no more than ' + f('' + max) + ' arguments'; };
			}
			if (this.highlighting) return this.highlight(node, name, args);
			else return this.context[name].apply(this.context, args);
		},

		handleAttributeGet: function(node, name) {
			return this.context[name];
		},

		handleAttributeSet: function(node, name, value) {
			this.context[name] = value;
			if (this.highlighting) {
				if (this.functions[name].mirror) this.mirrorContext[name] = value;

				if (name === 'strokeStyle') {
					this.actualStrokeStyle = this.context.strokeStyle;
				} else if (name === 'fillStyle') {
					this.actualFillStyle = this.context.fillStyle;
				} else if (name === 'shadowColor') {
					this.actualShadowColor = this.context.shadowColor;
				}
			}
		},

		startHighlighting: function() {
			this.highlightNextShapes = true;
		},

		stopHighlighting: function() {
			this.highlightNextShapes = false;
		},

		enableHighlighting: function() {
			this.highlighting = true;
			this.$div.addClass('canvas-highlighting');
			this.$div.on('mousemove', $.proxy(this.mouseMove, this));
			this.editor.outputRequestsRerun();
		},

		disableHighlighting: function() {
			this.highlighting = false;
			this.highlightCallTarget = 0;
			this.$div.removeClass('canvas-highlighting');
			this.$div.off('mousemove');
			this.editor.outputRequestsRerun();
		},

		startRun: function() {
			this.stopHighlighting();
			this.clear();
			this.$canvas.removeClass('canvas-error');
		},

		endRun: function() {

		},

		endRunStepping: function() {

		},

		hasError: function() {
			this.$canvas.addClass('canvas-error');
		},

		clear: function() {
			this.context.restore();
			this.context.save();
			this.context.clearRect(0, 0, this.size, this.size);
			this.context.beginPath();

			if (this.highlighting) {
				this.mirrorContext.restore();
				this.mirrorContext.save();
				this.mirrorContext.clearRect(0, 0, this.size, this.size);
				this.mirrorContext.beginPath();
				this.highlightCallCounter = 1;
				this.actualStrokeStyle = this.context.strokeStyle;
				this.actualFillStyle = this.context.fillStyle;
				this.actualShadowColor = this.context.shadowColor;
			}
		},

		getImageData: function() {
			return this.context.getImageData(0, 0, 550, 550);
		},

		/// INTERNAL FUNCTIONS ///
		highlight: function(node, name, args) {
			if (this.functions[name].draws) {
				if (this.functions[name].mirror && this.context.globalAlpha > 0) {
					// some spread is needed between the numbers as borders are blurred, and colour information is thus not 100% reliable
					// therefore we use calculation modulo prime, so that eventually all numbers are used, and this also introduces a nice cycle,
					// so that colours can be used again; the assumption is that whenever there are so many elements on the screen, the ones
					// that introduced faulty colours, or the original ones in case of reusing colours, are most likely overwritten already
					this.highlightCallCounter = (this.highlightCallCounter + 67*65536 + 111*256 + 11) % 16777213;
					//this.highlightCallCounter++;
					var color = 'rgba(' + (~~(this.highlightCallCounter/65536)%256) + ',' + (~~(this.highlightCallCounter/256)%256) + ',' + (this.highlightCallCounter%256) + ', 1)';
					this.mirrorContext.strokeStyle = color;
					this.mirrorContext.fillStyle = color;
					this.mirrorContext.shadowColor = color;
					this.mirrorContext.lineWidth = Math.max(3, this.context.lineWidth);
					this.mirrorContext[name].apply(this.mirrorContext, args);
				}

				if (this.highlightNextShapes || this.highlightCallCounter === this.highlightCallTarget) {
					this.context.strokeStyle = 'rgba(5, 195, 5, 0.85)';
					this.context.fillStyle = 'rgba(5, 195, 5, 0.85)';
					this.context.shadowColor = 'rgba(5, 195, 5, 0.85)';
					if (this.highlightCallTarget > 0) this.editor.highlightNode(node);

					var retVal = this.context[name].apply(this.context, args);
					this.context.strokeStyle = this.actualStrokeStyle;
					this.context.fillStyle = this.actualFillStyle;
					this.context.shadowColor = this.actualShadowColor;
					return retVal;
				}
			} else {
				if (this.functions[name].mirror) this.mirrorContext[name].apply(this.mirrorContext, args);
			}
			return this.context[name].apply(this.context, args);
		},

		mouseMove: function(event) {
			if (this.highlighting) {
				var offset = this.$canvas.offset();
				var x = event.pageX - offset.left, y = event.pageY - offset.top;
				var pixel = this.mirrorContext.getImageData(x, y, 1, 1).data;
				// use the alpha channel as an extra safeguard
				var target = (pixel[3] < 255 ? 0 : (pixel[0]*65536 + pixel[1]*256 + pixel[2]) % 16777213);

				if (this.highlightCallTarget !== target) {
					this.highlightCallTarget = target;
					if (!this.editor.outputRequestsRerun()) {
						this.highlightCallTarget = 0;
					}
					if (this.highlightCallTarget <= 0) {
						this.editor.highlightNode(null);
					}
				}
			}
		}
	};
};
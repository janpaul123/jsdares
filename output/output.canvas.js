/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.Canvas = function() { return this.init.apply(this, arguments); };

	output.Canvas.prototype = {
		init: function($div, editor, size) {
			this.$div = $div;
			this.$div.addClass('output canvas');

			this.size = size || 550;
			this.$container = $('<div class="canvas-container"></div>');
			this.$div.append(this.$container);
			this.$container.css('max-width', this.size);

			this.$canvas = $('<canvas class="canvas-canvas"></canvas>');
			this.$container.append(this.$canvas);

			this.$canvas.attr('width', this.size);
			this.$canvas.attr('height', this.size);
			this.context = this.$canvas[0].getContext('2d');
			this.context.save();

			this.$mirrorCanvas = $('<canvas class="canvas-mirror"></canvas>');
			this.$div.append(this.$mirrorCanvas);
			this.$mirrorCanvas.attr('width', this.size);
			this.$mirrorCanvas.attr('height', this.size);
			this.mirrorContext = this.$mirrorCanvas[0].getContext('2d');
			this.mirrorContext.save();

			this.$targetCanvas = null;

			//this.debugToBrowser = true;
			this.highlighting = false;
			this.highlightCallTarget = 0;
			this.calls = [];
			this.callNr = Infinity;
			this.editor = editor;
			this.editor.addOutput(this);

			this.clear();
		},

		remove: function() {
			this.$canvas.remove();
			this.$mirrorCanvas.remove();
			if (this.$targetCanvas !== null) {
				this.$targetCanvas.remove();
			}
			this.$container.remove();

			this.$div.removeClass('output canvas');
			this.$div.off('mousemove');
			this.editor.removeOutput(this);
		},

		functions: {
			clearRect: {type: 'function', argsMin: 4, argsMax: 4, example: 'clearRect(100, 100, 100, 100)', draws: true, mirror: true},
			fillRect: {type: 'function', argsMin: 4, argsMax: 4, example: 'fillRect(100, 100, 100, 100)', draws: true, mirror: true},
			strokeRect: {type: 'function', argsMin: 4, argsMax: 4, example: 'strokeRect(100, 100, 100, 100)', draws: true, mirror: true},
			beginPath: {type: 'function', argsMin: 0, argsMax: 0, example: 'beginPath()', draws: false, mirror: true},
			closePath: {type: 'function', argsMin: 0, argsMax: 0, example: 'closePath()', draws: false, mirror: true},
			fill: {type: 'function', argsMin: 0, argsMax: 0, example: 'fill()', draws: true, mirror: true},
			stroke: {type: 'function', argsMin: 0, argsMax: 0, example: 'stroke()', draws: true, mirror: true},
			clip: {type: 'function', argsMin: 0, argsMax: 0, example: 'clip()', draws: false, mirror: true},
			moveTo: {type: 'function', argsMin: 2, argsMax: 2, example: 'moveTo(100, 100)', draws: false, mirror: true},
			lineTo: {type: 'function', argsMin: 2, argsMax: 2, example: 'lineTo(100, 100)', draws: false, mirror: true},
			quadraticCurveTo: {type: 'function', argsMin: 4, argsMax: 4, example: 'quadraticCurveTo(30, 80, 100, 100)', draws: false, mirror: true},
			bezierCurveTo: {type: 'function', argsMin: 6, argsMax: 6, example: 'bezierCurveTo(30, 80, 60, 40, 100, 100)', draws: false, mirror: true},
			arcTo: {type: 'function', argsMin: 5, argsMax: 5, example: 'arcTo(20, 20, 100, 100, 60)', draws: false, mirror: true},
			arc: {type: 'function', argsMin: 5, argsMax: 6, example: 'arc(100, 100, 30, 0, 360)', draws: false, mirror: true},
			rect: {type: 'function', argsMin: 4, argsMax: 4, example: 'rect(100, 100, 100, 100)', draws: false, mirror: true},
			scale: {type: 'function', argsMin: 2, argsMax: 2, example: 'scale(2.0, 3.0)', draws: true, mirror: true},
			rotate: {type: 'function', argsMin: 1, argsMax: 1, example: 'rotate(0.40)', draws: true, mirror: true},
			translate: {type: 'function', argsMin: 2, argsMax: 2, example: 'translate(10, 30)', draws: true, mirror: true},
			transform: {type: 'function', argsMin: 6, argsMax: 6, example: 'transform(0.8, 0.3, 0.5, 1.0, 10, 30)', draws: true, mirror: true},
			fillText: {type: 'function', argsMin: 3, argsMax: 4, example: 'fillText("Hello World!", 100, 100)', draws: true, mirror: true},
			strokeText: {type: 'function', argsMin: 3, argsMax: 4, example: 'strokeText("Hello World!", 100, 100)', draws: true, mirror: true},
			isPointInPath: {type: 'function', argsMin: 2, argsMax: 2, example: 'isPointInPath(150, 150)', draws: false, mirror: true},
			fillStyle: {type: 'variable', example: 'fillStyle = "#a00"', draws: false, mirror: false},
			strokeStyle: {type: 'variable', example: 'strokeStyle = "#a00"', draws: false, mirror: false},
			shadowOffsetX: {type: 'variable', example: 'shadowOffsetX = 10', draws: false, mirror: true},
			shadowOffsetY: {type: 'variable', example: 'shadowOffsetY = 10', draws: false, mirror: true},
			shadowBlur: {type: 'variable', example: 'shadowBlur = 5', draws: false, mirror: false},
			shadowColor: {type: 'variable', example: 'shadowColor = "#3a3"', draws: false, mirror: false},
			globalAlpha: {type: 'variable', example: 'globalAlpha = 0.5', draws: false, mirror: false},
			lineWidth: {type: 'variable', example: 'lineWidth = 3', draws: false, mirror: false},
			lineCap: {type: 'variable', example: 'lineCap = "round"', draws: false, mirror: true},
			lineJoin: {type: 'variable', example: 'lineJoin = "bevel"', draws: false, mirror: true},
			miterLimit: {type: 'variable', example: 'miterLimit = 3', draws: false, mirror: true},
			font: {type: 'variable', example: 'font = "40pt Calibri"', draws: false, mirror: true},
			textAlign: {type: 'variable', example: 'textAlign = "center"', draws: false, mirror: true},
			textBaseline: {type: 'variable', example: 'textBaseline = "top"', draws: false, mirror: true}
		},

		getAugmentedObject: function() {
			return {
				width: {
					name: 'width',
					type: 'variable',
					example: 'width',
					get: $.proxy(function() {
						return this.size;
					}, this),
					set: function() {
						throw '<var>width</var> cannot be set';
					}
				},
				height: {
					name: 'height',
					type: 'variable',
					example: 'height',
					get: $.proxy(function() {
						return this.size;
					}, this),
					set: function() {
						throw '<var>height</var> cannot be set';
					}
				},
				getContext: {
					name: 'getContext',
					type: 'function',
					example: 'getContext("2d")',
					func: $.proxy(function(node, name, args) {
						if (args.length !== 1) {
							throw '<var>getContext</var> takes exactly <var>1</var> argument';
						} else if (args[0] !== '2d') {
							throw 'Only the <var>2d</var> context is supported';
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
				if (func.type === 'function') {
					obj[name] = {
						name: name,
						type: 'function',
						func: $.proxy(this.handleMethod, this),
						example: func.example
					};
				} else if (func.type === 'variable') {
					obj[name] = {
						name: name,
						type: 'variable',
						get: $.proxy(this.handleAttributeGet, this),
						set: $.proxy(this.handleAttributeSet, this),
						example: func.example
					};
				}
			}
			this.getContextObject = function() { return obj; };
			return obj;
		},

		handleMethod: function(context, name, args) {
			var min = this.functions[name].argsMin, max = this.functions[name].argsMax;
			if (args.length < min) {
				throw '<var>' + name + '</var> requires at least <var>' + min + '</var> arguments';
			} else if (args.length > max) {
				throw '<var>' + name + '</var> accepts no more than <var>' + max + '</var> arguments';
			}
			this.calls.push({type: 'function', name: name, args: args, callNr: context.getCallNr(), node: context.getCallNode()});
			return this.context[name].apply(this.context, args);
		},

		handleAttributeGet: function(name) {
			return this.context[name];
		},

		handleAttributeSet: function(context, name, value) {
			this.calls.push({type: 'variable', name: name, value: value, callNr: context.getCallNr(), node: context.getCallNode()});
			this.context[name] = value;
		},

		render: function(highlightCallNrs) {
			console.log('render!');
			highlightCallNrs = highlightCallNrs || [];
			this.clear();
			for (var i=0; i<this.calls.length; i++) {
				var call = this.calls[i];
				if (call.callNr > this.callNr) break;

				if (call.type === 'function') {
					if (this.highlighting) this.highlight(call.node, call.name, call.args, highlightCallNrs.indexOf(call.callNr) >= 0);
					else this.context[call.name].apply(this.context, call.args);
				} else {
					this.context[call.name] = call.value;
					if (this.highlighting) {
						if (this.functions[call.name].mirror) this.mirrorContext[call.name] = call.value;

						if (call.name === 'strokeStyle') {
							this.actualStrokeStyle = this.context.strokeStyle;
						} else if (call.name === 'fillStyle') {
							this.actualFillStyle = this.context.fillStyle;
						} else if (call.name === 'shadowColor') {
							this.actualShadowColor = this.context.shadowColor;
						}
					}
				}
			}
		},

		enableHighlighting: function() {
			this.highlighting = true;
			this.$div.addClass('canvas-highlighting');
			this.$div.on('mousemove', $.proxy(this.mouseMove, this));
			this.render();
		},

		disableHighlighting: function() {
			this.highlighting = false;
			this.highlightCallTarget = 0;
			this.$div.removeClass('canvas-highlighting');
			this.$div.off('mousemove');
			this.render();
		},

		startRun: function() {
			this.clear();
			this.$container.removeClass('canvas-error');
			this.calls = [];
		},

		endRun: function() {
			if (this.highlighting) {
				this.render();
			}
		},

		hasError: function() {
			this.$container.addClass('canvas-error');
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
			return this.context.getImageData(0, 0, this.size, this.size);
		},

		makeTargetCanvas: function() {
			this.$targetCanvas = $('<canvas class="canvas-target"></canvas>');
			this.$container.append(this.$targetCanvas);
			this.$targetCanvas.attr('width', this.size);
			this.$targetCanvas.attr('height', this.size);
			return this.$targetCanvas[0].getContext('2d');
		},

		getSize: function() {
			return this.size;
		},

		setFocus: function() {

		},

		setCallNr: function(callNr) {
			callNr = callNr < 0 ? Infinity : callNr;
			if (callNr !== this.callNr) this.render();
		},

		highlightCalls: function(calls) {
			this.render(calls);
		},

		/// INTERNAL FUNCTIONS ///
		highlight: function(node, name, args, showHighlight) {
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

				if (showHighlight || this.highlightCallCounter === this.highlightCallTarget) {
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
					this.render();
					if (this.highlightCallTarget <= 0) {
						this.editor.highlightNode(null);
					}
				}
			}
		}
	};
};
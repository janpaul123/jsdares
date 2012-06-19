/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.CanvasWrapper = function() { return this.init.apply(this, arguments); };
	output.CanvasWrapper.prototype = {
		init: function(canvas, properties) {
			this.canvas = canvas;
			this.properties = properties;
			this.context = canvas.getContext('2d');
			this.context.save();
			this.reset();
		},
		reset: function() {
			this.state = null;
			this.context.restore();
			this.context.save();
			this.callPath('beginPath', []);
		},
		callPath: function(name, args) {
			this.state = null;
			if (name === 'beginPath') {
				this.path = [];
			}
			this.path.push({name: name, args: args});
			return this.context[name].apply(this.context, args);
		},
		set: function(name, value) {
			this.state = null;
			this.context[name] = value;
		},
		getState: function() {
			if (this.state === null) {
				this.state = { path: this.path.slice() };
				for (var i=0; i<this.properties.length; i++) {
					this.state[this.properties[i]] = this.context[this.properties[i]];
				}
			}
			return this.state;
		},
		setState: function(state) {
			this.state = state;
			for (var i=0; i<this.properties.length; i++) {
				this.context[this.properties[i]] = this.state[this.properties[i]];
			}

			this.path = state.path.slice();
			for (i=0; i<this.path.length; i++) {
				this.context[this.path[i].name].apply(this.context, this.path[i].args);
			}
		}
	};

	// some spread is needed between the numbers as borders are blurred, and colour information is thus not 100% reliable
	// therefore we use calculation modulo prime, so that eventually all numbers are used, and this also introduces a nice cycle,
	// so that colours can be used again; the assumption is that whenever there are so many elements on the screen, the ones
	// that introduced faulty colours, or the original ones in case of reusing colours, are most likely overwritten already
	var highlightMult = 67*65536 + 111*256 + 11;
	var highlightPrime = 16777213;

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

			this.$mirrorCanvas = $('<canvas class="canvas-mirror"></canvas>');
			this.$div.append(this.$mirrorCanvas);
			this.$mirrorCanvas.attr('width', this.size);
			this.$mirrorCanvas.attr('height', this.size);
			this.mirrorContext = this.$mirrorCanvas[0].getContext('2d');

			this.wrapper = new output.CanvasWrapper(this.$canvas[0], ['strokeStyle', 'fillStyle',
				'shadowOffsetX', 'shadowOffsetY', 'shadowBlur', 'shadowColor', 'globalAlpha', 'lineWidth',
				'lineCap', 'lineJoin', 'miterLimit', 'font', 'textAlign', 'textBaseline']);

			this.mirrorWrapper = new output.CanvasWrapper(this.$mirrorCanvas[0], ['lineWidth', 'lineCap',
				'lineJoin', 'miterLimit', 'font', 'textAlign', 'textBaseline']);

			this.$targetCanvas = null;

			this.$originalCanvasBuffer = [];
			for (var i=0; i<30; i++) {
				this.$originalCanvasBuffer[i] = $('<canvas width="' + this.size + '" height="' + this.size + '"></canvas>');
			}

			this.highlighting = false;
			this.highlightCallTarget = 0;
			this.editor = editor;
		},

		remove: function() {
			for (var i=0; i<30; i++) {
				this.$originalCanvasBuffer[i].remove();
			}
			this.$canvas.remove();
			this.$mirrorCanvas.remove();
			if (this.$targetCanvas !== null) {
				this.$targetCanvas.remove();
			}
			this.$container.remove();

			this.$div.removeClass('output canvas');
			this.$div.off('mousemove');
		},

		functions: {
			clearRect: {type: 'function', argsMin: 4, argsMax: 4, example: 'clearRect(100, 100, 100, 100)', path: false, highlight: false, cost: 0.3},
			fillRect: {type: 'function', argsMin: 4, argsMax: 4, example: 'fillRect(100, 100, 100, 100)', path: false, highlight: true, cost: 0.3},
			strokeRect: {type: 'function', argsMin: 4, argsMax: 4, example: 'strokeRect(100, 100, 100, 100)', path: false, highlight: true, cost: 0.3},
			beginPath: {type: 'function', argsMin: 0, argsMax: 0, example: 'beginPath()', path: true, highlight: true, cost: 0.5},
			closePath: {type: 'function', argsMin: 0, argsMax: 0, example: 'closePath()', path: true, highlight: true, cost: 0.3},
			fill: {type: 'function', argsMin: 0, argsMax: 0, example: 'fill()', path: false, highlight: true, cost: 0.3},
			stroke: {type: 'function', argsMin: 0, argsMax: 0, example: 'stroke()', path: false, highlight: true},
			// clip: {type: 'function', argsMin: 0, argsMax: 0, example: 'clip()', path: true, highlight: true},
			moveTo: {type: 'function', argsMin: 2, argsMax: 2, example: 'moveTo(100, 100)', path: true, highlight: true},
			lineTo: {type: 'function', argsMin: 2, argsMax: 2, example: 'lineTo(100, 100)', path: true, highlight: true},
			quadraticCurveTo: {type: 'function', argsMin: 4, argsMax: 4, example: 'quadraticCurveTo(30, 80, 100, 100)', path: true, highlight: true},
			bezierCurveTo: {type: 'function', argsMin: 6, argsMax: 6, example: 'bezierCurveTo(30, 80, 60, 40, 100, 100)', path: true, highlight: true},
			arcTo: {type: 'function', argsMin: 5, argsMax: 5, example: 'arcTo(20, 20, 100, 100, 60)', path: true, highlight: true},
			arc: {type: 'function', argsMin: 5, argsMax: 6, example: 'arc(100, 100, 30, 0, 360)', path: true, highlight: true, cost: 0.3},
			rect: {type: 'function', argsMin: 4, argsMax: 4, example: 'rect(100, 100, 100, 100)', path: true, highlight: true, cost: 0.3},
			// scale: {type: 'function', argsMin: 2, argsMax: 2, example: 'scale(2.0, 3.0)', path: false, highlight: true},
			// rotate: {type: 'function', argsMin: 1, argsMax: 1, example: 'rotate(0.40)', path: false, highlight: true},
			// translate: {type: 'function', argsMin: 2, argsMax: 2, example: 'translate(10, 30)', path: false, highlight: true},
			// transform: {type: 'function', argsMin: 6, argsMax: 6, example: 'transform(0.8, 0.3, 0.5, 1.0, 10, 30)', path: false, highlight: true},
			fillText: {type: 'function', argsMin: 3, argsMax: 4, example: 'fillText("Hello World!", 100, 100)', path: false, highlight: true, cost: 0.3},
			strokeText: {type: 'function', argsMin: 3, argsMax: 4, example: 'strokeText("Hello World!", 100, 100)', path: false, highlight: true, cost: 0.3},
			isPointInPath: {type: 'function', argsMin: 2, argsMax: 2, example: 'isPointInPath(150, 150)', path: false, highlight: true, cost: 15},
			fillStyle: {type: 'variable', example: 'fillStyle = "#a00"'},
			strokeStyle: {type: 'variable', example: 'strokeStyle = "#a00"'},
			shadowOffsetX: {type: 'variable', example: 'shadowOffsetX = 10'},
			shadowOffsetY: {type: 'variable', example: 'shadowOffsetY = 10'},
			shadowBlur: {type: 'variable', example: 'shadowBlur = 5'},
			shadowColor: {type: 'variable', example: 'shadowColor = "#3a3"'},
			globalAlpha: {type: 'variable', example: 'globalAlpha = 0.5'},
			lineWidth: {type: 'variable', example: 'lineWidth = 3'},
			lineCap: {type: 'variable', example: 'lineCap = "round"'},
			lineJoin: {type: 'variable', example: 'lineJoin = "bevel"'},
			miterLimit: {type: 'variable', example: 'miterLimit = 3'},
			font: {type: 'variable', example: 'font = "40pt Calibri"'},
			textAlign: {type: 'variable', example: 'textAlign = "center"'},
			textBaseline: {type: 'variable', example: 'textBaseline = "top"'}
		},

		getAugmentedObject: function() {
			return {
				type: 'object',
				string: '[object canvas]',
				properties: {
					width: {
						name: 'width',
						info: 'canvas.width',
						type: 'variable',
						example: 'width',
						get: $.proxy(function() {
							return this.size;
						}, this),
						set: function() {
							throw '<var>width</var> cannot be set';
						},
						cost: 0.2
					},
					height: {
						name: 'height',
						info: 'canvas.height',
						type: 'variable',
						example: 'height',
						get: $.proxy(function() {
							return this.size;
						}, this),
						set: function() {
							throw '<var>height</var> cannot be set';
						},
						cost: 0.2
					},
					getContext: {
						name: 'getContext',
						info: 'canvas.getContext',
						type: 'function',
						example: 'getContext("2d")',
						string: '[function canvas.getContext]',
						func: $.proxy(function(node, name, args) {
							if (args.length !== 1) {
								throw '<var>getContext</var> takes exactly <var>1</var> argument';
							} else if (args[0] !== '2d') {
								throw 'Only the <var>2d</var> context is supported';
							}
							return this.getContextObject();
						}, this),
						cost: 0.2
					}
				}
			};
		},

		getContextObject: function() {
			var obj = {type: 'object', string: '[object context]', properties: {}};
			for (var name in this.functions) {
				var func = this.functions[name];
				if (func.type === 'function') {
					obj.properties[name] = {
						name: name,
						info: 'context.' + name,
						type: 'function',
						func: $.proxy(this.handleMethod, this),
						example: func.example,
						string: '[function context.' + name + ']',
						cost: func.cost || 0.2
					};
				} else if (func.type === 'variable') {
					obj.properties[name] = {
						name: name,
						info: 'context.' + name,
						type: 'variable',
						get: $.proxy(this.handleAttributeGet, this),
						set: $.proxy(this.handleAttributeSet, this),
						example: func.example,
						cost: func.cost || 0.2
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
			if (this.functions[name].path) {
				return this.wrapper.callPath(name, args);
			} else {
				this.events[this.eventPosition].calls.push({
					name: name,
					args: args,
					state: this.wrapper.getState(),
					stepNum: context.getStepNum(),
					nodeId: context.getCallNodeId(),
					callId: context.getCallId()
				});
				return this.context[name].apply(this.context, args);
			}
		},

		handleAttributeGet: function(name) {
			return this.context[name];
		},

		handleAttributeSet: function(context, name, value) {
			this.wrapper.set(name, value);
		},

		outputStartEvent: function(context) {
			var position = (this.eventsPosStart+this.eventsPosLength)%this.eventsSize;
			var $originalCanvas = null;

			if ((position % 30) === 0) {
				$originalCanvas = this.$originalCanvasBuffer[Math.floor(position/30)];
				$originalCanvas[0].getContext('2d').clearRect(0, 0, this.size, this.size);
				$originalCanvas[0].getContext('2d').drawImage(this.$canvas[0], 0, 0);
				this.lastOriginalPosition = position;
			}

			var event = {
				state: this.wrapper.getState(),
				calls: [],
				originalPosition: this.lastOriginalPosition,
				$originalCanvas: $originalCanvas
			};

			this.eventPosition = position;
			this.events[position] = event;
			this.eventsPosLength++;
		},

		outputEndEvent: function() {
			var position = (this.eventsPosStart+this.eventsPosLength-1)%this.eventsSize;
			this.events[position].endState = this.wrapper.getState();
		},

		outputClearAllEvents: function() {
			this.wrapper.reset();
			this.context.clearRect(0, 0, this.size, this.size);

			this.events = [];
			this.eventsSize = 300;
			this.eventsPosStart = 0;
			this.eventsPosLength = 0;
			this.callIds = [];
			this.timeIds = null;
		},

		outputPopFirstEvent: function() {
			if (this.eventsPosLength > 0) {
				this.eventsPosStart++;
				this.eventsPosStart %= this.eventsSize;
				this.eventsPosLength--;
			}
		},

		outputClearEventsFrom: function(eventNum) {
			this.setCanvasState((this.eventsPosStart+eventNum)%this.eventsSize);
			this.eventsPosLength = eventNum;
		},

		outputClearEventsToEnd: function() {
			this.eventsPosStart += this.eventsPosLength;
			this.eventsPosStart %= this.eventsSize;
			this.eventsPosLength = 0;
		},

		outputSetError: function(error) {
			if (error) {
				this.$canvas.addClass('canvas-error');
			} else {
				this.$canvas.removeClass('canvas-error');
			}
		},

		outputSetEventStep: function(eventNum, stepNum) {
			var position = (this.eventsPosStart+eventNum)%this.eventsSize;
			if (this.eventPosition !== position || this.stepNum !== stepNum) {
				this.eventPosition = position;
				this.stepNum = stepNum;
				this.render();
			}
		},

		highlightTimeIds: function(timeIds) {
			this.timeIds = timeIds;
			this.render();
		},

		highlightCallIds: function(callids) {
			this.callIds = callids;
			this.render();
		},

		render: function() {
			this.setCanvasState(this.eventPosition);

			for (var i=0; i<this.events[this.eventPosition].calls.length; i++) {
				var call = this.events[this.eventPosition].calls[i];
				if (call.stepNum > this.stepNum) break;
				this.wrapper.setState(call.state);

				if (this.highlighting) {
					this.context[call.name].apply(this.context, call.args);
					this.context.strokeStyle = 'rgba(0, 110, 220, 0.50)';
					this.context.fillStyle = 'rgba(0, 110, 220, 0.50)';
					this.context.shadowColor = 'rgba(0, 110, 220, 0.50)';
				}

				this.context[call.name].apply(this.context, call.args);
			}

			if (this.timeIds !== null) {
				for (var i=0; i<this.eventsPosLength; i++) {
					var event = this.events[(this.eventsPosStart+i)%this.eventsSize];
					for (var j=0; j<event.calls.length; j++) {
						var call = event.calls[j];

						if (this.timeIds[i].indexOf(call.callId) >= 0 && this.functions[call.name].highlight) {
							this.wrapper.setState(call.state);
							this.context.strokeStyle = 'rgba(0, 110, 220, 0.30)';
							this.context.fillStyle = 'rgba(0, 110, 220, 0.30)';
							this.context.shadowColor = 'rgba(0, 110, 220, 0.30)';
							this.context[call.name].apply(this.context, call.args);
						}
					}
				}
			}

			if (this.callIds !== null) {
				for (var i=0; i<this.events[this.eventPosition].calls.length; i++) {
					var call = this.events[this.eventPosition].calls[i];
					if (call.stepNum > this.stepNum) break;

					if (this.callIds.indexOf(call.callId) >= 0 && this.functions[call.name].highlight) {
						this.wrapper.setState(call.state);
						this.context.strokeStyle = 'rgba(5, 195, 5, 0.85)';
						this.context.fillStyle = 'rgba(5, 195, 5, 0.85)';
						this.context.shadowColor = 'rgba(5, 195, 5, 0.85)';
						this.context[call.name].apply(this.context, call.args);
					}
				}
			}

			if (this.highlighting) {
				this.drawMirror();
			}

			this.wrapper.setState(this.events[this.eventPosition].endState);
		},

		drawMirror: function() {
			this.clearMirror();
			for (var i=0; i<this.events[this.eventPosition].calls.length; i++) {
				var call = this.events[this.eventPosition].calls[i];
				if (call.stepNum > this.stepNum) break;

				this.mirrorWrapper.setState(call.state);

				var highlightId = (highlightMult*(i+1))%highlightPrime;
				var color = 'rgba(' + (~~(highlightId/65536)%256) + ',' + (~~(highlightId/256)%256) + ',' + (highlightId%256) + ', 1)';
				this.mirrorContext.strokeStyle = color;
				this.mirrorContext.fillStyle = color;
				this.mirrorContext.shadowColor = color;
				this.mirrorContext.lineWidth = Math.max(3, this.context.lineWidth);
				this.mirrorContext[call.name].apply(this.mirrorContext, call.args);
			}
		},

		clearMirror: function() {
			this.mirrorWrapper.reset();
			this.mirrorContext.clearRect(0, 0, this.size, this.size);
			this.mirrorWrapper.setState(this.events[this.eventPosition].state);
		},

		enableHighlighting: function() {
			this.highlighting = true;
			this.highlightCallIndex = -1;
			this.$div.addClass('canvas-highlighting');
			this.$div.on('mousemove', $.proxy(this.mouseMove, this));
			if (this.eventsPosLength > 0) {
				this.render();
			}
		},

		disableHighlighting: function() {
			this.highlighting = false;
			this.highlightCallIndex = -1;
			this.$div.removeClass('canvas-highlighting');
			this.$div.off('mousemove');
			this.callIds = [];
			if (this.eventsPosLength > 0) {
				this.render();
				this.clearMirror();
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

		getMouseElement: function() {
			return this.$canvas;
		},

		/// INTERNAL FUNCTIONS ///
		setCanvasState: function(position) {
			position = position%this.eventsSize;

			this.wrapper.reset();
			this.context.clearRect(0, 0, this.size, this.size);

			var start = this.events[position].originalPosition;
			this.context.drawImage(this.events[start].$originalCanvas[0], 0, 0);
			this.wrapper.setState(this.events[start].state);

			for (var i=start; i !== position; i=(i+1)%this.eventsSize) {
				for (var j=0; j<this.events[i].calls.length; j++) {
					var call = this.events[i].calls[j];
					this.wrapper.setState(call.state);
					this.context[call.name].apply(this.context, call.args);
				}
			}
			this.lastOriginalPosition = start;
		},

		mouseMove: function(event) {
			if (this.highlighting) {
				var offset = this.$canvas.offset();
				var x = event.pageX - offset.left, y = event.pageY - offset.top;
				var pixel = this.mirrorContext.getImageData(x, y, 1, 1).data;

				// use the alpha channel as an extra safeguard
				var highlightId = (pixel[3] < 255 ? 0 : (pixel[0]*65536 + pixel[1]*256 + pixel[2]) % 16777213);

				var highlightCallIndex = -1;
				for (var i=0; i<this.events[this.eventPosition].calls.length; i++) {
					var highlightIdMatch = (highlightMult*(i+1))%highlightPrime;
					if (highlightId === highlightIdMatch) {
						highlightCallIndex = i;
						break;
					}
				}

				if (this.highlightCallIndex !== highlightCallIndex) {
					this.highlightCallIndex = highlightCallIndex;

					if (this.highlightCallIndex < 0) {
						this.editor.highlightNode(null);
						this.highlightCallIds(null);
					} else {
						this.editor.highlightNodeId(this.events[this.eventPosition].calls[this.highlightCallIndex].nodeId);
						this.highlightCallIds([this.events[this.eventPosition].calls[this.highlightCallIndex].callId]);
					}
				}
			}
		}
	};
};
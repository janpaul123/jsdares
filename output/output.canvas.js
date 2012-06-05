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

			this.mirrorWrapper = new output.CanvasWrapper(this.$mirrorCanvas[0], ['strokeStyle', 'fillStyle',
				'lineWidth', 'lineCap', 'lineJoin', 'miterLimit', 'font', 'textAlign', 'textBaseline']);

			this.$targetCanvas = null;

			this.$originalCanvas = [];

			//this.debugToBrowser = true;
			this.highlighting = false;
			this.highlightCallTarget = 0;
			// this.calls = [];
			// this.stepNum = Infinity;
			this.editor = editor;
			this.editor.addOutput(this);

			//this.clear();
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
			clearRect: {type: 'function', argsMin: 4, argsMax: 4, example: 'clearRect(100, 100, 100, 100)', path: false},
			fillRect: {type: 'function', argsMin: 4, argsMax: 4, example: 'fillRect(100, 100, 100, 100)', path: false},
			strokeRect: {type: 'function', argsMin: 4, argsMax: 4, example: 'strokeRect(100, 100, 100, 100)', path: false},
			beginPath: {type: 'function', argsMin: 0, argsMax: 0, example: 'beginPath()', path: true},
			closePath: {type: 'function', argsMin: 0, argsMax: 0, example: 'closePath()', path: true},
			fill: {type: 'function', argsMin: 0, argsMax: 0, example: 'fill()', path: false},
			stroke: {type: 'function', argsMin: 0, argsMax: 0, example: 'stroke()', path: false},
			// clip: {type: 'function', argsMin: 0, argsMax: 0, example: 'clip()', path: true},
			moveTo: {type: 'function', argsMin: 2, argsMax: 2, example: 'moveTo(100, 100)', path: true},
			lineTo: {type: 'function', argsMin: 2, argsMax: 2, example: 'lineTo(100, 100)', path: true},
			quadraticCurveTo: {type: 'function', argsMin: 4, argsMax: 4, example: 'quadraticCurveTo(30, 80, 100, 100)', path: true},
			bezierCurveTo: {type: 'function', argsMin: 6, argsMax: 6, example: 'bezierCurveTo(30, 80, 60, 40, 100, 100)', path: true},
			arcTo: {type: 'function', argsMin: 5, argsMax: 5, example: 'arcTo(20, 20, 100, 100, 60)', path: true},
			arc: {type: 'function', argsMin: 5, argsMax: 6, example: 'arc(100, 100, 30, 0, 360)', path: true},
			rect: {type: 'function', argsMin: 4, argsMax: 4, example: 'rect(100, 100, 100, 100)', path: true},
			// scale: {type: 'function', argsMin: 2, argsMax: 2, example: 'scale(2.0, 3.0)', path: false},
			// rotate: {type: 'function', argsMin: 1, argsMax: 1, example: 'rotate(0.40)', path: false},
			// translate: {type: 'function', argsMin: 2, argsMax: 2, example: 'translate(10, 30)', path: false},
			// transform: {type: 'function', argsMin: 6, argsMax: 6, example: 'transform(0.8, 0.3, 0.5, 1.0, 10, 30)', path: false},
			fillText: {type: 'function', argsMin: 3, argsMax: 4, example: 'fillText("Hello World!", 100, 100)', path: false},
			strokeText: {type: 'function', argsMin: 3, argsMax: 4, example: 'strokeText("Hello World!", 100, 100)', path: false},
			isPointInPath: {type: 'function', argsMin: 2, argsMax: 2, example: 'isPointInPath(150, 150)', path: false},
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
					}
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
					}
				},
				getContext: {
					name: 'getContext',
					info: 'canvas.getContext',
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
						info: 'context.' + name,
						type: 'function',
						func: $.proxy(this.handleMethod, this),
						example: func.example
					};
				} else if (func.type === 'variable') {
					obj[name] = {
						name: name,
						info: 'context.' + name,
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
			if (this.functions[name].path) {
				return this.wrapper.callPath(name, args);
			} else {
				this.currentEvent.calls.push({name: name, args: args, state: this.wrapper.getState(), stepNum: context.getStepNum(), nodeId: context.getCallNodeId()});
				return this.context[name].apply(this.context, args);
			}
		},

		handleAttributeGet: function(name) {
			return this.context[name];
		},

		handleAttributeSet: function(context, name, value) {
			//this.currentEvent.calls.push({type: 'variable', name: name, value: value, stepNum: context.getStepNum(), nodeId: context.getCallNodeId()});
			//this.context[name] = value;
			this.wrapper.set(name, value);
		},

		setCanvasState: function(position) {
			this.wrapper.reset();
			this.context.clearRect(0, 0, this.size, this.size);

			var start = (position-this.buffer[position].lastOriginalOffset+this.bufferSize)%this.bufferSize;
			this.context.drawImage(this.buffer[start].$originalCanvas[0], 0, 0);
			this.wrapper.setState(this.buffer[start].state);

			for (var i=start; i !== position; i=(i+1)%this.bufferSize) {
				for (var j=0; j<this.buffer[i].calls.length; j++) {
					var call = this.buffer[i].calls[j];
					this.wrapper.setState(call.state);
					this.context[call.name].apply(this.context, call.args);
				}
			}
		},

		outputStartEvent: function(context) {
			var position = (this.bufferPosStart+this.bufferPosLength)%this.bufferSize;
			this.currentEvent = {
				//$originalCanvas: this.$originalCanvas[(this.bufferPosStart+this.bufferPosLength)%this.bufferSize],
				// $originalCanvas: this.$canvas,
				// imageBuffer: this.context.getImageData(0, 0, this.size, this.size),
				position: position,
				state: this.wrapper.getState(),
				calls: []
			};

			if ((position % 30) === 0) {
				if (this.$originalCanvas[position] === undefined) {
					this.$originalCanvas[position] = $('<canvas width="' + this.size + '" height="' + this.size + '"></canvas>');
				} else {
					this.$originalCanvas[position][0].getContext('2d').clearRect(0, 0, this.size, this.size);
				}
				this.$originalCanvas[position][0].getContext('2d').drawImage(this.$canvas[0], 0, 0); // expensive bottleneck!
				this.currentEvent.$originalCanvas = this.$originalCanvas[position];
				this.lastOriginalPosition = position;
			}
			this.currentEvent.lastOriginalOffset = (position-this.lastOriginalPosition+this.bufferSize)%this.bufferSize;
			// var imageBuffer = new Image();
			//imageBuffer.src = this.$canvas[0].toDataURL();

			// this.events.push(this.currentEvent);
			this.buffer[(this.bufferPosStart+this.bufferPosLength)%this.bufferSize] = this.currentEvent;
			this.bufferPosLength++;
		},

		outputEndEvent: function() {
		},

		outputClearAll: function() {
			this.wrapper.reset();
			this.context.clearRect(0, 0, this.size, this.size);

			// this.events = [];

			this.buffer = [];
			this.bufferSize = 300;
			this.bufferPosStart = 0;
			this.bufferPosLength = 0;
		},

		outputPopFront: function() {
			// var event = this.events.shift();

			if (this.bufferPosLength > 0) {
				this.bufferPosStart = (this.bufferPosStart+1)%this.bufferSize;
				this.bufferPosLength--;
			}
		},

		outputClearToStart: function() {
			// this.wrapper.reset();
			// this.context.clearRect(0, 0, this.size, this.size);
			// this.context.drawImage(this.events[0].$originalCanvas[0], 0, 0);
			// this.wrapper.setState(this.events[0].state);
			this.setCanvasState(this.bufferPosStart);

			// this.events = [];
			this.bufferPosLength = 0;
		},

		outputClearToEnd: function() {
			// this.events = [];
			this.bufferPosLength = 0;
		},

		outputClearEventsFrom: function(eventNum) {
			// this.wrapper.reset();
			// this.context.clearRect(0, 0, this.size, this.size);
			// this.context.drawImage(this.events[eventNum].$originalCanvas[0], 0, 0);
			// this.wrapper.setState(this.events[eventNum].state);
			this.setCanvasState((this.bufferPosStart+eventNum)%this.bufferSize);

			// this.events = this.events.slice(0, eventNum);
			this.bufferPosLength = eventNum;
		},

		outputSetError: function(error) {
			if (error) {
				this.$canvas.addClass('canvas-error');
			} else {
				this.$canvas.removeClass('canvas-error');
			}
		},

		outputSetEventStep: function(eventNum, stepNum) {
			// if (this.currentEvent !== this.events[eventNum] || this.stepNum !== stepNum) {
				// this.currentEvent = this.events[eventNum];
			if (this.currentEvent !== this.buffer[(this.bufferPosStart+eventNum)%this.bufferSize] || this.stepNum !== stepNum) {
				this.currentEvent = this.buffer[(this.bufferPosStart+eventNum)%this.bufferSize];
				this.stepNum = stepNum;
				this.render();
			}
		},

		highlightCallNodes: function(nodeIds) {
			this.render(true);
			for (var i=0; i<this.currentEvent.calls.length; i++) {
				var call = this.currentEvent.calls[i];
				if (nodeIds.indexOf(call.nodeId) >= 0) {
					this.wrapper.setState(call.state);
					this.context.strokeStyle = 'rgba(5, 195, 5, 0.85)';
					this.context.fillStyle = 'rgba(5, 195, 5, 0.85)';
					this.context.shadowColor = 'rgba(5, 195, 5, 0.85)';
					this.context[call.name].apply(this.context, call.args);
				}
			}
		},

		render: function(highlightEvent) {
			// this.wrapper.reset();
			// this.context.clearRect(0, 0, this.size, this.size);
			// this.context.drawImage(this.currentEvent.$originalCanvas[0], 0, 0);
			// this.wrapper.setState(this.currentEvent.state);
			this.setCanvasState(this.currentEvent.position);

			for (var i=0; i<this.currentEvent.calls.length; i++) {
				var call = this.currentEvent.calls[i];
				if (call.stepNum > this.stepNum) break;
				this.wrapper.setState(call.state);

				if (highlightEvent) {
					this.context[call.name].apply(this.context, call.args);
					this.context.strokeStyle = 'rgba(0, 150, 250, 0.25)';
					this.context.fillStyle = 'rgba(0, 150, 250, 0.25)';
					this.context.shadowColor = 'rgba(0, 150, 250, 0.25)';
				}

				this.context[call.name].apply(this.context, call.args);
			}
		},

		drawMirror: function() {
			this.clearMirror();
			for (var i=0; i<this.currentEvent.calls.length; i++) {
				var call = this.currentEvent.calls[i];
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
			this.mirrorWrapper.setState(this.currentEvent.state);
		},

		enableHighlighting: function() {
			this.highlighting = true;
			this.highlightCallIndex = -1;
			this.$div.addClass('canvas-highlighting');
			this.$div.on('mousemove', $.proxy(this.mouseMove, this));
			this.render(true);
			this.drawMirror();
		},

		disableHighlighting: function() {
			this.highlighting = false;
			this.highlightCallIndex = -1;
			this.$div.removeClass('canvas-highlighting');
			this.$div.off('mousemove');
			this.render();
			this.clearMirror();
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

		/// INTERNAL FUNCTIONS ///
		mouseMove: function(event) {
			if (this.highlighting) {
				var offset = this.$canvas.offset();
				var x = event.pageX - offset.left, y = event.pageY - offset.top;
				var pixel = this.mirrorContext.getImageData(x, y, 1, 1).data;

				// use the alpha channel as an extra safeguard
				var highlightId = (pixel[3] < 255 ? 0 : (pixel[0]*65536 + pixel[1]*256 + pixel[2]) % 16777213);

				var highlightCallIndex = -1;
				for (var i=0; i<this.currentEvent.calls.length; i++) {
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
						this.render(true); // == this.highlightCallNodes([]);
					} else {
						this.editor.highlightNodeId(this.currentEvent.calls[this.highlightCallIndex].nodeId);
						this.highlightCallNodes([this.currentEvent.calls[this.highlightCallIndex].nodeId]);
					}
				}
			}
		}
	};
};
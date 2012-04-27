/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.ImageDare = function() { return this.init.apply(this, arguments); };

	var AnimatedCanvas = function() { return this.init.apply(this, arguments); };
	AnimatedCanvas.prototype = {
		init: function(context) {
			this.context = context;
			this.queue = [];
			this.next = 0;
			this.timeout = null;
		},
		remove: function() {
			if (this.timeout !== null) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}
		},
		push: function(func) {
			this.queue.push(func);
		},
		run: function(delay) {
			if (delay <= 0) {
				for (var i=0; i<this.queue.length; i++)	{
					this.queue[i](this.context);
				}
			} else {
				this.delay = delay;
				this.next = 0;
				this.animateNext();
			}
		},
		animateNext: function() {
			if (this.timeout !== null) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}
			this.queue[this.next++](this.context);
			if (this.next < this.queue.length) {
				this.timeout = setTimeout($.proxy(this.animateNext, this), this.delay);
			}
		}
	};

	var AnimatedPoints = function() { return this.init.apply(this, arguments); };
	AnimatedPoints.prototype = {
		init: function($div) {
			this.$div = $div;
			this.$div.addClass('dare-points');
			this.$console = $('<div class="dare-points-console"></div>');
			this.$div.append(this.$console);
			this.$code = $('<div class="dare-points-code"></div>');
			this.$div.append(this.$code);
			this.factors = {};
			this.threshold = null;
		},
		addFactor: function(name, factor) {
			var $factor = $('<div class="dare-points-factor">var ' + name + ' = </div>');
			var $number = $('<span class="dare-points-factor-number">0</span>');
			$factor.append($number);
			$factor.append(';');
			this.$code.append($factor);
			this.factors[name] = {factor: factor, $number: $number, value: 0};
		},
		setThreshold: function(threshold) {
			this.threshold = threshold;
		},
		finish: function() {
			var $points = $('<div class="dare-points-points">var points = </div>');
			var i = 0;
			for (var name in this.factors) {
				var factor = this.factors[name];
				if (i > 0 && factor.factor >= 0) {
					$points.append(' + ');
				} else if (i > 0 && factor.factor < 0) {
					$points.append(' - ');
				} else if (i === 0 && factor.factor < 0) {
					$points.append('-');
				}
				if (Math.abs(factor.factor) !== 1) $points.append(Math.abs(factor.factor) + '*');
				$points.append(name);
				i++;
			}
			$points.append(';');
			this.$code.append($points);
			this.$code.append('<div>console.log(points);</div>');
			if (this.threshold !== null) {
				this.$code.append('<div>console.log(points >= ' + this.threshold + ');</div>');
			}
			this.refreshConsole();
		},
		setChanging: function(name) {
			this.$code.find('.dare-points-changing').removeClass('dare-points-changing');
			if (name !== null) {
				this.factors[name].$number.addClass('dare-points-changing');
			}
		},
		setValue: function(name, value) {
			this.factors[name].value = value;
			this.factors[name].$number.text(value);
			this.refreshConsole();
		},
		refreshConsole: function() {
			var points = 0;
			for (var name in this.factors) {
				var factor = this.factors[name];
				points += factor.value * factor.factor;
			}
			this.$console.html(points + (this.threshold !== null ? '<br/>' + (points >= this.threshold) : ''));
		}
	};

	output.ImageDare.prototype = {
		init: function(options, ui) {
			this.ui = ui;
			this.name = options.name || '';
			this.description = options.description || '';
			this.outputs = ['canvas'];
			this.difficulty = options.difficulty || 1;
			this.completed = options.completed || 0;
			this.original = options.original;
			this.speed = options.speed || 50;
			this.threshold = options.threshold || 300000;

			this.previewAnim = null;
		},

		addPreview: function($preview) {
			this.removePreviewAnim();

			var $canvas = $('<canvas class="dares-image-canvas" width="550" height="550"></canvas>');
			$preview.html($canvas);
			$preview.append(this.description);
			$preview.append('<span class="dares-table-cell-preview-points">var points = numMatchingPixels - numLines*50;</span>');

			this.$previewAccept = $('<button class="btn btn-success">Accept</button>');
			this.$previewAccept.on('click', $.proxy(this.selectDare, this));
			$preview.append(this.$previewAccept);

			var context = $canvas[0].getContext('2d');
			this.previewAnim = new AnimatedCanvas(context);
			this.original(this.previewAnim);
			this.previewAnim.run(this.speed);
		},

		removePreviewAnim: function() {
			if (this.previewAnim !== null) {
				this.previewAnim.remove();
			}
		},

		selectDare: function() {
			this.ui.removeAll();
			this.ui.hideDares();
			this.ui.addDare(this);
		},

		makeActive: function($div, ui) {
			this.editor = this.ui.addEditor();
			this.canvasOutput = this.ui.addCanvas();

			this.$div = $div;
			$div.addClass('imagedare');

			this.$originalCanvasContainer = $('<div class="imagedare-original-container"><div class="imagedare-original-refresh"><i class="icon-repeat icon-white"></i></div></div>');
			this.$originalCanvasContainer.on('click', $.proxy(this.animateImage, this));
			this.$div.append(this.$originalCanvasContainer);
			this.$originalCanvas = $('<canvas class="imagedare-original-canvas" width="550" height="550"></canvas>');
			this.size = 550;
			this.$originalCanvasContainer.append(this.$originalCanvas);
			this.originalContext = this.$originalCanvas[0].getContext('2d');

			this.$resultCanvas = $('<canvas class="imagedare-result" width="550" height="550"></canvas>');
			this.$div.append(this.$resultCanvas);
			this.resultContext = this.$resultCanvas[0].getContext('2d');

			var $text = $('<div class="dare-text">' + this.description + '</div>');
			this.$div.append($text);

			var $submit = $('<div class="btn btn-success">Submit</div>');
			$submit.on('click', $.proxy(this.submit, this));
			this.$div.append($submit);

			this.originalAnim = new AnimatedCanvas(this.originalContext);
			this.original(this.originalAnim);
			this.drawImage(0);
			this.imageData = this.originalContext.getImageData(0, 0, this.size, this.size);

			var $points = $('<div></div>');
			this.$div.append($points);
			this.animatedPoints = new AnimatedPoints($points);
			this.animatedPoints.addFactor('numMatchingPixels', 1);
			this.animatedPoints.addFactor('numLines', -50);
			this.animatedPoints.setThreshold(this.threshold);
			this.animatedPoints.finish();

			this.pointsAnimationTimeout = null;
			this.pointsAnimationPosition = 0;

			this.animateImage();
		},

		animateImage: function() {
			this.drawImage(50);
		},

		drawImage: function(speed) {
			this.originalContext.clearRect(0, 0, this.size, this.size);
			this.originalAnim.run(speed);
		},

		submit: function() {
			var userImageData = this.canvasOutput.getImageData();
			var resultImageData = this.resultContext.createImageData(this.size, this.size);
			this.pointsPerLine = [];

			var i=0, points = 0;
			for (var y=0; y<this.size; y++) {
				var linePoints = 0;
				for (var x=0; x<this.size; x++) {
					var dr = userImageData.data[i] - this.imageData.data[i++];
					var dg = userImageData.data[i] - this.imageData.data[i++];
					var db = userImageData.data[i] - this.imageData.data[i++];
					var da = userImageData.data[i] - this.imageData.data[i++];
					var distance = dr*dr + dg*dg + db*db + da*da;

					resultImageData.data[i-1] = 140; // alpha
					if (distance < 20) {
						points++;
						linePoints++;
						resultImageData.data[i-3] = 255; // green
					} else {
						resultImageData.data[i-4] = 255; // red
					}
				}
				this.pointsPerLine.push(linePoints);
			}

			this.resultContext.clearRect(0, 0, this.size, this.size);
			this.resultContext.putImageData(resultImageData, 0, 0);

			this.pointsAnimationPosition = 0;
			this.pointsAnimationPositionMatching = 0;
			this.pointsAnimationCallback();
		},

		pointsAnimationCallback: function() {
			if (this.pointsAnimationTimeout !== null) {
				clearTimeout(this.pointsAnimationTimeout);
			}

			var speed = 1;

			if (this.pointsAnimationPosition < this.size) {
				speed = 10;
				var y = this.pointsAnimationPosition;
				if (y === 0) {
					this.drawImage(0);
					this.animatedPoints.setChanging('numMatchingPixels');
				}
				for (var i=0; i<speed; i++) {
					this.pointsAnimationPositionMatching += this.pointsPerLine[y+i];
				}
				this.animatedPoints.setValue('numMatchingPixels', this.pointsAnimationPositionMatching);
				this.originalContext.drawImage(this.$resultCanvas[0], 0, y, this.size, speed, 0, y, this.size, speed);
				this.pointsAnimationPosition+=speed;
			}

			if (this.pointsAnimationPosition < this.size) {
				this.pointsAnimationTimeout = setTimeout($.proxy(this.pointsAnimationCallback, this), 50);
			}
		}
	};
};
/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.ImageDare = function() { return this.init.apply(this, arguments); };

	var AnimatedCanvas = function() { return this.init.apply(this, arguments); };
	AnimatedCanvas.prototype = {
		init: function() {
			this.queue = [];
			this.next = 0;
			this.timeout = null;
		},
		remove: function() {
			this.clearTimeout();
		},
		push: function(func) {
			this.queue.push(func);
		},
		run: function(context, delay) {
			this.clearTimeout();
			this.context = context;
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
		/// INTERNAL FUNCTIONS ///
		clearTimeout: function() {
			if (this.timeout !== null) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}
		},
		animateNext: function() {
			this.clearTimeout();
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

	var SegmentedAnimation = function() { return this.init.apply(this, arguments); };
	SegmentedAnimation.prototype = {
		init: function() {
			this.segments = [];
			this.total = 0;
			this.timeout = null;
		},
		remove: function() {
			this.clearTimeout();
		},
		addSegment: function(to, delay, callback) {
			this.segments.push({
				from: this.total,
				to: to+this.total,
				delay: delay,
				callback: callback
			});
			this.total += to;
		},
		run: function() {
			this.position = 0;
			this.segment = 0;
			this.animateNext();
		},
		/// INTERNAL FUNCTIONS ///
		clearTimeout: function() {
			if (this.timeout !== null) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}
		},
		animateNext: function() {
			this.clearTimeout();
			if (this.position < this.total) {
				var segment = this.segments[this.segment];
				if (this.position >= segment.to) {
					this.segment++;
					segment = this.segments[this.segment];
				}
				segment.callback(this.position-segment.from);
				this.timeout = setTimeout($.proxy(this.animateNext, this), segment.delay);
				this.position++;
			}
		}
	};

	output.addCommonDareMethods = function(dare) {
		dare.loadOptions = function(options, ui) {
			this.ui = ui;
			this.outputs = [];
			this.name = options.name || '';
			this.description = options.description || '';
			this.difficulty = options.difficulty || 1;
			this.original = options.original;
			this.threshold = options.threshold || 300000;
			this.linePenalty = options.linePenalty || 5000;

			this.highscore = JSON.parse(window.localStorage.getItem('dare-highscore-' + this.name)) || 0;
			this.completed = JSON.parse(window.localStorage.getItem('dare-completed-' + this.name)) || false;
		};

		dare.makePreviewButton = function() {
			var $previewSelect = $('<button class="btn btn-success">Select</button>');
			$previewSelect.on('click', $.proxy(function(event) { event.stopImmediatePropagation(); this.selectDare(); }, this));
			return $previewSelect;
		};

		dare.selectDare = function() {
			this.ui.removeAll();
			this.ui.hideDares();
			this.ui.addDare(this);
		};

		dare.loadEditor = function(ui) {
			this.editor = this.ui.addEditor();

			var codeName = 'dare-code-' + this.name;
			this.editor.setText(window.localStorage.getItem(codeName) || '');
			this.editor.setTextChangeCallback(function(text) {
				window.localStorage.setItem(codeName, text);
			});
		};

		dare.updateScore = function(points) {
			if (points > this.threshold) {
				this.completed = true;
				this.highscore = Math.max(this.highscore, points);
				window.localStorage.setItem('dare-completed-' + this.name, true);
				window.localStorage.setItem('dare-highscore-' + this.name, this.highscore);
			}
		};

		dare.drawScore = function() {
			if (this.completed) {
				this.$score.html('');
				this.$score.append('<div class="dare-score-completed"><i class="icon-ok icon-white"></i> Dare completed!</div>');
				this.$score.append('<div class="dare-score-highscore"><i class="icon-trophy icon-white"></i> Highscore: ' + this.highscore + ' points</div>');
				var $share = $('<div class="dare-score-share"><i class="icon-share icon-white"></i> Share: </div>');
				var twitUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent('I completed the ' + this.name + ' dare with ' + this.highscore + ' points on @jsdare!');
				var $twitter = $('<a href="' + twitUrl + '" target="_blank"><i class="icon-twitter"></i></a> ');
				$twitter.click(function(event) {
					event.preventDefault();
					window.open(twitUrl, '', 'width=550,height=300');
				});
				$share.append($twitter);
				// for Facebook see https://developers.facebook.com/docs/reference/dialogs/feed/
				this.$score.append($share);
				this.$score.slideDown(150);
			} else {
				this.$score.hide();
			}
		};

		dare.updateScoreAndAnimationWithLines = function(points) {
			this.contentLines = this.editor.getContentLines();
			this.animation.addSegment(this.contentLines.length, 100, $.proxy(this.animationLinesCallback, this));
			points -= this.linePenalty*this.contentLines.length;
			this.updateScore(points);
		};

		dare.animationLinesCallback = function(line) {
			if (line === 0) {
				this.animatedPoints.setChanging('numLines');
			}
			this.editor.highlightSingleLine(this.contentLines[line]);
			this.animatedPoints.setValue('numLines', line+1);
		};

		dare.animationFinish = function() {
			if (this.animation !== null) {
				this.animation.remove();
				this.animatedPoints.setChanging(null);
				this.editor.highlightSingleLine(null);
				this.drawScore();
			}
		};
		return dare;
	};

	output.ImageDare.prototype = output.addCommonDareMethods({
		init: function(options, ui) {
			this.loadOptions(options, ui);
			this.outputs = ['canvas'];
			this.speed = options.speed || 50;
			this.previewAnim = null;
			this.animation = null;
		},

		setPreview: function($preview) {
			this.removePreviewAnim();

			var $canvas = $('<canvas class="dares-image-canvas" width="540" height="540"></canvas>');
			$preview.html($canvas);
			$preview.append(this.description);
			$preview.append('<div class="dares-table-preview-points-container"><span class="dares-table-preview-points">var points = numMatchingPixels - ' + this.linePenalty + '*numLines;</span></div>');

			$preview.append(this.makePreviewButton());

			var context = $canvas[0].getContext('2d');
			this.previewAnim = new AnimatedCanvas();
			this.original(this.previewAnim);
			this.previewAnim.run(context, this.speed);
		},

		removePreviewAnim: function() {
			if (this.previewAnim !== null) {
				this.previewAnim.remove();
			}
		},

		makeActive: function($div, ui) {
			this.loadEditor(ui);

			this.$div = $div;
			$div.addClass('imagedare');
			this.canvasOutput = this.ui.addCanvas();
			this.size = this.canvasOutput.getSize();

			this.$description = $('<div class="dare-description"></div>');
			this.$div.append(this.$description);

			this.$originalCanvasContainer = $('<div class="imagedare-original-container"><div class="imagedare-original-refresh"><i class="icon-repeat icon-white"></i></div></div>');
			this.$originalCanvasContainer.on('click', $.proxy(this.animateImage, this));
			this.$description.append(this.$originalCanvasContainer);
			this.$originalCanvas = $('<canvas class="imagedare-original-canvas" width="' + this.size + '" height="' + this.size + '"></canvas>');
			this.$originalCanvasContainer.append(this.$originalCanvas);
			this.originalContext = this.$originalCanvas[0].getContext('2d');

			this.$resultCanvas = $('<canvas class="imagedare-result" width="' + this.size + '" height="' + this.size + '"></canvas>');
			this.$div.append(this.$resultCanvas);
			this.resultContext = this.$resultCanvas[0].getContext('2d');

			this.$description.append('<h2>' + this.name + '</h2><div class="dare-text">' + this.description + '</div>');

			this.$submit = $('<div class="btn btn-success">Submit</div>');
			this.$submit.on('click', $.proxy(this.submit, this));
			this.$description.append(this.$submit);

			this.originalAnim = new AnimatedCanvas();
			this.original(this.originalAnim);
			this.drawImage(0);
			this.imageData = this.originalContext.getImageData(0, 0, this.size, this.size);

			var targetContext = this.canvasOutput.makeTargetCanvas();
			this.originalAnim.run(targetContext, 0);

			var $points = $('<div></div>');
			this.$div.append($points);
			this.animatedPoints = new AnimatedPoints($points);
			this.animatedPoints.addFactor('numMatchingPixels', 1);
			this.animatedPoints.addFactor('numLines', -this.linePenalty);
			this.animatedPoints.setThreshold(this.threshold);
			this.animatedPoints.finish();

			this.$score = $('<div class="dare-score"></div>');
			this.$div.append(this.$score);
			this.drawScore();

			this.animateImage();
		},

		remove: function() {
			this.animationFinish();
			this.$submit.remove();
			this.$originalCanvasContainer.remove();
			this.$div.html('');
			this.$div.removeClass('imagedare');
		},

		animateImage: function() {
			this.animationFinish();
			this.drawImage(this.speed);
		},

		drawImage: function(speed) {
			this.originalContext.clearRect(0, 0, this.size, this.size);
			this.originalAnim.run(this.originalContext, speed);
		},

		submit: function() {
			this.animationFinish();
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

			this.animation = new SegmentedAnimation();
			this.animation.addSegment(this.size/10, 50, $.proxy(this.animationMatchingCallback, this));
			this.animationMatchingNumber = 0;
			this.updateScoreAndAnimationWithLines(points);
			this.animation.addSegment(1, 50, $.proxy(this.animationFinish, this));
			this.animation.run();
		},

		animationMatchingCallback: function(y) {
			y *= 10;
			if (y === 0) {
				this.drawImage(0);
				this.animatedPoints.setChanging('numMatchingPixels');
			}
			for (var i=0; i<10; i++) {
				this.animationMatchingNumber += this.pointsPerLine[y+i];
			}
			this.animatedPoints.setValue('numMatchingPixels', this.animationMatchingNumber);
			this.originalContext.drawImage(this.$resultCanvas[0], 0, y, this.size, 10, 0, y, this.size, 10);
		}
	});
};
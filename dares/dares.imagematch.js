/*jshint node:true jquery:true*/
"use strict";

module.exports = function(dares) {
	dares.AnimatedCanvas = function() { return this.init.apply(this, arguments); };
	dares.ImageMatchDare = function() { return this.init.apply(this, arguments); };
	
	dares.AnimatedCanvas.prototype = {
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
	
	dares.ImageMatchDare.prototype = dares.addCommonDareMethods({
		init: function(options, ui) {
			this.loadOptions(options, ui);
			this.threshold = options.threshold || 300000;
			this.linePenalty = options.linePenalty || 5000;
			this.outputs = ['canvas'];
			this.previewAnim = null;
			this.animation = null;
		},

		setPreview: function($preview) {
			this.removePreviewAnim();

			var $canvas = $('<canvas class="dares-imagematch-canvas" width="540" height="540"></canvas>');
			$preview.html($canvas);
			$preview.append(this.description);
			$preview.append('<div class="dares-table-preview-points-container"><span class="dares-table-preview-points">var points = numMatchingPixels - ' + this.linePenalty + '*numLines;</span></div>');

			$preview.append(this.makePreviewButton());

			var context = $canvas[0].getContext('2d');
			this.previewAnim = new dares.AnimatedCanvas();
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
			$div.addClass('dare dare-imagematch');
			this.canvas = this.ui.addCanvas();
			this.size = this.canvas.getSize();

			this.$description = $('<div class="dare-description"></div>');
			this.$div.append(this.$description);

			this.$originalCanvasContainer = $('<div class="dare-imagematch-original-container"><div class="dare-imagematch-original-refresh"><i class="icon-repeat icon-white"></i></div></div>');
			this.$originalCanvasContainer.on('click', $.proxy(this.animateImage, this));
			this.$description.append(this.$originalCanvasContainer);
			this.$originalCanvas = $('<canvas class="dare-imagematch-original-canvas" width="' + this.size + '" height="' + this.size + '"></canvas>');
			this.$originalCanvasContainer.append(this.$originalCanvas);
			this.originalContext = this.$originalCanvas[0].getContext('2d');

			this.$resultCanvas = $('<canvas class="dare-imagematch-result" width="' + this.size + '" height="' + this.size + '"></canvas>');
			this.$div.append(this.$resultCanvas);
			this.resultContext = this.$resultCanvas[0].getContext('2d');

			this.$description.append('<h2>' + this.name + '</h2><div class="dare-text">' + this.description + '</div>');

			this.$submit = $('<div class="btn btn-success">Submit</div>');
			this.$submit.on('click', $.proxy(this.submit, this));
			this.$description.append(this.$submit);

			this.originalAnim = new dares.AnimatedCanvas();
			this.original(this.originalAnim);
			this.drawImage(0);
			this.imageData = this.originalContext.getImageData(0, 0, this.size, this.size);

			var targetContext = this.canvas.makeTargetCanvas();
			this.originalAnim.run(targetContext, 0);

			var $points = $('<div></div>');
			this.$div.append($points);
			this.animatedPoints = new dares.AnimatedPoints($points);
			this.animatedPoints.addFactor('numMatchingPixels', 1, 'max: ' + (this.size*this.size));
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
			this.$div.removeClass('dare dare-imagematch');
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
			this.animatedPoints.show();

			var userImageData = this.canvas.getImageData();
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

			this.animation = new dares.SegmentedAnimation();
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
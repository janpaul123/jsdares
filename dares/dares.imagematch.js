/*jshint node:true jquery:true*/
"use strict";

var applet = require('jsmm-applet');

module.exports = function(dares) {
	dares.AnimatedCanvas = function() { return this.init.apply(this, arguments); };
	dares.ImageMatchDare = function() { return this.init.apply(this, arguments); };
	
	dares.AnimatedCanvas.prototype = {
		init: function() {
			this.calls = [];
			this.position = 0;
			this.timeout = null;
		},
		remove: function() {
			this.clearTimeout();
		},

		run: function(code) {
			var simpleCanvas = new applet.output.SimpleCanvas();
			var runner = new applet.jsmm.SimpleRunner({canvas: simpleCanvas.getAugmentedObject()});
			runner.run(code);
			this.calls = this.calls.concat(simpleCanvas.getCalls());
		},

		play: function(context, delay) {
			this.clearTimeout();
			this.context = context;
			this.delay = delay;
			this.position = 0;
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
			while (this.position < this.calls.length) {
				var call = this.calls[this.position++];
				if (call.value !== undefined) {
					this.context[call.name] = call.value;
				} else {
					this.context[call.name].apply(this.context, call.args);
				}
			
				if (this.delay > 0 && call.draws) {
					this.timeout = setTimeout($.proxy(this.animateNext, this), this.delay);
					return;
				}
			}
		}
	};
	
	dares.ImageMatchDare.prototype = dares.addCommonDareMethods({
		init: function(delegate, ui, options) {
			this.initOptions(delegate, ui, options);
			this.previewAnim = null;

			this.$div.addClass('dare dare-imagematch');
			this.canvas = this.ui.getOutput('canvas');
			this.size = this.canvas.getSize();

			this.$originalCanvasContainer = $('<div class="dare-imagematch-original-container"><div class="dare-original-refresh"><i class="icon-repeat icon-white"></i></div></div>');
			this.$originalCanvasContainer.on('click', $.proxy(this.animateImage, this));
			this.$div.append(this.$originalCanvasContainer);
			this.$originalCanvas = $('<canvas class="dare-imagematch-original-canvas" width="' + this.size + '" height="' + this.size + '"></canvas>');
			this.$originalCanvasContainer.append(this.$originalCanvas);
			this.originalContext = this.$originalCanvas[0].getContext('2d');

			this.$resultCanvas = $('<canvas class="dare-imagematch-result" width="' + this.size + '" height="' + this.size + '"></canvas>');
			this.$div.append(this.$resultCanvas);
			this.resultContext = this.$resultCanvas[0].getContext('2d');

			this.originalAnim = new dares.AnimatedCanvas();
			this.originalAnim.run(this.options.original);
			this.drawImage(0);
			this.imageData = this.originalContext.getImageData(0, 0, this.size, this.size);

			var targetContext = this.canvas.makeTargetCanvas();
			this.originalAnim.play(targetContext, 0);

			this.appendDescription(this.$div);

			this.initPoints();
			this.matchPoints = new dares.MatchPoints(this.$points, this.options.minPercentage, 'canvas');
			this.initEditor();
			this.animateImage();
		},

		remove: function() {
			this.animationFinish();
			this.$submit.remove();
			this.$originalCanvasContainer.remove();
		},

		animateImage: function() {
			this.animationFinish();
			this.drawImage(this.options.speed);
		},

		drawImage: function(speed) {
			this.originalContext.clearRect(0, 0, this.size, this.size);
			this.originalAnim.play(this.originalContext, speed);
		},

		submit: function() {
			this.animationFinish();

			var userImageData = this.canvas.getImageData();
			var resultImageData = this.resultContext.createImageData(this.size, this.size);
			this.pointsPerLine = [];

			var i=0, matching = 0, total = this.size*this.size;
			this.percentage = 0;

			for (var y=0; y<this.size; y++) {
				for (var x=0; x<this.size; x++) {
					var dr = userImageData.data[i] - this.imageData.data[i++];
					var dg = userImageData.data[i] - this.imageData.data[i++];
					var db = userImageData.data[i] - this.imageData.data[i++];
					var da = userImageData.data[i] - this.imageData.data[i++];
					var distance = dr*dr + dg*dg + db*db + da*da;

					resultImageData.data[i-1] = 140; // alpha
					if (distance < 20) {
						matching++;
						resultImageData.data[i-3] = 255; // green
					} else {
						resultImageData.data[i-4] = 255; // red
					}
				}
				this.percentage = Math.floor(100*matching/total);
				this.pointsPerLine.push(this.percentage);
			}

			this.resultContext.clearRect(0, 0, this.size, this.size);
			this.resultContext.putImageData(resultImageData, 0, 0);

			this.animation = new dares.SegmentedAnimation();
			this.animation.addSegment(1, 500, $.proxy(this.animationMatchingStartCallback, this));
			this.animation.addSegment(this.size/10, 50, $.proxy(this.animationMatchingCallback, this));
			this.animation.addRemoveSegment(500, $.proxy(this.animationMatchingFinishCallback, this));
			this.addToAnimation(this.percentage, this.percentage >= this.options.minPercentage);
			this.animation.play();
		},

		animationMatchingStartCallback: function() {
			this.drawImage(0);
		},

		animationMatchingCallback: function(y) {
			this.matchPoints.setValue(this.pointsPerLine[Math.min(y*10+9, this.pointsPerLine.length-1)]);
			this.originalContext.drawImage(this.$resultCanvas[0], 0, y*10, this.size, 10, 0, y*10, this.size, 10);
		},

		animationMatchingFinishCallback: function() {
			this.matchPoints.setValue(this.percentage);
			this.matchPoints.endAnimation();
		}
	});
};
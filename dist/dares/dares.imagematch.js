/*jshint node:true jquery:true*/
"use strict";

var applet = require('../jsmm-applet');

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
					this.timeout = setTimeout(_(this.animateNext).bind(this), this.delay);
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

			this.$originalCanvasContainer = $('<div class="dare-imagematch-original-container"><div class="dare-original-refresh"><i class="icon icon-repeat icon-white"></i></div></div>');
			this.$originalCanvasContainer.on('click', _(this.animateImage).bind(this));
			this.$div.append(this.$originalCanvasContainer);
			this.$originalCanvas = $('<canvas class="dare-imagematch-original-canvas" width="' + this.size + '" height="' + this.size + '"></canvas>');
			this.$originalCanvasContainer.append(this.$originalCanvas);
			this.originalContext = this.$originalCanvas[0].getContext('2d');

			this.$resultCanvas = $('<canvas class="dare-imagematch-result" width="' + this.size + '" height="' + this.size + '"></canvas>');
			this.$div.append(this.$resultCanvas);
			this.resultContext = this.$resultCanvas[0].getContext('2d');

			if (this.dareOptions.hidePreview) {
				this.$originalCanvasContainer.hide();
			}

			this.originalAnim = new dares.AnimatedCanvas();
			this.originalAnim.run(this.options.original);
			this.drawImage(0);
			this.imageData = this.originalContext.getImageData(0, 0, this.size, this.size);

			var targetContext = this.canvas.makeTargetCanvas();
			this.originalAnim.play(targetContext, 0);

			this.appendDescription(this.$div);

			this.initPoints();
			this.matchPoints = new dares.MatchPoints(this.$points, this.dareOptions.ImageMatch.minPercentage, 'canvas');
			this.initEditor();
			this.animateImage();
		},

		remove: function() {
			this.animationFinish();
			this.$submit.remove();
			this.$originalCanvasContainer.remove();
		},

		initOutputs: function(outputs) {
			outputs.canvas.enabled = true;
			return outputs;
		},

		animateImage: function() {
			this.animationFinish();
			this.drawImage(this.dareOptions.ImageMatch.speed);
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
			this.animation.addSegment(1, 500, _(this.animationMatchingStartCallback).bind(this));
			this.animation.addSegment(Math.ceil(this.size/10), 50, _(this.animationMatchingCallback).bind(this));
			this.animation.addRemoveSegment(500, _(this.animationMatchingFinishCallback).bind(this));
			this.addToAnimation(this.percentage, this.percentage >= this.dareOptions.ImageMatch.minPercentage);
			this.animation.play();
		},

		animationMatchingStartCallback: function() {
			this.drawImage(0);
		},

		animationMatchingCallback: function(y) {
			var height = 10;
			if (y*10+10 > this.size) height = this.size-y*10; // to correct when this.size is no multiple of 10
			this.matchPoints.setValue(this.pointsPerLine[Math.min(y*10+9, this.size-1)]);
			this.originalContext.drawImage(this.$resultCanvas[0], 0, y*10, this.size, height, 0, y*10, this.size, height);
		},

		animationMatchingFinishCallback: function() {
			this.matchPoints.setValue(this.percentage);
			this.matchPoints.endAnimation();
		}
	});
};
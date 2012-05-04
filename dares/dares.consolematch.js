/*jshint node:true jquery:true*/
"use strict";

module.exports = function(dares) {
	dares.AnimatedConsole = function() { return this.init.apply(this, arguments); };
	dares.ConsoleMatchDare = function() { return this.init.apply(this, arguments); };
	
	dares.AnimatedConsole.prototype = {
		init: function($div) {
			this.$div = $div || null;
			this.fullText = '';
			this.queue = [];
			this.next = 0;
			this.timeout = null;
		},
		remove: function() {
			this.clearTimeout();
		},
		push: function(text) {
			this.fullText += '' + text;
			this.queue.push(this.fullText);
		},
		getFullText: function() {
			return this.fullText;
		},
		run: function(delay) {
			this.clearTimeout();
			if (delay <= 0) {
				this.$div.text(this.fullText);
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
			this.$div.text(this.queue[this.next++]);
			if (this.next < this.queue.length) {
				this.timeout = setTimeout($.proxy(this.animateNext, this), this.delay);
			}
		}
	};

	dares.ConsoleMatchDare.prototype = dares.addCommonDareMethods({
		init: function(options, ui) {
			this.loadOptions(options, ui);
			this.outputs = ['console'];
			this.original = options.original;
			this.fullText = this.original(new dares.AnimatedConsole()).getFullText();
			this.linePenalty = options.linePenalty || 3;
			this.maxLines = options.maxLines || 10;
			this.threshold = options.threshold || this.fullText.length - this.linePenalty * this.maxLines;
			this.previewAnim = null;
			this.animation = null;
		},

		setPreview: function($preview) {
			this.removePreviewAnim();

			var $console = $('<div class="dares-consolematch-console"></div>');
			var $container = $('<div class="dares-table-preview-console-container"></div>');
			$container.append($console);
			$preview.html($container);

			if (this.previewHeight === undefined) {
				$console.text(this.fullText);
				this.previewHeight = $console.height();
			}
			$console.height(this.previewHeight); // fix height

			$preview.append(this.description);
			$preview.append('<div class="dares-table-preview-points-container"><span class="dares-table-preview-points">var points = numMatchingChars - ' + this.linePenalty + '*numLines;</span></div>');
			$preview.append(this.makePreviewButton());

			this.previewAnim = new dares.AnimatedConsole($console);
			this.original(this.previewAnim);
			this.previewAnim.run(this.speed);
		},

		removePreviewAnim: function() {
			if (this.previewAnim !== null) {
				this.previewAnim.remove();
			}
		},

		makeActive: function($div, ui) {
			this.loadEditor(ui);

			this.$div = $div;
			$div.addClass('dare dare-consolematch');
			this.console = this.ui.addConsole();

			this.$description = $('<div class="dare-description"></div>');
			this.$div.append(this.$description);
			this.$description.append('<h2>' + this.name + '</h2><div class="dare-text">' + this.description + '</div>');

			this.$submit = $('<div class="btn btn-success">Submit</div>');
			this.$submit.on('click', $.proxy(this.submit, this));
			this.$description.append(this.$submit);

			this.$originalConsoleContainer = $('<span class="dare-consolematch-original-container"></span>');
			this.$originalConsoleContainer.on('click', $.proxy(this.animateConsole, this));
			this.$div.append(this.$originalConsoleContainer);

			this.$resultCanvas = $('<canvas class="dare-consolematch-result"></canvas>');
			this.$originalConsoleContainer.append(this.$resultCanvas);
			this.resultContext = this.$resultCanvas[0].getContext('2d');

			this.$originalConsoleContainer.append('<div class="dare-consolematch-original-refresh"><i class="icon-repeat icon-white"></i></div>');
			this.$originalConsole = $('<span class="dare-consolematch-original-console"></span>');
			this.$originalConsoleContainer.append(this.$originalConsole);

			this.originalAnim = new dares.AnimatedConsole(this.$originalConsole);
			this.original(this.originalAnim);
			this.initOffsets();

			this.$originalConsole.text(this.fullText);
			this.width = this.$originalConsole.width() + this.charWidth;
			this.height = this.$originalConsole.height();
			this.$originalConsole.width(this.width); // fix width and height
			this.$originalConsole.height(this.height);
			this.$resultCanvas.attr('width', this.width);
			this.$resultCanvas.attr('height', this.height + this.lineHeight);

			var $points = $('<div></div>');
			this.$div.append($points);
			this.animatedPoints = new dares.AnimatedPoints($points);
			this.animatedPoints.addFactor('numMatchingChars', 1, 'max: ' + this.fullText.length);
			this.animatedPoints.addFactor('numLines', -this.linePenalty);
			this.animatedPoints.setThreshold(this.threshold);
			this.animatedPoints.finish();

			this.$score = $('<div class="dare-score"></div>');
			this.$div.append(this.$score);
			this.drawScore();

			this.animateConsole();
		},

		remove: function() {
			this.animationFinish();
			this.$submit.remove();
			this.$originalConsoleContainer.remove();
			this.$div.html('');
			this.$div.removeClass('dare dare-consolematch');
		},

		animateConsole: function() {
			this.animationFinish();
			this.drawConsole(this.speed);
		},

		drawConsole: function(speed) {
			this.resultContext.clearRect(0, 0, this.width, this.height+this.lineHeight);
			this.originalAnim.run(speed);
		},

		submit: function() {
			this.animationFinish();
			this.animatedPoints.show();

			var userText = this.console.getText();
			this.animationRects = [];
			var points = 0, x = 0, y = 0, maxX = 0;

			for (var i=0; i<this.fullText.length; i++) {
				var orig = this.fullText.charAt(i);
				var match = orig === userText.charAt(i);
				if (match) points++;

				if (orig === '\n') {
					this.animationRects.push({x1: x, x2: x+1, y: y, match: match, points: points});
					x = 0; y++;
				} else {
					var prevX = x, prevY = y;
					if (orig === '\t') {
						// tab width: 8
						x += 8-(x%8);
					} else {
						x++;
					}
					this.animationRects.push({x1: prevX, x2: x, y: y, match: match, points: points});
					maxX = Math.max(x, maxX);
				}
			}

			var surplus = userText.length - this.fullText.length;
			maxX += 2; // account for last character and endline marker
			if (surplus > 0) {
				var origPoints = points;
				var parts = Math.min(surplus, 1000);
				for (i=0; i<parts; i++) {
					points = Math.floor(origPoints - i/parts*surplus);
					this.animationRects.push({x1: maxX*i/parts, x2: maxX*(i+1)/parts, y: y, match: false, points: points});
				}
				points = origPoints - surplus;
			}

			this.animation = new dares.SegmentedAnimation();
			this.animation.addSegment(Math.ceil(this.animationRects.length/10), 50, $.proxy(this.animationMatchingCallback, this));
			this.updateScoreAndAnimationWithLines(points);
			this.animation.addSegment(1, 50, $.proxy(this.animationFinish, this));
			this.animation.run();
		},

		initOffsets: function() {
			// setting up mirror
			var $mirror = $('<span class="dare-consolematch-mirror"></span>');
			this.$originalConsoleContainer.append($mirror);

			$mirror.text('a');
			var textOffset = {x: $mirror.outerWidth(), y: $mirror.outerHeight()};

			// this trick of measuring a long string especially helps Firefox get an accurate character width
			$mirror.text('a' + new Array(100+1).join('a'));
			this.charWidth = ($mirror.outerWidth() - textOffset.x)/100;

			$mirror.text('a\na');
			this.lineHeight = $mirror.outerHeight() - textOffset.y;
			
			// this works assuming there is no padding on the right or bottom
			textOffset.x -= this.charWidth;
			textOffset.y -= this.lineHeight;

			this.$resultCanvas.css('left', textOffset.x);
			this.$resultCanvas.css('top', textOffset.y);
			$mirror.remove();
		},

		animationMatchingCallback: function(i) {
			i *= 10;
			if (i === 0) {
				this.drawConsole(0);
				this.animatedPoints.setChanging('numMatchingChars');
			}

			var rectangle = null;
			for (var j=0; j<10 && i+j<this.animationRects.length; j++) {
				rectangle = this.animationRects[i+j];
				if (rectangle.match) {
					this.resultContext.fillStyle = '#030';
				} else {
					this.resultContext.fillStyle = '#300';
				}
				this.resultContext.fillRect(rectangle.x1*this.charWidth, rectangle.y*this.lineHeight, (rectangle.x2-rectangle.x1)*this.charWidth, this.lineHeight);
			}
			
			if (rectangle !== null) {
				this.animatedPoints.setValue('numMatchingChars', rectangle.points);
			}
		}
	});
};
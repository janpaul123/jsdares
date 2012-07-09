/*jshint node:true jquery:true*/
"use strict";

var applet = require('jsmm-applet');

module.exports = function(dares) {
	dares.AnimatedConsole = function() { return this.init.apply(this, arguments); };
	dares.AnimatedConsole.prototype = {
		init: function($div) {
			this.$div = $div;
			this.$div.addClass('dare-consolematch-animatedconsole');
			this.text = '';
			this.calls = [];
			this.width = this.height = this.position = 0;
			this.timeout = null;
		},

		remove: function() {
			this.$div.removeClass('dare-consolematch-animatedconsole');
			this.clearTimeout();
		},

		run: function(code) {
			var simpleConsole = new applet.output.SimpleConsole();
			var runner = new applet.jsmm.SimpleRunner({console: simpleConsole.getAugmentedObject()});
			runner.run(code);
			this.calls = this.calls.concat(simpleConsole.getCalls());
			this.text = simpleConsole.getText();

			for (var i=0; i<this.calls.length; i++) {
				this.applyCall(this.calls[i]);
				this.width = Math.max(this.width, this.$div.width());
				this.height = Math.max(this.height, this.$div.height());
				console.log(this.$div.height());
			}

			this.$div.width(this.width); // fix width and height
			this.$div.height(this.height);
		},

		play: function(delay) {
			this.clearTimeout();
			this.delay = delay;
			this.position = 0;
			this.$div.html('');
			this.animateNext();
		},

		getText: function() {
			return this.text;
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
				this.applyCall(this.calls[this.position++]);
			
				if (this.delay > 0) {
					this.timeout = setTimeout(this.animateNext.bind(this), this.delay);
					return;
				}
			}
		},

		applyCall: function(call) {
			if (call.clear) {
				this.$div.html('');
			} else {
				var $line = $('<div class="dare-consolematch-animatedconsole-line"></div>');
				$line.text(call.text);
				$line.css('color', call.color);
				this.$div.append($line);
			}
		}
	};

	dares.ConsoleMatchDare = function() { return this.init.apply(this, arguments); };
	dares.ConsoleMatchDare.prototype = dares.addCommonDareMethods({
		init: function(delegate, ui, options) {
			this.initOptions(delegate, ui, options);

			this.$div.addClass('dare dare-consolematch');
			this.console = this.ui.getOutput('console');

			this.appendDescription(this.$div);

			this.$originalConsoleContainer = $('<div class="dare-consolematch-original-container"></div>');
			this.$originalConsoleContainer.on('click', this.animateConsole.bind(this));
			this.$div.append(this.$originalConsoleContainer);

			this.$resultConsole = $('<canvas class="dare-consolematch-result"></canvas>');
			this.$originalConsoleContainer.append(this.$resultConsole);
			this.resultContext = this.$resultConsole[0].getContext('2d');

			this.$originalConsoleContainer.append('<div class="dare-original-refresh"><i class="icon-repeat icon-white"></i></div>');
			this.$originalConsole = $('<div class="dare-consolematch-original-console"></div>');
			this.$originalConsoleContainer.append(this.$originalConsole);

			this.originalAnim = new dares.AnimatedConsole(this.$originalConsole);
			this.originalAnim.run(this.options.original);

			this.initOffsets();
			this.$originalConsole.width(this.$originalConsole.width() + this.charWidth);
			this.$resultConsole.attr('width', this.$originalConsole.width());
			this.$resultConsole.attr('height', this.$originalConsole.height() + this.lineHeight);

			this.fullText = this.originalAnim.getText();
			this.console.makeTargetConsole(this.fullText);

			this.initPoints();
			this.matchPoints = new dares.MatchPoints(this.$points, this.options.minPercentage, 'console');
			this.initEditor();
			this.animateConsole();
		},

		remove: function() {
			this.animationFinish();
			this.$submit.remove();
			this.$originalConsoleContainer.remove();
		},

		animateConsole: function() {
			this.animationFinish();
			this.drawConsole(this.options.speed);
		},

		drawConsole: function(speed) {
			this.resultContext.clearRect(0, 0, this.$resultConsole.width(), this.$resultConsole.height());
			this.originalAnim.play(speed);
		},

		submit: function() {
			if (this.error) return;
			this.animationFinish();

			var userText = this.console.getText();
			this.animationRects = [];
			var matching = 0, x = 0, y = 0, maxX = 0;
			this.percentage = 100;

			for (var i=0; i<this.fullText.length; i++) {
				var orig = this.fullText.charAt(i);
				var match = orig === userText.charAt(i);
				if (match) matching++;
				this.percentage = Math.floor(100*matching/this.fullText.length);

				if (orig === '\n') {
					this.animationRects.push({x1: x, x2: x+1, y: y, match: match, points: this.percentage});
					x = 0; y++;
				} else {
					var prevX = x, prevY = y;
					if (orig === '\t') {
						// tab width: 8
						x += 8-(x%8);
					} else {
						x++;
					}
					this.animationRects.push({x1: prevX, x2: x, y: y, match: match, points: this.percentage});
					maxX = Math.max(x, maxX);
				}
			}

			var surplus = userText.length - this.fullText.length;
			maxX += 2; // account for last character and endline marker
			if (surplus > 0) {
				var origMatching = matching;
				var parts = Math.min(surplus, 30);
				for (i=0; i<parts; i++) {
					matching = Math.max(0, Math.floor(origMatching - (i+1)/parts*surplus));
					this.percentage = Math.floor(100*matching/this.fullText.length);
					this.animationRects.push({x1: maxX*i/parts, x2: maxX*(i+1)/parts, y: y, match: false, points: this.percentage});
				}
				matching = origMatching - surplus;
			}

			this.percentage = Math.max(0, Math.floor(100*matching/this.fullText.length));
			this.animationSteps = Math.min(this.animationRects.length, 100);

			this.animation = new dares.SegmentedAnimation();
			this.animation.addSegment(1, 500, this.animationMatchingStartCallback.bind(this));
			this.animation.addSegment(this.animationSteps, Math.max(1500/this.animationSteps, 50), this.animationMatchingCallback.bind(this));
			this.animation.addRemoveSegment(500, this.animationMatchingFinishCallback.bind(this));
			
			this.addToAnimation(this.percentage, this.percentage >= this.options.minPercentage);
			this.animation.play();
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

			// this.$resultConsole.css('left', textOffset.x);
			// this.$resultConsole.css('top', textOffset.y);
			$mirror.remove();
		},

		animationMatchingStartCallback: function() {
			this.matchPoints.setValue(0);
			this.drawConsole(0);
		},

		animationMatchingCallback: function(i) {
			var rectangle = null;

			var steps = Math.ceil(this.animationRects.length/this.animationSteps);
			for (var j=0; j<steps && steps*i+j < this.animationRects.length; j++) {
				rectangle = this.animationRects[steps*i+j];
				if (rectangle.match) {
					this.resultContext.fillStyle = '#060';
				} else {
					this.resultContext.fillStyle = '#600';
				}
				this.resultContext.fillRect(rectangle.x1*this.charWidth, rectangle.y*this.lineHeight, (rectangle.x2-rectangle.x1)*this.charWidth, this.lineHeight);
				this.matchPoints.setValue(rectangle.points);
			}
		},

		animationMatchingFinishCallback: function() {
			this.matchPoints.setValue(this.percentage);
			this.matchPoints.endAnimation();
		}
	});
};
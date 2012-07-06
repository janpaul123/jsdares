/*jshint node:true jquery:true*/
"use strict";

module.exports = function(dares) {
	dares.LinePoints = function() { return this.init.apply(this, arguments); };
	dares.LinePoints.prototype = {
		init: function($div, max, reward) {
			this.max = max;
			this.reward = reward;

			this.$container = $('<div class="dare-points-lines"><div class="dare-points-info"><div class="dare-points-title"><strong><span class="dare-points-lines-lines">0</span> lines</strong> (maximum ' + this.max + ')</div><div class="dare-points-description">You get <strong>' + this.reward + '</strong> points for every line below the maximum. Only lines that actually contain content are counted.</div></div><div class="dare-points-points dare-points-good">0</div></div>');
			$div.append(this.$container);

			this.$lines = this.$container.find('.dare-points-lines-lines');
			this.$points = this.$container.find('.dare-points-points');
		},
		remove: function() {
			this.$container.remove();
		},
		setValue: function(lines) {
			this.$lines.text(lines);
			if (lines <= this.max) {
				this.$points.addClass('dare-points-good');
				this.$points.text((this.max-lines)*this.reward);
			} else {
				this.$points.removeClass('dare-points-good');
				this.$points.text(0);
			}
		}
	};

	/*
	dares.AnimatedPoints = function() { return this.init.apply(this, arguments); };
	dares.AnimatedPoints.prototype = {
		init: function($div) {
			this.$div = $div;
			this.$div.addClass('dare-points');
			this.$console = $('<div class="dare-points-console"></div>');
			this.$div.append(this.$console);
			this.$code = $('<div class="dare-points-code"></div>');
			this.$div.append(this.$code);
			this.$div.hide();
			this.factors = {};
			this.threshold = null;
		},
		show: function() {
			this.$div.slideDown(150);
		},
		hide: function() {
			this.$div.slideUp(150);
		},
		addFactor: function(name, factor, comment) {
			var $factor = $('<div class="dare-points-factor">var ' + name + ' = </div>');
			var $number = $('<span class="dare-points-factor-number">0</span>');
			$factor.append($number);
			$factor.append(';');
			if (comment !== undefined) {
				$factor.append(' // ' + comment);
			}
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
	*/

	dares.SegmentedAnimation = function() { return this.init.apply(this, arguments); };
	dares.SegmentedAnimation.prototype = {
		init: function() {
			this.segments = [];
			this.total = 0;
			this.timeout = null;
		},
		remove: function() {
			this.clearTimeout();
		},
		addSegment: function(to, delay, callback) {
			if (to > 0) {
				this.segments.push({
					from: this.total,
					to: to+this.total,
					delay: delay,
					callback: callback
				});
				this.total += to;
			}
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

	dares.addCommonDareMethods = function(dare) {
		dare.hasError = function() {
			this.error = true;
			this.$submit.addClass('disabled');
			this.animationFinish();
		};

		dare.setCallNr = function() {
			this.error = false;
			this.$submit.removeClass('disabled');
			this.animationFinish();
		};

		dare.updateScore = function(points) {
			if (points >= this.threshold) {
				this.completed = true;
				this.highscore = Math.max(this.highscore || 0, points);
				this.delegate.updateHighscore(this.highscore);
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
			points += (this.threshold-this.contentLines.length)*this.linePenalty;
			this.updateScore(points);
		};

		dare.animationLinesCallback = function(line) {
			this.editor.highlightContentLine(this.contentLines[line]);
			this.linePoints.setValue(line+1);
		};

		dare.animationFinish = function() {
			if (this.animation !== null) {
				this.animation.remove();
				//this.animatedPoints.setChanging(null);
				this.editor.highlightContentLine(null);
				this.drawScore();
			}
		};
		return dare;
	};
};
/*jshint node:true jquery:true*/
"use strict";

module.exports = function(dares) {
	dares.LinePoints = function() { return this.init.apply(this, arguments); };
	dares.LinePoints.prototype = {
		init: function($div, max, reward) {
			this.max = max;
			this.reward = reward;

			this.$container = $('<div class="dare-points-content dare-points-lines"><div class="dare-points-info"><div class="dare-points-title">Lines: <span class="dare-points-lines-lines">0</span></strong> <span class="dare-points-constraints">no more than ' + this.max + ' lines</span></div><div class="dare-points-description">You get <strong>' + this.reward + '</strong> points for every line below the maximum. Only lines that actually contain content are counted.</div></div><div class="dare-points-points dare-points-good">0</div></div>');
			$div.append(this.$container);

			this.$lines = this.$container.find('.dare-points-lines-lines');
			this.$points = this.$container.find('.dare-points-points');
		},

		remove: function() {
			this.$container.remove();
		},

		setValue: function(lines) {
			this.$lines.addClass('dare-points-highlight');
			this.$lines.text(lines);
			if (lines <= this.max) {
				this.$points.addClass('dare-points-good');
				this.$points.text((this.max-lines)*this.reward);
			} else {
				this.$points.removeClass('dare-points-good');
				this.$points.text(0);
			}
		},

		endAnimation: function() {
			this.$lines.removeClass('dare-points-highlight');
		}
	};

	dares.MatchPoints = function() { return this.init.apply(this, arguments); };
	dares.MatchPoints.prototype = {
		init: function($div, min, type) {
			this.min = min;

			this.$container = $('<div class="dare-points-content dare-points-match"><div class="dare-points-info"><div class="dare-points-title">Matching ' + (type === 'console' ? 'characters' : 'pixels') +': <span class="dare-points-match-percentage">0</span>% <span class="dare-points-constraints">at least ' + this.min + '%</span></div><div class="dare-points-description">You get one point for every percentage of the ' + type + ' output that matches.</div></div><div class="dare-points-points">0</div></div>');
			$div.append(this.$container);

			this.$percentage = this.$container.find('.dare-points-match-percentage');
			this.$points = this.$container.find('.dare-points-points');
		},

		setValue: function(percentage) {
			this.$percentage.addClass('dare-points-highlight');
			this.$percentage.text(percentage);

			this.$points.text(percentage);
			if (percentage >= this.min) this.$points.addClass('dare-points-good');
			else this.$points.removeClass('dare-points-good');
		},

		endAnimation: function() {
			this.$percentage.removeClass('dare-points-highlight');
		}
	};

	dares.HighscorePoints = function() { return this.init.apply(this, arguments); };
	dares.HighscorePoints.prototype = {
		init: function($div, name, initial) {
			this.name = name;
			this.$container = $('<div class="dare-points-highscore"><div class="dare-points-highscore-score">0</div><div class="dare-points-highscore-share"></div></div>');
			$div.append(this.$container);

			this.$score = this.$container.find('.dare-points-highscore-score');
			this.$share = this.$container.find('.dare-points-highscore-share');

			if (this.initial > 0) {
				this.setValue(initial);
			}
		},

		setValue: function(score) {
			this.$score.text(score);
			this.$container.removeClass('dare-points-highscore-blink');
			window.setTimeout($.proxy(function() {
				this.$container.addClass('dare-points-highscore-active dare-points-highscore-blink');
			}, this));

			var twitUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent('I completed the ' + this.name + ' dare with ' + score + ' points on @jsdare!');
			var $twitter = $('<a href="' + twitUrl + '" target="_blank"><i class="icon-twitter"></i></a> ');
			$twitter.click(function(event) {
				event.preventDefault();
				window.open(twitUrl, '', 'width=550,height=300');
			});

			this.$share.html($twitter);
		},

		endAnimation: function() {
			this.$container.removeClass('dare-points-highscore-blink');
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
			this.removeSegments = [];
			this.timeout = null;
		},

		remove: function() {
			this.clearTimeout();
			for (var i=0; i<this.removeSegments.length; i++) {
				this.removeSegments[i]();
			}
		},

		prependSegment: function(to, delay, callback) {
			if (to > 0) {
				this.segments.unshift({to: to, delay: delay, callback: callback, popRemove: false });
			}
		},

		addSegment: function(to, delay, callback) {
			if (to > 0) {
				this.segments.push({to: to, delay: delay, callback: callback, popRemove: false });
			}
		},

		addRemoveSegment: function(delay, callback) {
			this.segments.push({to: 1, delay: delay, callback: callback, popRemove: this.removeSegments.length });
			this.removeSegments.push(callback);
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
			while (this.segment < this.segments.length) {
				var segment = this.segments[this.segment];
				segment.callback(this.position);
				if (segment.popRemove !== false) {
					this.removeSegments.splice(segment.popRemove, 1);
				}
				
				this.position++;
				if (this.position >= segment.to) {
					this.segment++;
					this.position = 0;
				}

				if (segment.delay > 0) {
					this.timeout = setTimeout($.proxy(this.animateNext, this), segment.delay);
					return;
				}
			}
		}
	};

	dares.addCommonDareMethods = function(dare) {
		dare.initOptions = function(delegate, ui, options) {
			this.delegate = delegate;
			this.ui = ui;
			this.options = options;
			this.highscore = options.user.highscore;
			this.animation = null;

			this.editor = this.ui.addEditor(this.options.editor);
			this.$div = this.ui.addTab('dare');
			this.ui.loadOutputs(this.options.outputOptions);
			this.ui.selectTab('dare');
		};

		dare.appendDescription = function($div) {
			this.$description = $('<div class="dare-description"></div>');
			this.$description.append('<h2>' + this.options.name + '</h2><div class="dare-text">' + this.options.description + '</div>');
			$div.append(this.$description);

			this.$submit = $('<div class="btn btn-success dare-submit">Submit solution</div>');
			this.$submit.on('click', $.proxy(this.submit, this));
			this.$description.append(this.$submit);
		};

		dare.initPoints = function() {
			this.$points = $('<div class="dare-points"></div>');
			this.$div.append(this.$points);
			this.$points.hide();

			this.linePoints = null;
			if (this.options.maxLines !== undefined) {
				this.linePoints = new dares.LinePoints(this.$points, this.options.maxLines, this.options.lineReward);
			}
			this.highscorePoints = new dares.HighscorePoints(this.$points, this.options.name, this.highscore);
		};

		dare.initEditor = function() {
			if (this.options.user.text !== undefined) {
				this.editor.setText(this.options.user.text);
			}
			this.editor.setTextChangeCallback($.proxy(this.delegate.updateCode, this.delegate));
		};

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

		dare.updateHighScore = function(points) {
			if (!this.completed || points > this.highscore) {
				this.completed = true;
				this.highscore = points;
				this.delegate.updateHighscore(this.highscore);
				this.animation.addRemoveSegment(300, $.proxy(this.animationHighscoreCallback, this));
			}
		};

		dare.hasValidNumberOfLines = function() {
			return this.options.maxLines === undefined || this.editor.getContentLines().length <= this.options.maxLines;
		};

		dare.addLineAnimation = function() {
			this.contentLines = this.editor.getContentLines();
			this.animation.addSegment(1, 500, $.proxy(this.animationLinesStartCallback, this));
			this.animation.addSegment(this.contentLines.length, Math.max(1300/this.contentLines.length, 50), $.proxy(this.animationLinesCallback, this));
			this.animation.addRemoveSegment(0, $.proxy(this.animationLinesFinishCallback, this));
			return (this.options.maxLines-this.contentLines.length)*this.options.lineReward;
		};

		dare.addToAnimation = function(points) {
			if (!this.$points.is(':visible')) {
				this.animation.prependSegment(1, 400, $.proxy(this.animationSlideDown, this));
			}

			if (this.options.maxLines !== undefined) {
				points += this.addLineAnimation();
			}
			
			if (this.visitedGoals.length >= this.options.minGoals && this.hasValidNumberOfLines()) {
				this.updateHighScore(points);
			}

			this.animation.addSegment(1, 0, $.proxy(this.animationFinish, this));
		};

		dare.animationSlideDown = function() {
			this.$points.slideDown(400);
		};

		dare.animationLinesStartCallback = function() {
			this.linePoints.setValue(0);
		};

		dare.animationLinesCallback = function(line) {
			this.editor.highlightContentLine(this.contentLines[line]);
			this.linePoints.setValue(line+1);
		};

		dare.animationLinesFinishCallback = function() {
			this.linePoints.setValue(this.contentLines.length);
			this.linePoints.endAnimation();
			this.editor.highlightContentLine(null);
		};

		dare.animationHighscoreCallback = function() {
			this.highscorePoints.setValue(this.highscore);
		};

		dare.animationFinish = function() {
			if (this.animation !== null) {
				this.animation.remove();
				this.highscorePoints.endAnimation();
				this.animation = null;
			}
		};
		return dare;
	};
};
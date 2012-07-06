/*jshint node:true jquery:true*/
"use strict";

var robot = require('jsmm-applet').robot;
var clayer = require('jsmm-applet').clayer;

module.exports = function(dares) {
	dares.RobotGoalPoints = function() { return this.init.apply(this, arguments); };
	dares.RobotGoalPoints.prototype = {
		init: function($div, numGoals, reward, threshold) {
			this.$div = $div;
			this.$div.addClass('dare-robotgoal-points');
			this.$div.hide();

			this.$goals = $('<div class="dare-robotgoal-points-goals"></div>');
			this.$div.append(this.$goals);

			this.$squares = [];
			for (var i=0; i<numGoals; i++) {
				var $square = $('<div class="dare-robotgoal-points-square"></div>');
				this.$goals.append($square);
				this.$squares.push($square);
			}

			this.$points = $('<div class="dare-robotgoal-points-points">0</div>');
			this.$div.append(this.$points);
			this.reward = reward;
			this.threshold = threshold;
		},
		show: function() {
			this.$div.slideDown(150);
		},
		hide: function() {
			this.$div.slideUp(150);
		},
		setValue: function(name, value) {
			if (value > 0) {
				clayer.setCss3(this.$squares[value-1], 'transition', 'background-color 0.2s linear');
				this.$squares[value-1].addClass('dare-robotgoal-points-square-active dare-robotgoal-points-square-blink');
				if (value-2 >= 0) {
					this.$squares[value-2].removeClass('dare-robotgoal-points-square-blink');
				}
			} else {
				for (var i=0; i<this.$squares.length; i++) {
					clayer.setCss3(this.$squares[i], 'transition', '');
					this.$squares[i].removeClass('dare-robotgoal-points-square-active dare-robotgoal-points-square-blink');
				}
			}
			this.$points.text(this.reward*value);
			if (this.reward*value >= this.threshold) this.$points.addClass('win');
			else this.$points.removeClass('win');
		},
		endAnimation: function() {
			this.$squares[this.$squares.length-1].removeClass('dare-robotgoal-points-square-blink');
		},
		setChanging: function() {}
	};

	dares.RobotGoalDare = function() { return this.init.apply(this, arguments); };
	dares.RobotGoalDare.prototype = dares.addCommonDareMethods({
		init: function(delegate, ui, options) {
			this.delegate = delegate;
			this.ui = ui;
			this.options = options;
			this.previewBlockSize = options.previewBlockSize || 32;
			this.resultBlockSize = options.resultBlockSize || 48;
			this.numGoals = options.numGoals;
			this.linePenalty = options.linePenalty;
			this.goalReward = options.goalReward || 50;
			this.maxLines = options.maxLines || 10;
			this.threshold = options.threshold || this.numGoals*this.goalReward - this.linePenalty*this.maxLines;
			this.highscore = options.user.highscore;
			this.previewRobot = null;
			this.animation = null;

			this.editor = this.ui.addEditor(this.options.editor);

			this.$div = this.ui.addTab('dare');
			this.ui.loadOutputs(this.options.outputOptions);
			this.ui.selectTab('dare');

			this.$div.addClass('dare dare-robotgoal');
			this.robot = this.ui.getOutput('robot');
			
			this.$originalRobotContainer = $('<span class="dare-robotgoal-original-container"></span>');
			this.$originalRobotContainer.on('click', $.proxy(this.animateRobot, this));
			this.$div.append(this.$originalRobotContainer);

			this.$originalRobot = $('<div class="dare-robotgoal-original"></div>');
			this.$originalRobotContainer.append(this.$originalRobot);
			this.$originalRobotContainer.append('<div class="dare-robotgoal-original-refresh"><i class="icon-repeat icon-white"></i></div>');

			this.$description = $('<div class="dare-description"></div>');
			this.$div.append(this.$description);
			this.$description.append('<h2>' + this.options.name + '</h2><div class="dare-text">' + this.options.description + '</div>');

			this.$submit = $('<div class="btn btn-success dare-submit">Submit solution</div>');
			this.$submit.on('click', $.proxy(this.submit, this));
			this.$description.append(this.$submit);

			this.originalRobot = new robot.Robot(this.$originalRobot, true, this.resultBlockSize);
			this.originalRobot.setState(this.options.robotState);
			this.originalRobot.clear();
			this.originalRobot.insertDelay(30000);
			this.options.original(this.originalRobot);

			var $points = $('<div></div>');
			this.$div.append($points);

			if (this.linePenalty > 0) {
				this.animatedPoints = new dares.AnimatedPoints($points);
				this.animatedPoints.addFactor('numVisitedGoals', this.goalReward);
				this.animatedPoints.addFactor('numLines', -this.linePenalty);
				this.animatedPoints.setThreshold(this.threshold);
				this.animatedPoints.finish();
			} else {
				this.animatedPoints = new dares.RobotGoalPoints($points, this.numGoals, this.goalReward, this.threshold);
			}

			this.$score = $('<div class="dare-score"></div>');
			this.$div.append(this.$score);
			this.drawScore();

			this.robot.setState(this.options.robotState);
			if (this.options.user.text !== undefined) {
				this.editor.setText(this.options.user.text);
			}
			this.editor.setTextChangeCallback($.proxy(this.delegate.updateCode, this.delegate));
			
			this.animateRobot();
		},

		remove: function() {
			this.animationFinish();
			this.originalRobot.remove();
			this.$submit.remove();
			this.$originalRobotContainer.remove();
			this.ui.removeAll();
		},

		animateRobot: function() {
			this.animationFinish();
			this.originalRobot.playAll();
		},

		submit: function() {
			if (this.error) return;
			this.animationFinish();
			this.animatedPoints.show();

			this.visitedGoals = this.robot.getVisitedGoals();
			var points = this.visitedGoals.length * this.goalReward;

			this.animation = new dares.SegmentedAnimation();
			this.animation.addSegment(1, 500, $.proxy(this.animationGoalStartCallback, this));
			this.animation.addSegment(this.visitedGoals.length+1, 500, $.proxy(this.animationGoalCallback, this));
			if (this.linePenalty > 0) {
				this.updateScoreAndAnimationWithLines(points);
			} else {
				this.updateScore(points);
			}
			this.animation.addSegment(1, 50, $.proxy(this.animationFinish, this));
			this.animation.run();
		},

		animationGoalStartCallback: function(i) {
			if (i === 0 && this.linePenalty > 0) {
				this.animatedPoints.setChanging('numVisitedGoals');
			}
			this.animatedPoints.setValue('numVisitedGoals', 0);
		},

		animationGoalCallback: function(i) {
			if (i < this.visitedGoals.length) {
				this.animatedPoints.setValue('numVisitedGoals', i+1);
				this.originalRobot.highlightVisitedGoal(this.visitedGoals[i]);
			} else {
				this.animatedPoints.endAnimation();
				this.originalRobot.highlightVisitedGoal(null);
			}
		}
	});
};
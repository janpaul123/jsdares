/*jshint node:true jquery:true*/
"use strict";

var robot = require('jsmm-applet').robot;
var clayer = require('jsmm-applet').clayer;

module.exports = function(dares) {
	dares.RobotGoalPoints = function() { return this.init.apply(this, arguments); };
	dares.RobotGoalPoints.prototype = {
		init: function($div, min, total, reward) {
			this.min = min;
			this.total = total;
			this.reward = reward;

			this.$container = $('<div class="dare-points-content dare-points-robotgoal"><div class="dare-points-info"><div class="dare-points-title">Goal squares: <span class="dare-points-robotgoal-goals">0</span></div><div class="dare-points-robotgoal-squares"></div></div><div class="dare-points-points">0</div></div>');
			$div.append(this.$container);

			var $squareContainer = this.$container.find('.dare-points-robotgoal-squares');
			this.$goals = this.$container.find('.dare-points-robotgoal-goals');
			this.$points = this.$container.find('.dare-points-points');

			this.$squares = [];
			for (var i=0; i<min; i++) {
				this.$squares[i] = $('<div class="dare-points-robotgoal-square"></div>');
				$squareContainer.append(this.$squares[i]);
			}

			if (min < total) {
				var $optional = $('<div class="dare-points-robotgoal-optional"></div>');
				$squareContainer.append($optional);

				for (;i<total; i++) {
					this.$squares[i] = $('<div class="dare-points-robotgoal-square"></div>');
					$optional.append(this.$squares[i]);
				}

				$optional.append('<span class="dare-points-robotgoal-optional-text">optional</span>');
			}
		},

		setValue: function(goals) {
			this.$goals.addClass('dare-points-highlight');
			this.$goals.text(goals);

			if (goals > 0) {
				this.$container.addClass('dare-points-robotgoal-active');
				this.$squares[goals-1].addClass('dare-points-robotgoal-square-active dare-points-robotgoal-square-blink');
				//this.$squares[goals-1].text(this.reward);
				if (goals-2 >= 0) {
					this.$squares[goals-2].removeClass('dare-points-robotgoal-square-blink');
				}
			} else {
				this.$container.removeClass('dare-points-robotgoal-active');
				for (var i=0; i<this.$squares.length; i++) {
					this.$squares[i].removeClass('dare-points-robotgoal-square-active dare-points-robotgoal-square-blink');
					//this.$squares[i].text('');
				}
			}

			this.$points.text(this.reward*goals);
			if (goals >= this.min) this.$points.addClass('dare-points-good');
			else this.$points.removeClass('dare-points-good');
		},

		endAnimation: function() {
			this.$goals.removeClass('dare-points-highlight');
			this.$squares[this.$squares.length-1].removeClass('dare-points-robotgoal-square-blink');
		}
	};

	dares.RobotGoalDare = function() { return this.init.apply(this, arguments); };
	dares.RobotGoalDare.prototype = dares.addCommonDareMethods({
		init: function(delegate, ui, options) {
			this.delegate = delegate;
			this.ui = ui;
			this.options = options;
			this.previewBlockSize = options.previewBlockSize || 32;
			this.resultBlockSize = options.resultBlockSize || 48;
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

			this.$points = $('<div class="dare-points"></div>');
			this.$div.append(this.$points);

			this.goalPoints = new dares.RobotGoalPoints(this.$points, this.options.minGoals, this.options.totalGoals, this.options.goalReward);
			if (this.options.maxLines !== undefined) {
				this.linePoints = new dares.LinePoints(this.$points, this.options.maxLines, this.options.lineReward);
			}
			this.highscorePoints = new dares.HighscorePoints(this.$points, this.options.name, this.highscore);

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

			this.visitedGoals = this.robot.getVisitedGoals();
			var points = this.visitedGoals.length * this.options.goalReward;

			this.animation = new dares.SegmentedAnimation();
			this.animation.addSegment(1, 500, $.proxy(this.animationGoalStartCallback, this));
			this.animation.addSegment(this.visitedGoals.length, 500, $.proxy(this.animationGoalCallback, this));
			this.animation.addRemoveSegment(500, $.proxy(this.animationGoalFinishCallback, this));
			if (this.options.maxLines !== undefined) {
				points += this.addLineAnimation();
			}
			
			if (this.visitedGoals.length >= this.options.minGoals && this.hasValidNumberOfLines()) {
				this.updateHighScore(points);
			}

			this.animation.addSegment(1, 50, $.proxy(this.animationFinish, this));
			this.animation.run();
		},

		animationGoalStartCallback: function() {
			this.goalPoints.setValue(0);
		},

		animationGoalCallback: function(i) {
			if (i < this.visitedGoals.length) {
				this.goalPoints.setValue(i+1);
				this.originalRobot.highlightVisitedGoal(this.visitedGoals[i]);
			}
		},

		animationGoalFinishCallback: function() {
			this.goalPoints.endAnimation();
			this.originalRobot.highlightVisitedGoal(null);
		}
	});
};
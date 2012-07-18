/*jshint node:true jquery:true*/
"use strict";

var applet = require('../jsmm-applet');

module.exports = function(dares) {
	dares.RobotGoalPoints = function() { return this.init.apply(this, arguments); };
	dares.RobotGoalPoints.prototype = {
		init: function($div, min, total, reward) {
			this.min = min;
			this.total = total;
			this.reward = reward;

			this.$container = $('<div class="dare-points-content dare-points-robotgoal"><div class="dare-points-info"><div class="dare-points-title">Goal squares: <span class="dare-points-robotgoal-goals">0</span></div><div class="dare-points-robotgoal-squares"></div></div><div class="dare-points-points">0</div></div>');
			$div.prepend(this.$container);

			this.$squareContainer = this.$container.find('.dare-points-robotgoal-squares');
			this.$goals = this.$container.find('.dare-points-robotgoal-goals');
			this.$points = this.$container.find('.dare-points-points');

			this.$squares = [];
			for (var i=0; i<min; i++) {
				this.$squares[i] = $('<div class="dare-points-robotgoal-square"></div>');
				this.$squareContainer.append(this.$squares[i]);
			}

			if (min < total) {
				var $optional = $('<div class="dare-points-robotgoal-optional"></div>');
				this.$squareContainer.append($optional);

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
			this.$squareContainer.find('.dare-points-robotgoal-square-blink').removeClass('dare-points-robotgoal-square-blink');
		}
	};

	dares.RobotGoalDare = function() { return this.init.apply(this, arguments); };
	dares.RobotGoalDare.prototype = dares.addCommonDareMethods({
		init: function(delegate, ui, options) {
			this.initOptions(delegate, ui, options);
			this.previewBlockSize = options.outputs.robot.previewBlockSize || 48;

			this.$div.addClass('dare dare-robotgoal');
			this.robot = this.ui.getOutput('robot');
			
			this.$originalRobotContainer = $('<span class="dare-robotgoal-original-container"></span>');
			this.$originalRobotContainer.on('click', this.animateRobot.bind(this));
			this.$div.append(this.$originalRobotContainer);

			this.$originalRobot = $('<div class="dare-robotgoal-original"></div>');
			this.$originalRobotContainer.append(this.$originalRobot);
			this.$originalRobotContainer.append('<div class="dare-original-refresh"><i class="icon-repeat icon-white"></i></div>');
			
			this.originalRobot = new applet.robot.Robot(this.$originalRobot, true, this.previewBlockSize, this.robot.getState());
			this.originalRobot.insertDelay(30000);

			var simpleRobot = new applet.output.SimpleRobot(this.robot.getState());
			var runner = new applet.jsmm.SimpleRunner({robot: simpleRobot.getAugmentedObject()});
			runner.run(this.options.original);
			simpleRobot.play(this.originalRobot);

			this.appendDescription(this.$div);
			
			this.initPoints();
			this.goalPoints = new dares.RobotGoalPoints(this.$points, this.options.minGoals, this.options.totalGoals, this.options.goalReward);
			this.initEditor();
			this.animateRobot();
		},

		remove: function() {
			this.animationFinish();
			this.originalRobot.remove();
			this.$submit.remove();
			this.$originalRobotContainer.remove();
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
			this.animation.addSegment(1, 200, this.animationGoalStartCallback.bind(this));
			this.animation.addSegment(this.visitedGoals.length, 500, this.animationGoalCallback.bind(this));
			this.animation.addRemoveSegment(500, this.animationGoalFinishCallback.bind(this));

			this.addToAnimation(points, this.visitedGoals.length >= this.options.minGoals);
			this.animation.play();
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
			this.goalPoints.setValue(this.visitedGoals.length);
			this.goalPoints.endAnimation();
			this.originalRobot.highlightVisitedGoal(null);
		}
	});
};
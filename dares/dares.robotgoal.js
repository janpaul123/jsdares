/*jshint node:true jquery:true*/
"use strict";

module.exports = function(dares) {
	var robot = require('../robot');

	dares.RobotGoalDare = function() { return this.init.apply(this, arguments); };
	dares.RobotGoalDare.prototype = dares.addCommonDareMethods({
		init: function(options, ui) {
			this.loadOptions(options, ui);
			this.outputs = ['robot'];
			this.state = options.state;
			this.original = options.original;
			this.previewBlockSize = options.previewBlockSize || 32;
			this.resultBlockSize = options.resultBlockSize || 48;
			this.goalReward = options.goalReward || 20;
			this.linePenalty = options.linePenalty || 3;
			this.maxLines = options.maxLines || 10;
			this.threshold = options.threshold || options.numGoals*this.goalReward - this.linePenalty*this.maxLines;
			this.previewRobot = null;
			this.animation = null;
		},

		setPreview: function($preview) {
			this.removePreview();

			var $robot = $('<div class="dares-robotgoal-robot"></div>');
			var $container = $('<div class="dares-table-preview-robot-container"></div>');
			$container.append($robot);
			$preview.html($container);

			$preview.append(this.description);
			$preview.append('<div class="dares-table-preview-points-container"><span class="dares-table-preview-points">var points = numVisitedGoals - ' + this.linePenalty + '*numLines;</span></div>');
			$preview.append(this.makePreviewButton());

			this.previewRobot = new robot.Robot($robot, true, this.previewBlockSize);
			this.previewRobot.setState(this.state);
			this.previewRobot.clear();
			this.previewRobot.insertDelay(100000);
			this.original(this.previewRobot);
			this.previewRobot.playAll();
		},

		removePreview: function() {
			if (this.previewRobot !== null) {
				this.previewRobot.remove();
			}
		},

		makeActive: function($div, ui) {
			this.loadEditor(ui);

			this.$div = $div;
			$div.addClass('dare dare-robotgoal');
			this.robot = this.ui.addRobot(true);
			this.robot.setState(this.state);
			
			this.$originalRobotContainer = $('<span class="dare-robotgoal-original-container"></span>');
			this.$originalRobotContainer.on('click', $.proxy(this.animateRobot, this));
			this.$div.append(this.$originalRobotContainer);

			this.$originalRobot = $('<div class="dare-robotgoal-original"></div>');
			this.$originalRobotContainer.append(this.$originalRobot);
			this.$originalRobotContainer.append('<div class="dare-robotgoal-original-refresh"><i class="icon-repeat icon-white"></i></div>');

			this.$description = $('<div class="dare-description"></div>');
			this.$div.append(this.$description);
			this.$description.append('<h2>' + this.name + '</h2><div class="dare-text">' + this.description + '</div>');

			this.$submit = $('<div class="btn btn-success">Submit</div>');
			this.$submit.on('click', $.proxy(this.submit, this));
			this.$description.append(this.$submit);

			this.originalRobot = new robot.Robot(this.$originalRobot, true, this.resultBlockSize);
			this.originalRobot.setState(this.state);
			this.originalRobot.clear();
			this.originalRobot.insertDelay(30000);
			this.original(this.originalRobot);

			var $points = $('<div></div>');
			this.$div.append($points);
			this.animatedPoints = new dares.AnimatedPoints($points);
			this.animatedPoints.addFactor('numVisitedGoals', this.goalReward);
			this.animatedPoints.addFactor('numLines', -this.linePenalty);
			this.animatedPoints.setThreshold(this.threshold);
			this.animatedPoints.finish();

			this.$score = $('<div class="dare-score"></div>');
			this.$div.append(this.$score);
			this.drawScore();

			this.editor.addOutput(this);
			this.editor.outputRequestsRerun();
			this.animateRobot();
		},

		remove: function() {
			this.animationFinish();
			this.editor.removeOutput(this);
			this.originalRobot.remove();
			this.$submit.remove();
			this.$originalRobotContainer.remove();
			this.$div.html('');
			this.$div.removeClass('dare dare-robotgoal');
		},

		animateRobot: function() {
			this.animationFinish();
			this.originalRobot.playAll();
		},

		submit: function() {
			if (this.error) return;
			this.animationFinish();
			this.animatedPoints.show();

			var points = this.robot.getNumberOfVisitedGoals() * this.goalReward;

			this.animation = new dares.SegmentedAnimation();
			this.animation.addSegment(this.robot.getNumberOfVisitedGoals()+1, 50, $.proxy(this.animationGoalCallback, this));
			this.updateScoreAndAnimationWithLines(points);
			this.animation.addSegment(1, 50, $.proxy(this.animationFinish, this));
			this.animation.run();
		},

		animationGoalCallback: function(i) {
			if (i === 0) {
				this.animatedPoints.setChanging('numVisitedGoals');
			}
			this.animatedPoints.setValue('numVisitedGoals', i);
		}
	});
};
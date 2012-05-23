/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.RobotAnimationManager = function() { return this.init.apply(this, arguments); };
	output.RobotAnimationManager.prototype = {
		init: function($robot, blockSize) {
			this.$robot = $robot;
			this.$robot.hide();
			this.blockSize = blockSize;
			this.runningAnimation = null;
			this.insertingAnimation = null;
		},

		newAnimation: function() {
			this.insertingAnimation = new output.RobotAnimation(this.$robot, this.blockSize);
			return this.insertingAnimation;
		},
		
		playAll: function() {
			this.execFunc('playAll');
		},

		playLast: function() {
			this.execFunc('playLast');
		},

		remove: function() {
			if (this.runningAnimation !== null) {
				this.runningAnimation.remove();
				this.runningAnimation = null;
			}
			if (this.insertingAnimation !== null) {
				this.insertingAnimation.remove();
				this.insertingAnimation = null;
			}
		},

		/// INTERNAL FUNCTIONS ///
		execFunc: function(name) {
			if (this.runningAnimation === null && this.insertingAnimation === null) {
				// nothing
			} else if (this.runningAnimation === null && this.insertingAnimation !== null) {
				this.runningAnimation = this.insertingAnimation;
				this.runningAnimation[name]();
			} else if (this.runningAnimation !== null && this.insertingAnimation === null) {
				this.runningAnimation[name]();
			} else if (this.insertingAnimation.animationString !== this.runningAnimation.animationString) {
				this.runningAnimation.remove();
				this.runningAnimation = this.insertingAnimation;
				this.runningAnimation[name]();
			}
			this.insertingAnimation = null;
		}
	};
};
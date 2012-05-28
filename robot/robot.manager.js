/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.RobotAnimationManager = function() { return this.init.apply(this, arguments); };
	output.RobotAnimationManager.prototype = {
		init: function($robot, $maze, blockSize) {
			this.$robot = $robot;
			this.$robot.hide();
			this.$maze = $maze;
			this.blockSize = blockSize;
			this.runningAnimation = null;
			this.insertingAnimation = null;
		},

		newAnimation: function() {
			this.insertingAnimation = new output.RobotAnimation(this.$robot, this.$maze, this.blockSize);
			return this.insertingAnimation;
		},
		
		playAll: function() {
			this.execFunc('playAll');
		},

		playNone: function() {
			this.execFunc('playNone');
		},

		playAnimNum: function(num) {
			this.execFunc('playAnimNum', num);
		},

		setAnimNumEnd: function(num) {
			this.execFunc('setAnimNumEnd', num);
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
		execFunc: function(name, arg) {
			if (this.runningAnimation === null && this.insertingAnimation === null) {
				// nothing
			} else if (this.runningAnimation === null && this.insertingAnimation !== null) {
				this.runningAnimation = this.insertingAnimation;
				this.runningAnimation[name](arg);
			} else if (this.runningAnimation !== null && this.insertingAnimation === null) {
				this.runningAnimation[name](arg);
			} else if (this.insertingAnimation.animationString !== this.runningAnimation.animationString) {
				this.runningAnimation.remove();
				this.runningAnimation = this.insertingAnimation;
				this.runningAnimation[name](arg);
			}
			this.insertingAnimation = null;
		}
	};
};
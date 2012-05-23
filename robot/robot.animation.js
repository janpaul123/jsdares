/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	var clayer = require('../clayer');

	output.RobotAnimation = function() { return this.init.apply(this, arguments); };
	output.RobotAnimation.prototype = {
		init: function($robot, blockSize) {
			this.$robot = $robot;
			this.blockSize = blockSize;
			
			this.rotationFactor = 0.6;
			this.detectWallLength = 40000;
			this.animationQueue = [];
			this.animationLength = 0;
			this.duration = 0.006;
			this.animateTimeout = null;
			this.currentAnimation = null;
			this.lastNumber = 0;
			this.animationString = '';
		},

		add: function(anim) {
			if (anim.type === 'movement') {
				var dx = (anim.x2-anim.x)*this.blockSize, dy = (anim.y2-anim.y)*this.blockSize;
				anim.length = Math.sqrt(dx*dx + dy*dy);
				if (anim.length <= 0) return;
				this.animationLength += anim.length;
			} else if (anim.type === 'rotation') {
				anim.length = Math.abs(anim.angle2-anim.angle);
				if (anim.length <= 0) return;
				this.animationLength += anim.length*this.rotationFactor;
			} else { // anim.type === 'wall'
				this.animationLength += this.detectWallLength;
			}
			this.animationQueue.push(anim);
			this.animationString += anim.type + ',' + anim.x + ',' + anim.y + ',' + anim.x2 + ',' + anim.y2 + ',' + anim.angle + ',' + anim.angle2 + ',';
		},

		playAnimation: function(number) {
			this.$robot.show();
			clayer.setCss3(this.$robot, 'transition', '');
			this.$robot.off('transitionend webkitTransitionEnd MSTransitionEnd oTransitionEnd');

			var animation = this.animationQueue[number];
			this.number = number;
			this.setPosition(animation.x, animation.y);
			this.setOrientation(animation.angle);
			this.setLight('default');

			if (this.animateTimeout !== null) {
				clearTimeout(this.animateTimeout);
			}

			if (animation.type === 'wall') {
				this.setLight(animation.wall ? 'red' : 'green');
				this.animateTimeout = setTimeout($.proxy(this.animationEnd, this), this.duration*this.detectWallLength);
			} else {
				this.animateTimeout = setTimeout($.proxy(this.animationStart, this), 0);
			}
		},

		playAll: function() {
			if (this.animationQueue.length > 0) {
				this.lastNumber = this.animationQueue.length-1;
				this.playAnimation(0);
			}
		},

		playLast: function() {
			if (this.animationQueue.length > 0) {
				this.lastNumber = this.animationQueue.length-1;
				this.playAnimation(this.lastNumber);
			}
		},

		remove: function() {
			if (this.animateTimeout !== null) {
				clearTimeout(this.animateTimeout);
			}
			this.$robot.off('transitionend webkitTransitionEnd MSTransitionEnd oTransitionEnd');
			this.$robot.hide();
		},

		/// INTERNAL FUNCTIONS ///
		animationStart: function() {
			this.animateTimeout = null;
			this.$robot.on('transitionend webkitTransitionEnd MSTransitionEnd oTransitionEnd', $.proxy(this.animationEnd, this));
			var animation = this.animationQueue[this.number];
			var duration = this.duration*animation.length;

			if (animation.type === 'movement') {
				clayer.setCss3(this.$robot, 'transition', 'left ' + duration + 's ease-in-out, top ' + duration + 's ease-in-out');
				this.setPosition(animation.x2, animation.y2);
			} else if (animation.type === 'rotation') {
				duration = this.rotationFactor*duration;
				clayer.setCss3(this.$robot, 'transition', 'transform ' + duration + 's linear', true);
				this.setOrientation(animation.angle2);
			}
		},

		animationEnd: function() {
			this.animateTimeout = null;
			if (this.number < this.lastNumber) {
				this.playAnimation(this.number+1);
			}
		},

		setPosition: function(x, y) {
			this.$robot.css('left', x*this.blockSize);
			this.$robot.css('top', y*this.blockSize);
		},

		setOrientation: function(angle) {
			clayer.setCss3(this.$robot, 'transform', 'rotate(' + (90-angle) + 'deg)');
		},

		setLight: function(state) {
			this.$robot.removeClass('robot-green robot-red');
			if (state === 'red') {
				this.$robot.addClass('robot-red');
			} else if (state === 'green') {
				this.$robot.addClass('robot-green');
			}
		}
	};
};
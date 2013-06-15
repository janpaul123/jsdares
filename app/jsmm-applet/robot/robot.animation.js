/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	var clayer = require('../clayer');

	output.RobotAnimation = function() { return this.init.apply(this, arguments); };
	output.RobotAnimation.prototype = {
		init: function($robot, $maze, blockSize) {
			this.$robot = $robot;
			this.$maze = $maze;
			this.blockSize = blockSize;

			this.scale = blockSize/64+0.01;
			if (this.blockSize !== 64) {
				clayer.setCss3(this.$robot, 'transform', 'scale(' + this.scale + ')');
			}

			this.rotationFactor = 0.75;
			this.detectWallLength = 40000;
			this.animationQueue = [];
			this.duration = 0.006;
			this.animateTimeout = null;
			this.blinkTimeouts = [];
			this.currentAnimation = null;
			this.lastNumber = 0;
			this.animationString = '';
			this.playing = false;
		},

		add: function(anim) {
			if (anim.type === 'movement') {
				var dx = (anim.x2-anim.x)*this.blockSize, dy = (anim.y2-anim.y)*this.blockSize;
				anim.length = Math.sqrt(dx*dx + dy*dy);
				if (anim.length <= 0) return;
			} else if (anim.type === 'rotation') {
				anim.length = Math.abs(anim.angle2-anim.angle);
				if (anim.length <= 0) return;
			}
			this.animationQueue.push(anim);
			this.addAnimationString(anim);
		},

		playAnimation: function(number) {
			this.playing = true;
			this.clearTimeout();
			this.number = number;
			var animation = this.animationQueue[this.number];
			this.setInitial(animation);

			if (animation.type === 'wall') {
				this.setLight(animation.wall ? 'red' : 'green');
				this.animateTimeout = setTimeout(_(this.animationEnd).bind(this), this.duration*this.detectWallLength);
			} else if (animation.type === 'delay') {
				this.animateTimeout = setTimeout(_(this.animationEnd).bind(this), this.duration*animation.length);
			} else {
				this.animateTimeout = _.defer(_(this.animationStart).bind(this));
			}
		},

		play: function(start, end) {
			if (start >= 0 && this.animationQueue.length > 0) {
				if (end > start) {
					this.lastNumber = end;
					this.playAnimation(start);
				} else {
					this.playing = false;
					if (start < this.animationQueue.length) {
						this.setInitial(this.animationQueue[start]);
					} else {
						var animation = this.animationQueue[this.animationQueue.length-1];
						this.resetRobot();
						this.setPosition(animation.x2 || animation.x, animation.y2 || animation.y, animation.angle2 || animation.angle);
						this.setLight('default');
					}
					this.clearTimeout();
				}
			} else {
				this.playing = false;
				this.clearTimeout();
				this.resetRobot();
				this.$robot.hide();
			}
		},

		stop: function() {
			this.clearTimeout();
			this.resetRobot();
			this.$robot.hide();
		},

		getLength: function() {
			return this.animationQueue.length;
		},

		remove: function() {
			this.clearTimeout();
			this.resetRobot();
			this.$robot.hide();
		},

		removeFromAnimNum: function(animNum) {
			this.clearTimeout();
			this.animationQueue = this.animationQueue.slice(0, animNum);
			this.animationString = '';
			for (var i=0; i<this.animationQueue.length; i++) {
				this.addAnimationString(this.animationQueue[i]);
			}
		},

		/// INTERNAL FUNCTIONS ///
		addAnimationString: function(anim) {
			if (anim.goals) {
				for (var i=0; i<anim.goals.length; i++) {
					this.animationString += 'G' + anim.goals[i].x + '/' + anim.goals[i].y + '/' + anim.goals[i].amount + ',';
				}
			}
			this.animationString += anim.type + ',' + anim.x + ',' + anim.y + ',' + anim.x2 + ',' + anim.y2 + ',' + anim.angle + ',' + anim.angle2 + ',';
		},

		resetRobot: function() {
			this.$robot.show();
			clayer.setCss3(this.$robot, 'transition', '');
			this.$robot.off('transitionend webkitTransitionEnd MSTransitionEnd oTransitionEnd');
			this.$maze.children('.robot-maze-block-goal-blink').removeClass('robot-maze-block-goal-blink');
			for (var i=0; i<this.blinkTimeouts.length; i++) {
				clearTimeout(this.blinkTimeouts[i]);
			}
		},

		setInitial: function(animation) {
			this.resetRobot();
			this.setPosition(animation.x, animation.y, animation.angle);
			this.setLight('default');
		},

		animationStart: function() {
			this.animateTimeout = null;
			var animation = this.animationQueue[this.number];
			var duration = (this.duration*animation.length).toFixed(5);
			//this.$robot.on('transitionend webkitTransitionEnd MSTransitionEnd oTransitionEnd', _(this.animationEnd).bind(this));
			this.animateTimeout = window.setTimeout(_(this.animationEnd).bind(this), duration*1000);

			if (animation.type === 'movement') {
				clayer.setCss3(this.$robot, 'transition', 'transform ' + duration + 's linear', true);
				this.setPosition(animation.x2, animation.y2, animation.angle);

				if (animation.goals !== null) {
					for (var i=0; i<animation.goals.length; i++) {
						this.setBlinkAnim(animation.goals[i].$block, animation.goals[i].amount);
					}
				}
			} else if (animation.type === 'rotation') {
				duration = this.rotationFactor*duration;
				clayer.setCss3(this.$robot, 'transition', 'transform ' + duration + 's linear', true);
				this.setPosition(animation.x, animation.y, animation.angle2);
			}
		},

		setBlinkAnim: function($block, amount) {
			this.blinkTimeouts.push(setTimeout(function() {
				$block.addClass('robot-maze-block-goal-blink');
			}, (amount-0.5)*this.blockSize*this.duration*1000));
			this.blinkTimeouts.push(setTimeout(function() {
				$block.removeClass('robot-maze-block-goal-blink');
			}, (amount+0.5)*this.blockSize*this.duration*1000));
		},

		animationEnd: function() {
			//this.clearTimeout();
			this.animateTimeout = null;
			this.setLight('default');

			if (this.number+1 < this.lastNumber && this.number < this.animationQueue.length-1) {
				this.playAnimation(this.number+1);
			} else {
				this.playing = false;
			}
		},

		setPosition: function(x, y, angle) {
			x = Math.round(x*this.blockSize + this.blockSize/2);
			y = Math.round(y*this.blockSize + this.blockSize/2);
      var str = 'translate3d(' + x + 'px, ' + y + 'px, 0) rotate(' + Math.round(90-angle) + 'deg)';
      if (this.blockSize !== 64) str += ' scale(' + this.scale + ')';
			clayer.setCss3(this.$robot, 'transform', str);
    },

		setLight: function(state) {
			this.$robot.removeClass('robot-green robot-red');
			if (state === 'red') {
				this.$robot.addClass('robot-red');
			} else if (state === 'green') {
				this.$robot.addClass('robot-green');
			}
		},

		clearTimeout: function() {
			if (this.animateTimeout !== null) {
				clearTimeout(this.animateTimeout);
				this.animateTimeout = null;
			}
		}
	};
};

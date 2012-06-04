/*jshint node:true jquery:true */
/*global Modernizr:false */
"use strict";

var clayer = {};
clayer.setCss3 = function($element, name, value, addBrowserToValue) {
	addBrowserToValue = addBrowserToValue || false;
	var browsers = ['', '-ms-', '-moz-', '-webkit-', '-o-'];
	for (var i=0; i<browsers.length; i++) {
		var cssName = browsers[i] + name;
		var cssValue = (addBrowserToValue ? browsers[i] : '') + value;
		$element.css(cssName, cssValue);
	}
};

/*
clayer.properties = {};
var ua = navigator.userAgent.toLowerCase();
clayer.properties.isWebKit = !!ua.match(/applewebkit/);
clayer.properties.isTouch = !!(ua.match(/ipad/) || ua.match(/iphone/) || ua.match(/ipod/) || ua.match(/android/));
clayer.properties.isHoverAvailable = !clayer.properties.isTouch;

clayer.properties.useTransitions = Modernizr.csstransitions;
clayer.properties.useTransforms = Modernizr.csstransforms;
clayer.properties.useTransforms3D = Modernizr.csstransforms3d;

clayer.properties.defaultMoveAnimationDuration = 0;
clayer.properties.defaultFadeAnimationDuration = 150;

clayer.Layer = function() { return this.init.apply(this, arguments); };
clayer.Layer.prototype = {
	init: function($element) {
		this.$element = $element;
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.opacity = 1;
		this.hidden = false;
		this.timeout = null;
		
		this.offsetX = 0;
		this.offsetY = 0;
		
		this.accelerated = true;
		this.moveAnimationDuration = clayer.properties.defaultMoveAnimationDuration;
		this.fadeAnimationDuration = clayer.properties.defaultFadeAnimationDuration;
	
		if (clayer.properties.useTransitions) {
			if (clayer.properties.useTransforms && this.accelerated) {
				this.$element.css(Modernizr.prefixed('TransitionProperty'), 'transform, width, height, opacity');
			} else {
				this.$element.css(Modernizr.prefixed('TransitionProperty'), 'left, top, width, height, opacity');
			}
			this.$element.css(Modernizr.prefixed('TransitionDuration'), '0s');
			this.$element.css(Modernizr.prefixed('TransitionTimingFunction'), 'ease-in-out');
		}
	},
	setX: function(x, animate) {
		this.setPosition(x, this.y, animate);
	},
	setY: function(y, animate) {
		this.setPosition(this.x, y, animate);
	},
	setPosition: function(x, y, animate) {
		if (this.x === x && this.y === y) return;
		this.x = x;
		this.y = y;
		this.updateElementPosition(animate);
	},
	setOffset: function(x, y, animate) {
		if (this.offsetX === x && this.offsetY === y) return;
		this.offsetX = x;
		this.offsetY = y;
		this.updateElementPosition(animate);
	},
	setWidth: function(width, animate) {
		if (this.width === width) return;
		this.width = width;
		this.setAnimatableProperty('width', width, 'px', animate ? this.moveAnimationDuration : 0);
	},
	setHeight: function(height, animate) {
		if (this.height === height) return;
		this.height = height;
		this.setAnimatableProperty('height', height, 'px', animate ? this.moveAnimationDuration : 0);
	},
	setOpacity: function(opacity, animate) {
		if (this.opacity === opacity) return;
		this.opacity = opacity;
		this.setAnimatableProperty('opacity', opacity, '', animate ? this.fadeAnimationDuration : 0);
	},
	show: function(animate) {
		if (!this.hidden) return;
		this.hidden = false;
		if (this.timeout !== null) {
			window.clearTimeout(this.timeout);
			this.timeout = null;
		}
		this.setAnimatableProperty('opacity', 0, '', 0);
		this.$element.css('display', 'block');
		this.setOpacity(this.opacity, animate);
	},
	hide: function(animate) {
		if (this.hidden) return;
		this.hidden = true;
		if (this.timeout !== null) {
			window.clearTimeout(this.timeout);
			this.timeout = null;
		}
		this.setAnimatableProperty('opacity', 0, '', animate ? this.fadeAnimationDuration : 0);
		var that = this;
		this.timeout = window.setTimeout(function() {
			that.$element.css('display', 'none');
			that.timeout = null;
		}, animate ? this.fadeAnimationDuration : 0);
	},
	toggle: function() {
		if (this.hidden) this.show();
		else this.hide();
	},
	setAccelerated: function(value) {
		this.accelerated = value;
	},
	setAnimationDuration: function(move, fade) {
		this.moveAnimationDuration = move;
		this.fadeAnimationDuration = fade;
	},
	remove: function() {
		this.$element.remove();
	},
	/// INTERNAL FUNCTIONS ///
	updateElementPosition: function (animate) {
		animate = animate || false;
		var x = this.x+this.offsetX, y = this.y+this.offsetY;

		if (clayer.properties.useTransitions && clayer.properties.useTransforms && this.accelerated) {
			if (animate && this.moveAnimationDuration > 0) {
				this.$element.css(Modernizr.prefixed('TransitionDuration'), '' + (0.001 * this.moveAnimationDuration) + 's');
			}

			var translation = clayer.properties.useTransforms3D ?
				'translate3d(' + x + 'px,' + y + 'px, 0) ' :
				'translate('   + x + 'px,' + y + 'px) ';

			this.$element.css(Modernizr.prefixed('Transform'), translation);
		} else {
			this.setAnimatableProperty('left', x, 'px', animate ? this.moveAnimationDuration : 0);
			this.setAnimatableProperty('top', y, 'px', animate ? this.moveAnimationDuration : 0);
		}
	},
	setAnimatableProperty: function (name, value, suffix, animationDuration) {
		suffix = suffix || '';
		animationDuration = animationDuration || 0;
		if (animationDuration > 0) {
			if (clayer.properties.useTransitions) {
				this.$element.css(Modernizr.prefixed('TransitionDuration'), '' + (0.001 * animationDuration) + 's');
				this.$element.css(name, '' + value + suffix);
			} else {
				this.$element.animate({name: '' + value + suffix}, animationDuration);
			}
		} else {
			this.$element.css(name, '' + value + suffix);
		}
	}
};
*/

clayer.Touchable = function() { return this.init.apply(this, arguments); };
clayer.Touchable.prototype = {
	init: function($element, delegate) {
		this.$element = $element;
		this.$document = $($element[0].ownerDocument);
		this.delegate = delegate;

		this.mouseDown = $.proxy(this.mouseDownHandler, this);
		this.mouseMove = $.proxy(this.mouseMoveHandler, this);
		this.mouseUp = $.proxy(this.mouseUpHandler, this);
		this.touchStart = $.proxy(this.touchStartHandler, this);
		this.touchMove = $.proxy(this.touchMoveHandler, this);
		this.touchEnd = $.proxy(this.touchEndHandler, this);

		this.documentEvents = {
			mousemove: this.mouseMove,
			mouseup: this.mouseUp,
			touchmove: this.touchMove,
			touchend: this.touchEnd,
			touchcancel: this.touchEnd
		};

		this.setTouchable(true);
	},

	setTouchable: function(isTouchable) {
		if (this.isTouchable === isTouchable) return;
		this.isTouchable = isTouchable;

		if (isTouchable) {
			this.$element.on({
				mousedown: this.mouseDown,
				touchstart: this.touchStart
			});
		}
		else {
			this.$element.off('mousedown touchstart');
			this.$document.off(this.documentEvents);
		}
	},

	mouseDownHandler: function(event) {
		if (this.isTouchable) {
			this.$document.on({
				mousemove: this.mouseMove,
				mouseup: this.mouseUp
			});
			
			this.touch = new clayer.Touch(this.$element, event);
			this.delegate.touchDown(this.touch);
		}
		return false;
	},

	mouseMoveHandler: function(event) {
		if (this.isTouchable && this.touch) {
			this.touch.touchMove(event);
			this.delegate.touchMove(this.touch);
		}
		return false;
	},

	mouseUpHandler: function(event) {
		if (this.isTouchable && this.touch) {
			this.touch.touchUp(event);
			this.delegate.touchUp(this.touch);
			
			delete this.touch;
		}
		this.$document.off(this.documentEvents);
		return false;
	},

	touchStartHandler: function(event) {
		if (!this.isTouchable || this.touch || event.originalEvent.touches.length > 1) {
			// only single touch for now
			this.touchEnd(event);
		} else {
			this.$document.on({
				touchmove: this.touchMove,
				touchend: this.touchEnd,
				touchcancel: this.touchEnd
			});
		
			this.touch = new clayer.Touch(this.$element, event.originalEvent.touches[0]);
			this.touchDown(this.touch);
		}
		return false;
	},

	touchMoveHandler: function(event) {
		if (this.isTouchable && this.touch) {
			this.touch.touchMove(event.originalEvent.touches[0]);
			this.delegate.touchMove(this.touch);
		}
		return false;
	},

	touchEndHandler: function(event) {
		if (this.isTouchable && this.touch) {
			this.touch.touchUp(event.originalEvent.touches[0]);
			this.delegate.touchUp(this.touch);
			
			delete this.touch;
		}
		this.$document.off(this.documentEvents);
		return false;
	}
};

clayer.Touch = function() { return this.init.apply(this, arguments); };
clayer.Touch.prototype = {
	init: function($element, event) {
		this.$element = $element;
		this.globalPoint = { x: event.pageX, y: event.pageY };
		this.translation = { x:0, y:0 };
		this.deltaTranslation = { x:0, y:0 };
		this.localPoint = { x:0, y:0 };
		this.updateLocalPoint();

		this.event = event;
		this.timestamp = event.timeStamp;
		this.downTimestamp = this.timestamp;
		this.hasMoved = false;
		this.wasTap = false;
	},

	touchMove: function(event) {
		this.event = event;
		this.timestamp = event.timeStamp;
		this.updatePositions();
	},

	touchUp: function(event) {
		this.event = event;
		this.timestamp = event.timeStamp;
		this.wasTap = !this.hasMoved && (this.getTimeSinceGoingDown() < 300);
	},

	getTimeSinceGoingDown: function () {
		return this.timestamp - this.downTimestamp;
	},

	resetDeltaTranslation: function() {
		this.deltaTranslation.x = 0;
		this.deltaTranslation.y = 0;
	},

	updatePositions: function() {
		var dx = this.event.pageX - this.globalPoint.x;
		var dy = this.event.pageY - this.globalPoint.y;
		this.translation.x += dx;
		this.translation.y += dy;
		this.deltaTranslation.x += dx;
		this.deltaTranslation.y += dy;
		this.globalPoint.x = this.event.pageX;
		this.globalPoint.y = this.event.pageY;
		this.updateLocalPoint();

		if (Math.abs(this.translation.x) > 10 || Math.abs(this.translation.y) > 10) this.hasMoved = true;
	},

	updateLocalPoint: function() {
		var offset = this.$element.offset();
		this.localPoint.x = this.globalPoint.x - offset.left;
		this.localPoint.y = this.globalPoint.y - offset.left;
	}
};

clayer.Slider = function() { return this.init.apply(this, arguments); };
clayer.Slider.prototype = {
	init: function($element, delegate, valueWidth) {
		this.$element = $element;
		this.$element.addClass('clayer-slider');
		this.delegate = delegate;

		this.valueWidth = valueWidth || 1;
		this.markerValue = 0;
		this.knobValue = 0;

		this.$container = $('<div class="clayer-slider-container"></div>');
		this.$element.append(this.$container);

		this.$bar = $('<div class="clayer-slider-bar"></div>');
		this.$container.append(this.$bar);

		this.$marker = $('<div class="clayer-slider-marker"></div>');
		this.markerWidth = Math.min(this.valueWidth, 10);
		this.$marker.width(this.markerWidth);
		this.$bar.append(this.$marker);

		this.$knob = $('<div class="clayer-slider-knob"></div>');
		this.$container.append(this.$knob);

		this.$element.on('mousemove', $.proxy(this.mouseMove, this));
		this.$element.on('mouseleave', $.proxy(this.mouseLeave, this));
		this.touchable = new clayer.Touchable(this.$element, this);

		this.bounceTimer = null;

		this.renderKnob();
		this.renderMarker();
	},

	remove: function() {
		this.touchable.setTouchable(false);
		this.$element.off('mousemove mouseleave');
		this.$marker.remove();
		this.$knob.remove();
		this.$bar.remove();
		this.$container.remove();
	},

	setValue: function(value) {
		this.markerValue = this.knobValue = value;
		this.renderKnob();
		this.renderMarker();
	},

	changed: function() {
		this.delegate.sliderChanged(this.knobValue);
	},

	updateKnob: function(x) {
		x = Math.max(0, Math.min(this.$element.width()-1, x));
		var knobValue = Math.floor(x/this.valueWidth);
		if (this.knobValue !== knobValue) {
				this.knobValue = knobValue;
				this.renderKnob();
				this.changed();
		}
	},

	updateMarker: function(x) {
		x = Math.max(0, Math.min(this.$element.width()-1, x));
		var markerValue = Math.floor(x/this.valueWidth);
		if (this.markerValue !== markerValue) {
			this.knobValue = this.markerValue = markerValue;
			this.renderKnob();
			this.renderMarker();
			this.changed();
		}
	},

	renderKnob: function() {
		this.$knob.css('left', (this.knobValue+0.5)*this.valueWidth);

		if (this.bounceTimer !== null) {
			this.bounceProgress = Math.min(this.bounceProgress + 0.04, 1);
			var p = this.bounceProgress;
			var jumpY = (p < 0.5) ? (15*(1-Math.pow(4*p-1, 2))) : (4*(1-Math.pow(4*(p-0.5)-1, 2)));
			this.$knob.css('top', -jumpY);
			if (this.bounceProgress >= 1) {
				clearInterval(this.bounceTimer);
				this.bounceTimer = null;
			}
		}
	},

	renderMarker: function() {
		this.$marker.css('left', (this.markerValue+0.5)*this.valueWidth - this.markerWidth/2);
	},

	mouseMove: function(event) {
		this.updateKnob(event.pageX - this.$element.offset().left);
	},

	mouseLeave: function(event) {
		this.updateKnob(this.markerValue*this.valueWidth);
	},

	touchDown: function(touch) {
		this.updateMarker(touch.localPoint.x);
	},

	touchMove: function(touch) {
		this.updateMarker(touch.localPoint.x);
	},

	touchUp: function(touch) {
		this.updateMarker(touch.localPoint.x);
		if (touch.wasTap) {
			this.bounce();
		}
	},

	bounce: function () {
		if (this.bounceTimer === null) {
			this.bounceTimer = setInterval($.proxy(this.renderKnob, this), 20);
			this.bounceProgress = 0;
		}
	}
};

module.exports = clayer;

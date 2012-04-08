/*jshint node:true jquery:true*/
"use strict";

var clayer = {};

clayer.Touchable = function() { return this.init.apply(this, arguments); };
clayer.Touch = function() { return this.init.apply(this, arguments); };

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
		}
	},

	mouseDownHandler: function(event) {
		this.$document.on({
			mousemove: this.mouseMove,
			mouseup: this.mouseUp
		});
		
		this.touch = new clayer.Touch(this.$element, event);
		this.delegate.touchDown(this.touch);
		return false;
	},

	mouseMoveHandler: function(event) {
		this.touch.touchMove(event);
		this.delegate.touchMove(this.touch);
		return false;
	},

	mouseUpHandler: function(event) {
		this.touch.touchUp(event);
		this.delegate.touchUp(this.touch);
		
		delete this.touch;
		this.$document.off('mousemove mouseup');
		return false;
	},

	touchStartHandler: function(event) {
		if (this.touch || event.originalEvent.touches.length > 1) {
			// only-single touch for now
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
		if (this.touch) {
			this.touch.touchMove(event.originalEvent.touches[0]);
			this.delegate.touchMove(this.touch);
		}
		return false;
	},

	touchEndHandler: function(event) {
		if (this.touch) {
			this.touch.touchUp(event.originalEvent.touches[0]);
			this.delegate.touchUp(this.touch);
			
			delete this.touch;
			this.$document.removeEvents('touchmove touchend touchcancel');
		}
		return false;
	}
};

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

module.exports = clayer;

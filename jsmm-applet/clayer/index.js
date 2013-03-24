/*jshint node:true jquery:true */
/*global Modernizr:false */
"use strict";

var clayer = {};

/*
clayer.Color = function() { return this.init.apply(this, arguments); };
clayer.Color.prototype = {
	names: {aliceblue: "f0f8ff", antiquewhite: "faebd7", aqua: "0ff", aquamarine: "7fffd4", azure: "f0ffff", beige: "f5f5dc", bisque: "ffe4c4", black: "000", blanchedalmond: "ffebcd", blue: "00f", blueviolet: "8a2be2", brown: "a52a2a", burlywood: "deb887", burntsienna: "ea7e5d", cadetblue: "5f9ea0", chartreuse: "7fff00", chocolate: "d2691e", coral: "ff7f50", cornflowerblue: "6495ed", cornsilk: "fff8dc", crimson: "dc143c", cyan: "0ff", darkblue: "00008b", darkcyan: "008b8b", darkgoldenrod: "b8860b", darkgray: "a9a9a9", darkgreen: "006400", darkgrey: "a9a9a9", darkkhaki: "bdb76b", darkmagenta: "8b008b", darkolivegreen: "556b2f", darkorange: "ff8c00", darkorchid: "9932cc", darkred: "8b0000", darksalmon: "e9967a", darkseagreen: "8fbc8f", darkslateblue: "483d8b", darkslategray: "2f4f4f", darkslategrey: "2f4f4f", darkturquoise: "00ced1", darkviolet: "9400d3", deeppink: "ff1493", deepskyblue: "00bfff", dimgray: "696969", dimgrey: "696969", dodgerblue: "1e90ff", firebrick: "b22222", floralwhite: "fffaf0", forestgreen: "228b22", fuchsia: "f0f", gainsboro: "dcdcdc", ghostwhite: "f8f8ff", gold: "ffd700", goldenrod: "daa520", gray: "808080", green: "008000", greenyellow: "adff2f", grey: "808080", honeydew: "f0fff0", hotpink: "ff69b4", indianred: "cd5c5c", indigo: "4b0082", ivory: "fffff0", khaki: "f0e68c", lavender: "e6e6fa", lavenderblush: "fff0f5", lawngreen: "7cfc00", lemonchiffon: "fffacd", lightblue: "add8e6", lightcoral: "f08080", lightcyan: "e0ffff", lightgoldenrodyellow: "fafad2", lightgray: "d3d3d3", lightgreen: "90ee90", lightgrey: "d3d3d3", lightpink: "ffb6c1", lightsalmon: "ffa07a", lightseagreen: "20b2aa", lightskyblue: "87cefa", lightslategray: "789", lightslategrey: "789", lightsteelblue: "b0c4de", lightyellow: "ffffe0", lime: "0f0", limegreen: "32cd32", linen: "faf0e6", magenta: "f0f", maroon: "800000", mediumaquamarine: "66cdaa", mediumblue: "0000cd", mediumorchid: "ba55d3", mediumpurple: "9370db", mediumseagreen: "3cb371", mediumslateblue: "7b68ee", mediumspringgreen: "00fa9a", mediumturquoise: "48d1cc", mediumvioletred: "c71585", midnightblue: "191970", mintcream: "f5fffa", mistyrose: "ffe4e1", moccasin: "ffe4b5", navajowhite: "ffdead", navy: "000080", oldlace: "fdf5e6", olive: "808000", olivedrab: "6b8e23", orange: "ffa500", orangered: "ff4500", orchid: "da70d6", palegoldenrod: "eee8aa", palegreen: "98fb98", paleturquoise: "afeeee", palevioletred: "db7093", papayawhip: "ffefd5", peachpuff: "ffdab9", peru: "cd853f", pink: "ffc0cb", plum: "dda0dd", powderblue: "b0e0e6", purple: "800080", red: "f00", rosybrown: "bc8f8f", royalblue: "4169e1", saddlebrown: "8b4513", salmon: "fa8072", sandybrown: "f4a460", seagreen: "2e8b57", seashell: "fff5ee", sienna: "a0522d", silver: "c0c0c0", skyblue: "87ceeb", slateblue: "6a5acd", slategray: "708090", slategrey: "708090", snow: "fffafa", springgreen: "00ff7f", steelblue: "4682b4", tan: "d2b48c", teal: "008080", thistle: "d8bfd8", tomato: "ff6347", turquoise: "40e0d0", violet: "ee82ee", wheat: "f5deb3", white: "fff", whitesmoke: "f5f5f5", yellow: "ff0", yellowgreen: "9acd32"},

	init: function(color) {
		this.setColor(color || '#000000');
	},

	setColor: function(color) {
		this.original = color;
		if (this.names[color] !== undefined) {
			this.color = color;
			this.format = 'name';
		} else {
			var match = /^["]([#][0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?)|(?:(rgb|rgba|hsl|hsla)[(][ ]*(\d+(?:[.]\d+)?)([%]?)[ ]*,[ ]*(\d+(?:[.]\d+)?)([%]?)[ ]*,[ ]*(\d+(?:[.]\d+)?)([%]?)[ ]*(?:,[ ]*(\d+(?:[.]\d+)?)[ ]*)?[)])["]$/g.exec(color);
			if (match !== null) {
				var hex = match[1]; // either "#xxx" or "#xxxxxx"
				var format = match[2]; // either "rgb", "rgba", "hsl", "hsla", or undefined
				var part1 = match[3]; // number
				var percent1 = match[4]; // either "" or "%"
				var part2 = match[5]; // number
				var percent2 = match[6]; // either "" or "%"
				var part3 = match[7]; // number
				var percent3 = match[8]; // either "" or "%"
				var alpha = match[9]; // alpha part or undefined

				if (hex !== undefined) {
					this.format = 'hex';
					if (hex.length === 4) {
						hex = '#' + hex.substring(1,2) + hex.substring(1,2) + hex.substring(2,3) + hex.substring(2,3) + hex.substring(3,4) + hex.substring(3,4);
					}
					this.color = hex;
				} else if (split.format === 'rgb' || split.format === 'rgba') {
				}
			} else {
				this.format = 'invalid';
			}
		}
	},

		parseColor: function(text) {
			this.colorData = {};
			var split = jsmm.editor.editables.splitColor(text);
			if (split === null) {
				return false;
			} else {
				if (split.hex !== undefined) {
					this.colorData.value = split.hex;
					this.colorData.format = 'hex';
					return true;
				} else {
					var a;
					if (split.format === 'rgb' || split.format === 'rgba') {
						var r = parseFloat(split.part1);
						var g = parseFloat(split.part2);
						var b = parseFloat(split.part3);
						a = parseFloat(split.alpha || '1');
						if (split.percent1 === '%') {
							r = r*255/100;
						}
						if (split.percent2 === '%') {
							g = g*255/100;
						}
						if (split.percent3 === '%') {
							b = b*255/100;
						}
						if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 || a < 0 || a > 1) return false;
						this.colorData.value = 'rgba(' + r.toFixed(0) + ', ' + g.toFixed(0) + ', ' + b.toFixed(0) + ', ' + a.toFixed(2) + ')';
						this.colorData.format = 'rgba';
						return true;
					} else if (split.format === 'hsl' || split.format === 'hsla') {
						var h = parseInt(split.part1, 10);
						var s = parseInt(split.part2, 10);
						var l = parseInt(split.part3, 10);
						a = parseFloat(split.alpha || '1');
						if (h < 0 || h > 360 || split.percent1 === '%' || s < 0 || s > 100 || split.percent2 !== '%' ||
							l < 0 || l > 100 || split.percent3 !== '%' || a < 0 || a > 1) return false;
						this.colorData.value = 'hsla(' + h.toFixed(0) + ', ' + s.toFixed(2) + '%, ' + l.toFixed(2) + '%, ' + a.toFixed(2) + ')';
						this.colorData.format = 'hsla';
						return true;
					} else {
						return false;
					}
				}
			}
		},

};
*/

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

		this.mouseDown = _(this.mouseDown).bind(this);
		this.mouseMove = _(this.mouseMove).bind(this);
		this.mouseUp = _(this.mouseUp).bind(this);
		this.touchStart = _(this.touchStart).bind(this);
		this.touchMove = _(this.touchMove).bind(this);
		this.touchEnd = _(this.touchEnd).bind(this);

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

	mouseDown: function(event) {
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

	mouseMove: function(event) {
		if (this.isTouchable && this.touch) {
			this.touch.touchMove(event);
			this.delegate.touchMove(this.touch);
		}
		return false;
	},

	mouseUp: function(event) {
		if (this.isTouchable && this.touch) {
			this.touch.touchUp(event);
			this.delegate.touchUp(this.touch);
			
			delete this.touch;
		}
		this.$document.off(this.documentEvents);
		return false;
	},

	touchStart: function(event) {
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

	touchMove: function(event) {
		if (this.isTouchable && this.touch) {
			this.touch.touchMove(event.originalEvent.touches[0]);
			this.delegate.touchMove(this.touch);
		}
		return false;
	},

	touchEnd: function(event) {
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

		this.$segmentContainer = $('<div class="clayer-slider-segment-container"></div>');
		this.$bar.append(this.$segmentContainer);

		this.$marker = $('<div class="clayer-slider-marker"></div>');
		this.markerWidth = Math.min(this.valueWidth, 10);
		this.$marker.width(this.markerWidth);
		this.$bar.append(this.$marker);

		this.$knob = $('<div class="clayer-slider-knob"></div>');
		this.$container.append(this.$knob);

		this.$element.on('mousemove', _(this.mouseMove).bind(this));
		this.$element.on('mouseleave', _(this.mouseLeave).bind(this));
		this.touchable = new clayer.Touchable(this.$element, this);

		this.bounceTimer = null;

		this.renderKnob();
		this.renderMarker();
	},

	remove: function() {
		this.touchable.setTouchable(false);
		this.$element.off('mousemove mouseleave');
		this.$segmentContainer.remove();
		this.$marker.remove();
		this.$knob.remove();
		this.$bar.remove();
		this.$container.remove();
	},

	setSegments: function(ranges) {
		this.$segmentContainer.html('');
		for (var i=0; i<ranges.length; i++) {
			var range = ranges[i];
			var $segment = $('<div class="clayer-slider-segment"></div>');
			this.$segmentContainer.append($segment);

			$segment.css('left', range.start*this.valueWidth);
			$segment.width((range.end - range.start + 1)*this.valueWidth);
			$segment.css('background-color', range.color);
		}
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
		this.updateKnobValue(Math.floor(x/this.valueWidth));
	},

	updateKnobValue: function(knobValue) {
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
		this.updateKnobValue(this.markerValue);
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
			this.bounceTimer = setInterval(_(this.renderKnob).bind(this), 20);
			this.bounceProgress = 0;
		}
	}
};

module.exports = clayer;

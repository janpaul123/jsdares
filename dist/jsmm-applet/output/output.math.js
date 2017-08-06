/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.Math = function() { return this.init.apply(this, arguments); };
	output.Math.prototype = {
		init: function(editor, options) {
			this.staticRandom = options.staticRandom || false;
		},

		remove: function() {
		},

		functions: {
			abs: {type: 'function', argsMin: 1, argsMax: 1, example: 'abs(x)'},
			acos: {type: 'function', argsMin: 1, argsMax: 1, example: 'acos(x)'},
			asin: {type: 'function', argsMin: 1, argsMax: 1, example: 'asin(x)'},
			atan: {type: 'function', argsMin: 1, argsMax: 1, example: 'atan(x)'},
			atan2: {type: 'function', argsMin: 2, argsMax: 2, example: 'atan2(y, x)'},
			ceil: {type: 'function', argsMin: 1, argsMax: 1, example: 'ceil(x)'},
			cos: {type: 'function', argsMin: 1, argsMax: 1, example: 'cos(x)'},
			exp: {type: 'function', argsMin: 1, argsMax: 1, example: 'exp(x)'},
			floor: {type: 'function', argsMin: 1, argsMax: 1, example: 'floor(x)'},
			log: {type: 'function', argsMin: 1, argsMax: 1, example: 'log(x)'},
			max: {type: 'function', argsMin: 2, argsMax: Infinity, example: 'max(x, y)'},
			min: {type: 'function', argsMin: 2, argsMax: Infinity, example: 'min(x, y)'},
			pow: {type: 'function', argsMin: 2, argsMax: 2, example: 'pow(x, y)'},
			//random: {type: 'function', argsMin: 0, argsMax: 0, example: 'random()'},
			round: {type: 'function', argsMin: 1, argsMax: 1, example: 'round(x)'},
			sin: {type: 'function', argsMin: 1, argsMax: 1, example: 'sin(x)'},
			sqrt: {type: 'function', argsMin: 1, argsMax: 1, example: 'sqrt(x)'},
			tan: {type: 'function', argsMin: 1, argsMax: 1, example: 'tan(x)'},
			E: {type: 'variable', example: 'E'},
			LN2: {type: 'variable', example: 'LN2'},
			LN10: {type: 'variable', example: 'LN10'},
			LOG2E: {type: 'variable', example: 'LOG2E'},
			LOG10E: {type: 'variable', example: 'LOG10E'},
			PI: {type: 'variable', example: 'PI'},
			SQRT1_2: {type: 'variable', example: 'SQRT1_2'},
			SQRT2: {type: 'variable', example: 'SQRT2'}
		},

		getScopeObjects: function() {
			return {Math: this.getAugmentedObject()};
		},

		getAugmentedObject: function() {
			var obj = {type: 'object', string: '[object Math]', properties: {
				random: {
					name: 'random',
					info: 'Math.random',
					type: 'function',
					example: 'random()',
					string: '[function Math.random]',
					func: _(this.handleRandom).bind(this)
				}
			}};
			for (var name in this.functions) {
				var func = this.functions[name];
				if (func.type === 'function') {
					obj.properties[name] = {
						name: name,
						info: 'Math.' + name,
						type: 'function',
						example: func.example,
						string: '[function Math.' + name + ']',
						func: _(this.handleMethod).bind(this)
					};
				} else if (func.type === 'variable') {
					obj.properties[name] = {
						name: name,
						info: 'Math.' + name,
						type: 'variable',
						get: _(this.handleAttributeGet).bind(this),
						set: _(this.handleAttributeSet).bind(this),
						example: func.example
					};
				}
			}
			this.getAugmentedObject = function() { return obj; };
			return obj;
		},

		handleMethod: function(context, name, args) {
			var min = this.functions[name].argsMin, max = this.functions[name].argsMax;
			if (args.length < min) {
				throw '<var>' + name + '</var> requires at least <var>' + min + '</var> arguments';
			} else if (args.length > max) {
				throw '<var>' + name + '</var> accepts no more than <var>' + max + '</var> arguments';
			}
			return Math[name].apply(Math, args);
		},

		handleAttributeGet: function(name) {
			return Math[name];
		},

		handleAttributeSet: function(context, name, value) {
			throw 'You can only read <var>' + name + '</var>, not set it to another value';
		},

		handleRandom: function(context, name, args) {
			if (args.length > 0) {
				throw '<var>random</var> does not take any arguments';
			}

			// simple but good 32-bits RNG from http://www.jstatsoft.org/v08/i14/paper/
			this.randomNumber ^= (this.randomNumber<<13);
			this.randomNumber ^= (this.randomNumber>>17);
			this.randomNumber ^= (this.randomNumber<<5);

			// Math.pow(2,31) == 2147483648
			// Math.pow(2,32) == 4294967296
			// binary operations give 32-bit *signed* number, so between [-2^31, 2^31)
			// correcting this gives range [0, 1)
			return (this.randomNumber+2147483648)/4294967296;
		},

		outputStartEvent: function(context) {
			this.randomNumbers.push(this.randomNumber);
		},

		outputClearReload: function() {
			if (this.staticRandom) {
				this.startRandomNumber = 2463534242;
			} else {
				// get a random starting point in our order 2^32-1 sequence
				do {
					// convert to 32-bit signed integer
					this.startRandomNumber = ~~(Math.random()*2147483648-2147483648);
				} while (this.startRandomNumber === 0);
				// easy fix to avoid zero-numbers, since those don't work!
			}
		},

		outputClearAllEvents: function() {
			this.randomNumber = this.startRandomNumber;
			this.randomNumbers = [];
		},

		outputPopFirstEvent: function() {
			this.randomNumbers.shift();
		},

		outputClearEventsFrom: function(eventNum) {
			this.randomNumber = this.randomNumbers[eventNum];
			this.randomNumbers = this.randomNumbers.slice(0, eventNum);
		},

		outputClearEventsToEnd: function() {
			this.randomNumbers = [];
		}
	};
};

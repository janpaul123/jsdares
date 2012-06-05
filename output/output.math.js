/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.Math = function() { return this.init.apply(this, arguments); };
	output.Math.prototype = {
		init: function() {
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
			random: {type: 'function', argsMin: 0, argsMax: 0, example: 'random()'},
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

		getAugmentedObject: function() {
			var obj = {};
			for (var name in this.functions) {
				var func = this.functions[name];
				if (func.type === 'function') {
					obj[name] = {
						name: name,
						info: 'Math.' + name,
						type: 'function',
						func: $.proxy(this.handleMethod, this),
						example: func.example
					};
				} else if (func.type === 'variable') {
					obj[name] = {
						name: name,
						info: 'Math.' + name,
						type: 'variable',
						get: $.proxy(this.handleAttributeGet, this),
						set: $.proxy(this.handleAttributeSet, this),
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
		}
	};
};

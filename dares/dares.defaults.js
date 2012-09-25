/*jshint node:true jquery:true*/
"use strict";

module.exports = function(dares) {
	dares.sanitize = {};
	dares.sanitize.dareOptions = {
		allDares: {
			RobotGoal: {
				goalReward: {type: 'number', def: 50, min: 0, max: 1000},
				optionalGoals: {type: 'number', def: 50, min: 0, max: 1000},
				hidePreview: {type: 'boolean', def: false},
				previewBlockSize: {type: 'number', def: 48, min: 1, max: 100}
			},
			ImageMatch: {
				minPercentage: {type: 'number', def: 95, min: 0, max: 100},
				hidePreview: {type: 'boolean', def: false},
				speed: {type: 'number', def: 100, min: 0, max: 10000}
			},
			ConsoleMatch: {
				minPercentage: {type: 'number', def: 95, min: 0, max: 100},
				hidePreview: {type: 'boolean', def: false},
				speed: {type: 'number', def: 100, min: 0, max: 10000}
			}
		},
		allOutputs: {
			robot: {
				rows: {type: 'number', def: 8, min: 1, max: 30},
				columns: {type: 'number', def: 8, min: 1, max: 30},
				readOnly: {type: 'boolean', def: true}
			},
			canvas: {
				size: {type: 'number', def: 512, min: 1, max: 1024}
			},
			console: {

			},
			info: {
				scope: {type: 'boolean', def: true}
			},
			events: {

			},
			math: {
				staticRandom: {type: 'boolean', def: true}
			}
		},
		type: {type: 'text', def: 'RobotGoal', valid: ['RobotGoal', 'ImageMatch', 'ConsoleMatch']},
		outputs: {type: 'array', def: ['robot'], valid: ['robot', 'canvas', 'console', 'info', 'events', 'math']},
		name: {type: 'text', def: 'Untitled Dare'},
		description: {type: 'text', def: ''}
	};

	dares.sanitize.sanitizeInput = function(input, options) {
		var newObject = {};
		if (options.def !== undefined) {
			return dares.sanitize.sanitizeItem(input, options);
		} else {
			for (var name in options) {
				newObject[name] = dares.sanitize.sanitizeInput(input[name], options[name]);
			}
			return newObject;
		}
	};

	dares.sanitize.sanitizeItem = function(input, options) {
		if (input === undefined) {
			return options.def;
		} else if (options.type === 'number') {
			if (typeof input !== 'number') {
				input = parseInt(input, 10);
			}
			if (!isFinite(input) || input < options.min || input > options.max) {
				return options.def;
			} else {
				return input;
			}
		} else if (options.type === 'boolean') {
			if (input === true || input === 'true' || input === 1 || input === '1') {
				return true;
			} else if (input === false || input === 'false' || input === 0 || input === '0') {
				return false;
			} else {
				return options.def;
			}
		} else if (options.type === 'text') {
			if (typeof input !== 'string' ||
				(typeof options.valid === 'array' && options.valid.indexOf(input) < 0) ||
				(typeof options.valid === 'function' && !options.valid(input))
			) {
				return options.def;
			} else {
				return input;
			}
		} else if (options.type === 'array') {
			if (Object.prototype.toString.call(input) === '[object Array]') {
				for (var i=0; i<input.length; i++) {
					if (options.valid.indexOf(input[i]) < 0) {
						return options.def;
					}
				}
				return input;
			} else {
				return options.def;
			}
		} else {
			console.error('Invalid option: ' + input);
		}
	};
};
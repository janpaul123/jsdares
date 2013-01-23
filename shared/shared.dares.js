/*jshint node:true jquery:true*/
"use strict";

var applet = require('../jsmm-applet');

module.exports = function(shared) {
	shared.dares = {};

	shared.dares.configDefinition = {
		dare: {
			type: {type: 'text', def: 'RobotGoal', valid: ['RobotGoal', 'ImageMatch', 'ConsoleMatch']},
			maxLines: {type: 'number', def: 0, min: 0, max: 1000},
			lineReward: {type: 'number', def: 10, min: 0, max: 1000},
			hidePreview: {type: 'boolean', def: false},

			RobotGoal: {
				goalReward: {type: 'number', def: 50, min: 0, max: 1000},
				optionalGoals: {type: 'number', def: 0, min: 0, max: 1000},
				previewBlockSize: {type: 'number', def: 48, min: 1, max: 100}
			},
			ImageMatch: {
				minPercentage: {type: 'number', def: 95, min: 0, max: 100},
				speed: {type: 'number', def: 100, min: 0, max: 10000}
			},
			ConsoleMatch: {
				minPercentage: {type: 'number', def: 95, min: 0, max: 100},
				speed: {type: 'number', def: 100, min: 0, max: 10000}
			}
		},
		outputs: {
			robot: {
				rows: {type: 'number', def: 8, min: 1, max: 30},
				columns: {type: 'number', def: 8, min: 1, max: 30},
				readOnly: {type: 'boolean', def: true},
				enabled: {type: 'boolean', def: false}
			},
			canvas: {
				size: {type: 'number', def: 512, min: 1, max: 1024},
				enabled: {type: 'boolean', def: false}
			},
			console: {
				enabled: {type: 'boolean', def: false}
			},
			info: {
				scope: {type: 'boolean', def: true},
				enabled: {type: 'boolean', def: false},
				commands: {type: 'text', def: ''}
			},
			events: {
				enabled: {type: 'boolean', def: false}
			},
			math: {
				staticRandom: {type: 'boolean', def: true},
				enabled: {type: 'boolean', def: false}
			}
		}
	};

	shared.dares.dareOptions = {
		name: {type: 'text', def: 'Untitled Dare'},
		description: {type: 'text', def: ''},
		published: {type: 'boolean', def: false},
		editor: {
			hideToolbar: {type: 'boolean', def: false},
			text: {type: 'text', def: ''}
		},
		original: {type: 'text', def: ''},
		configProgram: {type: 'text', def: ''},
		outputStates: {
			robot: {type: 'text', def: ''}
		},
		_id: {type: 'nosanitize', def: null},
		userId: {type: 'nosanitize', def: null},
		instance: {type: 'nosanitize', def: null}
	};

	shared.dares.userOptions = {
		_id: {type: 'nosanitize', def: null},
		admin: {type: 'nosanitize', def: null},
		screenname: {type: 'nosanitize', def: null},
		link: {type: 'nosanitize', def: null}
	};

	shared.dares.sanitizeInput = function(input, options) {
		if (options.def !== undefined) {
			return shared.dares.sanitizeItem(input, options);
		} else {
			var newObject = {};
			for (var name in options) {
				if (name !== 'sanitize') {
					newObject[name] = shared.dares.sanitizeInput((input || {})[name], options[name]);
					if (newObject[name] === undefined) delete newObject[name];
				}
			}
			if (options.sanitize !== undefined) {
				newObject = options.sanitize(newObject) || newObject;
			}
			return newObject;
		}
	};

	shared.dares.sanitizeItem = function(input, options) {
		if (options.type === 'nosanitize') {
			return input;
		} else if (input === undefined) {
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
				(Object.prototype.toString.call(options.valid) === '[object Array]' && options.valid.indexOf(input) < 0) ||
				(typeof options.valid === 'function' && !options.valid(input))
			) {
				return options.def;
			} else {
				return input;
			}
		} else if (options.type === 'array') {
			var def = [];
			for (var i=0; i<options.def.length; i++) {
				def.push(options.def[i]);
			}
			if (Object.prototype.toString.call(input) === '[object Array]') {
				for (var j=0; j<input.length; j++) {
					if (options.valid.indexOf(input[j]) < 0) {
						return def;
					}
				}
				return input;
			} else {
				return def;
			}
		} else {
			console.error('Invalid option: ' + input);
		}
	};
};
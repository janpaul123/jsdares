/*jshint node:true jquery:true*/
"use strict";

var traverse = function(object, callback) {
	var traverseWithPath = function(pathArray, object, callback) {
		for (var name in object) {
			var newPathArray = pathArray.concat(name);
			var value = object[name];

			callback(newPathArray, value);

			if (typeof value === 'object' && value) {
				traverseWithPath(newPathArray, value, callback);
			}
		}
	};

	traverseWithPath([], object, callback);
};

var leafs = function(object, isLeafCallback) {
	var leafs = [];
	traverse(object, function(pathArray, value) {
		if (isLeafCallback(value)) {
			leafs.push({pathArray: pathArray, value: value});
		}
	});
	return leafs;
};

var jsmm = require('../jsmm');

module.exports = function(output) {
	output.Config = function() { return this.init.apply(this, arguments); };
	output.Config.prototype = {
		init: function(definition) {
			this.definition = definition;
			this.augmentedObjects = {};
			this.clear();
		},

		clear: function() {
			this.config = {};
		},

		getConfig: function() {
			var cloneWithDefinition = function(from, definition) {
				from = from || {};
				var to = {};
				for (var name in definition) {
					if (definition[name].def !== undefined) {
						to[name] = from[name] !== undefined ? from[name].value : definition[name].def;
					} else {
						to[name] = cloneWithDefinition(from[name], definition[name]);
					}
				}
				return to;
			};

			return cloneWithDefinition(this.config, this.definition);
		},

		validateItem: function(name, item, validation) {
			if (validation.type === 'boolean') {
				if (item !== true && item !== false) {
					throw '<var>' + name + '</var> must be <var>true</var> or <var>false</var>';
				}
			} else if (validation.type === 'number' || validation.type === 'integer') {
				if (typeof item !== 'number') {
					throw '<var>' + name + '</var> must be a number';
				} else if (item < validation.min || item > validation.max) {
					throw '<var>' + name + '</var> must be between <var>' + validation.min + '</var> and <var>' + validation.max + '</var>';
				} else if (validation.type === 'integer' && item % 1 !== 0) {
					throw '<var>' + name + '</var> must be an integer';
				}
			} else if (validation.type === 'text') {
				if (typeof item !== 'string') {
					throw '<var>' + name + '</var> must be a string';
				} else if (Object.prototype.toString.call(validation.valid) === '[object Array]' && validation.valid.indexOf(item) < 0) {
					throw '<var>' + name + '</var> must be one of those: <var>' + validation.valid.join(', ') + '</var>';
				}
			}
		},

		walkOptionPath: function(start, optionPath) {
			var config = start;
			for (var i=0; i<optionPath.length; i++) {
				var optionName = optionPath[i];
				config[optionName] = config[optionName] || {};
				config = config[optionName];
			}
			return config;
		},

		findConfig: function(optionPath) {
			return this.walkOptionPath(this.config, optionPath);
		},

		getOption: function(optionPath) {
			var config = this.findConfig(optionPath);
			return config.value;
		},

		setOption: function(optionPath, value, validation) {
			var name = optionPath[optionPath.length-1];
			this.validateItem(name, value, validation);
			var config = this.findConfig(optionPath);
			config.value = value;
		},

		getAugmentedObjectFor: function(objectName, object, optionPath) {
			var that = this;
			var makeGet = function(propName) {
				return (function(name) { that.getOption(optionPath.concat(propName)); });
			};
			var makeSet = function(propName, member) {
				return (function(context, name, value) { that.setOption(optionPath.concat(propName), value, member); });
			};

			var objectPath = optionPath.concat(objectName).join('.');

			if (!this.augmentedObjects[objectPath]) {
				var augmented = {
					type: 'object',
					string: '[object ' + objectName + ']',
					properties: {}
				};

				for (var propName in object) {
					var member = object[propName];
					if (member.def !== undefined) {
						var def = (member.type === 'text' ? '"' + member.def + '"' : member.def);

						if (member.type !== 'nosanitize') {
							augmented.properties[propName] = {
								name: propName,
								info: '',
								type: 'variable',
								example: propName + ' = ' + def,
								get: makeGet(propName),
								set: makeSet(propName, member)
							};
						}
					} else {
						augmented.properties[propName] = this.getAugmentedObjectFor(propName, member, optionPath.concat(propName));
					}
				}

				this.augmentedObjects[objectPath] = augmented;
			}
			return this.augmentedObjects[objectPath];
		},

		getScopeObjects: function() {
			return {config: this.getAugmentedObjectFor('config', this.definition, [])};
		},

		definitionLeafs: function() {
			return leafs(this.definition, function(value) { return value && value.def !== undefined; } );
		}
	};

	output.ConfigOutput = function() { return this.init.apply(this, arguments); };
	output.ConfigOutput.prototype = {
		init: function(editor, options, $div) {
			this.definition = options.definition;
			this.config = new output.Config(this.definition);

			this.$div = $div;
			this.$div.addClass('output config');

			this.renderOptionElements();

			this.augmentedObjects = {};
		},

		remove: function() {
			this.$div.removeClass('output config');
			this.$div.html('');
		},

		renderOptionElements: function() {
			var options = this.config.definitionLeafs();
			this.$optionValues = [];
			this.$optionGroups = [];
			for (var i=0; i<options.length; i++) {
				var pathArray = options[i].pathArray;
				var $option = this.renderOptionElement(pathArray, options[i].value);
				this.optionGroup('config.' + pathArray.slice(0, -1).join('.')).append($option);
			}
		},

		renderOptionElement: function(pathArray, option) {
			var $option = $('<div class="config-option">' + pathArray[pathArray.length-1] + ' = </div>');
			var $value = $('<span class="config-option-value"></span>');
			this.$optionValues[pathArray.toString()] = $value;
			$option.append($value);
			return $option;
		},

		optionGroup: function(name) {
			if (!this.$optionGroups[name]) {
				var $optionGroup = $('<div class="config-option-group"></div>');
				$optionGroup.append('<div class="config-option-group-name">' + name + '</div>' );
				this.$div.append($optionGroup);
				this.$optionGroups[name] = $optionGroup;
			}
			return this.$optionGroups[name];
		},

		renderConfig: function() {
			var options = this.config.definitionLeafs();
			for (var i=0; i<options.length; i++) {
				var pathArray = options[i].pathArray;
				var config = this.config.findConfig(pathArray);
				var value = this.makeOptionValue(config.value, options[i].value);

				this.$optionValues[pathArray.toString()].text(value);
			}
		},

		makeOptionValue: function(value, definition) {
			if (value === undefined) {
				value = definition.def;
			}

			if (definition.type === 'text') {
				return '"' + value + '"';
			} else {
				return value;
			}
		},

		getScopeObjects: function() {
			return this.config.getScopeObjects();
		},

		outputClearAllEvents: function() {
			this.config.clear();
		},

		outputSetEventStep: function() {
			this.renderConfig();
		}
	};
};
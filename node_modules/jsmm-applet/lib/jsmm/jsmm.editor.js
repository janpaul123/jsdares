/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	jsmm.editor = {};

	jsmm.editor.autocompletion = {
		// expected text format: someObject.someProperty.startOfAFunction
		getExamples: function(scope, text) {
			var split = text.split('.');

			var obj = scope.find(split[0]);
			
			if (obj === undefined || typeof obj.value !== 'object' || obj.value.properties === undefined) return null;
			obj = obj.value;
			for (var i=1; i<split.length-1; i++) {
				obj = obj.properties[split[i]];
				if (typeof obj !== 'object' || obj.properties === undefined) return null;
			}

			var examples = [];
			var start = split[split.length-1].toLowerCase();
			for (var name in obj.properties) {
				var example;
				if (typeof obj.properties[name] === 'object' && obj.properties[name].example !== undefined) {
					example = obj.properties[name].example;
				} else {
					example = name;
				}

				if (start.length === 0 || example.substring(0, start.length).toLowerCase() === start) {
					// split into name part and "= 123" or "(100, 150)" part
					var splitExample = example.split(/( \=.*|\(.*)/);
					if (splitExample[1] !== undefined && splitExample[1].length > 0) {
						splitExample[1] += ';';
					} else {
						splitExample[1] = '';
					}
					examples.push(splitExample);
				}
			}
			return {
				examples: examples,
				width: start.length,
				prefix: text.substring(0, text.length - start.length)
			};
		}
	};

	jsmm.editor.editables = {
		generate: function(tree, editorEditables, surface, editor) {
			var editables = [];
			var i;
			var booleanNodes = tree.getNodesByType('BooleanLiteral');
			if (booleanNodes !== undefined) {
				for (i=0; i<booleanNodes.length; i++) {
					editables.push(new editorEditables.CycleEditable(booleanNodes[i], surface, editor, this.parseBoolean, this.makeBoolean));
				}
			}
			var numberNodes = tree.getNodesByType('NumberLiteral');
			if (numberNodes !== undefined) {
				for (i=0; i<numberNodes.length; i++) {
					var node = numberNodes[i];
					if (node.parent.type === 'UnaryExpression') {
						node = node.parent;
					}
					editables.push(new editorEditables.NumberEditable(node, surface, editor, this.parseNumber, this.makeNumber));
				}
			}
			var stringNodes = tree.getNodesByType('StringLiteral');
			if (stringNodes !== undefined) {
				for (i=0; i<stringNodes.length; i++) {
					var str = stringNodes[i].str;
					if (jsmm.editor.editables.splitColor('"' + str + '"') !== null) {
						editables.push(new editorEditables.ColorEditable(stringNodes[i], surface, editor, this.parseColor, this.makeColor));
					}
				}
			}
			return editables;
		},

		parseBoolean: function(text) {
			this.value = text === 'true';
			return (text === 'true' || text === 'false');
		},

		makeBoolean: function() {
			return this.value ? 'false' : 'true';
		},

		splitNumber: function(text) {
			var match = /^[+]?([\-]?)[ ]*([0-9]+)(?:[.]([0-9]+))?(?:([eE])[+]?([\-]?[0-9]+))?$/g.exec(text);
			if (match === null) {
				return null;
			} else {
				return {
					sign: match[1], // either "-" or undefined ("+" is dropped)
					integer: match[2], // integer part, cannot be undefined (if the number is valid)
					decimals: match[3], // decimal part without ".", or undefined
					exponentLetter: match[4], // either "e", "E", or undefined
					exponent: match[5] // the exponent part without the letter, but with an optional "-" (again not "+"), or undefined
				};
			}
		},

		parseNumber: function(text) {
			this.numberData = {};
			// remove spaces since it is possible to have e.g. "-  5"
			this.numberData.value = parseFloat(text.replace(/[ ]+/g, ''));
			var split = jsmm.editor.editables.splitNumber(text);

			if (split === null || !isFinite(this.numberData.value)) {
				return false;
			} else {
				// if an exponent is defined, use the capitalisation already used in the value
				this.numberData.exponentLetter = split.exponentLetter || 'e';

				// calculate the delta for each offset pixel based on the number of decimals in the original number (and of course exponent)
				// the delta is inverted as this seems to reduce the number of rounding errors (e.g. 0.57 !== 57*0.01, but 0.57 === 57/100)
				this.numberData.invDelta = Math.pow(10, -(parseInt(split.exponent || '0', 10) - (split.decimals || '').length));

				// determine the number of significant digits by trimming leading zeros
				var significant = (split.integer + (split.decimals || '')).replace(/^0*/, '').length;
				
				// when zero, the number of significant digits is the number of decimals plus one
				if (this.numberData.value === 0 && split.decimals !== undefined) {
					significant = split.decimals.length+1;
				}

				// clamp the number
				if (significant > 8) significant = 8;
				else if (significant < 1) significant = 1;

				// the final number of decimals has to be based on the .toPrecision value with the calculated number of significant digits,
				// as this will be used when generating the number, and this function may alter the format of the number (e.g. different
				// number of digits and exponent, etc.)
				this.numberData.decimals = (jsmm.editor.editables.splitNumber(this.numberData.value.toPrecision(significant)).decimals || '').length;
				
				return true;
			}
		},

		makeNumber: function(offset) {
			// calculate new number with 8 significant digits and split it
			// for calculating the new number the function x^3/(x^2+200), which provides nice snapping to the original number and
			// lower sensitiveness near the original number
			var split = jsmm.editor.editables.splitNumber((this.numberData.value + (offset*offset*offset)/((offset*offset+200)*this.numberData.invDelta)).toPrecision(8));

			// start off with the integer part
			var newText = split.integer;

			// if we want any decimals, take all the decimals we get with 8 significant digits, and cap this off by the required amount
			if (this.numberData.decimals > 0) {
				newText += '.' + (split.decimals || '0').substring(0, this.numberData.decimals);
			}

			// add the exponent using the user-defined letter, if necessary
			if (split.exponent !== undefined) {
				newText += this.numberData.exponentLetter + split.exponent;
			}

			// finally add the negative sign if required, and if the rest of the number we have so far does not evaluate to zero
			if (split.sign === '-' && parseFloat(newText) !== 0) {
				newText = '-' + newText;
			}

			return newText;
		},

		splitColor: function(text) {
			var match = /^["]([#][0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?)|(?:(rgb|rgba|hsl|hsla)[(][ ]*(\d+(?:[.]\d+)?)([%]?)[ ]*,[ ]*(\d+(?:[.]\d+)?)([%]?)[ ]*,[ ]*(\d+(?:[.]\d+)?)([%]?)[ ]*(?:,[ ]*(\d+(?:[.]\d+)?)[ ]*)?[)])["]$/g.exec(text);
			if (match === null) {
				return null;
			} else {
				return {
					hex: match[1], // either "#xxx" or "#xxxxxx"
					format: match[2], // either "rgb", "rgba", "hsl", "hsla", or undefined
					part1: match[3], // number
					percent1: match[4], // either "" or "%"
					part2: match[5], // number
					percent2: match[6], // either "" or "%"
					part3: match[7], // number
					percent3: match[8], // either "" or "%"
					alpha: match[9] // alpha part or undefined
				};
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

		makeColor: function(color) {
			return '"' + color + '"';
		}
	};

	jsmm.editor.timeHighlights = {
		getTimeHighlights: function(tree) {
			var nodes = tree.getNodesByType('FunctionDeclaration');
			var result = {};
			for (var i=0; i<nodes.length; i++) {
				result[nodes[i].name] = nodes[i].blockLoc;
			}
			return result;
		}
	};
};
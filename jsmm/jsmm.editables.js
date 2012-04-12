/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	jsmm.editables = {
		generate: function(tree, editorEditables, surface, editor) {
			var editables = [];
			var nodes = tree.getNodesByType('NumberLiteral');
			if (nodes !== undefined) {
				for (var i=0; i<nodes.length; i++) {
					var node = nodes[i];
					if (node.parent.type === 'UnaryExpression') {
						node = node.parent;
					}
					editables.push(new editorEditables.NumberEditable(node, surface, editor, this.parseNumber, this.makeNumber));
				}
			}
			return editables;
		},

		splitNumber: function(str) {
			var match = /^[+]?([\-]?)([0-9]+)(?:[.]([0-9]+))?(?:([eE])[+]?([\-]?[0-9]+))?/g.exec(str);
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
			this.numberData.value = parseFloat(text);
			var split = jsmm.editables.splitNumber(text);

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
				if (significant > 8) significant = 8;
				else if (significant < 1) significant = 1;

				if (significant > 0) {
					// the final number of decimals has to be based on the .toPrecision value with the calculated number of significant digits,
					// as this will be used when generating the number, and this function may alter the format of the number (e.g. different
					// number of digits and exponent, etc.)
					this.numberData.decimals = (jsmm.editables.splitNumber(this.numberData.value.toPrecision(significant)).decimals || '').length;
				} else {
					// if there are no significant numbers, the value is 0, so simply look at the number of decimals
					this.numberData.decimals = (split.decimals || '').length;
				}
				return true;
			}
		},

		makeNumber: function(offset) {
			// calculate new number with 8 significant digits and split it
			// for calculating the new number the function x^3/(x^2+200), which provides nice snapping to the original number and
			// lower sensitiveness near the original number
			var split = jsmm.editables.splitNumber((this.numberData.value + (offset*offset*offset)/((offset*offset+200)*this.numberData.invDelta)).toPrecision(8));

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
		}
	};
};
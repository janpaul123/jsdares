/*jshint node:true jquery:true*/
"use strict";

module.exports = function(editor) {
	editor.Code = function() { return this.init.apply(this, arguments); };

	editor.Code.prototype = {
		init: function(text) {
			this.text = '' + text;
		},
		getText: function() {
			return this.text;
		},
		getLine: function(line) {
			this.makeLines();
			return this.lines[line-1];
		},
		lineColumnToOffset: function(line, column) {
			this.makeOffsets();
			return this.offsets[line-1] + column;
		},
		posToOffset: function(loc) {
			return this.lineColumnToOffset(loc.line, loc.column);
		},
		rangeToText: function(textLoc) {
			return this.text.substring(this.lineColumnToOffset(textLoc.line, textLoc.column), this.lineColumnToOffset(textLoc.line2, textLoc.column2));
		},
		lineColumnToPositionText: function(line, column) {
			this.makeLines();
			return new Array(line).join('\n') + (this.lines[line-1] || '').substring(0, column);
		},
		offsetToLoc: function(offset) {
			this.makeOffsets();
			// TODO: implement binary search
			for (var i=0; i<this.lines.length; i++) {
				if (offset < this.offsets[i]) {
					return {line: i, column: offset-(this.offsets[i-1] || 0)};
				}
			}
			return {line: this.lines.length, column: offset-this.offsets[this.lines.length-1]};
		},
		insertAtOffset: function(offset, text) {
			return this.text.substring(0, offset) + text + this.text.substring(offset);
		},
		removeOffsetRange: function(offset1, offset2) {
			return this.text.substring(0, offset1) + this.text.substring(offset2);
		},
		replaceOffsetRange: function(offset1, offset2, text) {
			return this.text.substring(0, offset1) + text + this.text.substring(offset2);
		},
		/// INTERNAL FUNCTIONS ///
		makeLines: function() {
			if (this.lines !== undefined) return;
			this.lines = this.text.split(/\n/);
		},
		makeOffsets: function() {
			if (this.offsets !== undefined) return;
			this.makeLines();
			this.offsets = [0];
			for (var i=1; i<this.lines.length; i++) {
				// add one for the actual newline character
				this.offsets[i] = this.offsets[i-1] + this.lines[i-1].length + 1;
			}
		}
	};
};

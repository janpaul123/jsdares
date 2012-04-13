/*jshint node:true jquery:true*/
"use strict";

var clayer = require('../clayer');


module.exports = function(editor) {
	editor.Editor = function() { return this.init.apply(this, arguments); };

	editor.Editor.prototype = {
		init: function(language, $div, delegate) {
			this.language = language;
			this.surface = new editor.Surface($div, this);
			this.delegate = delegate;
			this.outputs = [];
			this.runner = new language.StaticRunner();

			this.editables = [];
			this.editablesByLine = [];
			this.editablesEnabled = false;

			this.highlightingEnabled = false;
			this.currentHighlightNode = null;

			this.setText('');
		},

		setText: function(text) {
			this.surface.setText(text);
			this.surface.resetSelection();
			this.update();
		},

		setScope: function(scope) {
			this.runner.newScope(scope);
			this.update();
		},

		addOutput: function(output) {
			this.outputs.push(output);
			this.update();
		},

		callOutputs: function(funcName) {
			for (var i=0; i<this.outputs.length; i++) {
				this.outputs[i][funcName]();
			}
		},

		update: function() {
			this.code = new editor.Code(this.surface.getText());
			this.tree = new this.language.Tree(this.code.text);
			if (this.tree.hasError()) {
				if (this.editablesEnabled) {
					this.disableEditables();
				}
				if (this.highlightingEnabled) {
					this.disableHighlighting();
				}
				this.handleError(this.tree.getError());
				this.delegate.criticalError();
			} else {
				this.run();
			}
		},

		run: function() {
			this.callOutputs('clear');
			this.runner.newTree(this.tree);
			this.runner.run();
			this.handleRunnerOutput();
		},

		restart: function() {
			if (!this.tree.hasError()) {
				this.runner.restart();
				this.run();
			}
		},

		stepForward: function() {
			if (!this.tree.hasError()) {
				this.callOutputs('clear');
				if (!this.runner.isStepping()) {
					this.surface.openStepMessage();
				}
				this.runner.stepForward();
				this.handleRunnerOutput();
			}
		},

		stepBackward: function() {
			if (!this.tree.hasError()) {
				this.callOutputs('clear');
				this.runner.stepBackward();
				this.handleRunnerOutput();
			}
		},

		handleRunnerOutput: function() {
			if (this.runner.hasError()) {
				this.handleError(this.runner.getError());
				if (this.runner.isStepping()) {
					this.delegate.steppingWithError();
				} else {
					this.delegate.runningWithError();
				}
			} else {
				this.handleMessages(this.runner.getMessages());
				if (this.runner.isStepping()) {
					this.delegate.steppingWithoutError();
				} else {
					this.delegate.runningWithoutError();
				}
			}
		},

		handleError: function(error) {
			this.surface.hideStepMessage();
			this.surface.showErrorMessage(error);
		},

		handleMessages: function(messages) {
			this.surface.hideErrorMessage();
			if (messages.length <= 0) {
				this.surface.hideStepMessage();
			} else {
				for (var i=0; i<messages.length; i++) {
					if (messages[i].type === 'Inline') {
						this.surface.showStepMessage(messages[i]);
					}
				}
			}
		},

		userChangedText: function() { // callback
			this.update();
			if (this.editablesEnabled) {
				this.refreshEditables();
			}
			//window.localStorage.setItem('1', this.code.text);
		},

		userStartedChangingText: function() { // callback

		},

		tabIndent: function(event, offset1, offset2) { // callback
			// 9 == tab key
			if (event.keyCode === 9) {
				var code = new editor.Code(this.surface.getText());
				var pos1 = code.offsetToLoc(offset1);
				var pos2 = pos1;
				if (offset2 !== offset1) {
					pos2 = code.offsetToLoc(offset2);
				}
				
				var newText = code.text.substring(0, code.lineColumnToOffset(pos1.line, 0));
				var totalOffset1 = 0, totalOffset2 = 0;

				for (var i=pos1.line; i<=pos2.line; i++) {
					var startOffset = code.lineColumnToOffset(i, 0);
					var line = code.getLine(i);
					//console.log('line', line);
					if (!event.shiftKey) {
						// insert spaces
						newText += '  ' + line + '\n';
						if (i === pos1.line) totalOffset1 += 2;
						totalOffset2 += 2;
					} else {
						// remove spaces
						var spaces = Math.min(code.getLine(i).match(/^ */)[0].length, 2);
						newText += line.substring(spaces) + '\n';
						if (i === pos1.line) totalOffset1 -= spaces;
						totalOffset2 -= spaces;
					}
				}
				var finalOffset = code.lineColumnToOffset(pos2.line+1, 0);
				if (finalOffset !== null) newText += code.text.substring(finalOffset);
				console.log(finalOffset, totalOffset1, totalOffset2);

				if (!event.shiftKey) {
					// when adding, first set the new text
					this.surface.setText(newText);
					this.surface.offsetCursorRange(totalOffset1, totalOffset2);
				} else {
					// when deleting, first set the new cursor range
					this.surface.offsetCursorRange(totalOffset1, totalOffset2);
					this.surface.setText(newText);
				}
				
				event.preventDefault();
				return true;
			} else {
				return false;
			}
		},

		// TODO: use http://archive.plugins.jquery.com/project/fieldselection
		autoIndent: function(event, offset) { // callback
			// 13 == enter, 221 = } or ]
			if ([13, 221].indexOf(event.keyCode) >= 0) {
				var code = new editor.Code(this.surface.getText());

				var pos = code.offsetToLoc(offset);
				if (pos.line > 1) {
					var prevLine = code.getLine(pos.line-1);
					var curLine = code.getLine(pos.line);

					// how many spaces are there on the previous line (reference), and this line
					var spaces = prevLine.match(/^ */)[0].length;
					var spacesAlready = curLine.match(/^ */)[0].length;

					// "{" on previous line means extra spaces, "}" on this one means less
					spaces += prevLine.match(/\{ *$/) !== null ? 2 : 0;
					spaces -= curLine.match(/^ *\}/) !== null ? 2 : 0;

					// also, since we are returning an offset, remove the number of spaces we have already
					spaces -= spacesAlready;

					var startOffset = code.lineColumnToOffset(pos.line, 0);
					if (spaces < 0) {
						// don't delete more spaces that there are on this line
						spaces = Math.max(spaces, -spacesAlready);
						this.surface.setText(code.removeOffsetRange(startOffset, startOffset-spaces));
					} else {
						this.surface.setText(code.insertAtOffset(startOffset, new Array(spaces+1).join(' ')));
					}
					this.surface.offsetCursor(spaces);
				}
			}
		},

		enableEditables: function() {
			if (!this.tree.hasError()) {
				this.editablesEnabled = true;
				this.delegate.editablesEnabled();
				this.refreshEditables();
			}
		},

		disableEditables: function() {
			this.removeEditables();
			this.editablesEnabled = false;
			this.delegate.editablesDisabled();
		},

		refreshEditables: function() {
			if (this.editablesEnabled) {
				this.removeEditables();
				this.editables = this.language.editor.editables.generate(this.tree, editor.editables, this.surface, this);
				for (var i=0; i<this.editables.length; i++) {
					var line = this.editables[i].line;
					if (this.editablesByLine[line] === undefined) {
						this.editablesByLine[line] = [];
					}
					this.editablesByLine[line].push(this.editables[i]);
				}
			}
		},

		removeEditables: function() {
			if (this.editablesEnabled) {
				for (var i=0; i<this.editables.length; i++) {
					this.editables[i].remove();
				}
				this.editables = [];
				this.editablesByLine = [];
			}
		},

		getEditablesText: function(node) { //callback
			return this.code.rangeToText(node.textLoc);
		},

		editableReplaceCode: function(line, column, column2, newText) { // callback
			this.surface.setText(this.code.replaceOffsetRange(this.code.lineColumnToOffset(line, column), this.code.lineColumnToOffset(line, column2), newText));

			var offset = newText.length - (column2-column);
			if (offset !== 0 && this.editablesByLine[line] !== undefined) {
				for (var i=0; i<this.editablesByLine[line].length; i++) {
					this.editablesByLine[line][i].offsetColumn(column, offset);
				}
				this.surface.offsetCursor(offset);
			}

			this.update();
		},

		enableHighlighting: function() {
			if (!this.tree.hasError()) {
				this.surface.enableMouse();
				this.highlightingEnabled = true;
				this.delegate.highlightingEnabled();
				this.callOutputs('enableHighlighting');
			}
		},

		disableHighlighting: function() {
			this.tree.clearHooks();
			this.surface.hideHighlight();
			this.surface.disableMouse();
			this.highlightingEnabled = false;
			this.delegate.highLightingDisabled();
			this.callOutputs('disableHighlighting');
		},

		highlightNode: function(node) { // callback
			this.surface.showHighlight(node.lineLoc.line, node.lineLoc.column, node.lineLoc.line+1, node.lineLoc.column2);
			this.surface.scrollToLine(node.lineLoc.line);
		},

		mouseMove: function(event, line, column) { // callback
			if (this.highlightingEnabled) {
				var node = this.tree.getNodeByLine(line);
				if (node !== this.currentHighlightNode) {
					this.currentHighlightNode = node;
					this.tree.clearHooks();
					if (node !== null) {
						this.tree.addHookBeforeNode(node, $.proxy(this.startHighlighting, this));
						this.tree.addHookAfterNode(node, $.proxy(this.stopHighlighting, this));
						var line1 = node.blockLoc.line, line2 = node.blockLoc.line2;
						console.log(this.code.blockToRightColumn(line1, line2));
						this.surface.showHighlight(line1, this.code.blockToLeftColumn(line1, line2), line2+1, this.code.blockToRightColumn(line1, line2));
					} else {
						this.surface.hideHighlight();
					}
					this.run();
				}
			}
		},

		mouseLeave: function(event) { //callback
			if (this.highlightingEnabled) {
				this.currentHighlightNode = null;
				this.tree.clearHooks();
				this.surface.hideHighlight();
				this.run();
			}
		},

		startHighlighting: function(node, scope) { // callback
			this.callOutputs('startHighlighting');
		},

		stopHighlighting: function(node, scope) { // callback
			this.callOutputs('stopHighlighting');
		}
		
	};
};

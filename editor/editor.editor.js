/*jshint node:true jquery:true*/
"use strict";

var clayer = require('../clayer');


module.exports = function(editor) {
	editor.Editor = function() { return this.init.apply(this, arguments); };

	editor.Editor.prototype = {
		init: function(language, $div, $toolbar) {
			this.language = language;
			this.surface = new editor.Surface($div, this);
			this.toolbar = new editor.Toolbar($toolbar, this);
			this.outputs = [];
			this.runner = new language.StaticRunner();

			this.editables = [];
			this.editablesByLine = [];
			this.editablesEnabled = false;

			this.highlightingEnabled = false;
			this.highlightLine = 0;
			this.currentHighlightNode = null;

			this.autoCompletionEnabled = false;

			this.updateTimeout = null;
			this.runTimeout = null;

			this.textChangeCallback = function(){};

			this.setText('');
		},

		remove: function() {
			this.removeEditables();
			this.surface.remove();
			this.toolbar.remove();
		},

		getText: function() {
			return this.code.text;
		},

		setText: function(text) {
			this.surface.setText(text);
			this.surface.resetCursor();
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

		setTextChangeCallback: function(callback) {
			this.textChangeCallback = callback;
		},

		removeOutput: function(output) {
			var index = this.outputs.indexOf(output);
			if (index >= 0) {
				this.outputs.splice(index, 1);
			}
		},

		callOutputs: function(funcName) {
			for (var i=0; i<this.outputs.length; i++) {
				this.outputs[i][funcName]();
			}
		},

		delayedUpdate: function() {
			this.code = new editor.Code(this.surface.getText());
			if (this.updateTimeout === null) {
				this.updateTimeout = setTimeout($.proxy(this.update, this), 5);
			}
		},

		update: function() {
			this.updateTimeout = null;
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
				this.toolbar.criticalError();
			} else {
				if (this.highlightingEnabled) {
					this.refreshHighlights();
				}
				this.run();
			}
			this.textChangeCallback(this.code.text);
		},

		delayedRun: function() {
			if (this.runTimeout === null) {
				this.runTimeout = setTimeout($.proxy(this.run, this), 5);
			}
		},

		run: function() {
			this.runTimeout = null;
			this.callOutputs('startRun');
			this.runner.newTree(this.tree);
			this.runner.run();
			//this.callOutputs('endRun');
			this.handleRunnerOutput();
		},

		restart: function() {
			if (!this.tree.hasError() && !this.autoCompletionEnabled) {
				this.runner.restart();
				this.run();
			}
		},

		stepForward: function() {
			if (!this.tree.hasError() && !this.autoCompletionEnabled) {
				if (!this.runner.isStepping()) {
					this.surface.openStepMessage();
				}
				this.callOutputs('startRun');
				this.runner.stepForward();
				//this.callOutputs('endRun');
				this.handleRunnerOutput();
			}
		},

		stepBackward: function() {
			if (!this.tree.hasError() && !this.autoCompletionEnabled) {
				this.callOutputs('startRun');
				this.runner.stepBackward();
				//this.callOutputs('endRun');
				this.handleRunnerOutput();
			}
		},

		handleRunnerOutput: function() {
			this.surface.hideAutoCompleteBox();
			if (this.runner.hasError()) {
				this.handleError(this.runner.getError());
				if (this.runner.isStepping()) {
					this.toolbar.steppingWithError();
				} else {
					this.toolbar.runningWithError();
				}
				this.callOutputs('endRun');
			} else {
				this.handleMessages(this.runner.getMessages());
				if (this.runner.isStepping()) {
					this.toolbar.steppingWithoutError();
					this.callOutputs('endRunStepping');
				} else {
					this.toolbar.runningWithoutError();
					this.callOutputs('endRun');
				}
			}
		},

		handleError: function(error) {
			this.surface.hideStepMessage();
			this.surface.hideAutoCompleteBox();
			this.surface.showErrorMessage(error);
			this.callOutputs('hasError');
		},

		handleMessages: function(messages) {
			this.surface.hideErrorMessage();
			var shown = false;
			for (var i=0; i<messages.length; i++) {
				if (messages[i].type === 'Inline') {
					this.surface.showStepMessage(messages[i]);
					shown = true;
				}
			}
			if (!shown) {
				this.surface.hideStepMessage();
			}
		},

		userChangedText: function() { // callback
			this.update(); // refreshEditables uses this.tree
			if (this.editablesEnabled) {
				this.refreshEditables();
			}
			//window.localStorage.setItem('1', this.code.text);
		},

		outputRequestsRerun: function() { //callback
			if (!this.tree.hasError()) {
				this.delayedRun();
				return true;
			} else {
				return false;
			}
		},

		getContentLines: function() {
			return this.tree.getNodeLines();
		},

		/// EDITABLES METHODS AND CALLBACKS ///
		enableEditables: function() {
			if (!this.tree.hasError() && !this.autoCompletionEnabled) {
				this.editablesEnabled = true;
				this.toolbar.editablesEnabled();
				this.refreshEditables();
			}
		},

		disableEditables: function() {
			this.removeEditables();
			this.editablesEnabled = false;
			this.toolbar.editablesDisabled();
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
			if (this.editablesByLine[line] === undefined) return;

			var offset1 = this.code.lineColumnToOffset(line, column), offset2 = this.code.lineColumnToOffset(line, column2);
			this.surface.setText(this.code.replaceOffsetRange(offset1, offset2, newText));

			var changeOffset = newText.length - (column2-column);
			if (changeOffset !== 0) {
				for (var i=0; i<this.editablesByLine[line].length; i++) {
					this.editablesByLine[line][i].offsetColumn(column, changeOffset);
				}
			}
			this.delayedUpdate();
			this.surface.restoreCursor(offset2, changeOffset);
		},

		/// HIGHLIGHTING METHODS AND CALLBACKS ///
		enableHighlighting: function() {
			if (!this.tree.hasError() && !this.autoCompletionEnabled) {
				this.surface.enableMouse();
				this.surface.enableHighlighting();
				this.highlightingEnabled = true;
				this.toolbar.highlightingEnabled();
				this.callOutputs('enableHighlighting');
			}
		},

		disableHighlighting: function() {
			this.tree.clearHooks();
			this.highlightLine = 0;
			this.currentHighlightNode = null;
			this.surface.disableMouse();
			this.surface.disableHighlighting();
			this.highlightingEnabled = false;
			this.toolbar.highLightingDisabled();
			this.callOutputs('disableHighlighting');
		},

		highlightNode: function(node) { // callback
			if (node !== null) {
				this.surface.showHighlight(node.lineLoc.line, node.lineLoc.column, node.lineLoc.line+1, node.lineLoc.column2);
				this.surface.scrollToLine(node.lineLoc.line);
			} else {
				this.surface.hideHighlight();
			}
		},

		highlightSingleLine: function(line) {
			if (line === null) {
				this.highlightNode(null);
			} else {
				this.highlightNode(this.tree.getNodeByLine(line));
			}
		},

		// internal method; return whether or not a rerun is required
		refreshHighlights: function() {
			var node = this.tree.getNodeByLine(this.highlightLine);

			if (node !== this.currentHighlightNode) {
				this.currentHighlightNode = node;
				this.tree.clearHooks();
				if (node !== null) {
					this.tree.addHookBeforeNode(node, $.proxy(this.startHighlighting, this));
					this.tree.addHookAfterNode(node, $.proxy(this.stopHighlighting, this));
					var line1 = node.blockLoc.line, line2 = node.blockLoc.line2;
					this.surface.showHighlight(line1, this.code.blockToLeftColumn(line1, line2), line2+1, this.code.blockToRightColumn(line1, line2));
				} else {
					this.surface.hideHighlight();
				}
				return true;
			} else {
				return false;
			}
		},

		mouseMove: function(event, line, column) { // callback
			if (this.highlightingEnabled) {
				this.highlightLine = line;
				if (this.refreshHighlights()) {
					this.delayedRun();
				}
			}
		},

		mouseLeave: function(event) { //callback
			if (this.highlightingEnabled) {
				this.highlightLine = 0;
				if (this.refreshHighlights()) {
					this.delayedRun();
				}
			}
		},

		startHighlighting: function(node, scope) { // callback
			this.callOutputs('startHighlighting');
		},

		stopHighlighting: function(node, scope) { // callback
			this.callOutputs('stopHighlighting');
		},

		/// KEYBOARD CALLBACKS ///
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

				this.surface.setText(newText);
				this.surface.restoreCursorRange(totalOffset1, totalOffset2);
				
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
					this.surface.restoreCursor(startOffset, spaces);
				}
			}
		},

		autoComplete: function(event, offset) { // callback
			// 190 == ., 48-90 == alpha-num, 8 == backspace
			if (event.keyCode === 190 || (event.keyCode >= 48 && event.keyCode <= 90) || event.keyCode === 8) {
				this.code = new editor.Code(this.surface.getText());
				var pos = this.code.offsetToLoc(offset);
				if (pos.line > 0) {
					var line = this.code.getLine(pos.line);
					var match = /([A-Za-z][A-Za-z0-9]*[.])+([A-Za-z][A-Za-z0-9]*)?$/.exec(line.substring(0, pos.column));
					if (match !== null) {
						var examples = this.runner.getExamples(match[0]);
						if (examples !== null) {
							var addSemicolon = line.substring(pos.column).replace(' ', '').length <= 0;
							this.surface.showAutoCompleteBox(pos.line, pos.column-examples.width, offset-examples.width, examples, addSemicolon);
							return;
						}
					}
				}
			}
			this.disableAutoCompletion();
		},

		previewExample: function(offset1, offset2, example) { // callback
			this.autoCompletionEnabled = true;
			if (this.editablesEnabled) {
				this.disableEditables();
			}
			if (this.highlightingEnabled) {
				this.disableHighlighting();
			}

			var text = this.surface.getText();
			this.tree = new this.language.Tree(text.substring(0, offset1) + example + text.substring(offset2));
			if (!this.tree.hasError()) {
				this.runner.restart();
				this.callOutputs('startRun');
				this.runner.newTree(this.tree);
				this.runner.run();
				this.callOutputs('endRun');
			}
			
			this.toolbar.previewing();
		},

		insertExample: function(offset1, offset2, example) { // callback
			if (this.autoCompletionEnabled) {
				var text = this.surface.getText();
				this.surface.setText(text.substring(0, offset1) + example + text.substring(offset2));
				this.surface.setCursor(offset1 + example.length, offset1 + example.length);
				this.disableAutoCompletion();
			}
		},

		disableAutoCompletion: function() {
			if (this.autoCompletionEnabled) {
				this.autoCompletionEnabled = false;
				this.delayedUpdate();
			}
		}
	};
};

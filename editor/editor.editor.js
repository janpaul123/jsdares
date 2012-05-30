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
			this.scope = {};
			this.outputs = [];
			this.inputs = [];
			this.updateRunner();

			this.editables = [];
			this.editablesByLine = [];
			this.editablesEnabled = false;

			this.highlightingEnabled = false;

			this.autoCompletionEnabled = false;

			this.updateTimeout = null;
			this.runTimeout = null;

			this.textChangeCallback = function(){};

			this.setText('');
		},

		updateRunner: function() {
			this.runner = new this.language.Runner(this, this.scope, this.outputs, this.inputs);
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
			this.scope = scope;
			this.updateRunner();
			if (!this.tree.hasError()) {
				this.run();
			}
		},

		addOutput: function(output) {
			this.outputs.push(output);
			this.updateRunner();
			if (!this.tree.hasError()) {
				this.run();
			}
		},

		addInput: function(input) {
			this.inputs.push(input);
			this.updateRunner();
			if (!this.tree.hasError()) {
				this.run();
			}
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
				if (this.outputs[i][funcName] !== undefined) {
					this.outputs[i][funcName].apply(this.outputs[i], [].slice.call(arguments, 1));
				}
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
			if (this.code.hasError()) {
				this.handleCriticalError(this.code.getError());
			} else {
				this.tree = new this.language.Tree(this.code.text);
				if (this.tree.hasError()) {
					this.handleCriticalError(this.tree.getError());
				} else {
					if (this.highlightingEnabled) {
						this.refreshHighlights();
					}
					this.run();
				}
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
			this.runner.newTree(this.tree);
		},

		runTemp: function(text) {
			this.tree = new this.language.Tree(text);
			if (!this.code.hasError() && !this.tree.hasError()) {
				this.runner.newTree(this.tree);
			}
		},

		hasCriticalError: function() {
			return this.code.hasError() || this.tree.hasError();
		},

		canRun: function() {
			return !this.hasCriticalError() && !this.autoCompletionEnabled;
		},

		updateRunnerOutput: function() { // callback
			if (!this.autoCompletionEnabled) {
				this.refreshRunnerOutput();
			}
		},

		refreshRunnerOutput: function() {
			this.surface.hideAutoCompleteBox();
			if (this.runner !== undefined) {
				if (this.runner.hasError()) {
					this.handleError(this.runner.getError());
				} else {
					this.handleMessages(this.runner.getMessages());
				}
				this.toolbar.update();
			}
		},

		makeMessageLoc: function(message) {
			var loc = {};
			if (message.loc.line2 !== undefined) {
				loc.line = message.loc.line;
				loc.line2 = message.loc.line2+1;
				loc.column = this.code.blockToLeftColumn(message.loc.line, message.loc.line2);
				loc.column2 = this.code.blockToRightColumn(message.loc.line, message.loc.line2);
			} else {
				loc.line = message.loc.line;
				loc.line2 = message.loc.line+1;
				loc.column = message.loc.column;
				loc.column2 = message.loc.column2 || message.loc.column;
			}
			return loc;
		},

		handleCriticalError: function(error) {
			if (this.editablesEnabled) {
				this.disableEditables();
			}
			if (this.highlightingEnabled) {
				this.disableHighlighting();
			}
			this.handleError(error);
		},

		handleError: function(error) {
			this.surface.hideStepMessage();
			this.surface.hideAutoCompleteBox();
			this.surface.showErrorMessage(this.makeMessageLoc(error), error.getHTML());
			this.callOutputs('outputSetError', true);
		},

		handleMessages: function(messages) {
			this.callOutputs('outputSetError', false);
			this.surface.hideErrorMessage();
			var shown = false;
			for (var i=0; i<messages.length; i++) {
				if (messages[i].type === 'Inline') {
					this.surface.showStepMessage(this.makeMessageLoc(messages[i]), messages[i].getHTML());
					shown = true;
					// this.callOutputs('setCallNr', this.runner.getContext(), messages[i].callNr);
				}
			}
			if (!shown) {
				this.surface.hideStepMessage();
				// this.callOutputs('setCallNr', this.runner.getContext(), Infinity);
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
			if (this.code.hasError()) {
				this.handleError(this.code.getError());
				return false;
			} else {
				if (this.tree.hasError()) {
					this.handleError(this.tree.getError());
					return false;
				} else {
					this.delayedRun();
					return true;
				}
			}
		},

		getContentLines: function() {
			return this.tree.getNodeLines();
		},

		/// EDITABLES METHODS AND CALLBACKS ///
		enableEditables: function() {
			if (this.canRun()) {
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
			if (this.canRun()) {
				this.surface.enableMouse();
				this.surface.enableHighlighting();
				this.highlightingEnabled = true;
				this.toolbar.highlightingEnabled();
				this.callOutputs('enableHighlighting');
			}
		},

		disableHighlighting: function() {
			this.currentHighlightNode = null;
			this.currentHighlightLine = 0;
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

		highlightNodes: function(nodes) { // callback
			this.surface.removeHighlights();
			for (var i=0; i<nodes.length; i++) {
				var node = nodes[i];
				this.surface.addHighlight(node.lineLoc.line, node.lineLoc.column, node.lineLoc.line+1, node.lineLoc.column2);
			}
		},

		highlightContentLine: function(line) { // used for dare line count
			if (line === null) {
				this.highlightNode(null);
			} else {
				this.highlightNode(this.tree.getNodeByLine(line));
			}
		},

		// internal method
		refreshHighlights: function() {
			var node = this.tree.getNodeByLine(this.currentHighlightLine);
			
			if (node !== this.currentHighlightNode) {
				this.currentHighlightNode = node;
				if (node !== null) {
					var line1 = node.blockLoc.line, line2 = node.blockLoc.line2;
					this.surface.showHighlight(line1, this.code.blockToLeftColumn(line1, line2), line2+1, this.code.blockToRightColumn(line1, line2));
					this.callOutputs('highlightCalls', this.runner.getContext().getCallsByRange(line1, line2));
					this.callOutputs('highlightCodeLine', node.lineLoc.line);
				} else {
					this.surface.hideHighlight();
					this.callOutputs('highlightCalls', []);
					this.callOutputs('highlightCodeLine', 0);
				}
			}
		},

		mouseMove: function(event, line, column) { // callback
			if (this.highlightingEnabled && this.currentHighlightLine !== line) {
				this.currentHighlightLine = line;
				this.refreshHighlights();
			}
		},

		mouseLeave: function(event) { //callback
			if (this.highlightingEnabled) {
				this.currentHighlightLine = 0;
				this.refreshHighlights();
			}
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
						if (i === pos1.line) totalOffset1 -= Math.min(spaces, pos1.column);
						if (i === pos2.line) {
							totalOffset2 -= Math.min(spaces, pos2.column);
						} else {
							totalOffset2 -= spaces;
						}
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
			this.runTemp(text.substring(0, offset1) + example + text.substring(offset2));
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
		},


		addEvent: function(funcName, args) {
			return this.runner.addEvent(funcName, args);
		}
	};
};

/*jshint node:true jquery:true*/
"use strict";

var clayer = require('../clayer');


module.exports = function(editor) {
	editor.Editor = function() { return this.init.apply(this, arguments); };

	editor.Editor.prototype = {
		init: function(options, language, $div, $toolbar, $stepbar) {
			this.language = language;
			this.eventHandlers = [];

			this.surface = new editor.Surface($div, this);

			if (options.hideToolbar) {
				$toolbar.hide();
				this.toolbar = null;
			} else {
				$toolbar.show();
				this.toolbar = new editor.Toolbar($toolbar, this);
			}

			if (options.hideStepbar) {
				$stepbar.hide();
				this.stepbar = null;
			} else {
				$stepbar.show();
				this.stepbar = new editor.Stepbar($stepbar, this);
			}

			this.currentEditableLine = 0;
			this.previousEditableLine = 0;
			this.editables = [];
			this.editablesByLine = [];

			this.highlighting = false;
			this.currentHighlightNode = null;
			this.currentHighlightLine = 0;
			this.surface.enableMouse();

			this.activeTimeHighlights = [];

			this.autoCompletionEnabled = false;

			this.updateTimeout = null;

			this.runner = null;
			this.textChangeCallback = function(){};

			this.surface.setText(options.text || '');
		},

		remove: function() {
			this.removeEditables();
			this.surface.remove();
			this.toolbar.remove();
			this.stepbar.remove();
		},

		updateSettings: function(runner, outputs) {
			this.runner = runner;
			this.outputs = outputs;
			this.update();
			this.refreshEditables();
		},

		getText: function() {
			return this.code.text;
		},

		setText: function(text) {
			this.surface.setText(text);
			this.surface.resetCursor();
			this.update();
			this.refreshEditables();
		},

		setTextChangeCallback: function(callback) {
			this.textChangeCallback = callback;
		},

		bindEventHandler: function(eventHandler) {
			this.eventHandlers.push(eventHandler);
		},

		callEventHandlers: function(funcName) {
			for (var i=0; i<this.eventHandlers.length; i++) {
				var eventHandler = this.eventHandlers[i];
				eventHandler[funcName].apply(eventHandler, [].slice.call(arguments, 1));
			}
		},

		callOutputs: function(funcName) {
			for (var outputName in this.outputs) {
				if (this.outputs[outputName][funcName] !== undefined) {
					this.outputs[outputName][funcName].apply(this.outputs[outputName], [].slice.call(arguments, 1));
				}
			}
		},

		enable: function() {
			this.surface.enable();
			this.update();
		},

		disable: function() {
			this.surface.hideAutoCompleteBox();
			this.update();
			this.runner.disable();
			this.callEventHandlers('disable');
			this.surface.disable();
		},

		delayedUpdate: function() {
			this.code = new editor.Code(this.surface.getText());
			if (this.updateTimeout === null) {
				this.updateTimeout = setTimeout(_(this.update).bind(this), 5);
			}
		},

		update: function() {
			if (this.updateTimeout !== null) {
				clearTimeout(this.updateTimeout);
				this.updateTimeout = null;
			}
			this.code = new editor.Code(this.surface.getText());
			this.tree = new this.language.Tree(this.code.text);
			if (this.tree.hasError()) {
				this.handleCriticalError(this.tree.getError());
			} else {
				this.run();
			}
		},

		run: function() {
			this.runner.enable();
			this.runner.newTree(this.tree);
			this.updateHighlighting();
		},

		runTemp: function(text) {
			this.tree = new this.language.Tree(text);
			if (!this.tree.hasError()) {
				this.runner.newTree(this.tree);
				this.updateHighlighting();
				this.refreshEditables();
				return true;
			} else {
				this.callOutputs('outputSetError', true);
				return false;
			}
		},

		canRun: function() {
			return !this.tree.hasError() && !this.autoCompletionEnabled;
		},

		canHighlight: function() {
			return this.canRun() && this.runner.isStatic();
		},

		canHighlightTime: function() {
			return this.runner && this.runner.isInteractive() && this.canHighlight();
		},

		canShowEditables: function() {
			return this.canRun();
		},

		handleCriticalError: function(error) {
			this.handleError(error);
			this.runner.disable();
			this.callEventHandlers('disable');
			this.updateHighlighting();
			this.updateEditables();
			this.highlightFunctionNode(null);
			this.callOutputs('outputSetError', true);
		},

		handleError: function(error) {
			this.surface.hideAutoCompleteBox();
			this.surface.showMessage('error', this.makeMessageLoc(error), error.getHTML());
		},

		makeMessageLoc: function(message) {
			return this.makeLoc(message.getLoc(this.tree));
		},

		makeLoc: function(loc) {
			var output = {};
			if (loc.line2 !== undefined) {
				output.line = loc.line;
				output.line2 = loc.line2+1;
				output.column = this.code.blockToLeftColumn(loc.line, loc.line2);
				output.column2 = this.code.blockToRightColumn(loc.line, loc.line2);
			} else {
				output.line = loc.line;
				output.line2 = loc.line+1;
				output.column = loc.column;
				output.column2 = loc.column2 || loc.column;
			}
			return output;
		},

		callTextChangeCallback: function() {
			this.textChangeCallback(this.code.text);
		},

		scrollToError: function() { // callback
			this.handleError(this.runner.getError());
			this.surface.scrollToLine(this.runner.getError().getLoc(this.tree).line);
		},

		userChangedText: function() { // callback
			this.update(); // refreshEditables uses this.tree
			this.refreshEditables();
			this.callTextChangeCallback();
		},

		outputRequestsRerun: function() { //callback
			if (this.canRun()) {
				this.runner.selectBaseEvent();
				return true;
			} else {
				return false;
			}
		},

		getContentLines: function() {
			return this.tree.getNodeLines();
		},

		/// RUNNER CALLBACKS ///
		startEvent: function(context) {
			this.callOutputs('outputStartEvent', context);
		},

		endEvent: function(context) {
			this.callOutputs('outputEndEvent', context);
		},

		clearReload: function() {
			this.callOutputs('outputClearReload');
		},

		clearAllEvents: function() {
			this.callOutputs('outputClearAllEvents');
		},

		popFirstEvent: function() {
			this.callOutputs('outputPopFirstEvent');
		},

		clearEventsToEnd: function() {
			this.callOutputs('outputClearEventsToEnd');
		},

		clearEventsFrom: function(context) {
			this.callOutputs('outputClearEventsFrom', context);
		},

		runnerChanged: function() { // runner callback
			if (!this.autoCompletionEnabled) {
				this.surface.hideAutoCompleteBox();
				if (this.runner.isStepping()) {
					var message = this.runner.getMessage();
					if (message !== null) {
						this.surface.showMessage(message.type.toLowerCase(), this.makeMessageLoc(message), message.getHTML());
						if (this.runner.getEventNum() !== this.lastEventNum || this.runner.getStepNum() !== this.lastStepNum) {
							this.surface.scrollToLine(message.getLoc(this.tree).line);
						}
					}
					this.lastEventNum = this.runner.getEventNum();
					this.lastStepNum = this.runner.getStepNum();
				} else {
					this.lastEventNum = undefined;
					this.lastStepNum = undefined;
					if (this.runner.hasError()) {
						this.handleError(this.runner.getError());
					} else {
						this.surface.hideMessage();
					}
				}
				this.callEventHandlers('update', this.runner);
			}
			this.callOutputs('outputSetError', this.runner.hasError());
			this.updateHighlighting();
			this.updateEditables();
			this.callOutputs('outputSetEventStep', this.runner.getEventNum(), this.runner.getStepNum());
		},

		runnerChangedEvent: function() {
			this.callOutputs('outputSetEventStep', this.runner.getEventNum(), this.runner.getStepNum());
		},

		/// EDITABLES METHODS AND CALLBACKS ///
		refreshEditables: function() {
			if (this.canShowEditables()) {
				this.removeEditables();
				this.editables = this.language.editor.editables.generate(this.tree, editor.editables, this.surface, this);
				for (var i=0; i<this.editables.length; i++) {
					var line = this.editables[i].loc.line;
					if (this.editablesByLine[line] === undefined) {
						this.editablesByLine[line] = [];
					}
					this.editablesByLine[line].push(this.editables[i]);
				}
				this.updateEditables();
			} else {
				this.removeEditables();
			}
		},

		removeEditables: function() {
			for (var i=0; i<this.editables.length; i++) {
				this.editables[i].remove();
			}
			this.editables = [];
			this.editablesByLine = [];
			this.previousEditableLine = 0;
		},

		updateEditables: function() {
			if (this.canShowEditables()) {
				if (this.currentEditableLine !== this.previousEditableLine) {
					this.hideEditables(this.previousEditableLine);
					this.previousEditableLine = this.currentEditableLine;
					if (this.editablesByLine[this.currentEditableLine]) {
						for (var i=0; i<this.editablesByLine[this.currentEditableLine].length; i++) {
							this.editablesByLine[this.currentEditableLine][i].show();
						}
					}
				}
			} else if (this.previousEditableLine > 0) {
				this.hideEditables(this.previousEditableLine);
				this.previousEditableLine = 0;
			}
		},

		hideEditables: function(line) {
			if (this.editablesByLine[line]) {
				for (var i=0; i<this.editablesByLine[line].length; i++) {
					this.editablesByLine[line][i].hide();
				}
			}
		},

		getEditablesText: function(node) { //callback
			return this.code.rangeToText(node.textLoc);
		},

		editableReplaceCode: function(line, column, column2, newText) { // callback
			if (this.editablesByLine[line] === undefined) return;

			var offset1 = this.code.lineColumnToOffset(line, column), 
				offset2 = this.code.lineColumnToOffset(line, column2);

			this.surface.setText(this.code.replaceOffsetRange(offset1, offset2, newText));

			var changeOffset = newText.length - (column2-column);
			if (changeOffset !== 0) {
				for (var i=0; i<this.editablesByLine[line].length; i++) {
					this.editablesByLine[line][i].offsetColumn(column, changeOffset);
				}
			}
			this.delayedUpdate();
			this.surface.restoreCursor(offset2, changeOffset);
			this.callTextChangeCallback();
		},

		/// HIGHLIGHTING METHODS AND CALLBACKS ///
		updateHighlighting: function() {
			if (this.canHighlight()) {
				this.highlighting = true;
				var node = this.tree.getNodeByLine(this.currentHighlightLine);
				if (node !== this.currentHighlightNode) {
					this.currentHighlightNode = node;
					if (node !== null) {
						this.surface.showHighlight(this.makeLoc(node.blockLoc));
						var nodeIds = this.tree.getNodeIdsByRange(node.blockLoc.line, node.blockLoc.line2);
						this.callOutputs('highlightNodes', nodeIds);
						this.callOutputs('highlightCallIds', this.runner.getCallIdsByNodeIds(nodeIds));
					} else {
						this.surface.hideHighlight();
						this.callOutputs('highlightNodes', null);
						this.callOutputs('highlightCallIds', null);
					}
				}
				this.updateTimeHighlighting();
				this.callOutputs('enableHighlighting'); // don't check for !this.highlighting, but always call this
			} else if (this.highlighting) {
				this.highlighting = false;
				this.surface.hideTimeHighlights();
				this.surface.hideHighlight();
				this.callOutputs('disableHighlighting');
				this.currentHighlightNode = null;
				// this.currentHighlightLine = 0;
			}
		},

		// *only* call from updateHighlighting!!
		updateTimeHighlighting: function() {
			if (this.canHighlightTime()) {
				var timeHighlights = this.language.editor.timeHighlights.getTimeHighlights(this.tree);
				for (var i=0; i<this.activeTimeHighlights.length; i++) {
					if (timeHighlights[this.activeTimeHighlights[i]] === undefined) {
						this.activeTimeHighlights.splice(i--, 1);
					}
				}
				this.surface.showTimeHighlights(timeHighlights);
				this.updateActiveTimeHighlights();
			} else {
				this.surface.hideTimeHighlights();
				this.callOutputs('highlightTimeIds', null);
			}
		},

		updateActiveTimeHighlights: function() {
			if (this.activeTimeHighlights.length > 0) {
				var timeIds = [];
				var size = this.runner.getEventTotal();
				for (var i=0; i<size; i++) {
					timeIds[i] = [];
				}
				var highlightsFromTree = this.language.editor.timeHighlights.getTimeHighlights(this.tree);

				for (i=0; i<this.activeTimeHighlights.length; i++) {
					var timeHighlight = highlightsFromTree[this.activeTimeHighlights[i]];
					var nodeIds = this.tree.getNodeIdsByRange(timeHighlight.line, timeHighlight.line2);
					var idsPerContext = this.runner.getAllCallIdsByNodeIds(nodeIds);
					for (var j=0; j<idsPerContext.length; j++) {
						for (var k=0; k<idsPerContext[j].length; k++) {
							if (timeIds[j].indexOf(idsPerContext[j][k]) < 0) {
								timeIds[j].push(idsPerContext[j][k]);
							}
						}
					}
				}
				this.callOutputs('highlightTimeIds', timeIds);
			} else {
				this.callOutputs('highlightTimeIds', null);
			}
		},

		timeHighlightHover: function(name) {
		},

		timeHighlightActivate: function(name) {
			this.activeTimeHighlights.push(name);
			this.updateActiveTimeHighlights();
			this.callOutputs('enableHighlighting');
		},
		
		timeHighlightDeactivate: function(name) {
			var position = -1;
			for (var i=0; i<this.activeTimeHighlights.length; i++) {
				if (this.activeTimeHighlights[i] === name) {
					position = i;
					break;
				}
			}

			if (position > -1) {
				this.activeTimeHighlights.splice(position, 1);
				this.updateActiveTimeHighlights();
				this.callOutputs('enableHighlighting');
			}
		},

		highlightNode: function(node) { // callback
			if (node !== null) {
				this.surface.showHighlight(this.makeLoc(node.lineLoc));
				this.surface.scrollToLine(node.lineLoc.line);
			} else {
				this.surface.hideHighlight();
			}
		},

		highlightNodeId: function(nodeId) { // callback
			this.highlightNode(this.tree.getNodeById(nodeId));
		},

		highlightNodeIds: function(nodeIds) { // callback
			this.surface.removeHighlights();
			for (var i=0; i<nodeIds.length; i++) {
				var node = this.tree.getNodeById(nodeIds[i]);
				this.surface.addHighlight(this.makeLoc(node.lineLoc));
			}
		},

		highlightContentLine: function(line) { // used for dare line count
			if (line === null) {
				this.highlightNode(null);
			} else {
				this.highlightNode(this.tree.getNodeByLine(line));
			}
		},

		highlightFunctionNode: function(node, scroll) { // toolbar callback
			if (node === null) {
				this.surface.hideFunctionHighlight();
				this.callOutputs('disableEventHighlighting');
			} else {
				this.surface.showFunctionHighlight(this.makeLoc(node.blockLoc));
				if (scroll) {
					this.surface.scrollToLine(node.blockLoc.line);
				}
				this.callOutputs('enableEventHighlighting');
			}
		},

		// internal method
		mouseMove: function(event, line, column) { // callback
			if (column < -1) {
				line = 0;
			}
			if (this.currentHighlightLine !== line) {
				this.currentHighlightLine = line;
				this.updateHighlighting();
			}
			if (this.currentEditableLine !== line) {
				this.currentEditableLine = line;
				this.updateEditables();
			}
		},

		mouseLeave: function(event) { //callback
			this.currentHighlightLine = 0;
			this.updateHighlighting();
			this.currentEditableLine = 0;
			this.updateEditables();
		},

		/// KEYBOARD CALLBACKS ///
		tabIndent: function(event, offset1, offset2) { // callback
			// 9 == TAB
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
			// undefined: click event, 48-90 == alpha-num, 190 == ., 8 == backspace
			if (event.keyCode === undefined || (event.keyCode >= 48 && event.keyCode <= 90) || [190, 8].indexOf(event.keyCode) >= 0) {
				this.code = new editor.Code(this.surface.getText());
				var pos = this.code.offsetToLoc(offset);
				if (pos.line > 0) {
					var line = this.code.getLine(pos.line);
					var match = /([A-Za-z][A-Za-z0-9]*[.])+([A-Za-z][A-Za-z0-9]*)?$/.exec(line.substring(0, pos.column));
					if (match !== null) {
						var examples = this.runner.getExamples(match[0]);
						if (examples !== null) {
							this.autoCompletionEnabled = true;
							this.surface.showAutoCompleteBox(pos.line, pos.column-examples.width, offset-examples.width, examples);
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

			var text = this.surface.getText();
			this.runTemp(text.substring(0, offset1) + example + text.substring(offset2));
		},

		insertExample: function(offset1, offset2, example) { // callback
			if (this.autoCompletionEnabled) {
				var text = this.surface.getText();
				this.surface.setText(text.substring(0, offset1) + example + text.substring(offset2));
				this.surface.setCursor(offset1 + example.length, offset1 + example.length);
				this.disableAutoCompletion();
				this.refreshEditables();
				this.callTextChangeCallback();
			}
		},

		disableAutoCompletion: function() { // callback
			if (this.autoCompletionEnabled) {
				this.autoCompletionEnabled = false;
				this.surface.hideAutoCompleteBox();
				this.update();
				this.refreshEditables();
			}
		},

		addEvent: function(type, funcName, args) {
			return this.runner.addEvent(type, funcName, args);
		},

		makeInteractive: function(signature) {
			this.runner.makeInteractive(signature);
		}
	};
};

/*jshint node:true jquery:true*/
"use strict";

var clayer = require('../clayer');


module.exports = function(editor) {
	editor.Toolbar = function() { return this.init.apply(this, arguments); };

	editor.Toolbar.prototype = {
		init: function($div, ed) {
			this.$div = $div;
			this.editor = ed;

			this.$div.addClass('btn-toolbar editor-toolbar');

			var $stepGroup = $('<div class="btn-group editor-toolbar-step-group"></div>');
			this.$stepBackward = $('<button class="btn btn-success editor-toolbar-step-backward"><i class="icon-arrow-left icon-white"></i></button>');
			this.$stepBackward.click($.proxy(this.editor.stepBackward, this.editor));
			$stepGroup.append(this.$stepBackward);

			this.$stepForward = $('<button class="btn btn-success editor-toolbar-step-forward"><i class="icon-arrow-right icon-white"></i> Step</button>');
			this.$stepForward.click($.proxy(this.editor.stepForward, this.editor));
			$stepGroup.append(this.$stepForward);

			this.$restart = $('<button class="btn btn-success editor-toolbar-restart"><i class="icon-repeat icon-white"></i></button>');
			this.$restart.click($.proxy(this.editor.restart, this.editor));
			$stepGroup.append(this.$restart);
			this.$div.append($stepGroup);

			var isMac = navigator.platform.indexOf("Mac") >= 0;
			var $editHighlightGroup = $('<div class="btn-group editor-toolbar-highlight-group"></div>');
			this.$highlight = $('<button class="btn btn-inverse editor-toolbar-highlight"><i class="icon-screenshot icon-white"></i></button>');
			this.$highlight.tooltip({title: '<strong>ctrl</strong>' + (isMac ? ' or <strong>cmd</strong> (&#8984;)' : ''), placement: 'bottom'});
			this.$highlight.click($.proxy(this.highlight, this));
			$editHighlightGroup.append(this.$highlight);

			this.$edit = $('<button class="btn btn-inverse editor-toolbar-edit"><i class="icon-edit icon-white"></i></button>');
			this.$edit.click($.proxy(this.edit, this));
			this.$edit.tooltip({title: '<strong>alt</strong>' + (isMac ? ' (&#8997;)' : ''), placement: 'bottom'});
			$editHighlightGroup.append(this.$edit);
			this.$div.append($editHighlightGroup);

			this.$checkKeys = $.proxy(this.checkKeys, this);
			this.$keyDown = $.proxy(this.keyDown, this);
			this.$keyUp = $.proxy(this.keyUp, this);
			$(document).on('keydown', this.$keyDown);
			$(document).on('keyup', this.$keyUp);

			this.highlightingKey = false;
			this.editablesKey = false;
		},

		remove: function() {
			this.$stepBackward.remove();
			this.$stepForward.remove();
			this.$restart.remove();
			this.$highlight.remove();
			this.$edit.remove();
			$(document).off('mousemove', this.$checkKeys);
			$(document).off('keydown', this.$keyDown);
			$(document).off('keyup', this.$keyUp);
			this.$div.html('');
			this.$div.removeClass('btn-toolbar editor-toolbar');
		},

		editablesEnabled: function() {
			this.$edit.addClass('active');
		},

		editablesDisabled: function() {
			this.$edit.removeClass('active');
			this.editablesKey = false;
			this.refreshCheckKeys();
		},

		highlightingEnabled: function() {
			this.$highlight.addClass('active');
		},

		highLightingDisabled: function() {
			this.$highlight.removeClass('active');
			this.highlightingKey = false;
			this.refreshCheckKeys();
		},

		previewing: function() {
			this.$stepForward.addClass('disabled');
			this.$stepBackward.addClass('disabled');
			this.$restart.addClass('disabled');
			this.$edit.addClass('disabled');
			this.$highlight.addClass('disabled');
		},

		criticalError: function() {
			this.$stepForward.addClass('disabled');
			this.$stepBackward.addClass('disabled');
			this.$restart.addClass('disabled');
			this.$edit.addClass('disabled');
			this.$highlight.addClass('disabled');
		},

		runningWithoutError: function() {
			this.$stepForward.removeClass('disabled');
			this.$stepBackward.addClass('disabled');
			this.$restart.addClass('disabled');
			this.$edit.removeClass('disabled');
			this.$highlight.removeClass('disabled');
		},

		runningWithError: function() {
			this.$stepForward.removeClass('disabled');
			this.$stepBackward.addClass('disabled');
			this.$restart.addClass('disabled');
			this.$edit.removeClass('disabled');
			this.$highlight.removeClass('disabled');
		},

		steppingWithoutError: function() {
			this.$stepForward.removeClass('disabled');
			this.$stepBackward.removeClass('disabled');
			this.$restart.removeClass('disabled');
			this.$edit.removeClass('disabled');
			this.$highlight.removeClass('disabled');
		},

		steppingWithError: function() {
			this.$stepForward.addClass('disabled');
			this.$stepBackward.removeClass('disabled');
			this.$restart.removeClass('disabled');
			this.$edit.removeClass('disabled');
			this.$highlight.removeClass('disabled');
		},

		refreshCheckKeys: function() {
			if (this.highlightingKey || this.editablesKey) {
				$(document).on('mousemove', this.$checkKeys);
			} else {
				$(document).off('mousemove', this.$checkKeys);
			}
		},

		checkKeys: function(event) {
			if (this.highlightingKey && !(event.ctrlKey || event.metaKey)) {
				this.editor.disableHighlighting();
			}
			if (this.editablesKey && !event.altKey) {
				this.editor.disableEditables();
			}
		},

		keyDown: function(event) {
			// 17 == CTRL, 18 == ALT, (17, 91, 93, 224) == COMMAND
			if ([17, 91, 93, 224].indexOf(event.keyCode) >= 0) {
				this.editor.enableHighlighting();
				this.highlightingKey = true;
				this.refreshCheckKeys();
			} else if (event.keyCode === 18) {
				this.editor.enableEditables();
				this.editablesKey = true;
				this.refreshCheckKeys();
			}
		},

		keyUp: function(event) {
			// 17 == CTRL, 18 == ALT, (17, 91, 93, 224) == COMMAND
			if ([17, 91, 93, 224].indexOf(event.keyCode) >= 0) {
				this.editor.disableHighlighting();
			} else if (event.keyCode === 18) {
				this.editor.disableEditables();
			}
		},

		highlight: function(event) {
			if (this.$highlight.hasClass('active')) this.editor.disableHighlighting();
			else this.editor.enableHighlighting();
		},

		edit: function(event) {
			if (this.$edit.hasClass('active')) this.editor.disableEditables();
			else this.editor.enableEditables();
		}
	};
};

/*jshint node:true jquery:true*/
"use strict";

var shared = require('../shared');
var applet = require('../jsmm-applet');

module.exports = function(dares) {
	dares.Editor = function() { return this.init.apply(this, arguments); };
	dares.Editor.prototype = {
		init: function(delegate, ui, options) {
			this.delegate = delegate;
			this.ui = ui;
			this.options = shared.dares.sanitizeInput(options, shared.dares.dareOptions);

			this.$div = this.ui.addTab('editor');
			this.$div.addClass('dare-editor');

			var $topToolbar = $('<div class="btn-toolbar dare-editor-top-toolbar"></div>');
			this.$div.append($topToolbar);

			var $submitGroup = $('<div class="btn-group dare-editor-submit-group"></div>');
			this.$saveButton = $('<button class="btn btn-primary dare-editor-submit-group-save"><i class="icon icon-white icon-ok"></i> Save</button>');
			this.$saveButton.on('click', this.saveHandler.bind(this));
			$submitGroup.append(this.$saveButton);
			$topToolbar.append($submitGroup);

			/*var $shareGroup = $('<div class="btn-group dare-editor-share-group"></div>');
			this.$publicButton = $('<button class="btn btn-inverse active dare-editor-share-group-public">Public</button>');
			// this.$publicButton.on('click', this.publicHandler.bind(this));
			$shareGroup.append(this.$publicButton);
			this.$privateButton = $('<button class="btn btn-inverse disabled dare-editor-share-group-private">Private <i class="icon icon-white icon-lock"></i></button>');
			// this.$privateButton.on('click', this.privateHandler.bind(this));
			$shareGroup.append(this.$privateButton);
			$shareGroup.tooltip({'title': 'Feature not yet available', placement: 'bottom'});
			$topToolbar.append($shareGroup);*/

			this.$saveSpinner = $('<i class="icon icon-white icon-loader dare-editor-top-toolbar-loader hide"></i>');
			$topToolbar.append(this.$saveSpinner);
			this.$saveError = $('<i class="icon icon-white icon-exclamation-sign-color dare-editor-top-toolbar-error hide"></i>');
			this.$saveError.tooltip({'title': 'Connection error', placement: 'bottom'});
			$topToolbar.append(this.$saveError);

			var $programGroup = $('<div class="btn-group dare-editor-program-group"><div class="dare-editor-program-group-arrow"></div></div>');
			this.$configProgramButton = $('<button class="btn btn-inverse">Config program</button>');
			this.$configProgramButton.tooltip({'title': 'Dare configuration', placement: 'bottom'});
			this.$targetProgramButton = $('<button class="btn btn-inverse">Target program</button>');
			this.$targetProgramButton.tooltip({'title': 'Program that is shown as an example', placement: 'bottom'});
			this.$initialProgramButton = $('<button class="btn btn-inverse">Initial program</button>');
			this.$initialProgramButton.tooltip({'title': 'Initial value of the editor when opening the dare', placement: 'bottom'});
			$programGroup.append(this.$configProgramButton, this.$targetProgramButton, this.$initialProgramButton);
			this.$div.append($programGroup);

			this.$configProgramButton.on('click', (function() {
				this.selectProgram('config');
			}).bind(this));
			this.$targetProgramButton.on('click', (function() {
				this.selectProgram('target');
			}).bind(this));
			this.$initialProgramButton.on('click', (function() {
				this.selectProgram('initial');
			}).bind(this));

			this.$typeGroup = $('<div class="btn-group dare-editor-type-group"></div>');
			this.$div.append(this.$typeGroup);

			this.ui.registerAdditionalObject('editor', this);

			this.editor = this.ui.addEditor(this.options.editor);
			this.editor.setTextChangeCallback(this.textChangeCallback.bind(this));
			
			this.reload();
			this.ui.selectTab('editor');
			this.selectProgram('config');
		},

		remove: function() {
			this.$div.removeClass('dare-editor');
		},

		reload: function() {
			this.ui.removeOutputs();

			if (this.programType === 'config') {
				this.ui.loadOutputs({config: {enabled: true, definition: shared.dares.configDefinition}});
				this.editor.setText(this.options.configProgram);
			} else {
				var config = this.ui.loadConfigProgram(shared.dares.configDefinition, this.options.configProgram, this.options.outputStates);

				if (config) {
					config.outputs.robot.readOnly = false;
					this.ui.loadOutputs(config.outputs);

					var robot = this.ui.getOutput('robot');
					if (robot) {
						robot.setStateChangeCallback(this.robotStateChanged.bind(this));
					}
				} else {
					this.ui.loadOutputs({});
				}

				if (this.programType === 'target') {
					this.editor.setText(this.options.original);
				} else {
					this.editor.setText(this.options.editor.text);
				}
			}
		},

		selectProgram: function(type) {
			if (this.programType !== type) {
				this.programType = type;
				this.$configProgramButton.toggleClass('active', type === 'config');
				this.$targetProgramButton.toggleClass('active', type === 'target');
				this.$initialProgramButton.toggleClass('active', type === 'initial');
				this.reload();
			}
		},

		textChangeCallback: function(text) {
			console.log('callback', this.programType, text);
			if (this.programType === 'config') {
				this.options.configProgram = text;
			} else if (this.programType === 'target') {
				this.options.original = text;
			} else {
				this.options.editor.text = text;
			}
		},

		saveHandler: function() {
			this.$saveSpinner.removeClass('hide');
			this.$saveError.addClass('hide');
			this.delegate.getSync().updateDare(this.options, this.saveSuccessHandler.bind(this), this.saveErrorHandler.bind(this));
		},

		saveSuccessHandler: function() {
			this.$saveSpinner.addClass('hide');
			this.$saveError.addClass('hide');
		},

		saveErrorHandler: function() {
			this.$saveSpinner.addClass('hide');
			this.$saveError.removeClass('hide');
		},

		typeButtonClickHandler: function(event) {
			this.selectDareType($(event.delegateTarget).data('id'));
		},

		robotStateChanged: function(state) {
			this.options.outputStates.robot = state;
		}
	};
};
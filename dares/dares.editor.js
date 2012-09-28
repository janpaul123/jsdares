/*jshint node:true jquery:true*/
"use strict";

var shared = require('../shared');

var matchDareType = {
	RobotGoal: {name: 'robot', icon: 'icon-th', outputs: ['robot', 'global'], tooltip: 'Robot has to visit all the goal squares, in any order'},
	ImageMatch: {name: 'canvas', icon: 'icon-picture', outputs: ['canvas', 'global'], tooltip: 'User has to match the target canvas per pixel'},
	ConsoleMatch: {name: 'console', icon: 'icon-list-alt', outputs: ['console', 'global'], tooltip: 'User has to match the target console per character'}
};

var outputs = {
	global: {editor: 'EditorGlobal', icon: 'icon-wrench', tooltip: 'Global settings'},
	robot: {editor: 'EditorRobot', icon: 'icon-th', tooltip: 'LOGO-style robot environment'},
	canvas: {editor: 'EditorCanvas', icon: 'icon-picture', tooltip: 'HTML5 &lt;canvas&gt; element'},
	console: {editor: 'EditorConsole', icon: 'icon-list-alt', tooltip: 'Text-based console'},
	info: {editor: 'EditorInfo', icon: 'icon-info-sign', tooltip: 'Command documentation and scope visualization'},
	events: {editor: 'EditorEvents', icon: 'icon-play', tooltip: 'Mouse, keyboard, and interval events'},
	math: {editor: 'EditorMath', icon: 'icon-cog', tooltip: 'Javascript Math object'}
};

module.exports = function(dares) {
	dares.Editor = function() { return this.init.apply(this, arguments); };
	dares.Editor.prototype = {
		init: function(delegate, ui, options) {
			this.delegate = delegate;
			this.ui = ui;
			this.options = shared.dares.sanitizeInput(options, shared.dares.dareOptions);

			this.editor = this.ui.addEditor(this.options.editor);
			this.$div = this.ui.addTab('editor');
			this.$div.addClass('dare-editor');
			this.editor.setTextChangeCallback(this.textChangeCallback.bind(this));

			var $topToolbar = $('<div class="btn-toolbar dare-editor-top-toolbar"></div>');
			this.$div.append($topToolbar);

			var $submitGroup = $('<div class="btn-group dare-editor-submit-group"></div>');
			this.$saveButton = $('<button class="btn btn-primary dare-editor-submit-group-save"><i class="icon icon-white icon-ok"></i> Save</button>');
			this.$saveButton.on('click', this.saveHandler.bind(this));
			$submitGroup.append(this.$saveButton);
			$topToolbar.append($submitGroup);

			var $shareGroup = $('<div class="btn-group dare-editor-share-group"></div>');
			this.$publicButton = $('<button class="btn btn-inverse active dare-editor-share-group-public">Public</button>');
			// this.$publicButton.on('click', this.publicHandler.bind(this));
			$shareGroup.append(this.$publicButton);
			this.$privateButton = $('<button class="btn btn-inverse disabled dare-editor-share-group-private">Private <i class="icon icon-white icon-lock"></i></button>');
			// this.$privateButton.on('click', this.privateHandler.bind(this));
			$shareGroup.append(this.$privateButton);
			$shareGroup.tooltip({'title': 'Feature not yet available', placement: 'bottom'});
			$topToolbar.append($shareGroup);

			this.$saveSpinner = $('<i class="icon icon-white icon-loader dare-editor-top-toolbar-loader hide"></i>');
			$topToolbar.append(this.$saveSpinner);
			this.$saveError = $('<i class="icon icon-white icon-exclamation-sign-color dare-editor-top-toolbar-error hide"></i>');
			this.$saveError.tooltip({'title': 'Connection error', placement: 'bottom'});
			$topToolbar.append(this.$saveError);

			var $programGroup = $('<div class="btn-group dare-editor-program-group"><div class="dare-editor-program-group-arrow"></div></div>');
			this.$targetProgramButton = $('<button class="btn btn-inverse">Target program</button>');
			this.$targetProgramButton.tooltip({'title': 'Program that is shown as an example', placement: 'bottom'});
			this.$initialProgramButton = $('<button class="btn btn-inverse">Initial program</button>');
			this.$initialProgramButton.tooltip({'title': 'Initial value of the editor when opening the dare', placement: 'bottom'});
			$programGroup.append(this.$targetProgramButton, this.$initialProgramButton);
			this.$div.append($programGroup);

			this.$targetProgramButton.on('click', (function() {
				this.selectProgram('target');
			}).bind(this));
			this.$initialProgramButton.on('click', (function() {
				this.selectProgram('initial');
			}).bind(this));

			this.$typeGroup = $('<div class="btn-group dare-editor-type-group"></div>');
			this.$div.append(this.$typeGroup);

			this.$dareContainer = $('<div class="dare-editor-dare-container"></div>');
			this.$dareContainerArrow = $('<div class="dare-editor-dare-container-arrow"></div>');
			this.$dareContainer.append(this.$dareContainerArrow);
			this.$div.append(this.$dareContainer);

			this.$typeButtons = {};
			this.typeEditors = {};
			for (var id in matchDareType) {
				this.$typeButtons[id] = $('<div class="btn btn-inverse"><i class="icon icon-white ' + matchDareType[id].icon + '"></i> ' + matchDareType[id].name + '</div>');
				this.$typeButtons[id].data('id', id);
				this.$typeButtons[id].on('click', this.typeButtonClickHandler.bind(this));
				this.$typeButtons[id].tooltip({'title': matchDareType[id].tooltip, placement: 'bottom'});
				this.$typeGroup.append(this.$typeButtons[id]);
				this.typeEditors[id] = new dares['Editor' + id](this, this.$dareContainer);
			}

			this.$outputGroup = $('<div class="btn-group dare-editor-output-group"></div>');
			this.$div.append(this.$outputGroup);

			this.$outputContainer = $('<div class="dare-editor-output-container"></div>');
			this.$outputContainerArrow = $('<div class="dare-editor-output-container-arrow"></div>');
			this.$outputContainer.append(this.$outputContainerArrow);
			this.$div.append(this.$outputContainer);

			this.$outputButtons = {};
			this.outputEditors = {};
			for (var name in outputs) {
				this.$outputButtons[name] = $('<div class="btn btn-inverse"><i class="icon icon-white ' + outputs[name].icon + '"></i> ' + name + '</div>');
				this.$outputButtons[name].data('name', name);
				this.$outputButtons[name].on('click', this.outputButtonClickHandler.bind(this));
				this.$outputButtons[name].on('mousemove', this.outputButtonHoverHandler.bind(this));
				this.$outputButtons[name].tooltip({'title': outputs[name].tooltip, placement: 'bottom'});
				this.$outputGroup.append(this.$outputButtons[name]);
				this.outputEditors[name] = new dares[outputs[name].editor](this, this.$outputContainer);
			}

			this.ui.registerAdditionalObject('editor', this);
			this.reload();
			this.ui.selectTab('editor');
			this.selectProgram('target');
			this.selectDareType(this.options.type);
			this.updateOutputSelection();
		},

		remove: function() {
			for (var id in matchDareType) {
				this.$typeButtons[id].remove();
			}
			this.$div.removeClass('dare-editor');
		},

		refresh: function() {
			this.options = shared.dares.sanitizeInput(this.options, shared.dares.dareOptions);
		},

		reload: function() {
			this.refresh();
			this.ui.removeOutputs();

			var optionsCopy = JSON.parse(JSON.stringify(this.options));
			optionsCopy.allOutputs['robot'].readOnly = false;
			this.ui.loadOutputs(optionsCopy.outputs, optionsCopy.allOutputs);

			var robot = this.ui.getOutput('robot');
			if (robot) {
				robot.setStateChangeCallback(this.robotStateChanged.bind(this));
			}
		},

		selectProgram: function(type) {
			if (this.programType !== type) {
				this.programType = type;
				this.$targetProgramButton.toggleClass('active', type === 'target');
				this.$initialProgramButton.toggleClass('active', type === 'initial');

				this.editor.setText(type === 'target' ? this.options.original : this.options.editor.text);
			}
		},

		textChangeCallback: function(text) {
			if (this.programType === 'target') {
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

		selectDareType: function(id) {
			this.$typeGroup.children().removeClass('active');
			this.$typeButtons[id].addClass('active');
			if (this.currentTypeId) {
				this.typeEditors[this.currentTypeId].deactivate();
			}
			this.typeEditors[id].activate();
			this.currentTypeId = id;
			this.options.type = id;
			this.$dareContainerArrow.css('left', this.$typeButtons[id].position().left+this.$typeButtons[id].outerWidth()/2);

			var newOutputs = [];
			for (var name in outputs) {
				if (name !== 'global' && (matchDareType[id].outputs.indexOf(name) >= 0 || this.options.outputs.indexOf(name) >= 0)) {
					newOutputs.push(name);
				}
			}
			this.options.outputs = newOutputs;

			this.updateOutputSelection();
			this.reload();
		},

		outputButtonClickHandler: function(event) {
			var name = $(event.delegateTarget).data('name');
			if (matchDareType[this.currentTypeId].outputs.indexOf(name) < 0) {
				var index = this.options.outputs.indexOf(name);
				this.$outputButtons[name].toggleClass('active');
				this.options.outputs = [];
				for (var name2 in this.$outputButtons) {
					if (this.$outputButtons[name2].hasClass('active') && name2 !== 'global') {
						console.log(name2);
						this.options.outputs.push(name2);
					}
				}
				console.log(this.options.outputs);
				if (index < 0) {
					this.selectOutput(name);
				} else if (this.options.outputs.length > index-1 && index > 0) {
					this.selectOutput(this.options.outputs[index-1]);
				} else if (this.options.outputs.length > 0) {
					this.selectOutput(this.options.outputs[0]);
				} else {
					this.selectOutput('global');
				}
				this.reload();
			}
		},

		outputButtonHoverHandler: function(event) {
			this.selectOutput($(event.delegateTarget).data('name'));
		},

		selectOutput: function(name) {
			if (this.options.outputs.indexOf(name) >= 0 || name === 'global') {
				if (this.currentOutputName) {
					this.outputEditors[this.currentOutputName].deactivate();
				}
				this.outputEditors[name].activate();
				this.currentOutputName = name;
				this.$outputContainerArrow.css('left', this.$outputButtons[name].position().left+this.$outputButtons[name].outerWidth()/2);
			}
		},

		updateOutputSelection: function() {
			this.$outputGroup.children().removeClass('active disabled');
			for (var i=0; i<this.options.outputs.length; i++) {
				this.$outputButtons[this.options.outputs[i]].addClass('active');
			}
			for (i=0; i<matchDareType[this.currentTypeId].outputs.length; i++) {
				this.$outputButtons[matchDareType[this.currentTypeId].outputs[i]].addClass('disabled');
			}
			if (this.options.outputs.length > 0) {
				this.selectOutput('global');
			}
		},

		robotStateChanged: function(state) {
			this.options.allOutputs['robot'].state = state;
			this.refresh();
		}
	};

	dares.EditorRobotGoal = function() { return this.init.apply(this, arguments); };
	dares.EditorRobotGoal.prototype = {
		init: function(delegate, $container) {
			this.delegate = delegate;
			this.$container = $container;

			this.$div = $('<div class="dare-editor-robotgoal"></div>');
			this.$container.append(this.$div);

			this.$form = $('<div class="form-horizontal"></div>');
			this.$div.append(this.$form);

			var $goalRewardGroup = $('<div class="control-group"><label class="control-label">Goal reward:</label><div class="controls"><input type="text" class="input-mini"></input> points per visited goal square</div></div>');
			this.$goalReward = $goalRewardGroup.find('input');
			this.$goalReward.on('change', this.change.bind(this));
			this.$form.append($goalRewardGroup);

			var $optionalGoalsGroup = $('<div class="control-group"><label class="control-label">Optional goals:</label><div class="controls"><input type="text" class="input-mini"></input> goal squares can be skipped</div></div>');
			this.$optionalGoals = $optionalGoalsGroup.find('input');
			this.$optionalGoals.on('change', this.change.bind(this));
			this.$form.append($optionalGoalsGroup);

			var $hidePreviewGroup = $('<div class="control-group"><label class="control-label">Hide preview:</label><div class="controls"><label class="checkbox"><input type="checkbox"></input> Hide the preview in the dare tab</label></div></div>');
			this.$hidePreview = $hidePreviewGroup.find('input');
			this.$hidePreview.on('change', this.change.bind(this));
			this.$form.append($hidePreviewGroup);

			var $previewBlockSizeGroup = $('<div class="control-group"><label class="control-label">Preview block size:</label><div class="controls"><input type="text" class="input-mini"></input> pixels for each block in the preview</div></div>');
			this.$previewBlockSize = $previewBlockSizeGroup.find('input');
			this.$previewBlockSize.on('change', this.change.bind(this));
			this.$form.append($previewBlockSizeGroup);

			var $maxLinesGroup = $('<div class="control-group"><label class="control-label">Maximum lines:</label><div class="controls"><input type="text" class="input-mini"></input> content lines maximum to pass (not counting empty lines and closing brackets); 0 for no maximum</div></div>');
			this.$maxLines = $maxLinesGroup.find('input');
			this.$maxLines.on('change', this.change.bind(this));
			this.$form.append($maxLinesGroup);

			var $lineRewardGroup = $('<div class="control-group"><label class="control-label">Line reward:</label><div class="controls"><input type="text" class="input-mini"></input> points for each line under the maximum</div></div>');
			this.$lineReward = $lineRewardGroup.find('input');
			this.$lineReward.on('change', this.change.bind(this));
			this.$form.append($lineRewardGroup);

			this.updateInputs();
		},

		remove: function() {
			this.deactivate();
			this.$div.remove();
		},

		activate: function() {
			this.$container.addClass('dare-editor-robotgoal-container');
		},

		deactivate: function() {
			this.$container.removeClass('dare-editor-robotgoal-container');
		},

		updateInputs: function() {
			this.$goalReward.val(this.delegate.options.allDares['RobotGoal'].goalReward);
			this.$optionalGoals.val(this.delegate.options.allDares['RobotGoal'].optionalGoals);
			this.$hidePreview.val(this.delegate.options.allDares['RobotGoal'].hidePreview ? ['on'] : []);
			this.$previewBlockSize.val(this.delegate.options.allDares['RobotGoal'].previewBlockSize);
			this.$maxLines.val(this.delegate.options.allDares['RobotGoal'].maxLines);
			this.$lineReward.val(this.delegate.options.allDares['RobotGoal'].lineReward);
		},

		change: function() {
			this.delegate.options.allDares['RobotGoal'].goalReward = this.$goalReward.val();
			this.delegate.options.allDares['RobotGoal'].optionalGoals = this.$optionalGoals.val();
			this.delegate.options.allDares['RobotGoal'].hidePreview = this.$hidePreview.is(':checked');
			this.delegate.options.allDares['RobotGoal'].previewBlockSize = this.$previewBlockSize.val();
			this.delegate.options.allDares['RobotGoal'].maxLines = this.$maxLines.val();
			this.delegate.options.allDares['RobotGoal'].lineReward = this.$lineReward.val();
			this.delegate.refresh();
			this.updateInputs();
		}
	};

	dares.EditorImageMatch = function() { return this.init.apply(this, arguments); };
	dares.EditorImageMatch.prototype = {
		init: function(delegate, $container) {
			this.delegate = delegate;
			this.$container = $container;

			this.$div = $('<div class="dare-editor-imagematch"></div>');
			this.$container.append(this.$div);

			this.$form = $('<div class="form-horizontal"></div>');
			this.$div.append(this.$form);

			var $minPercentageGroup = $('<div class="control-group"><label class="control-label">Minimum percentage:</label><div class="controls"><input type="text" class="input-mini"></input> % of pixels needs to match</div></div>');
			this.$minPercentage = $minPercentageGroup.find('input');
			this.$minPercentage.on('change', this.change.bind(this));
			this.$form.append($minPercentageGroup);

			var $hidePreviewGroup = $('<div class="control-group"><label class="control-label">Hide preview:</label><div class="controls"><label class="checkbox"><input type="checkbox"></input> Hide the preview in the dare tab</label></div></div>');
			this.$hidePreview = $hidePreviewGroup.find('input');
			this.$hidePreview.on('change', this.change.bind(this));
			this.$form.append($hidePreviewGroup);

			var $speedGroup = $('<div class="control-group"><label class="control-label">Preview speed:</label><div class="controls"><input type="text" class="input-mini"></input> milliseconds per command</div></div>');
			this.$speed = $speedGroup.find('input');
			this.$speed.on('change', this.change.bind(this));
			this.$form.append($speedGroup);

			var $maxLinesGroup = $('<div class="control-group"><label class="control-label">Maximum lines:</label><div class="controls"><input type="text" class="input-mini"></input> content lines maximum to pass (not counting empty lines and closing brackets); 0 for no maximum</div></div>');
			this.$maxLines = $maxLinesGroup.find('input');
			this.$maxLines.on('change', this.change.bind(this));
			this.$form.append($maxLinesGroup);

			var $lineRewardGroup = $('<div class="control-group"><label class="control-label">Line reward:</label><div class="controls"><input type="text" class="input-mini"></input> points for each line under the maximum</div></div>');
			this.$lineReward = $lineRewardGroup.find('input');
			this.$lineReward.on('change', this.change.bind(this));
			this.$form.append($lineRewardGroup);

			this.updateInputs();
		},

		remove: function() {
			this.deactivate();
			this.$div.remove();
		},

		activate: function() {
			this.$container.addClass('dare-editor-imagematch-container');
		},

		deactivate: function() {
			this.$container.removeClass('dare-editor-imagematch-container');
		},

		updateInputs: function() {
			this.$minPercentage.val(this.delegate.options.allDares['ImageMatch'].minPercentage);
			this.$hidePreview.val(this.delegate.options.allDares['ImageMatch'].hidePreview ? ['on'] : []);
			this.$speed.val(this.delegate.options.allDares['ImageMatch'].speed);
			this.$maxLines.val(this.delegate.options.allDares['ImageMatch'].maxLines);
			this.$lineReward.val(this.delegate.options.allDares['ImageMatch'].lineReward);
		},

		change: function() {
			this.delegate.options.allDares['ImageMatch'].minPercentage = this.$minPercentage.val();
			this.delegate.options.allDares['ImageMatch'].hidePreview = this.$hidePreview.is(':checked');
			this.delegate.options.allDares['ImageMatch'].speed = this.$speed.val();
			this.delegate.options.allDares['ImageMatch'].maxLines = this.$maxLines.val();
			this.delegate.options.allDares['ImageMatch'].lineReward = this.$lineReward.val();
			this.delegate.refresh();
			this.updateInputs();
		}
	};

	dares.EditorConsoleMatch = function() { return this.init.apply(this, arguments); };
	dares.EditorConsoleMatch.prototype = {
		init: function(delegate, $container) {
			this.delegate = delegate;
			this.$container = $container;

			this.$div = $('<div class="dare-editor-consolematch"></div>');
			this.$container.append(this.$div);

			this.$form = $('<div class="form-horizontal"></div>');
			this.$div.append(this.$form);

			var $minPercentageGroup = $('<div class="control-group"><label class="control-label">Minimum percentage:</label><div class="controls"><input type="text" class="input-mini"></input> % of characters needs to match</div></div>');
			this.$minPercentage = $minPercentageGroup.find('input');
			this.$minPercentage.on('change', this.change.bind(this));
			this.$form.append($minPercentageGroup);

			var $hidePreviewGroup = $('<div class="control-group"><label class="control-label">Hide preview:</label><div class="controls"><label class="checkbox"><input type="checkbox"></input> Hide the preview in the dare tab</label></div></div>');
			this.$hidePreview = $hidePreviewGroup.find('input');
			this.$hidePreview.on('change', this.change.bind(this));
			this.$form.append($hidePreviewGroup);

			var $speedGroup = $('<div class="control-group"><label class="control-label">Preview speed:</label><div class="controls"><input type="text" class="input-mini"></input> milliseconds per command</div></div>');
			this.$speed = $speedGroup.find('input');
			this.$speed.on('change', this.change.bind(this));
			this.$form.append($speedGroup);

			var $maxLinesGroup = $('<div class="control-group"><label class="control-label">Maximum lines:</label><div class="controls"><input type="text" class="input-mini"></input> content lines maximum to pass (not counting empty lines and closing brackets); 0 for no maximum</div></div>');
			this.$maxLines = $maxLinesGroup.find('input');
			this.$maxLines.on('change', this.change.bind(this));
			this.$form.append($maxLinesGroup);

			var $lineRewardGroup = $('<div class="control-group"><label class="control-label">Line reward:</label><div class="controls"><input type="text" class="input-mini"></input> points for each line under the maximum</div></div>');
			this.$lineReward = $lineRewardGroup.find('input');
			this.$lineReward.on('change', this.change.bind(this));
			this.$form.append($lineRewardGroup);

			this.updateInputs();
		},

		remove: function() {
			this.deactivate();
			this.$div.remove();
		},

		activate: function() {
			this.$container.addClass('dare-editor-consolematch-container');
		},

		deactivate: function() {
			this.$container.removeClass('dare-editor-consolematch-container');
		},

		updateInputs: function() {
			this.$minPercentage.val(this.delegate.options.allDares['ConsoleMatch'].minPercentage);
			this.$hidePreview.val(this.delegate.options.allDares['ConsoleMatch'].hidePreview ? ['on'] : []);
			this.$speed.val(this.delegate.options.allDares['ConsoleMatch'].speed);
			this.$maxLines.val(this.delegate.options.allDares['ConsoleMatch'].maxLines);
			this.$lineReward.val(this.delegate.options.allDares['ConsoleMatch'].lineReward);
		},

		change: function() {
			this.delegate.options.allDares['ConsoleMatch'].minPercentage = this.$minPercentage.val();
			this.delegate.options.allDares['ConsoleMatch'].hidePreview = this.$hidePreview.is(':checked');
			this.delegate.options.allDares['ConsoleMatch'].speed = this.$speed.val();
			this.delegate.options.allDares['ConsoleMatch'].maxLines = this.$maxLines.val();
			this.delegate.options.allDares['ConsoleMatch'].lineReward = this.$lineReward.val();
			this.delegate.refresh();
			this.updateInputs();
		}
	};

	dares.EditorRobot = function() { return this.init.apply(this,arguments); };
	dares.EditorRobot.prototype = {
		init: function(delegate, $container) {
			this.delegate = delegate;
			this.$container = $container;

			this.$div = $('<div class="dare-editor-robot"></div>');
			this.$container.append(this.$div);

			this.$form = $('<div class="form-horizontal"></div>');
			this.$div.append(this.$form);

			var $rowsGroup = $('<div class="control-group"><label class="control-label">Rows:</label><div class="controls"><input type="text" class="input-mini"></input> rows of blocks</div></div>');
			this.$rows = $rowsGroup.find('input');
			this.$rows.on('change', this.change.bind(this));
			this.$form.append($rowsGroup);

			var $columnsGroup = $('<div class="control-group"><label class="control-label">Columns:</label><div class="controls"><input type="text" class="input-mini"></input> columns of blocks</div></div>');
			this.$columns = $columnsGroup.find('input');
			this.$columns.on('change', this.change.bind(this));
			this.$form.append($columnsGroup);

			var $readOnlyGroup = $('<div class="control-group"><label class="control-label">Read only:</label><div class="controls"><label class="checkbox"><input type="checkbox"></input> User cannot change the maze</label></div></div>');
			this.$readOnly = $readOnlyGroup.find('input');
			this.$readOnly.on('change', this.change.bind(this));
			this.$form.append($readOnlyGroup);

			this.updateInputs();
		},

		remove: function() {
			this.deactivate();
			this.$div.remove();
		},

		activate: function() {
			this.$container.addClass('dare-editor-robot-container');
		},

		deactivate: function() {
			this.$container.removeClass('dare-editor-robot-container');
		},

		updateInputs: function() {
			this.$rows.val(this.delegate.options.allOutputs['robot'].rows);
			this.$columns.val(this.delegate.options.allOutputs['robot'].columns);
			this.$readOnly.val(this.delegate.options.allOutputs['robot'].readOnly ? ['on'] : []);
		},

		change: function() {
			this.delegate.options.allOutputs['robot'].rows = this.$rows.val();
			this.delegate.options.allOutputs['robot'].columns = this.$columns.val();
			this.delegate.options.allOutputs['robot'].readOnly = this.$readOnly.is(':checked');
			this.delegate.reload();
			this.updateInputs();
		}
	};

	dares.EditorCanvas = function() { return this.init.apply(this,arguments); };
	dares.EditorCanvas.prototype = {
		init: function(delegate, $container) {
			this.delegate = delegate;
			this.$container = $container;

			this.$div = $('<div class="dare-editor-canvas"></div>');
			this.$container.append(this.$div);

			this.$form = $('<div class="form-horizontal"></div>');
			this.$div.append(this.$form);

			var $sizeGroup = $('<div class="control-group"><label class="control-label">Size:</label><div class="controls"><input type="text" class="input-mini"></input> pixels wide and high</div></div>');
			this.$size = $sizeGroup.find('input');
			this.$size.on('change', this.change.bind(this));
			this.$form.append($sizeGroup);

			this.updateInputs();
		},

		remove: function() {
			this.deactivate();
			this.$div.remove();
		},

		activate: function() {
			this.$container.addClass('dare-editor-canvas-container');
		},

		deactivate: function() {
			this.$container.removeClass('dare-editor-canvas-container');
		},

		updateInputs: function() {
			this.$size.val(this.delegate.options.allOutputs['canvas'].size);
		},

		change: function() {
			this.delegate.options.allOutputs['canvas'].size = this.$size.val();
			this.delegate.reload();
			this.updateInputs();
		}
	};

	dares.EditorConsole = function() { return this.init.apply(this,arguments); };
	dares.EditorConsole.prototype = {
		init: function(delegate, $container) {
			this.delegate = delegate;
			this.$container = $container;

			this.$div = $('<div class="dare-editor-console"></div>');
			this.$container.append(this.$div);

			this.$form = $('<div class="form-horizontal"></div>');
			this.$div.append(this.$form);

			var $noGroup = $('<div class="control-group"><label class="control-label">No options.</label></div>');
			this.$form.append($noGroup);

			this.updateInputs();
		},

		remove: function() {
			this.deactivate();
			this.$div.remove();
		},

		activate: function() {
			this.$container.addClass('dare-editor-console-container');
		},

		deactivate: function() {
			this.$container.removeClass('dare-editor-console-container');
		},

		updateInputs: function() {
		},

		change: function() {
			this.delegate.refresh();
			this.updateInputs();
		}
	};

	dares.EditorInfo = function() { return this.init.apply(this,arguments); };
	dares.EditorInfo.prototype = {
		init: function(delegate, $container) {
			this.delegate = delegate;
			this.$container = $container;

			this.$div = $('<div class="dare-editor-info"></div>');
			this.$container.append(this.$div);

			this.$form = $('<div class="form-horizontal"></div>');
			this.$div.append(this.$form);

			var $scopeGroup = $('<div class="control-group"><label class="control-label">Show scope:</label><div class="controls"><label class="checkbox"><input type="checkbox"></input> Show a visualization of the current and parent scopes</label></div></div>');
			this.$scope = $scopeGroup.find('input');
			this.$scope.on('change', this.change.bind(this));
			this.$form.append($scopeGroup);

			this.updateInputs();
		},

		remove: function() {
			this.deactivate();
			this.$div.remove();
		},

		activate: function() {
			this.$container.addClass('dare-editor-info-container');
		},

		deactivate: function() {
			this.$container.removeClass('dare-editor-info-container');
		},

		updateInputs: function() {
			this.$scope.val(this.delegate.options.allOutputs['info'].scope ? ['on'] : []);
		},

		change: function() {
			this.delegate.options.allOutputs['info'].scope = this.$scope.is(':checked');
			this.delegate.reload();
			this.updateInputs();
		}
	};

	dares.EditorEvents = function() { return this.init.apply(this,arguments); };
	dares.EditorEvents.prototype = {
		init: function(delegate, $container) {
			this.delegate = delegate;
			this.$container = $container;

			this.$div = $('<div class="dare-editor-events"></div>');
			this.$container.append(this.$div);

			this.$form = $('<div class="form-horizontal"></div>');
			this.$div.append(this.$form);

			var $noGroup = $('<div class="control-group"><label class="control-label">No options.</label></div>');
			this.$form.append($noGroup);

			this.updateInputs();
		},

		remove: function() {
			this.deactivate();
			this.$div.remove();
		},

		activate: function() {
			this.$container.addClass('dare-editor-events-container');
		},

		deactivate: function() {
			this.$container.removeClass('dare-editor-events-container');
		},

		updateInputs: function() {
		},

		change: function() {
			this.delegate.refresh();
			this.updateInputs();
		}
	};

	dares.EditorMath = function() { return this.init.apply(this,arguments); };
	dares.EditorMath.prototype = {
		init: function(delegate, $container) {
			this.delegate = delegate;
			this.$container = $container;

			this.$div = $('<div class="dare-editor-math"></div>');
			this.$container.append(this.$div);

			this.$form = $('<div class="form-horizontal"></div>');
			this.$div.append(this.$form);

			var $staticRandomGroup = $('<div class="control-group"><label class="control-label">Static random generator:</label><div class="controls"><label class="checkbox"><input type="checkbox"></input> Repeat the same sequence of random numbers at every execution</label></div></div>');
			this.$staticRandom = $staticRandomGroup.find('input');
			this.$staticRandom.on('change', this.change.bind(this));
			this.$form.append($staticRandomGroup);

			this.updateInputs();
		},

		remove: function() {
			this.deactivate();
			this.$div.remove();
		},

		activate: function() {
			this.$container.addClass('dare-editor-math-container');
		},

		deactivate: function() {
			this.$container.removeClass('dare-editor-math-container');
		},

		updateInputs: function() {
			this.$staticRandom.val(this.delegate.options.allOutputs['math'].staticRandom ? ['on'] : []);
		},

		change: function() {
			this.delegate.options.allOutputs['math'].staticRandom = this.$staticRandom.is(':checked');
			this.delegate.reload();
			this.updateInputs();
		}
	};

	dares.EditorGlobal = function() { return this.init.apply(this,arguments); };
	dares.EditorGlobal.prototype = {
		init: function(delegate, $container) {
			this.delegate = delegate;
			this.$container = $container;

			this.$div = $('<div class="dare-editor-global"></div>');
			this.$container.append(this.$div);

			this.$form = $('<div class="form-horizontal"></div>');
			this.$div.append(this.$form);

			var $nameGroup = $('<div class="control-group"><label class="control-label">Name:</label><div class="controls"><input type="text" class="input-large"></input></div></div>');
			this.$name = $nameGroup.find('input');
			this.$name.on('change', this.change.bind(this));
			this.$form.append($nameGroup);

			var $descriptionGroup = $('<div class="control-group"><label class="control-label">Description:</label><div class="controls"><textarea rows="6" class="input-xlarge"></textarea></div></div>');
			this.$description = $descriptionGroup.find('textarea');
			this.$description.on('change', this.change.bind(this));
			this.$form.append($descriptionGroup);

			var $hideToolbarGroup = $('<div class="control-group"><label class="control-label">Hide toolbar:</label><div class="controls"><label class="checkbox"><input type="checkbox"></input> Hide the toolbar above the editor</label></div></div>');
			this.$hideToolbar = $hideToolbarGroup.find('input');
			this.$hideToolbar.on('change', this.change.bind(this));
			this.$form.append($hideToolbarGroup);

			this.updateInputs();
		},

		remove: function() {
			this.deactivate();
			this.$div.remove();
		},

		activate: function() {
			this.$container.addClass('dare-editor-global-container');
		},

		deactivate: function() {
			this.$container.removeClass('dare-editor-global-container');
		},

		updateInputs: function() {
			this.$name.val(this.delegate.options.name);
			this.$description.val(this.delegate.options.description);
			this.$hideToolbar.val(this.delegate.options.editor.hideToolbar ? ['on'] : []);
		},

		change: function() {
			this.delegate.options.name = this.$name.val();
			this.delegate.options.description = this.$description.val();
			this.delegate.options.hideToolbar = this.$hideToolbar.is(':checked');
			this.delegate.refresh();
			this.updateInputs();
		}
	};

	/*
	dares.EditorWindow = function() { return this.init.apply(this,arguments); };
	dares.EditorWindow.prototype = {
		init: function(delegate, $container, options) {
			this.delegate = delegate;
			this.$container = $container;
			this.options = options;

			this.$div = $('<div class="dare-editor-window"></div>');
			this.$container.append(this.$div);

			this.$form = $('<div class="form-horizontal"></div>');
			this.$div.append(this.$form);

			var $hideTabsGroup = $('<div class="control-group"><label class="control-label">Hide tabs:</label><div class="controls"><label class="checkbox"><input type="checkbox"></input> Hide the tabs</label></div></div>');
			this.$hideTabs = $hideTabsGroup.find('input');
			this.$hideTabs.on('change', this.change.bind(this));
			this.$form.append($hideTabsGroup);
		},

		remove: function() {
			this.deactivate();
			this.$div.remove();
		},

		activate: function() {
			this.$container.addClass('dare-editor-window-container');
		},

		deactivate: function() {
			this.$container.removeClass('dare-editor-window-container');
		}
	};
	*/
};
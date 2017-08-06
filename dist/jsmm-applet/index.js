/*jshint node:true jquery:true*/
"use strict";

// load colorPicker lib
require('./colorpicker/jquery.ui.colorPicker');

module.exports.clayer = require('./clayer');
module.exports.editor = require('./editor');
module.exports.info = require('./info');
module.exports.jsmm = require('./jsmm');
module.exports.output = require('./output');
module.exports.robot = require('./robot');

module.exports.UI = function() { return this.init.apply(this, arguments); };
module.exports.UI.prototype = {
	icons: {dare: 'icon-file', console: 'icon-list-alt', canvas: 'icon-picture', robot: 'icon-th', info: 'icon-info-sign', home: 'icon-home', 'editor': 'icon-pencil', config: 'icon-wrench'},
	paneOutputs: ['robot', 'console', 'canvas', 'info', 'config'],
	constructors: {
		robot: module.exports.output.Robot,
		console: module.exports.output.Console,
		canvas: module.exports.output.Canvas,
		info: module.exports.info.Info,
		events: module.exports.output.Events,
		math: module.exports.output.Math,
		config: module.exports.output.ConfigOutput
	},

	init: function($main, globalOptions) {
		if ($main === undefined) { // use modal mode
			this.$modal = $('<div class="ui-modal"></div>');
			// this.$modal.on('click', _(this.close).bind(this));
			$('body').append(this.$modal);

			this.$main = $('<div class="ui-modal-ui"></div>');
			this.$modal.append(this.$main);

			this.$close = $('<a href="#" class="ui-close">&times;</a>');
			this.$main.append(this.$close);
			this.$close.on('click', _(this.closeHandler).bind(this));
		} else {
			this.$modal = null;
			this.$main = $main;
		}
		this.globalOptions = globalOptions || {};

		this.$main.addClass('ui-main');

		this.$background = $('<div class="ui-background"></div>');
		this.$main.append(this.$background);

		this.$arrow = $('<div class="arrow"><div class="arrow-head"></div><div class="arrow-body"></div></div>');
		this.$main.append(this.$arrow);

		this.$output = $('<div class="ui-output tabbable"></div>');
		this.$main.append(this.$output);

		this.$tabs = $('<ul class="nav nav-tabs"></ul>');
		this.$output.append(this.$tabs);
		this.$tabs.toggle(!this.globalOptions.hideTabs);

		this.$content = $('<div class="tab-content">');
		this.$output.append(this.$content);

		this.$editor = $('<div class="ui-editor"></div>');
		this.$toolbar = $('<div class="ui-toolbar"></div>');
		this.$stepbar = $('<div class="ui-stepbar"></div>');
		this.$main.append(this.$editor);
		this.$main.append(this.$toolbar);
		this.$main.append(this.$stepbar);

		this.outputs = {};
		this.additionalObjects = {};
		this.editor = null;
		this.closeCallback = null;
		this.removeAll();
	},

	remove: function() {
		this.removeAll();
		this.$main.removeClass('ui-main');
		this.$background.remove();
		this.$output.remove();
		this.$editor.remove();
		this.$toolbar.remove();
		this.$stepbar.remove();
		this.$arrow.remove();
		if (this.$modal !== null) {
			this.$close.remove();
			this.$modal.remove();
		}
	},

	removeOutputs: function() {
		for (var name in this.outputs) {
			this.outputs[name].remove();
			if (this.tabsByName[name]) {
				this.tabsByName[name].$tab.remove();
				this.tabsByName[name].$pane.remove();
				this.tabsByName[name] = undefined;
				this.numTabs--;
			}
		}
		this.outputs = {};
		this.scope = {};
	},

	removeAll: function() {
		this.removeOutputs();
		for (var name in this.additionalObjects) {
			this.additionalObjects[name].remove();
		}
		if (this.editor !== null) {
			this.editor.remove();
		}
		this.$tabs.children('li').remove();
		this.$content.children('div').remove();

		this.additionalObjects = {};
		this.tabsByName = {};
		this.numTabs = 0;
	},

	loadConfigProgram: function(definition, program, states) {
		var config = new module.exports.output.Config(definition);
		var runner = new module.exports.jsmm.SimpleRunner(config.getScopeObjects(), {maxWidth: Infinity});
		runner.run(program);
		if (runner.hasError()) console.error(runner.getError());
		else return this.mixinStates(config.getConfig(), states);
	},

	mixinStates: function(config, states) {
		for (var name in states) {
			config.outputs[name].state = states[name];
		}
		return config;
	},

	loadOutputs: function(outputs) {
		for (var name in outputs) {
			if (outputs[name].enabled) {
				outputs[name].prepareTextElement = _(this.prepareTextElement).bind(this);

				var output;
				if (this.paneOutputs.indexOf(name) >= 0) {
					output = new this.constructors[name](this.editor, outputs[name], this.addTab(name));
				} else {
					output = new this.constructors[name](this.editor, outputs[name]);
				}
				this.outputs[name] = output;

				this.addToScope(output.getScopeObjects());

				if (name === 'events') {
					this.scope.document = output.getAugmentedDocumentObject();
					this.scope.window = output.getAugmentedWindowObject();

					var mouseObjects = outputs[name].mouseObjects || [];
					for (var j=0; j<mouseObjects.length; j++) {
						var outputName = mouseObjects[j];
						output.addMouseEvents(this.outputs[outputName].getMouseElement(), outputName, this.scope[outputName]);
					}
				}
			}
		}

		this.editor.updateSettings(new module.exports.jsmm.Runner(this.editor, this.scope), this.outputs);
	},

	addToScope: function(objects) {
		for (var name in objects) {
			this.scope[name] = objects[name];
		}
	},

	registerAdditionalObject: function(name, obj) {
		this.additionalObjects[name] = obj;
	},

	addTab: function(name) {
		var $tab = $('<li></li>');
		setTimeout(function() { $tab.addClass('tab-button-enabled'); }, 200*this.numTabs + 300);
		this.$tabs.append($tab);

		var $link = $('<a href="#"><i class="icon icon-white ' + this.icons[name] + '"></i> ' + name + '</a>');
		$tab.append($link);

		$link.click(_(function(event) {
			event.preventDefault();
			this.selectTab(name);
		}).bind(this));

		var $pane = $('<div class="tab-pane"></div>');
		this.$content.append($pane);

		var $output = $('<div class="tab-output"></div>');
		$pane.append($output);

		this.numTabs++;
		this.tabsByName[name] = {$pane: $pane, $tab: $tab};
		return $output;
	},

	addEditor: function(options) {
		this.editor = new module.exports.editor.Editor(options, module.exports.jsmm, this.$editor, this.$toolbar, this.$stepbar);
		return this.editor;
	},

	selectTab: function(name) {
		this.$content.children('.active').removeClass('active');
		this.$tabs.children('ul li.active').removeClass('active');
		this.tabsByName[name].$pane.addClass('active');
		this.tabsByName[name].$tab.addClass('active');
		if (this.outputs[name] !== undefined && this.outputs[name].setFocus !== undefined) this.outputs[name].setFocus();
		if (this.outputs[this.currentTab] !== undefined && this.outputs[this.currentTab].unsetFocus !== undefined) this.outputs[this.currentTab].unsetFocus();
		this.currentTab = name;
	},

	getOutput: function(name) {
		return this.outputs[name];
	},

	loadDefault: function() {
		this.load({
			editor: {},
			outputs: {
				robot: {},
				console: {},
				canvas: {},
				info: {},
				input: {mouseObjects: ['canvas']},
				Math: {}
			}
		});
	},

	setCloseCallback: function(callback) {
		this.closeCallback = callback;
	},

	openModal: function() {
		this.$modal.addClass('ui-modal-active');
		var $main = this.$main;
		setTimeout(function() { $main.addClass('ui-modal-ui-active'); }, 0);
		$('body').addClass('modal-open'); // for Bootstrap specific fixes
	},

	closeModal: function() {
		this.removeAll();
		this.$modal.removeClass('ui-modal-active');
		this.$main.removeClass('ui-modal-ui-active');
		$('body').removeClass('modal-open');
	},

	/// INTERNAL FUNCTIONS ///
	arrowPositions: { // dir, left, top
		'arrow-step': ['arrow-down', 655, 585],
		'arrow-highlighting': ['arrow-up', 751, 40],
		'arrow-manipulation': ['arrow-up', 785, 40],
		'arrow-close': ['arrow-up', 1066, 3]
	},

	prepareTextElement: function($el) {
		var $links = $el.find('a[href^="#arrow"]');
		var that = this;
		$links.on('mouseenter', function() { that.showArrow($(this).attr('href').substring(1)); });
		$links.on('mouseleave', function() { that.hideArrow(); });
		$links.on('click', function(e) { $(this).trigger('mouseenter'); that.animateArrow(); e.preventDefault(); });
		$links.addClass('arrow-link');
	},

	showArrow: function(str) {
		var pos = this.arrowPositions[str];
		if (pos === undefined) {
			if (str.indexOf('arrow-tab-') === 0) {
				var $tab = this.tabsByName[str.substring('arrow-tab-'.length)].$tab;
				pos = ['arrow-left', $tab.position().left+$tab.width()+5, 29];
			} else {
				pos = str.split(',');
			}
		}
		this.$arrow.addClass('arrow-active');
		this.$arrow.removeClass('arrow-left arrow-right arrow-up arrow-down arrow-animate');
		this.$arrow.addClass(pos[0]);
		this.$arrow.css('left', pos[1] + 'px');
		this.$arrow.css('top', pos[2] + 'px');
	},

	animateArrow: function() {
		var $arrow = this.$arrow;
		$arrow.removeClass('arrow-animate');
		window.setTimeout(function() { $arrow.addClass('arrow-animate'); }, 0);
	},

	hideArrow: function() {
		this.$arrow.removeClass('arrow-active');
	},
	
	closeHandler: function(event) {
		event.preventDefault();
		this.closeModal();
		if (this.closeCallback !== null) {
			this.closeCallback();
		}
	}
};
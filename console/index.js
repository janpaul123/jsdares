/*jshint node:true jquery:true*/
"use strict";

var cs = {};

cs.Console = function() { return this.init.apply(this, arguments); };

cs.Console.prototype = {
	init: function($div) {
		this.$div = $div;
		this.$div.addClass('cs-console');
		this.debugToBrowser = true;
		this.storeLines = false;
		this.clear();
	},

	getAugmentedObject: function() {
		return {
			isAugmentedObject: true,
			log: $.proxy(this.log, this),
			clear: $.proxy(this.log, this)
		};
	},

	log: function(/*node,*/ value) {
		var text = '' + value;
		if (typeof value === 'object') text = '[object]';
		else if (typeof value === 'function') text = '[function]';

		var $element = $('<div class="cs-line"></div>');
		$element.text(text);
		this.$div.append($element);

		if (this.storeLines) {
			$element.data('number', this.number);
			var line = {$element: $element, number: this.number, id: node.id};
			this.linesByNumber[this.number] = line;
			if (this.linesById[node.id] === undefined) this.linesById[node.id] = [];
			this.linesById[node.id].push(line);
			this.number++;
		}

		if (this.debugToBrowser && console && console.log) console.log(value);
	},

	clear: function() {
		this.$div.children('.cs-line').remove(); // like this to prevent $.data memory leaks
		this.linesByNumber = [];
		this.linesById = [];
		this.number = 0;
		if (this.debugToBrowser && console && console.clear) console.clear();
	}
};

module.exports = cs;

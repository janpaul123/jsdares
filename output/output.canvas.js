/*jshint node:true jquery:true*/
"use strict";

module.exports = function(output) {
	output.Canvas = function() { return this.init.apply(this, arguments); };

	output.Canvas.prototype = {
		init: function($div, editor) {
			this.$div = $div;
			this.$div.addClass('canvas');

			this.$canvas = $('<canvas class="canvas-canvas"></canvas>');
			this.$div.append(this.$canvas);

			this.size = this.$canvas.css('max-width').replace('px', '');
			this.$canvas.attr('width', this.size);
			this.$canvas.attr('height', this.size);
			this.context = this.$canvas[0].getContext('2d');
			this.context.save();

			//this.debugToBrowser = true;
			this.highlighting = false;
			this.highlightNextShapes = false;
			this.editor = editor;
			this.editor.addOutput(this);

			this.clear();
		},

		functions: [
			{name: 'clearRect', type: 'method', example: 'clearRect(100, 100, 100, 100)'},
			{name: 'fillRect', type: 'method', example: 'fillRect(100, 100, 100, 100)'},
			{name: 'strokeRect', type: 'method', example: 'clearRect(100, 100, 100, 100)'},
			{name: 'fillStyle', type: 'attribute', example: 'fillStyle = "#a00"'},
			{name: 'strokeStyle', type: 'attribute', example: 'strokeStyle = "#a00"'}
		],

		getAugmentedObject: function() {
			var obj = {};
			for (var i=0; i<this.functions.length; i++) {
				var func = this.functions[i];
				if (func.type === 'method') {
					obj[func.name] = {
						name: func.name,
						augmented: 'function',
						func: $.proxy(this.handleMethod, this),
						example: func.example
					};
				} else if (func.type === 'attribute') {
					obj[func.name] = {
						name: func.name,
						augmented: 'variable',
						get: $.proxy(this.handleAttributeGet, this),
						set: $.proxy(this.handleAttributeSet, this),
						example: func.example
					};
				}
			}
			return obj;
		},

		handleMethod: function(node, name, args) {
			return this.context[name].apply(this.context, args);
		},

		handleAttributeGet: function(node, name) {
			return this.context[name];
		},

		handleAttributeSet: function(node, name, value) {
			this.context[name] = value;
		},

		startHighlighting: function() {
			this.highlightNextShapes = true;
		},

		stopHighlighting: function() {
			this.highlightNextShapes = false;
		},

		enableHighlighting: function() {
			this.highlighting = true;
			this.$div.addClass('canvas-highlighting');
			//this.$div.on('mousemove', $.proxy(this.mouseMove, this));
		},

		disableHighlighting: function() {
			this.highlighting = false;
			this.$div.removeClass('canvas-highlighting');
			//this.$div.off('mousemove');
		},

		startRun: function() {
			this.stopHighlighting();
			this.clear();
		},

		endRun: function() {

		},

		clear: function() {
			console.log('cleeear', this.size);
			//this.context.restore();
			//this.context.save();
			this.context.clearRect(0, 0, this.size, this.size);
			this.context.beginPath();
		},

		/// INTERNAL FUNCTIONS ///
		mouseMove: function(event) {
			if (this.highlighting) {
				var $target = $(event.target);
				if ($target.data('node') !== undefined && !$target.hasClass('canvas-highlight-line')) {
					this.$content.children('.canvas-highlight-line').removeClass('canvas-highlight-line');
					$target.addClass('canvas-highlight-line');
					this.editor.highlightNode($target.data('node'));
				}
			}
		}
	};
};
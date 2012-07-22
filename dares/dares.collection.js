/*jshint node:true jquery:true*/
"use strict";

module.exports = function(dares) {
	dares.Collection = function() { return this.init.apply(this, arguments); };
	dares.Collection.prototype = {
		icons: {console: 'icon-list-alt', canvas: 'icon-picture', robot: 'icon-th'},

		init: function(page, $collection) {
			this.page = page;
			this.$collection = $collection;
			this.$collection.addClass('dares-collection');

			this.$header = $('<div class="dares-header"></div>');
			this.$collection.append(this.$header);

			this.$body = $('<div class="dares-body"></div>');
			this.$collection.append(this.$body);

			this.content = null;
		},

		remove: function() {
			this.$header.remove();
			this.$body.remove();
			this.$collection.removeClass('dares-collection');
		},

		updateContent: function(content) {
			this.content = content;
			this.render();
		},

		updateWithInstance: function(instance) {
			if (this.content !== null) {
				for (var i=0; i<this.content.dares.length; i++) {
					if (this.content.dares[i]._id === instance.dareId) {
						this.content.dares[i].instance = instance;
						this.render();
						break;
					}
				}
			}
		},

		render: function() {
			this.$header.html('');
			var $title = $('<div class="dares-header-title">' + this.content.title + '</div>');
			this.$header.append($title);
			var $difficulty = $('<div class="dares-header-difficulty"></div>');
			for (var i=0; i<this.content.difficulty; i++) {
				$difficulty.append('<i class="icon-star-yellow"></i>');
			}
			this.$header.append($difficulty);

			this.$body.children('.dares-body-item').remove(); // prevent $.data leaks
			for (i=0; i<this.content.dares.length; i++) {
				var dare = this.content.dares[i];

				var $item = $('<div class="dares-body-item"></div>');
				if (dare.instance.completed) {
					$item.addClass('dares-body-completed');
				}

				$item.data('_id', dare._id);
				$item.on('click', this.itemClick.bind(this));

				var $name = $('<span class="dares-body-name">' + dare.name + ' </span>');
				for (var output in dare.outputs) {
					if (this.icons[output] !== undefined) {
						$name.append('<span class="dares-body-output"><i class="' + this.icons[output] + ' icon-white"></i> ' + output + '</span>');
					}
				}
				$item.append($name);
				$item.append('<span class="dares-body-highscore"><i class="icon-trophy"></i> ' + dare.instance.highscore +'</span>');

				this.$body.append($item);
			}
		},

		itemClick: function(event) {
			var $target = $(event.delegateTarget);
			this.page.openDare($target.data('_id'));
		}
	};
};
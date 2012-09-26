/*jshint node:true jquery:true*/
"use strict";

module.exports = function(dares) {
	dares.Collection = function() { return this.init.apply(this, arguments); };
	dares.Collection.prototype = {
		icons: {console: 'icon-list-alt', canvas: 'icon-picture', robot: 'icon-th'},

		init: function(delegate, $collection) {
			this.delegate = delegate;
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

			if (this.content.title) {
				var $title = $('<div class="dares-header-title">' + this.content.title + '</div>');
				this.$header.append($title);
			}

			if (this.content.difficulty) {
				var $difficulty = $('<div class="dares-header-difficulty"></div>');
				for (var d=0; d<this.content.difficulty; d++) {
					$difficulty.append('<i class="icon-star-yellow"></i>');
				}
				this.$header.append($difficulty);
			}

			this.$collection.toggleClass('dares-collection-edit', this.content.edit);
			this.$collection.toggleClass('dares-collection-view', !this.content.edit);

			this.$body.children('.dares-body-item').remove(); // prevent $.data leaks
			for (var i=0; i<this.content.dares.length; i++) {
				var dare = this.content.dares[i];

				var $item = $('<div class="dares-body-item"></div>');

				if (dare.instance.completed) {
					$item.addClass('dares-body-completed');
				}

				$item.data('_id', dare._id);
				$item.on('click', this.itemViewClick.bind(this));

				var $name = $('<span class="dares-body-name">' + dare.name + ' </span>');
				for (var j=0; j<dare.outputs.length; j++) {
					var output = dare.outputs[j];
					if (this.icons[output] !== undefined) {
						$name.append('<span class="dares-body-output"><i class="' + this.icons[output] + ' icon-white"></i> ' + output + '</span>');
					}
				}
				$item.append($name);
				$item.append('<span class="dares-body-highscore"><i class="icon-trophy"></i> ' + dare.instance.highscore +'</span>');

				var $editButton = $('<button class="btn dares-body-edit">Edit</button>');
				$editButton.on('click', this.itemEditClick.bind(this));
				$item.append($editButton);

				this.$body.append($item);
			}
		},

		itemViewClick: function(event) {
			event.stopImmediatePropagation();
			var $target = $(event.delegateTarget);
			this.delegate.viewDare($target.data('_id'));
		},

		itemEditClick: function(event) {
			event.stopImmediatePropagation();
			var $target = $(event.delegateTarget).parent();
			this.delegate.editDare($target.data('_id'));
		}
	};
};
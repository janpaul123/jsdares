/*jshint node:true jquery:true*/
"use strict";

module.exports = function(dares) {
	dares.Collection = function() { return this.init.apply(this, arguments); };
	dares.Collection.prototype = {
		icons: {console: 'icon-list-alt', canvas: 'icon-picture', robot: 'icon-th'},

		init: function(id, page, $collection) {
			this.id = id;
			this.page = page;
			this.$collection = $collection;
			this.$collection.addClass('dares-collection');

			this.$header = $('<div class="dares-header"></div>');
			this.$collection.append(this.$header);

			this.$body = $('<div class="dares-body"></div>');
			this.$collection.append(this.$body);

			this.page.getSync().getCollectionAndDaresAndInstances(this.id, this.updateContent.bind(this));
		},

		remove: function() {
			this.$header.remove();
			this.$body.remove();
			this.$modal.remove();
			this.$collection.removeClass('dares-collection');
		},

		updateContent: function(content) {
			this.content = content;
			this.render();
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

				$item.data('index', i);
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
			var index = $target.data('index');
			this.page.getSync().getDareAndInstance(this.content.dares[index]._id, (function(dare) {
				this.content[index] = dare;
				this.render();
				this.index = index;
				var ui = this.page.openModal(this);
				new dares[dare.type](this, ui, dare);
			}).bind(this));
		},

		selectDare: function(body, number) {
			this.list.bodys[body].dares[number].selectDare();
		},

		updateInstance: function(completed, highscore, text) {
			this.content.dares[this.index].instance.completed = completed;
			this.content.dares[this.index].instance.highscore = highscore;
			this.content.dares[this.index].instance.text = text;
			this.render();
			this.page.getSync().updateInstance(this.content.dares[this.index].instance);
		},

		updateProgram: function(text) {
			this.content.dares[this.index].instance.text = text;
			this.page.getSync().updateProgram(this.content.dares[this.index].instance);
		}
	};
};
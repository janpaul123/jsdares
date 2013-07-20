/*jshint node:true jquery:true*/
"use strict";

var relativeDate = require('relative-date');

module.exports = function(dares) {
	dares.Collection = function() { return this.init.apply(this, arguments); };
	dares.Collection.prototype = {
		icons: {console: 'icon-list-alt', canvas: 'icon-picture', robot: 'icon-th'},

		init: function(delegate, $collection, showAuthors) {
			this.delegate = delegate;
			this.$collection = $collection;
			this.showAuthors = showAuthors;

			this.$collection.addClass('dares-collection');

			this.$header = $('<div class="dares-header"></div>');
			this.$collection.append(this.$header);

			this.$buttons = $('<div class="dares-header-buttons"></div>');
			this.$header.append(this.$buttons);

			this.$difficulty = $('<div class="dares-header-difficulty"></div>');
			this.$header.append(this.$difficulty);

			this.$title = $('<div class="dares-header-title"></div>');
			this.$header.append(this.$title);

			this.$body = $('<div class="dares-body"></div>');
			this.$collection.append(this.$body);

			this.content = null;
			this.userId = null;
			this.admin = false;
		},

		remove: function() {
			this.$header.remove();
			this.$body.remove();
			this.$buttons.remove();
			this.$collection.removeClass('dares-collection');
		},

		addButton: function(html, callback) {
			var $button = $('<button class="btn">' + html + '</button>');
			$button.on('click', callback);
			this.$buttons.append($button);
		},

		update: function(content, userId, admin) {
			this.content = content;
			this.userId = userId;
			this.admin = admin;
			this.render();
		},

		render: function() {
			this.$difficulty.html('');
			for (var d=0; d<(this.content.difficulty || 0); d++) {
				this.$difficulty.append('<i class="icon-star-yellow"></i>');
			}

			this.$title.text(this.content.title || '');

			this.$body.children('.dares-body-item').remove(); // prevent $.data leaks
			for (var i=0; i<this.content.dares.length; i++) {
				var dare = this.content.dares[i];

				if (dare.published || this.userId === dare.userId || this.admin) {
					var $item = $('<div class="dares-body-item"></div>');

					if (dare.instance && dare.instance.completed) {
						$item.addClass('dares-body-completed');
					}

					if (!dare.published) {
						$item.addClass('dares-body-unpublished');
					}

					$item.data('_id', dare._id);
					$item.on('click', _(this.itemViewClick).bind(this));

					if (this.userId === dare.userId || this.admin) {
						var $editButton = $('<button class="btn dares-body-edit">Edit</button>');
						$editButton.on('click', _(this.itemEditClick).bind(this));
						$item.append($editButton);
					}

					var highscore = '<i class="icon-trophy"></i> <span title="not yet completed">0</span>';
					if (dare.instance && dare.instance.highscore) {
						highscore = '<i class="icon-trophy"></i> <span title="completed with ' + dare.instance.highscore + ' points">' + dare.instance.highscore + '</span>';
					}

					var statistics = _.extend({highscore: 0, total: 0, completed: 0}, dare.statistics || {});

					highscore += '/<span title="maximum score (so far) is ' + statistics.highscore + ' points">' + statistics.highscore + '</span>';
					var percentage = Math.round(100*statistics.completed/statistics.total) || 0;
					highscore += ' <i class="icon-tasks"></i> ';
					highscore += '<span title="' + statistics.completed + ' out of ' + statistics.total + ' users (' + percentage + '%) finished this dare">' + statistics.completed + ' (' + percentage + '%)</span>';

					$item.append('<span class="dares-body-highscore">' + highscore +'</span>');

					var $name = $('<span class="dares-body-name">' + dare.name + ' </span>');

					if (this.showAuthors) {
						var $link = $('<a class="btn dares-body-author" href="/superheroes/' + dare.user.link + '"><i class="icon-user"></i> ' + dare.user.screenname + '</a>');
						$link.on('click', _(this.authorClick).bind(this));

						var $authors = $('<div></div>');
						$authors.append($link);

						$authors.append(' <span class="dares-body-time">' + relativeDate(new Date(dare.modifiedTime || dare.createdTime)) + '</span>');

						$name.append($authors);
					}

					/*
					for (var j=0; j<dare.outputs.length; j++) {
						var output = dare.outputs[j];
						if (this.icons[output] !== undefined) {
							$name.append('<span class="dares-body-output"><i class="icon icon-white ' + this.icons[output] + '"></i> ' + output + '</span>');
						}
					}
					*/
					$item.append($name);

					this.$body.append($item);
				}
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
		},

		authorClick: function(event) {
			event.stopImmediatePropagation();
			event.stopPropagation();
			event.preventDefault();
			var $target = $(event.delegateTarget);
			// Hack: pass in actual manager or so
			this.delegate.delegate.navigateTo($target.attr('href'));
		}
	};
};

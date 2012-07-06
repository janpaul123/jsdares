/*jshint node:true jquery:true*/
"use strict";

var applet = require('jsmm-applet');

module.exports = function(dares) {
	dares.Dares = function() { return this.init.apply(this, arguments); };

	dares.Dares.prototype = {
		icons: {console: 'icon-list-alt', canvas: 'icon-picture', robot: 'icon-th'},

		init: function(delegate, $collection, content) {
			this.delegate = delegate;
			this.content = content;
			this.$collection = $collection;
			this.$collection.addClass('dares-collection');

			//this.$header = $('<div class="modal-header"><a href="#" class="close" data-dismiss="modal">&times;</a><h3>Select a Dare</h3></div>');
			//this.$collection.append(this.$header);
			this.$header = $('<div class="dares-header"></div>');
			this.$collection.append(this.$header);

			var $title = $('<div class="dares-header-title">' + content.title + '</div>');
			this.$header.append($title);

			var $difficulty = $('<div class="dares-header-difficulty"></div>');
			for (var i=0; i<content.difficulty; i++) {
				$difficulty.append('<i class="icon-star-yellow"></i>');
			}
			this.$header.append($difficulty);

			this.$body = $('<div class="dares-body"></div>');
			this.$collection.append(this.$body);

			this.$modal = $('<div class="dares-modal"></div>');
			// this.$modal.on('click', $.proxy(this.close, this));
			$('body').append(this.$modal);

			this.$ui = $('<div class="dares-modal-ui"></div>');
			this.$modal.append(this.$ui);

			this.ui = new applet.UI(this.$ui, {
				close: $.proxy(this.closeModal, this)
			});
			this.dare = null;
			
			this.updateDares();
		},

		remove: function() {
			if (this.dare !== null) {
				this.dare.remove();
			}
			this.$header.remove();
			this.$body.remove();
			this.$modal.remove();
			this.$collection.removeClass('dares-collection');
		},

		updateDares: function() {
			this.$body.children('.dares-body-item').remove(); // prevent $.data leaks
			for (var i=0; i<this.content.dares.length; i++) {
				var dare = this.content.dares[i];

				var $item = $('<div class="dares-body-item"></div>');
				if (dare.completed) {
					$item.addClass('dares-body-completed');
				}

				$item.data('index', i);
				$item.on('click', $.proxy(this.itemClick, this));

				var $name = $('<span class="dares-body-name">' + dare.name + ' </span>');
				for (var j=0; j<dare.outputs.length; j++) {
					var output = dare.outputs[j];
					$name.append('<span class="dares-body-output"><i class="' + this.icons[output] + ' icon-white"></i> ' + output + '</span>');
				}
				$item.append($name);
				$item.append('<span class="dares-body-highscore"><i class="icon-trophy"></i> ' + dare.highscore +'</span>');

				this.$body.append($item);
			}
		},

		itemClick: function(event) {
			this.closeModal();

			var $target = $(event.delegateTarget);
			this.index = $target.data('index');
			var dare = this.content.dares[this.index];

			this.$modal.addClass('dares-modal-active');
			this.dare = new dares[dare.type](this, this.ui, dare);

			var $ui = this.$ui;
			setTimeout(function() { $ui.addClass('dares-modal-ui-active'); }, 0);
		},

		closeModal: function() {
			if (this.dare !== null) {
				this.dare.remove();
				this.$modal.removeClass('dares-modal-active');
				this.$ui.removeClass('dares-modal-ui-active');
			}
		},

		selectDare: function(body, number) {
			this.list.bodys[body].dares[number].selectDare();
		},

		updateHighscore: function(highscore) {
			this.content.dares[this.index].completed = true;
			this.content.dares[this.index].highscore = highscore;
			this.updateDares();
			this.delegate.updateContent(this.content);
		},

		updateCode: function(code) {
			this.content.dares[this.index].editor.text = code;
			this.delegate.updateContent(this.content);
		}
	};
};
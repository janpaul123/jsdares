/*jshint node:true jquery:true*/
"use strict";

var menu = [
	{title: 'introduction', url: '', urls: ['', 'intro', 'full'], locked: false},
	{title: 'learn', url: 'learn', urls: ['learn'], locked: true},
	{title: 'create', url: 'create', urls: ['create'], locked: true}
];

module.exports = function(client) {
	client.MenuHeader = function() { return this.init.apply(this, arguments); };
	client.MenuHeader.prototype = {
		init: function(delegate) {
			this.delegate = delegate;
			this.$div = $('#header-menu');
			this.$arrow = $('#header-arrow');
			this.$tabs = [];
			this.$links = [];
			this.$locks = [];
			this.urls = {};
			this.locksShown = false;

			for (var i=0; i<menu.length; i++) {
				var $tab = $('<li></li>');
				var $link = $('<a href="#">' + menu[i].title + ' </a>');
				var $lock = $('<i class="icon icon-lock-color hide"></i>');
				$link.append($lock);
				$tab.append($link);
				this.$div.append($tab);

				$link.data('index', i);
				$link.on('click', this.clickHandler.bind(this));
				this.$tabs.push($tab);
				this.$links.push($link);
				this.$locks.push($lock);

				for (var j=0; j<menu[i].urls.length; j++) {
					this.urls[menu[i].urls[j]] = i;
				}
			}

			this.$tabs[0].addClass('header-menu-first');
		},

		clickHandler: function(event) {
			event.preventDefault();
			var index = $(event.delegateTarget).data('index');
			if (this.locksShown && menu[index].locked) {
				var $arrow = this.$arrow;
				$arrow.removeClass('arrow-animate');
				window.setTimeout(function() { $arrow.addClass('arrow-animate'); }, 0);
			} else {
				this.delegate.navigateTo('/' + menu[index].url);
			}
		},

		mouseMoveHandler: function(event) {
			this.$arrow.addClass('arrow-active');
		},

		mouseLeaveHandler: function(event) {
			this.$arrow.removeClass('arrow-active arrow-animate');
		},

		navigateTo: function(splitUrl) {
			this.$div.children('li').removeClass('active');
			this.$tabs[this.urls[splitUrl[0] || 'home']].addClass('active');
		},

		showLocks: function(show) {
			this.$arrow.removeClass('arrow-animate');
			this.locksShown = show;
			for (var i=0; i<menu.length; i++) {
				var hideLock = !show || !menu[i].locked;
				this.$locks[i].toggleClass('hide', hideLock);
				this.$links[i].off('mousemove mouseleave');
				if (!hideLock) {
					this.$links[i].on('mousemove', this.mouseMoveHandler.bind(this));
					this.$links[i].on('mouseleave', this.mouseLeaveHandler.bind(this));
				}
			}
		}
	};
};
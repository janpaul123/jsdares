/*jshint node:true jquery:true*/
"use strict";

var dares = require('../dares');

module.exports = function(client) {
	client.PageAbout = function() { return this.init.apply(this, arguments); };
	client.PageAbout.prototype = {
		type: 'PageAbout',

		init: function(delegate, $div) {
			this.delegate = delegate;
			this.$div = $div;

			this.$div.html('<div class="row-fluid"><div class="span3"><h3>Team</h3><p><button class="btn janpaul123"><img src="https://en.gravatar.com/userimage/7626980/caf975f52288bcac2b54655d45a48ea0.jpeg"/><span><i class="icon icon-user"></i> JanPaul123</span></button></p><p><strong>You?</strong></p><div class="volunteers"><h3>Superheroes</h3> <span class="volunteers-superheroes"></span></div></div><div class="span9"><h2>About</h2><p><strong>jsdares is an experimental educational programming environment.</strong> You can learn by playing "dares" created by other users, or explore the "computational universe" on your own. If you already know programming, you can create dares and share them with the world.</p><p>All the code for jsdares was written in JavaScript by Jan Paul Posma for a masters dissertation at the <a href="http://www.cs.ox.ac.uk">University of Oxford</a>. The code is available under the MIT license on <a href="https://github.com/janpaul123/jsdares">GitHub</a>. You can also view the <a href="http://thesis.jsdares.com">thesis</a> online.</p><p>Thanks to everyone who has contributed to jsdares in one way or another, see the thesis for a complete list. Special thanks to these people for libraries and icons: <a href="http://jquery.com">jQuery</a>, <a href="http://worrydream.com">LayerScript/LOA</a> (MIT license); <a href="http://twitter.github.com/bootstrap/">Twitter Bootstrap</a> (Apache license); <a href="http://glyphicons.com/">Glyphicons</a>, <a href="http://www.famfamfam.com/">FAMFAMFAM</a>, <a href="http://thenounproject.com/noun/mouse/#icon-No890">Camila Bertoco (Noun Project)</a> (CC-BY license); <a href="http://thenounproject.com/noun/trophy/#icon-No1198">Nathan Driskell (Noun Project)</a> (CC-0); <a href="https://bitbucket.org/lindekleiv/jquery-ui-colorpicker">Olav Andreas Lindekleiv</a> (BSD license); <a href="http://pixtea.com/cup-award-icons/">Ioan Decean</a>, <a href="http://ajaxload.info/">ajaxload.info</a> ("free use").</p><h3>Restrictions</h3><p>Currently, jsdares is very experimental. A lot of work has been gone into making the interface concepts as used here work. In order to make the implementation a bit easier, there are a number of restrictions. We only support the latest version of <a href="www.google.com/chrome">Google Chrome</a>, <a href="http://firefox.com">Mozilla Firefox</a>, and <a href="apple.com/safari">Apple Safari</a>. Also, the JavaScript dialect is a severely restricted one, which is why we call it <var>js--</var>. You cannot create objects, running time is limited, we enforce a strict policy about newlines, and a whole lot of language features are just removed.</p><h3>Goals</h3><p><strong>The long-term goal is to take human ability to a next level by seriously improving programming. The short-term goal is to create an educational programming environment in which it is easy to implement and test new ideas in order to get there.</strong></p><p>This vision is inspired by the likes of <a href="http://worrydream.com">Bret Victor</a>, <a href="http://papert.org">Seymour Papert</a>, <a href="http://dougengelbart.org/">Douglas Engelbart</a>, and <a href="http://www.vpri.org/">Alan Kay</a>. The currently implemented features are merely an example, a starting point if you will. The restriction to an educational context allows us to quickly test new ideas with lots of people, without having to implement it completely in a real-life programming environment.</p><h3>Contribute</h3><p>The easiest way to contribute to jsdares is to start creating dares. You can also just start learning, and see how it goes. If you run into any problems you can help us by adding it to the <a href="https://github.com/janpaul123/jsdares/issues">issue tracker</a>, provided it is not on there already. You can also add all your ideas there!</p><p>If you would like to contribute to the <a href="https://github.com/janpaul123/jsdares">source code of jsdares</a>, then that would be even more awesome! You can find fixes for bugs and add new features, and submit pull requests for those. There are also larger things to be done. First of all, we need to make it easy to implement other editors, outputs, debuggers, interactions, and even other programming languages. There are numerous features that could be tried out. For example, the editor could be much improved still, visualising the program flow, giving in-line help, etc. There are many, many papers with ideas about improving programming, which could be tested in jsdares. Another possibility is to allow users to build their own editing interface without having to touch the GitHub code, this would allow for ever faster experimentation. The educational aspect can also be improved: more dares, different ways of scoring, and so on. Finally the website needs a lot of work to make it really usable.</p><p>If you want to get involved, do not hesitate to fork the project on <a href="https://github.com/janpaul123/jsdares">GitHub</a>, and implement new ideas. Currently the code is not well documented, and often you may find that things are done in crazy, unfamiliar way. This is the result of a long time of programming in isolation, without paying too much attention to <em>how things are done</em>, but rather to <em>getting things done</em>.</p><p>Since this is an open source project, and I also have a <a href="http://factlink.com">day job in changing the world</a>, I can only spend so many hours each week improving stuff. If you like this project so much that you would like to put some serious effort in it, please contact me at <a href="mailto:jp@jsdares.com">jp@jsdares.com</a>. Of course, you can also contact me with other questions and inquiries, but be sure to check the <a href="https://github.com/janpaul123/jsdares/issues">issue tracker</a> when talking about problems and features!</p></div></div>');

			this.$div.find('.janpaul123').on('click', (function() { this.delegate.navigateTo('/superheroes/janpaul123'); }).bind(this));

			this.$superheroes = this.$div.find('.volunteers-superheroes');

			var navigateToUser = (function(link) {
				return (function() { this.delegate.navigateTo('/superheroes/' + link); }).bind(this);
			}).bind(this);

			this.delegate.getSync().getUsersAll((function(users) {
				if (users.length <= 1) this.$superheroes.text('none...');
				for (var i=0; i<users.length; i++) {
					var user = users[i];
					var link = user.link;
					if (user.screenname !== 'JanPaul123') {
						var $button = $('<button class="btn"><i class="icon icon-user"></i> ' + user.screenname + '</button>');
						$button.on('click', navigateToUser(link));
						this.$superheroes.append($button);
					}
				}
			}).bind(this));
		},

		remove: function() {
			this.$div.html('');
		},

		navigateTo: function(splitUrl) {
		}
	};
};

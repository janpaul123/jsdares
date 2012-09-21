/*jshint node:true jquery:true*/
"use strict";

var shared = require('../shared');
var refreshSeconds = 60;

module.exports = function(client) {
	client.Login = function() { return this.init.apply(this, arguments); };
	client.Login.prototype = {
		init: function(delegate) {
			this.delegate = delegate;
			this.$div = $('#header-login');
			this.timeout = null;
			this.setTimeout(500); // half a second
		},

		remove: function() {
			if (this.register) this.register.hide();
			this.register = undefined;
		},

		clear: function() {
			if (this.$username) this.$username.remove();
			if (this.$password) this.$password.remove();
			if (this.$login) this.$login.remove();
			if (this.$register) this.$register.remove();
			if (this.$group) this.$group.remove();
			if (this.$invalid) this.$invalid.remove();
			if (this.$form) this.$form.remove();
			if (this.$loader) this.$loader.remove();

			if (this.$logout) this.$logout.remove();
			if (this.$name) this.$name.remove();
			if (this.$points) this.$points.remove();
			if (this.$details) this.$details.remove();

			this.$username = this.$password = this.$login = this.register = this.$group = this.$invalid =
			this.$form = this.$loader = this.$logout = this.$name = this.$points =  this.$details = undefined;
		},

		showLogin: function() {
			this.clear();
			this.$form = $('<form class="form-inline"></form>');
			this.$username = $('<input type="text" tabindex="1" placeholder="Username" class="login-field-username input-small"></input>');
			this.$password = $('<input type="password" tabindex="2" placeholder="Password" class="login-field-password input-small"></input>');
			this.$login = $('<input type="submit" tabindex="3" class="btn" value="Login"></input>');
			this.$register = $('<input type="button" tabindex="4" class="btn" value="Register"></input>');
			this.$group = $('<div class="btn-group"></div>');
			this.$group.append(this.$login, this.$register);
			this.$invalid = $('<div class="login-invalid hide">Invalid username or password</div>');
			this.$form.append(this.$group, this.$password, this.$username, this.$invalid);
			this.$loader = $('<i class="icon icon-loader login-loader hide"></i>');
			this.$div.append(this.$form, this.$loader);

			this.$form.on('submit', this.loginHandler.bind(this));
			this.$register.on('click', this.registerHandler.bind(this));
		},

		showLogout: function() {
			this.clear();
			this.$logout = $('<button type="submit" class="btn login-logout">Logout</button>');
			this.$name = $('<span class="login-details-name"></span>');
			this.$points = $('<span class="login-details-points"></span>');
			this.$details = $('<div class="login-details btn"></div>');
			this.$details.append(this.$name, $('<i class="icon icon-trophy"></i> '), this.$points);
			this.$div.append(this.$logout, this.$details);

			this.$logout.on('click', this.logoutHandler.bind(this));
		},

		update: function(data) {
			if (!data.loggedIn && !this.$form) {
				this.showLogin();
			} else if (data.loggedIn) {
				if (!this.$details) {
					this.showLogout();
				}
				this.$name.text(data.screenname);
				this.$points.text(data.points);
			}
			this.setTimeout(refreshSeconds*1000);
		},

		loginHandler: function(event) {
			event.preventDefault();

			var username = this.$username.val(), password = this.$password.val();
			if (!shared.validation.username(username) || !shared.validation.password(password)) {
				this.$invalid.removeClass('hide');
			} else {
				this.$invalid.addClass('hide');
				this.$loader.removeClass('hide');
				this.delegate.getSync().login(username, password, (function(error) {
					this.$loader.addClass('hide');
					if (error.status === 404) {
						this.$invalid.removeClass('hide');
						return false;
					}
				}).bind(this));
			}
		},

		logoutHandler: function() {
			this.delegate.getSync().logout();
		},

		registerHandler: function() {
			if (!this.register) {
				this.register = new client.Register(this, this.delegate.getSync(), this.$username.val(), this.$password.val());
			}
		},

		registerClosed: function() {
			this.register = undefined;
		},

		setTimeout: function(time) {
			if (this.timeout !== null) window.clearTimeout(this.timeout);

			this.timeout = window.setTimeout((function() {
				this.timeout = null;
				this.delegate.getSync().getLoginData();
			}).bind(this), time);
		}
	};

	client.Register = function() { return this.init.apply(this, arguments); };
	client.Register.prototype = {
		init: function(delegate, sync, username, password) {
			this.delegate = delegate;
			this.sync = sync;
			this.$div = $('<div class="header-register modal"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h3>Register</h3></div></div>');
			this.$body = $('<div class="modal-body header-register-form"><p>Sweet, you are only a few clicks away from registering! Your progress so far will be saved into your new account.</p><p>You do not have to repeat any of the fields, but if you mistype anything just contact me at <a href="mailto:jp@jsdares.com">jp@jsdares.com</a>.</p></div>');
			this.$form = $('<form></form>');
			this.$body.append(this.$form);
			this.$div.append(this.$body);

			this.$username = $('<input type="text" placeholder="Username" class="register-username input-large"></input>');
			this.$usernameIcon = $('<i class="icon header-register-icon-right"></i>');
			this.$usernameTooltip = $('<div class="tooltip right hide header-register-tooltip-username"><div class="tooltip-arrow"></div></div>');
			this.$usernameTooltipText = $('<div class="tooltip-inner"></div>');
			this.$usernameTooltip.append(this.$usernameTooltipText);
			this.$usernameIcon.append(this.$usernameTooltip);
			this.$form.append($('<div class="input-prepend"><span class="add-on"><i class="icon icon-user"></i></span></div>').append(this.$username, this.$usernameIcon));
			this.$username.val(username);

			this.$password = $('<input type="password" placeholder="Password" class="register-password input-large"></input>');
			this.$passwordIcon = $('<i class="icon header-register-icon-right"></i>');
			this.$passwordTooltip = $('<div class="tooltip right hide header-register-tooltip-password"><div class="tooltip-arrow"></div></div>');
			this.$passwordTooltipText = $('<div class="tooltip-inner"></div>');
			this.$passwordTooltip.append(this.$passwordTooltipText);
			this.$passwordIcon.append(this.$passwordTooltip);
			this.$form.append($('<div class="input-prepend"><span class="add-on"><i class="icon icon-lock"></i></span></div>').append(this.$password, this.$passwordIcon));
			this.$password.val(password);

			this.$email = $('<input type="email" placeholder="Email address" class="register-email input-large"></input>');
			this.$emailIcon = $('<i class="icon header-register-icon-right"></i>');
			this.$emailTooltip = $('<div class="tooltip right hide header-register-tooltip-email"><div class="tooltip-arrow"></div></div>');
			this.$emailTooltipText = $('<div class="tooltip-inner"></div>');
			this.$emailTooltip.append(this.$emailTooltipText);
			this.$emailIcon.append(this.$emailTooltip);
			this.$form.append($('<div class="input-prepend"><span class="add-on"><i class="icon icon-envelope"></i></span></div>').append(this.$email, this.$emailIcon));

			this.$div.append('<div class="modal-body header-register-confirmation"><p>Well done! We have sent a welcome email to <strong class="header-register-confirmation-email"></strong>, be sure to check it. If you cannot find it, please contact me at <a href="mailto:jp@jsdares.com">jp@jsdares.com</a>.</p><p>You can now continue learning and start creating immediately!</p></div>');

			this.$footer = $('<div class="modal-footer"></div>');
			this.$register = $('<button class="btn btn-primary header-register-submit">Register</button>');
			this.$submitIcon = $('<i class="icon icon-loader hide"></i>');
			this.$footer.append(this.$register, '<button class="btn" data-dismiss="modal">Close</button>', this.$submitIcon);
			this.$div.append(this.$footer);


			this.$form.on('submit', this.submitHandler.bind(this));
			this.$register.on('click', this.submitHandler.bind(this));
			this.$username.on('blur keyup', this.checkUsername.bind(this));
			this.$password.on('blur keyup', this.checkPassword.bind(this));
			this.$email.on('blur keyup', this.checkEmail.bind(this));

			this.modal = this.$div.modal();
			this.$div.on('hidden', this.remove.bind(this));

			this.checkUsername();
			this.checkPassword();
		},

		remove: function() {
			this.$username.remove();
			this.$password.remove();
			this.$email.remove();
			this.$register.remove();
			this.$form.remove();
			this.$div.remove();
			this.delegate.registerClosed();
		},

		hide: function() {
			this.$div.modal('hide');
		},

		checkUsername: function() {
			this.$usernameIcon.removeClass('icon-ok-sign-color icon-exclamation-sign-color icon-loader');
			this.$usernameTooltip.addClass('hide');

			var username = this.$username.val();
			if (username.length > 0) {
				if (shared.validation.username(username)) {
					this.$usernameIcon.addClass('icon-loader');
					this.sync.checkUsername(username, (function() {
						this.$usernameIcon.removeClass('icon-ok-sign-color icon-exclamation-sign-color icon-loader');
						this.$usernameIcon.addClass('icon-ok-sign-color');
					}).bind(this), (function() {
						this.$usernameIcon.removeClass('icon-ok-sign-color icon-exclamation-sign-color icon-loader');
						this.$usernameIcon.addClass('icon-exclamation-sign-color');
						this.$usernameTooltip.removeClass('hide');
						this.$usernameTooltipText.text('Username is already taken');
					}).bind(this));
				} else {
					this.$usernameIcon.addClass('icon-exclamation-sign-color');
					this.$usernameTooltip.removeClass('hide');
					this.$usernameTooltipText.text('Invalid username');
				}
			}
		},

		checkPassword: function() {
			this.$passwordIcon.removeClass('icon-ok-sign-color icon-exclamation-sign-color icon-loader');
			this.$passwordTooltip.addClass('hide');

			var password = this.$password.val();
			if (password.length > 0) {
				if (shared.validation.password(password)) {
					this.$passwordIcon.addClass('icon-ok-sign-color');
				} else {
					this.$passwordIcon.addClass('icon-exclamation-sign-color');
					this.$passwordTooltip.removeClass('hide');
					this.$passwordTooltipText.text('Password is too short');
				}
			}
		},

		checkEmail: function() {
			this.$emailIcon.removeClass('icon-ok-sign-color icon-exclamation-sign-color icon-loader');
			this.$emailTooltip.addClass('hide');

			var email = this.$email.val();
			if (email.length > 0) {
				if (shared.validation.email(email)) {
					this.$emailIcon.addClass('icon-loader');
					this.sync.checkEmail(email, (function() {
						this.$emailIcon.removeClass('icon-ok-sign-color icon-exclamation-sign-color icon-loader');
						this.$emailIcon.addClass('icon-ok-sign-color');
					}).bind(this), (function() {
						this.$emailIcon.removeClass('icon-ok-sign-color icon-exclamation-sign-color icon-loader');
						this.$emailIcon.addClass('icon-exclamation-sign-color');
						this.$emailTooltip.removeClass('hide');
						this.$emailTooltipText.text('Email address is already used');
					}).bind(this));
				} else {
					this.$emailIcon.addClass('icon-exclamation-sign-color');
					this.$emailTooltip.removeClass('hide');
					this.$emailTooltipText.text('Invalid email address');
				}
			}
		},

		submitHandler: function() {
			this.$submitIcon.addClass('hide');
			var username = this.$username.val(), password = this.$password.val(), email = this.$email.val();

			if (username.length <= 0) {
				this.$usernameIcon.removeClass('icon-ok-sign-color icon-loader');
				this.$usernameIcon.addClass('icon-exclamation-sign-color');
				this.$usernameTooltip.removeClass('hide');
				this.$usernameTooltipText.text('Username is empty');
			} else {
				this.checkUsername();
			}

			if (password.length <= 0) {
				this.$passwordIcon.removeClass('icon-ok-sign-color icon-loader');
				this.$passwordIcon.addClass('icon-exclamation-sign-color');
				this.$passwordTooltip.removeClass('hide');
				this.$passwordTooltipText.text('Password is empty');
			} else {
				this.checkPassword();
			}

			if (email.length <= 0) {
				this.$emailIcon.removeClass('icon-ok-sign-color icon-loader');
				this.$emailIcon.addClass('icon-exclamation-sign-color');
				this.$emailTooltip.removeClass('hide');
				this.$emailTooltipText.text('Email is empty');
			} else {
				this.checkEmail();
			}

			if (shared.validation.username(username) && shared.validation.password(password) && shared.validation.email(email)) {
				this.$submitIcon.removeClass('hide');
				this.sync.register(username, password, email, (function() {
					this.$submitIcon.addClass('hide');
					this.$div.addClass('header-register-done');
					this.$div.find('.header-register-confirmation-email').text(email);
				}).bind(this), (function () {
					this.$submitIcon.addClass('hide');
				}).bind(this));
			}
		}
	};
};
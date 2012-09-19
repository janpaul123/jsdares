/*jshint node:true*/
"use strict";

var nodemailer = require('nodemailer');
var mustache = require('mustache');
var fs = require('fs');
var templates = ['base', 'register'];

module.exports = function(server) {
	server.Mailer = function() { return this.init.apply(this, arguments); };
	server.Mailer.prototype = {

		init: function(options) {
			this.options = options;
			this.transport = nodemailer.createTransport(this.options.transport.type, this.options.transport.options);

			this.templates = {};
			for (var i=0; i<templates.length; i++) {
				this.templates[templates[i] + '-text'] = fs.readFileSync('server/mails/' + templates[i] + '-text.mustache', 'utf8');
				this.templates[templates[i] + '-html'] = fs.readFileSync('server/mails/' + templates[i] + '-html.mustache', 'utf8');
			}
		},

		sendRegister: function(email, username) {
			this.send('register', {to: {name: username, email: email}, subject: "Nice! You've just joined jsdare.", username: username});
		},

		send: function(type, data) {
			var mailOptions = {
				from: this.options.from.name + '<' + this.options.from.email + '>',
				to: data.to.name + '<' + data.to.email + '>',
				subject: data.subject,
				text: mustache.render(this.templates['base-text'], {subject: data.subject, content: mustache.render(this.templates[type + '-text'], data)}),
				html: mustache.render(this.templates['base-html'], {subject: data.subject, content: mustache.render(this.templates[type + '-html'], data)})
			};

			this.transport.sendMail(mailOptions, (function(error, response) {
				if (error) {
					console.error('Error in mailer @ ' + type + ' @ DATA : ' + JSON.stringify(data) + ' @ ERROR: '  + error);
				} else if (this.options.log) {
					console.log('SENT MAIL ' + type + ' - ' + data.to.name + '<' + data.to.email + '>');
				}
			}).bind(this));
		}
	};
};

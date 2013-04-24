/*jshint node:true*/
"use strict";

require('./server').init({
	port: process.env.PORT || 3000,
	mongodb: 'mongodb://' + process.env.MONGO_DB_PATH + '?auto_reconnect',
	assets: __dirname + '/assets-dev',
	browserify: {
		entry: __dirname + '/entry.js',
		debug: false,
		cache: true
	},
	less: {
		src: __dirname + '/client',
		dest: __dirname + '/assets-dev'
	},
	logs: {
		requests: false
	},
	api: {
		cookieSecret: process.env.COOKIE_SECRET,
		errors: {
			400: true,
			401: true,
			404: true,
			500: true
		}
	},
	mailer: {
		transport: {
			type: 'SMTP',
			options: {
				service: 'Gmail',
				auth: {
					user: process.env.GMAIL_USER,
					pass: process.env.GMAIL_PASS
				}
			}
		},
		from: {
			name: 'jsdares',
			email: 'jp@jsdares.com'
		},
		log: true
	}
});

console.log('Heroku webserver loaded');

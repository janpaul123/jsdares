/*jshint node:true*/
"use strict";

require('./server').init({
	port: 3000,
	mongodb: 'localhost:27017/jsdare-dev?auto_reconnect',
	assets: __dirname + '/assets-dev',
	browserify: {
		entry: __dirname + '/entry.js',
		debug: true
	},
	less: {
		src: __dirname + '/client',
		dest: __dirname + '/assets-dev'
	},
	logs: {
		requests: true
	},
	api: {
		cookieSecret: 'i love banana bread!',
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
				service: 'Gmail', // For example!
				auth: {
					user: 'someuser@gmail.com',
					pass: 'somepassword'
				}
			}
		},
		from: {
			name: 'somepassword',
			email: 'someuser@gmail.com'
		},
		log: true
	}
});

if (true) { // Change to false to disable unit testing
	var jsmm = require('./jsmm-applet/jsmm');
	if (jsmm.test.runAll()) {
		console.log('js-- unit testing successful');
	} else {
		console.log(jsmm.test.output);
	}
}

console.log('Development webserver loaded');

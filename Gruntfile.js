process.env.JSDARES_ENV = process.env.JSDARES_ENV || 'development';
process.env.JSDARES_PORT = process.env.JSDARES_PORT || 3000;
process.env.JSDARES_MONGO_DB_PATH = process.env.JSDARES_MONGO_DB_PATH || 'localhost:27017/jsdares';
process.env.JSDARES_EMAIL = process.env.JSDARES_EMAIL || 'test@test.com';
process.env.JSDARES_EMAIL_NAME = process.env.JSDARES_EMAIL_NAME || 'jsdares';
process.env.JSDARES_COOKIE_SECRET = process.env.JSDARES_COOKIE_SECRET || 'somesecret';
// process.env.JSDARES_GMAIL_USER
// process.env.JSDARES_GMAIL_PASS

var debug_enabled = (process.env.JSDARES_ENV === 'development');

serverOptions = {
	port: process.env.JSDARES_PORT,
	mongodb: 'mongodb://' + process.env.JSDARES_MONGO_DB_PATH + '?auto_reconnect',
	assets: __dirname + '/dist/assets',
	browserify: {
		entry: __dirname + '/dist/client-entry.js',
		debug: debug_enabled,
		cache: !debug_enabled
	},
	logs: {
		requests: debug_enabled
	},
	api: {
		cookieSecret: process.env.JSDARES_COOKIE_SECRET,
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
					user: process.env.JSDARES_GMAIL_USER,
					pass: process.env.JSDARES_GMAIL_PASS
				}
			}
		},
		from: {
			name: 'jsdares',
			email: process.env.JSDARES_EMAIL
		},
		log: debug_enabled
	},
	keepalive: true,
	middleware: function(connect, options) {
		return [
			require('./dist/server').middleware(connect, options)
		];
	}
};

module.exports = function(grunt) {
	grunt.initConfig({

		copy: {
			all: {
				files: [{
					expand: true,
					cwd: 'src',
					src: '**',
					dest: 'dist'
				}]
			}
		},

		less: {
			client: {
				src: 'src/client/index.less',
				dest: 'dist/assets/index.css'
			}
		},

		connect: {
			server: {
				options: serverOptions
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-connect');

	grunt.registerTask('default', ['copy', 'less', 'connect']);
};

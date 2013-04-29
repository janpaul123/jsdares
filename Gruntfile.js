var path = require('path');

process.env.JSDARES_PORT = process.env.JSDARES_PORT || 3000;

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

		express: {
			server: {
				options: {
					port: process.env.JSDARES_PORT,
					server: path.resolve('./dist/server-connect')
				}
			}
		},

		regarde: {
			scripts: {
				files: ['src/**/*.js', 'src/**/*.coffee'],
				tasks: ['express-restart']
			},

			styles: {
				files: ['src/**/*.less', 'src/**/*.css'],
				tasks: ['less']
			},

			assets: {
				files: ['src/assets/**'],
				tasks: ['copy']
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-express');
	grunt.loadNpmTasks('grunt-regarde');

	grunt.registerTask('default', ['copy', 'less', 'express', 'regarde']);
};

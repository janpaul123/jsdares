var path = require('path');

process.env.JSDARES_PORT = process.env.JSDARES_PORT || 3000;

module.exports = function(grunt) {
	grunt.initConfig({

		clean: {
			all: ['dist']
		},

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
					server: path.resolve('./dist/server-connect-grunt')
				}
			}
		},

		regarde: {
			scripts: {
				files: ['src/**/*.js', 'src/**/*.json', 'src/**/*.coffee'],
				tasks: ['copy', 'express-restart']
			},

			styles: {
				files: ['src/**/*.less', 'src/**/*.css'],
				tasks: ['less', 'livereload']
			},

			assets: {
				files: ['src/assets/**'],
				tasks: ['copy', 'livereload']
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-livereload');
	grunt.loadNpmTasks('grunt-express');
	grunt.loadNpmTasks('grunt-regarde');

	grunt.registerTask('dist', ['clean', 'copy', 'less']);
	grunt.registerTask('server', ['livereload-start', 'express', 'regarde']);

	grunt.registerTask('default', ['dist', 'server']);
	grunt.registerTask('heroku', ['dist']);
};

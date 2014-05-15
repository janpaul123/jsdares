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
					cwd: 'app',
					src: '**',
					dest: 'dist'
				}]
			}
		},

		less: {
			client: {
				src: 'app/client/index.less',
				dest: 'dist/assets/index.css'
			}
		},

		coffee: {
			all: {
				expand: true,
				cwd: 'app',
				src: ['**/*.coffee'],
				dest: 'dist',
				// ext: '.js' doesn't work because of grunt crazyness: https://github.com/gruntjs/grunt/pull/625
				rename: function(dest, name) { return dest + '/' + name.replace(/\.coffee$/gi, '.js'); }
			}
		},

		browserify: {
			client: {
				src: 'dist/client-entry.js',
				dest: 'dist/assets/browserify.js'
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
				files: ['app/**/*.js', 'app/**/*.json', 'app/**/*.coffee'],
				tasks: ['copy', 'coffee', 'browserify', 'express-restart']
			},

			styles: {
				files: ['app/**/*.less', 'app/**/*.css'],
				tasks: ['less', 'livereload']
			},

			assets: {
				files: ['app/assets/**'],
				tasks: ['copy', 'livereload']
			}
		},

		open : {
			dev : {
				path: 'http://localhost:' + process.env.JSDARES_PORT
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-livereload');
	grunt.loadNpmTasks('grunt-express');
	grunt.loadNpmTasks('grunt-regarde');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-open');

	grunt.registerTask('compile', ['clean', 'copy', 'coffee', 'browserify', 'less']);
	grunt.registerTask('server', ['livereload-start', 'express', 'open', 'regarde']);
	grunt.registerTask('default', ['compile', 'server']);
};

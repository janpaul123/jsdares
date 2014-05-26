var path = require('path');

process.env.PORT = process.env.PORT || 3000;

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
					port: process.env.PORT,
					script: path.resolve('./dist/server-entry.js')
				}
			}
		},

		regarde: {
			scripts: {
				files: ['app/**/*.js', 'app/**/*.json', 'app/**/*.coffee'],
				tasks: ['copy', 'coffee', 'browserify', 'express']
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
				path: 'http://localhost:' + process.env.PORT
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-livereload');
	grunt.loadNpmTasks('grunt-express-server');
	grunt.loadNpmTasks('grunt-regarde');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-open');

	grunt.registerTask('compile', ['clean', 'copy', 'coffee', 'browserify', 'less']);
	grunt.registerTask('server', ['livereload-start', 'express', 'open', 'regarde']);
	grunt.registerTask('default', ['compile', 'server']);
};

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
		}

	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', ['copy', 'less']);
};

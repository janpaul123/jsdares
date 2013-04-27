module.exports = function(grunt) {
	grunt.initConfig({

		less: {
			client: {
				src: 'client/index.less',
				dest: 'assets-dev/index.css'
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-less');

	grunt.registerTask('default', ['less']);
};

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        esversion: 6
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
    jsdoc: {
      dist: {
        src: ['src/*.js', 'README.md'],
        options: {
          destination: 'doc'
        }
      }
    },
    watch: {
      files: ['src/**/*.js', 'test/**/*.js'],
      tasks: ['jshint', 'test']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-karma');

  
  grunt.registerTask('test', ['karma']);
  grunt.registerTask('dev', ['watch']);
  
  // Default task(s).
  grunt.registerTask('default', ['jshint', 'test', 'jsdoc']);
};

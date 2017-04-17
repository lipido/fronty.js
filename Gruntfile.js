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
          destination: 'docs'
        }
      }
    },
    watch: {
      files: ['src/**/*.js', 'test/**/*.js'],
      tasks: ['jshint', 'test', 'jsdoc']
    },
    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015']
      },
      dist: {
        files: {
          'dist/fronty.js': 'src/fronty.js'
        }
      }
    },

    webpack: {
      fronty: {
        // webpack options 
        entry: "./dist/fronty.js",
        output: {
          path: __dirname + '/dist',
          filename: "fronty.js",
          library: 'Fronty',
          libraryTarget: 'umd'
        }
      }
    },

    uglify: {
      my_target: {
        files: {
          'dist/fronty.min.js': ['dist/fronty.js']
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-webpack');


  grunt.registerTask('test', ['karma']);
  grunt.registerTask('dev', ['watch']);

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'babel', 'webpack', 'test', 'jsdoc', 'uglify']);
};

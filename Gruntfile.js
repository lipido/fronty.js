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
      files: ['src/**/*.js', 'test/**/*.js', 'karma.conf.js'],
      tasks: ['jshint', 'babel', 'webpack', 'test', 'doc']
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
    },

    ts: {
      default: {
        src: ["src/fronty.js"],
        options: {
          comments: true,
          fast: 'never',
          additionalFlags: '--declaration --allowJs --emitDeclarationOnly --declarationMap --rootDir src --outDir dist'
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
  grunt.loadNpmTasks("grunt-ts");

  grunt.registerTask('test', ['karma']);
  grunt.registerTask('dev', ['watch']);
  grunt.registerTask('doc', ['jsdoc']);

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'babel', 'webpack', 'test', 'uglify', 'ts']);
};

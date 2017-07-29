module.exports = function Main(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      scripts: {
        files: ['**.js', 'helpers/**.js', 'public/js/**.js', 'schemas/**.js'],
        tasks: ['default'],
      },
    },
    jshint: {
      all: ['**.js', 'helpers/**.js', 'public/js/**.js', 'schemas/**.js'],
      options: {
        esversion: 6,
      },
    },
    eslint: {
      src: ['**.js', 'helpers/**.js', 'public/js/**.js', 'schemas/**.js'],
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('gruntify-eslint');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'eslint', 'watch']);
};

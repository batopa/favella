module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            dist: {
                files: [
                    {expand: true, flatten: true, src: 'src/favella.js', dest: 'dist/', filter: 'isFile'}
                ]
            }
        },
        uglify: {
            options: {
                banner: '/**\n' +
                        ' * <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                        ' * <%= pkg.homepage %>\n' +
                        ' *\n' +
                        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                        ' * Licensed under the MIT license\n' +
                        ' */',
                sourceMap: true
            },
            dist: {
                files: {
                    'dist/favella.min.js': ['src/favella.js']
                }
            }
        }
    });

    // Load the plugin that provides tasks
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask('default', ['copy', 'uglify']);

};

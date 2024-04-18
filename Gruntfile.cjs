module.exports = function (grunt) {

    grunt.initConfig({

        properties: grunt.file.readJSON('properties.json'),

        pkg: grunt.file.readJSON('package.json'),

        clean: ['<%= properties.webappBuildDir %>', '<%= properties.umdBuildDir %>'],

        sync: {
            all: {
                files:
                    [
                        // copy tests
                        { expand: true, cwd: '<%= properties.webappTestDir %>', src: '**', dest: '<%= properties.webappBuildDir %>' },

                        // copy tests resources
                        { expand: true, cwd: '<%= properties.unitTestsResourcesDir %>', src: 'imsc-tests/imsc1/ttml/**', dest: '<%= properties.webappBuildDir %>' },
                        { expand: true, cwd: '<%= properties.unitTestsResourcesDir %>', src: 'imsc-tests/imsc1/tests.json', dest: '<%= properties.webappBuildDir %>' },
                        { expand: true, cwd: '<%= properties.unitTestsResourcesDir %>', src: 'imsc-tests/imsc1_1/ttml/**', dest: '<%= properties.webappBuildDir %>' },
                        { expand: true, cwd: '<%= properties.unitTestsResourcesDir %>', src: 'imsc-tests/imsc1_1/tests.json', dest: '<%= properties.webappBuildDir %>' },
                        { expand: true, cwd: '<%= properties.unitTestsResourcesDir %>', src: 'unit-tests/**', dest: '<%= properties.webappBuildDir %>' }
                    ]
            },

            release: {
                src: '<%= properties.umdBuildDir %>/<%= properties.umdMinName %>',
                dest: '<%= properties.webappBuildDir %>/libs/imsc.js'
            },

            debug: {
                src: '<%= properties.umdBuildDir %>/<%= properties.umdDebugName %>',
                dest: '<%= properties.webappBuildDir %>/libs/imsc.js'
            }
        },

        npmcopy: {
            default: {
                files: {
                    '<%= properties.webappBuildDir %>/libs/': [
                        'sax:main',
                        'qunit-assert-close:main',
                        'qunitjs:main',
                        'filesaver.js-npm:main',
                        'jszip/dist/jszip.js'
                    ]
                }
            }
        },

        jshint: {
            'default': {
                src: "src/main",
                options: {
                    "-W032": true,
                    esversion: 6
                }
            }
        },

        exec:
        {
            rollup: {
                cmd: "rollup -c rollup.config.js",
            }
        }
    }

    );

    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.loadNpmTasks('grunt-npmcopy');

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.loadNpmTasks('grunt-sync');

    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('build:release', ['jshint', 'exec:rollup', 'sync:all', 'sync:release', 'npmcopy']);

    grunt.registerTask('build:debug', ['jshint', 'exec:rollup', 'sync:all', 'sync:debug', 'npmcopy']);

    grunt.registerTask('build', ['build:debug']);

    grunt.registerTask('clean', ['clean']);

};

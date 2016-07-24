module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        nittro: {
            js: {
                options: {
                    vendor: [
                        // things like jQuery
                    ],
                    base: {
                        core: true,
                        datetime: true,
                        neon: true,
                        di: true,
                        forms: true, // note that forms will automatically include the netteForms.js asset
                        ajax: true,
                        page: true,
                        storage: true,
                        routing: true
                    },
                    extras: {
                        flashes: true,
                        dialogs: true,
                        confirm: true,
                        dropzone: true,
                        paginator: true
                    },
                    libraries: [
                        // your website libraries
                    ],
                    bootstrap: null, // null = generated bootstrap, otherwise provide a path
                    stack: true // include the _stack library
                },
                dest: 'dist/nittro-full.js'
            },
            css: {
                options: {
                    vendor: [
                        // vendor CSS, e.g. Bootstrap
                    ],
                    base: {
                        core: true,
                        datetime: true,
                        neon: true,
                        di: true,
                        forms: true,
                        ajax: true,
                        page: true,
                        storage: true,
                        routing: true
                    },
                    extras: {
                        flashes: true,
                        dialogs: true,
                        confirm: true,
                        dropzone: true,
                        paginator: true
                    },
                    libraries: [
                        // your website styles
                    ]
                },
                dest: 'dist/nittro-full.less' // The result is just all files concatenated, no parsing is done,
                                              // so all LESS code will remain untouched etc. This is to allow you
                                              // to use any LESS compiler / other CSS postprocessing you need.
            }
        }
    });

    grunt.loadTasks('./tasks');
    grunt.registerTask('default', ['nittro']);

};

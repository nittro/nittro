module.exports = function (grunt) {

    var dependencies = [
        'bower_components/nittro-core/dist/js/nittro-core.js',
        'bower_components/nittro-page/dist/js/nittro-page.js',
        'bower_components/nittro-application/dist/js/nittro-application.js'
    ];

    var Nittro = [
        'src/js/Nittro/Widgets/Dialog.js',
        'src/js/Nittro/Widgets/Confirm.js',
        'src/js/Nittro/Widgets/FormDialog.js',
        'src/js/Nittro/Widgets/Paginator.js'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        netteForms: {
            fix: {
                files: {
                    'dist/js/netteForms.js': [
                        'bower_components/nette-forms/src/assets/netteForms.js'
                    ]
                }
            }
        },

        uglify: {
            options: {
                mangle: false,
                sourceMap: false
            },
            nittro: {
                files: {
                    'dist/js/nittro.min.js': Nittro,
                    'dist/js/nittro.core.min.js': dependencies.concat(Nittro),
                    'dist/js/nittro.full.min.js': [
                        'bower_components/promiz/promiz.min.js',
                        'dist/js/netteForms.js'
                    ].concat(
                        dependencies,
                        Nittro,
                        'src/js/bootstrap.js',
                        'bower_components/nittro-core/src/js/stack.js'
                    )
                }
            },
            stack: {
                files: {
                    'dist/js/stack.min.js': [
                        'bower_components/nittro-core/src/js/stack.js'
                    ]
                }
            }
        },

        concat: {
            options: {
                separator: ";\n"
            },
            nittro: {
                files: {
                    'dist/js/nittro.js': Nittro,
                    'dist/js/nittro.core.js': dependencies.concat(Nittro),
                    'dist/js/nittro.full.js': [
                        'bower_components/promiz/promiz.min.js',
                        'dist/js/netteForms.js'
                    ].concat(
                        dependencies,
                        Nittro,
                        'src/js/bootstrap.js',
                        'bower_components/nittro-core/src/js/stack.js'
                    )
                }
            }
        },

        less: {
            min: {
                options: {
                    compress: true
                },
                files: {
                    'dist/css/nittro.min.css': [
                        'src/css/dialogs.less'
                    ],
                    'dist/css/nittro.core.min.css': [
                        'src/css/dialogs.less',
                        'bower_components/nittro-page/src/css/flashes.less'
                    ],
                    'dist/css/nittro.full.min.css': [
                        'src/css/nittro-dialog.less',
                        'bower_components/nittro-page/src/css/flashes.less',
                        'bower_components/nittro-page/src/css/transitions.less'
                    ]
                }
            },
            full: {
                options: {
                    compress: false
                },
                files: {
                    'dist/css/nittro.css': [
                        'src/css/dialogs.less'
                    ],
                    'dist/css/nittro.core.css': [
                        'src/css/dialogs.less',
                        'bower_components/nittro-page/src/css/flashes.less'
                    ],
                    'dist/css/nittro.full.css': [
                        'src/css/nittro-dialog.less',
                        'bower_components/nittro-page/src/css/flashes.less',
                        'bower_components/nittro-page/src/css/transitions.less'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.registerTask('default', ['netteForms', 'uglify', 'concat', 'less']);


    grunt.registerMultiTask('netteForms', 'Fix netteForms.js', function () {
        this.files.forEach(function (f) {
            var source = f.src.map(grunt.file.read).join("\n");
            source = source.replace(/^[ \t]*global\.Nette\.initOnLoad\(\);[ \t]*$/mg, '');
            grunt.file.write(f.dest, source);

            grunt.file.write(f.dest, source);
            grunt.log.ok('Fixed ' + f.dest.replace(/^.+?([^\/]+)$/, '$1'));

        });
    });

};

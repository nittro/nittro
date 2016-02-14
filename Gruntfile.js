module.exports = function (grunt) {

    var NittroCore = [
        'src/js/context.js',
        'src/js/Utils/Strings.js',
        'src/js/Utils/Arrays.js',
        'src/js/Utils/HashMap.js',
        'src/js/Utils/DateInterval.js',
        'src/js/Utils/DateTime.js',
        'src/js/Utils/Url.js',
        'src/js/Utils/DOM.js',
        'src/js/Utils/ReflectionClass.js',
        'src/js/Utils/ReflectionFunction.js',
        'src/js/Nittro/EventEmitter.js',
        'src/js/Nittro/Freezable.js',
        'src/js/Nittro/Object.js',
        'src/js/Nittro/Utils/Tokenizer.js',
        'src/js/Nittro/Neon/Neon.js',
        'src/js/Nittro/Ajax/FormData.js',
        'src/js/Nittro/Ajax/Request.js',
        'src/js/Nittro/Ajax/Response.js',
        'src/js/Nittro/Ajax/Service.js',
        'src/js/Nittro/Ajax/Transport/Native.js',
        'src/js/Nittro/Page/Snippet.js',
        'src/js/Nittro/Page/Transitions.js',
        'src/js/Nittro/Page/Service.js',
        'src/js/Nittro/Forms/VendorCompiled.js',
        'src/js/Nittro/Forms/Form.js',
        'src/js/Nittro/Forms/Locator.js',
        'src/js/Nittro/DI/Container.js',
        'src/js/Nittro/DI/Context.js',
        'src/js/Nittro/Application/Storage.js',
        'src/js/Nittro/Application/Routing/URLRoute.js',
        'src/js/Nittro/Application/Routing/DOMRoute.js',
        'src/js/Nittro/Application/Routing/Router.js',
        'src/js/Nittro/Widgets/DialogBase.js',
        'src/js/Nittro/Widgets/Dialog.js',
        'src/js/Nittro/Widgets/Confirm.js',
        'src/js/Nittro/Widgets/FormDialog.js',
        'src/js/Nittro/Widgets/FlashMessages.js'
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
                    'dist/js/nittro.core.min.js': NittroCore,
                    'dist/js/nittro.full.min.js': [
                        'bower_components/promiz/promiz.min.js',
                        'dist/js/netteForms.js'
                    ].concat(
                        NittroCore,
                        'src/js/bootstrap.js',
                        'src/js/stack.js'
                    )
                }
            },
            stack: {
                files: {
                    'dist/js/stack.min.js': [
                        'src/js/stack.js'
                    ],
                    'dist/js/stack-async.min.js': [
                        'src/js/stack-async.js'
                    ]
                }
            }
        },

        concat: {
            options: {
                separator: ";\n"
            },
            nettejs: {
                files: {
                    'dist/js/nittro.core.js': NittroCore,
                    'dist/js/nittro.full.js': [
                        'bower_components/promiz/promiz.js',
                        'dist/js/netteForms.js'
                    ].concat(
                        NittroCore,
                        'src/js/bootstrap.js',
                        'src/js/stack.js'
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
                    'dist/css/nittro.core.min.css': [
                        'src/css/nittro-dialog.less',
                        'src/css/nittro-flashes.less'
                    ],
                    'dist/css/nittro.full.min.css': [
                        'src/css/nittro-dialog.less',
                        'src/css/nittro-flashes.less',
                        'src/css/nittro-transitions.less'
                    ]
                }
            },
            full: {
                options: {
                    compress: false
                },
                files: {
                    'dist/css/nittro.core.css': [
                        'src/css/nittro-dialog.less',
                        'src/css/nittro-flashes.less'
                    ],
                    'dist/css/nittro.full.css': [
                        'src/css/nittro-dialog.less',
                        'src/css/nittro-flashes.less',
                        'src/css/nittro-transitions.less'
                    ]
                }
            }
        },

        jasmine: {
            src: NittroCore,
            options: {
                vendor: [
                    'bower_components/promiz/promiz.min.js',
                    'bower_components/nette-forms/src/assets/netteForms.js'
                ],
                specs: 'tests/specs/**.spec.js',
                display: 'short',
                summary: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.registerTask('default', ['netteForms', 'uglify', 'concat', 'less']);
    grunt.registerTask('test', ['jasmine']);


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

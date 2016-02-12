module.exports = function (grunt) {

    var NetteJS = [
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
        'src/js/Nette/EventEmitter.js',
        'src/js/Nette/Freezable.js',
        'src/js/Nette/Object.js',
        'src/js/Nette/Utils/Tokenizer.js',
        'src/js/Nette/Neon/Neon.js',
        'src/js/Nette/Ajax/FormData.js',
        'src/js/Nette/Ajax/Request.js',
        'src/js/Nette/Ajax/Response.js',
        'src/js/Nette/Ajax/Service.js',
        'src/js/Nette/Ajax/Transport/Native.js',
        'src/js/Nette/Page/Snippet.js',
        'src/js/Nette/Page/Transitions.js',
        'src/js/Nette/Page/Service.js',
        'src/js/Nette/Forms/VendorCompiled.js',
        'src/js/Nette/Forms/Form.js',
        'src/js/Nette/Forms/Locator.js',
        'src/js/Nette/DI/Container.js',
        'src/js/Nette/DI/Context.js',
        'src/js/Nette/Application/Storage.js',
        'src/js/Nette/Application/Routing/URLRoute.js',
        'src/js/Nette/Application/Routing/DOMRoute.js',
        'src/js/Nette/Application/Routing/Router.js',
        'src/js/Nette/Widgets/DialogBase.js',
        'src/js/Nette/Widgets/Dialog.js',
        'src/js/Nette/Widgets/Confirm.js',
        'src/js/Nette/Widgets/FormDialog.js',
        'src/js/Nette/Widgets/FlashMessages.js'
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
            min: {
                files: {
                    'dist/js/nette.min.js': NetteJS
                }
            },
            full: {
                files: {
                    'dist/js/nette.full.js': [
                        'bower_components/promiz/promiz.min.js'
                    ].concat(
                        NetteJS,
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

        less: {
            min: {
                options: {
                    compress: true
                },
                files: {
                    'dist/css/nette.min.css': [
                        'src/css/nette-dialog.less',
                        'src/css/nette-flashes.less'
                    ]
                }
            },
            full: {
                options: {
                    compress: true
                },
                files: {
                    'dist/css/nette.full.css': [
                        'src/css/nette-dialog.less',
                        'src/css/nette-flashes.less',
                        'src/css/nette-transitions.less'
                    ]
                }
            }
        },

        jasmine: {
            src: NetteJS,
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
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.registerTask('default', ['netteForms', 'uglify', 'less']);
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

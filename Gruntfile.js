module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        js: {
            min: {
                files: {
                    'dist/js/nette.min.js': [
                        'src/js/promise.js',
                        'src/js/context.js',
                        'src/js/Utils/Strings.js',
                        'src/js/Utils/Arrays.js',
                        'src/js/Utils/HashMap.js',
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
                    ]
                }
            },
            full: {
                options: {
                    compress: false
                },
                files: {
                    'dist/js/nette.full.js': [
                        'src/js/promise.js',
                        'src/js/context.js',
                        'src/js/Utils/Strings.js',
                        'src/js/Utils/Arrays.js',
                        'src/js/Utils/HashMap.js',
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
                    ]
                }
            },
            stack: {
                files: {
                    'dist/js/stack.min.js': [
                        'src/js/stack.js'
                    ]
                }
            },
            'stack-async': {
                files: {
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
                    compress: false
                },
                files: {
                    'dist/css/nette.full.css': [
                        'src/css/nette-dialog.less',
                        'src/css/nette-flashes.less'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.registerTask('default', ['js', 'less']);


    grunt.registerMultiTask('js', 'Compile js', function () {
        var UglifyJS = require('uglify-js'),
            path = require('path');

        var options = this.options({
            compress: true
        });

        this.files.forEach(function (f) {
            var source;

            if (options.compress) {
                source = UglifyJS.minify(f.src, {
                    mangle: false,
                    compress: {
                        unused: false
                    }
                }).code;
            } else {
                source = f.src.map(function (src) {
                    return grunt.file.read(src);
                }).join("\n\n");
            }

            grunt.file.write(f.dest, source);
            grunt.log.ok('Compiled ' + path.basename(f.dest));

        });
    });

};

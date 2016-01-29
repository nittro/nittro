module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                mangle: false,
                sourceMap: true
            },
            build: {
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
                        'src/js/Nette/Forms/Vendor.js',
                        'src/js/Nette/Forms/Form.js',
                        'src/js/Nette/Forms/Locator.js',
                        'src/js/Nette/DI/Container.js',
                        'src/js/Nette/DI/Context.js',
                        'src/js/Nette/Application/Storage.js',
                        'src/js/Nette/Widgets/DialogBase.js',
                        'src/js/Nette/Widgets/Dialog.js',
                        'src/js/Nette/Widgets/Confirm.js',
                        'src/js/Nette/Widgets/FormDialog.js',
                        'src/js/Nette/Widgets/FlashMessages.js'
                    ],
                    'dist/js/stack.min.js': [
                        'src/js/stack.js'
                    ]
                }
            }
        },
        less: {
            build: {
                options: {
                    compress: true,
                    sourceMap: true
                },
                files: {
                    'dist/css/nette.min.css': [
                        'src/css/nette-dialog.less',
                        'src/css/nette-flashes.less'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.registerTask('default', ['uglify', 'less']);

};

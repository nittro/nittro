module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        context: {
            options: {
                contextPath: 'src/js/context.js',
                polyfills: [
                    'src/js/promise.js'
                ],
                sourceMap: true
            },
            min: {
                options: {
                    mangle: true
                },
                files: {
                    'dist/js/nette.min.js': [
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
                    mangle: false
                },
                files: {
                    'dist/js/nette.full.js': [
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

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.registerTask('default', ['context', 'less']);


    grunt.registerMultiTask('context', 'Compile _context', function () {
        var UglifyJS = require('uglify-js'),
            path = require('path');

        var options = this.options({
            contextPath: '',
            polyfills: [],
            sourceMap: true,
            mangle: true
        });

        if (!grunt.file.exists(options.contextPath)) {
            grunt.fail.warn(new Error('_context.js not found at specified path'));

        }

        options.polyfills.forEach(function (f) {
            if (!grunt.file.exists(f)) {
                grunt.fail.warn(new Error('Polyfill ' + f + ' doesn\'t exist'));
            }
        });

        this.files.forEach(function (f) {
            var sources = [];

            var nsStruct = {};

            function createNs(ns) {
                ns = ns.split(/\./g);

                var c = nsStruct;

                ns.forEach(function (n) {
                    if (!(n in c)) {
                        c[n] = {};
                    }

                    c = c[n];

                });
            }

            var _context = {
                invoke: function (ns, cb, imp) {
                    if (typeof imp === 'undefined' && typeof ns === 'function') {
                        imp = cb;
                        cb = ns;
                        ns = null;

                    }

                    if (ns) {
                        createNs(ns);
                        sources.push('_context.__ns("' + ns + '", this.' + ns + ');');
                        ns = 'this.' + ns;
                    } else {
                        sources.push('_context.__ns(null, this)');
                        ns = 'this';
                    }

                    var cbStr = cb.toString(),
                        cbArgs = cb.length ? cbStr.match(/^function\s*\((.*?)\)/i)[1].split(/\s*,\s*/) : [],
                        args = [];

                    cbArgs.forEach(function (arg) {
                        if (arg === 'context') {
                            args.push('_context');

                        } else if (arg === '_NS_') {
                            args.push(ns);

                        } else if (arg === 'undefined') {
                            args.push('undefined');

                        } else if (imp && arg in imp) {
                            args.push('this.' + imp[arg]);

                        } else {
                            args.push(ns + '.' + arg + ' || this.' + arg);

                        }
                    });

                    args.unshift(ns);
                    sources.push('(' + cbStr + ').call(' + args.join(', ') + ')');
                    sources.push('_context.__ns();');

                }
            };

            f.src.forEach(function (src) {
                eval(grunt.file.read(src));
            });

            for (var ns in nsStruct) {
                sources.unshift('this.' + ns + ' = ' + JSON.stringify(nsStruct[ns]) + ';');

            }

            sources.unshift('_context.invoke(function() { var undefined;');
            sources.unshift(grunt.file.read(options.contextPath));

            options.polyfills.forEach(function (p) {
                sources.unshift(grunt.file.read(p));
            });

            sources.push('});');
            sources = sources.join("\n");

            var uglifyOpts = {
                    fromString: true,
                    mangle: options.mangle,
                    compress: {
                        unused: false
                    }
                };

            if (options.sourceMap) {
                uglifyOpts.outSourceMap = path.basename(f.dest, '.js') + '.map';

            }

            sources = UglifyJS.minify(sources, uglifyOpts);

            grunt.file.write(f.dest, sources.code);
            grunt.log.ok('Compiled ' + path.basename(f.dest));

            if (options.sourceMap) {
                grunt.file.write(path.join(path.dirname(f.dest), uglifyOpts.outSourceMap), sources.map);
                grunt.log.ok('Source map written to ' + uglifyOpts.outSourceMap);

            }
        });
    });

};

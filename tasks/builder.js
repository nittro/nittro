module.exports = function (grunt) {

    var builder = require('../builder/builder');

    grunt.registerMultiTask('nittro', 'Build a custom Nittro package', function () {
        var options = this.options({
            baseDir: process.cwd(),
            bowerDir: null,
            vendor: [],
            base: {},
            extras: {},
            libraries: [],
            bootstrap: null,
            stack: true
        });

        this.files.forEach(function (f) {
            var source;

            if (f.dest.match(/\.js$/)) {
                source = builder.buildJs(options);
            } else {
                source = builder.buildCss(options);
            }

            grunt.file.write(f.dest, source);
            grunt.log.ok('Built custom package ' + f.dest);

        });
    });

};

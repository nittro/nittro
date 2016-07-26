var fs = require('fs'),
    path = require('path');

function normalizeOptions(options) {
    options || (options = {});

    if (!options.baseDir) {
        options.baseDir = process.cwd();
    }

    if (!options.bowerDir) {
        options.bowerDir = path.join(options.baseDir, 'bower_components');
    }

    if (!fs.existsSync(options.bowerDir)) {
        throw new Error('Bower dir "' + options.bowerDir + '" doesn\'t exist');
    }

    'vendor' in options || (options.vendor = {});
    'base' in options || (options.base = {});
    'extras' in options || (options.extras = {});
    'libraries' in options || (options.libraries = {});
    'bootstrap' in options || (options.bootstrap = true);
    'stack' in options || (options.stack = true);

    options.base = prefixPackages(options.base, 'nittro-');
    options.extras = prefixPackages(options.extras, 'nittro-extras-');

    return options;

}

function prefixPackages(packages, prefix) {
    var prefixed = {},
        pkg;

    for (pkg in packages) {
        if (packages[pkg]) {
            prefixed[prefix + pkg] = packages[pkg];

        }
    }

    return prefixed;

}

function buildPackageList(base, extras, bowerDir) {
    var pkg, packages = [];

    for (pkg in base) {
        addPackageWithDependencies(packages, pkg, bowerDir);
    }

    for (pkg in extras) {
        addPackageWithDependencies(packages, pkg, bowerDir);
    }

    return packages;

}

function addPackageWithDependencies(packages, pkg, bowerDir) {
    var dependencies = getDependencies(pkg, bowerDir);

    dependencies.forEach(function(dep) {
        if (packages.indexOf(dep) === -1) {
            addPackageWithDependencies(packages, dep, bowerDir);

        }
    });

    packages.push(pkg);

    return packages;

}

function getDependencies(pkg, bowerDir) {
    var meta = readBowerMeta(pkg, bowerDir),
        dep, dependencies = [];

    for (dep in meta.dependencies) {
        dependencies.push(dep);
    }

    return dependencies;

}

var bowerCache = {},
    nittroCache = {};

function readBowerMeta(pkg, bowerDir) {
    if (pkg in bowerCache) {
        return bowerCache[pkg];
    }

    return bowerCache[pkg] = JSON.parse(fs.readFileSync(path.join(bowerDir, pkg, 'bower.json')));

}

function readNittroMeta(pkg, bowerDir) {
    if (!(pkg in nittroCache)) {
        var p = path.join(bowerDir, pkg, 'nittro.json');

        if (fs.existsSync(p)) {
            nittroCache[pkg] = JSON.parse(fs.readFileSync(p));
        } else {
            nittroCache[pkg] = null;
        }
    }

    return nittroCache[pkg];

}

function formatFilePath(baseDir, file) {
    var p = path.join(baseDir, file);

    if (fs.existsSync(p)) {
        return p;
    } else {
        throw new Error('File "' + p + '" doesn\'t exist');
    }
}

function getPackageFiles(pkg, bowerDir) {
    var meta = readNittroMeta(pkg, bowerDir);

    if (meta) {
        return meta.files;

    } else {
        meta = readBowerMeta(pkg, bowerDir);

        return meta.main ? {
            js: [meta.main]
        } : {};
    }
}

function buildFileList(options, packages, type) {
    var files = [];

    type in options.vendor && options.vendor[type].forEach(function(file) {
        files.push(formatFilePath(options.baseDir, file));
    });

    if (type === 'js' && packages.indexOf('nittro-forms') > -1) {
        files.push(formatFilePath(options.bowerDir, 'nittro-forms/src/js/Nittro/Forms/Bridges/netteForms.js'));
    }

    packages.forEach(function(pkg) {
        var pkgFiles = getPackageFiles(pkg, options.bowerDir);

        if (type in pkgFiles) {
            pkgFiles[type].forEach(function(file) {
                files.push(formatFilePath(options.bowerDir, pkg + '/' + file));
            });
        }
    });

    type in options.libraries && options.libraries[type].forEach(function(file) {
        files.push(formatFilePath(options.baseDir, file));
    });

    if (type === 'js') {
        if (typeof options.bootstrap === 'string') {
            files.push(formatFilePath(options.baseDir, options.bootstrap));
        } else if (options.bootstrap) {
            files.push('__bootstrap-generated.js');
        }

        if (options.stack) {
            files.push(formatFilePath(options.bowerDir, 'nittro-core/src/js/stack.js'));
        }
    }

    return files;

}




function Builder(options) {
    if (!(this instanceof Builder)) {
        return new Builder(options);
        
    }

    this._ = {
        options: normalizeOptions(options),
        fileList: {
            js: null,
            css: null
        },
        compat: null
    };

    this._.packages = buildPackageList(options.base, options.extras, options.bowerDir);

}

Builder.prototype.getBaseDir = function () {
    return this._.options.baseDir;
};

Builder.prototype.getFileList = function(type) {
    if (this._.fileList[type] === null) {
        this._.fileList[type] = buildFileList(this._.options, this._.packages, type);

    }

    return this._.fileList[type];

};

Builder.prototype.getStackPath = function() {
    return formatFilePath(this._.options.bowerDir, 'nittro-core/src/js/stack.js');
};

Builder.prototype.getCompatFlags = function() {
    if (this._.compat === null) {
        this._.compat = {};

        this._.packages.forEach(function(pkg) {
            var meta = readNittroMeta(pkg, this._.options.bowerDir),
                flag;

            if (meta && meta.compat) {
                for (flag in meta.compat) {
                    if (meta.compat[flag]) {
                        this._.compat[flag] || (this._.compat[flag] = []);
                        this._.compat[flag].push(pkg);

                    }
                }
            }
        }.bind(this));
    }

    return this._.compat;
};


Builder.prototype.buildJs = function () {
    return this.getFileList('js').map(function(path) {
        if (path === '__bootstrap-generated.js') {
            return this.buildBootstrap();
        } else {
            return fs.readFileSync(path);
        }
    }.bind(this)).join("\n");
};

Builder.prototype.buildCss = function() {
    return this.getFileList('css').map(function(path) {
        return fs.readFileSync(path);
    }).join("\n");
};

Builder.prototype.buildBootstrap = function () {
    var bootstrap = [
        "_context.invoke(function(Nittro, DOM, Arrays) {",
        "    var params = DOM.getById('nittro-params'),",
        "        defaults = {",
        "            basePath: '',",
        "            'nittro-page': {",
        "                whitelistLinks: false,",
        "                whitelistForms: false,",
        "                whitelistRedirects: true,",
        "                defaultTransition: '.transition-auto'",
        "            },",
        "            'nittro-extras-flashes': {",
        "                layer: document.body",
        "            }",
        "        };\n",
        "    if (params && params.nodeName.toLowerCase() === 'script' && params.type === 'application/json') {",
        "        params = Arrays.mergeTree(defaults, JSON.parse(params.textContent.trim()));\n",
        "    } else {",
        "        params = defaults;\n",
        "    }\n"
    ];

    var extensions = {};

    this._.packages.forEach(function(pkg) {
        var meta = readNittroMeta(pkg, this._.options.bowerDir);

        if (meta && meta.di) {
            extensions[pkg] = meta.di;
        }
    }.bind(this));

    if (this._.packages.indexOf('nittro-extras-dialogs') > -1) {
        bootstrap.push(
            "    Nittro.Extras.Dialogs.Dialog.setDefaults({",
            "        layer: document.body",
            "    });\n"
        );
    }

    bootstrap.push(
        "    var builder = new Nittro.DI.ContainerBuilder({",
        "        extensions: " + JSON.stringify(extensions, null, 4).replace(/\n/g, "\n        ") + ",",
        "        params: params",
        "    });\n",
        "    this.di = builder.createContainer();",
        "    this.di.runServices();\n"
    );

    bootstrap.push(
        "}, {",
        "    DOM: 'Utils.DOM',",
        "    Arrays: 'Utils.Arrays'",
        "});"
    );

    return bootstrap.join("\n");

};

module.exports = Builder;

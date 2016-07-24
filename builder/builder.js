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

    'vendor' in options || (options.vendor = []);
    'base' in options || (options.base = {});
    'extras' in options || (options.extras = {});
    'libraries' in options || (options.libraries = []);
    'bootstrap' in options || (options.bootstrap = null);
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

    options.vendor.forEach(function(file) {
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

    options.libraries.forEach(function(file) {
        files.push(formatFilePath(options.baseDir, file));
    });

    if (type === 'js') {
        if (options.bootstrap) {
            files.push(formatFilePath(options.baseDir, options.bootstrap));
        } else {
            files.push('__bootstrap-generated.js');
        }

        if (options.stack) {
            files.push(formatFilePath(options.bowerDir, 'nittro-core/src/js/stack.js'));
        }
    }

    return files;

}

function buildBootstrap(packages, bowerDir) {
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

    packages.forEach(function(pkg) {
        var meta = readNittroMeta(pkg, bowerDir);

        if (meta && meta.di) {
            extensions[pkg] = meta.di;
        }
    });

    if (packages.indexOf('nittro-extras-dialogs') > -1) {
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
}

function buildJs(options) {
    var packages = buildPackageList(options.base, options.extras, options.bowerDir),
        files = buildFileList(options, packages, 'js');

    return files.map(function(path) {
        if (path === '__bootstrap-generated.js') {
            return buildBootstrap(packages, options.bowerDir);
        } else {
            return fs.readFileSync(path);
        }
    }).join("\n");
}

function buildCss(options) {
    var packages = buildPackageList(options.base, options.extras, options.bowerDir),
        files = buildFileList(options, packages, 'css');

    return files.map(function(path) {
        return fs.readFileSync(path);
    }).join("\n");
}

module.exports = {
    buildJs: function(options) {
        return buildJs(normalizeOptions(options));
    },
    buildCss: function(options) {
        return buildCss(normalizeOptions(options));
    },
    buildJsFileList: function(options) {
        options = normalizeOptions(options);

        return buildFileList(
            options,
            buildPackageList(options.base, options.extras, options.bowerDir),
            'js'
        );
    },
    buildCssFileList: function(options) {
        options = normalizeOptions(options);

        return buildFileList(
            options,
            buildPackageList(options.base, options.extras, options.bowerDir),
            'css'
        );
    },
    buildBootstrap: function(options) {
        options = normalizeOptions(options);

        return buildBootstrap(
            buildPackageList(options.base, options.extras, options.bowerDir),
            options.bowerDir
        );

    }
};

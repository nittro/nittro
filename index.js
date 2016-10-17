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
        if (packages.hasOwnProperty(pkg) && packages[pkg]) {
            prefixed[prefix + pkg] = packages[pkg];

        }
    }

    return prefixed;

}

function buildPackageList(base, extras, bowerDir) {
    var pkg, packages = [];

    [base, extras].forEach(function(source) {
        for (pkg in source) {
            if (source.hasOwnProperty(pkg)) {
                addPackageWithDependencies(packages, pkg, bowerDir);
            }
        }
    });

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

    if (!meta.dependencies) {
        return dependencies;
    }

    for (dep in meta.dependencies) {
        if (meta.dependencies.hasOwnProperty(dep)) {
            dependencies.push(dep);
        }
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

function getBridges(packages, bowerDir) {
    var bridges = [];

    packages.forEach(function(pkg) {
        var meta = readNittroMeta(pkg, bowerDir),
            dep;

        if (meta && meta.bridges) {
            for (dep in meta.bridges) {
                if (meta.bridges.hasOwnProperty(dep) && packages.indexOf(dep) > -1 && meta.bridges[dep].files) {
                    meta.bridges[dep].files.forEach(function (file) {
                        bridges.push(formatFilePath(bowerDir, pkg + '/' + file));

                    });
                }
            }
        }
    });

    return bridges;

}

function getExtensions(packages, bowerDir) {
    var extensions = {};

    packages.forEach(function(pkg) {
        var meta = readNittroMeta(pkg, bowerDir),
            dep, ext;

        if (meta && meta.bridges) {
            for (dep in meta.bridges) {
                if (meta.bridges.hasOwnProperty(dep) && packages.indexOf(dep) > -1 && meta.bridges[dep].extensions) {
                    for (ext in meta.bridges[dep].extensions) {
                        if (meta.bridges[dep].extensions.hasOwnProperty(ext)) {
                            extensions[ext] = meta.bridges[dep].extensions[ext];

                        }
                    }
                }
            }
        }
    });

    return extensions;

}

function buildFileList(options, packages, type) {
    var files = [],
        i, j, n;

    if (type === 'js' && packages.indexOf('nittro-forms') > -1) {
        files.push(formatFilePath(options.bowerDir, 'nittro-forms/src/js/Nittro/Forms/Bridges/netteForms.js'));
    }

    type in options.vendor && options.vendor[type].forEach(function(file) {
        files.push(formatFilePath(options.baseDir, file));
    });

    packages.forEach(function(pkg) {
        var pkgFiles = getPackageFiles(pkg, options.bowerDir);

        if (type in pkgFiles) {
            pkgFiles[type].forEach(function(file) {
                files.push(formatFilePath(options.bowerDir, pkg + '/' + file));
            });
        }
    });

    if (type === 'js') {
        var bridges = getBridges(packages, options.bowerDir);
        files = files.concat(bridges);

    }

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

    for (i = 0, n = files.length; i < n; i++) {
        for (j = i + 1; j < n; j++) {
            if (files[j] === files[i]) {
                files.splice(j, 1);
                j--;
                n--;
            }
        }
    }

    return files;

}




function Builder(options) {
    if (!(this instanceof Builder)) {
        return new Builder(options);

    }

    options = normalizeOptions(options);

    this._ = {
        options: options,
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
        "_context.invoke(function(Nittro) {"
    ];

    var config = {
        params: {},
        extensions: getExtensions(this._.packages, this._.options.bowerDir)
    };

    if (typeof this._.options.bootstrap === 'object') {
        ['params', 'extensions'].forEach(function(section) {
            if (section in this._.options.bootstrap) {
                for (var key in this._.options.bootstrap[section]) {
                    if (this._.options.bootstrap[section].hasOwnProperty(key)) {
                        config[section][key] = this._.options.bootstrap[section][key];

                    }
                }
            }
        }.bind(this));
    }

    if (this._.packages.indexOf('nittro-extras-dialogs') > -1) {
        bootstrap.push(
            "    Nittro.Extras.Dialogs.Dialog.setDefaults({",
            "        layer: document.body",
            "    });\n"
        );
    }

    bootstrap.push(
        "    var builder = new Nittro.DI.ContainerBuilder(" + JSON.stringify(config, null, 4).replace(/\n/g, "\n        ") + ");\n",
        "    this.di = builder.createContainer();",
        "    this.di.runServices();\n"
    );

    bootstrap.push(
        "});"
    );

    return bootstrap.join("\n");

};

module.exports = Builder;

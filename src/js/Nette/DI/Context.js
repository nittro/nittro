_context.invoke('Nette.DI', function(Container, Arrays, HashMap, ReflectionClass, NeonEntity, undefined) {

    function traverse(cursor, path, create) {
        if (typeof path === 'string') {
            path = path.split(/\./g);

        }

        var i, p, n = path.length;

        for (i = 0; i < n; i++) {
            p = path[i];

            if (Arrays.isArray(cursor) && p.match(/^\d+$/)) {
                p = parseInt(p);

            }

            if (cursor[p] === undefined) {
                if (create) {
                    cursor[p] = {};

                } else {
                    return undefined;

                }
            }

            cursor = cursor[p];

        }

        return cursor;

    }

    var Context = _context.extend(function(config) {
        config || (config = {});

        this._ = {
            params: Arrays.mergeTree({}, config.params || null),
            serviceDefs: Arrays.mergeTree({}, config.services || null),
            services: {},
            factories: Arrays.mergeTree({}, config.factories || null)
        };

    }, {
        hasParam: function(name) {
            return traverse(this._.params, name) !== undefined;

        },

        getParam: function(name, def) {
            var value = traverse(this._.params, name);
            return value !== undefined ? value : (def !== undefined ? def : null);

        },

        setParam: function(name, value) {
            name = name.split(/\./g);

            var p = name.pop(),
                cursor = this._.params;

            if (name.length) {
                cursor = traverse(cursor, name, true);

            }

            if (Arrays.isArray(cursor) && p.match(/^\d+$/)) {
                p = parseInt(p);

            }

            cursor[p] = value;

            return this;

        },

        hasFactory: function(name) {
            return this._.factories[name] !== undefined;

        },

        addFactory: function(name, factory, params) {
            if (typeof factory === 'string') {
                this._.factories[name] = factory;

            } else {
                this._.factories[name] = {
                    callback: factory,
                    params: params || null
                };
            }

            return this;

        },

        create: function(name, args) {
            if (!this.hasFactory(name)) {
                throw new Error('No factory named "' + name + '" has been registered');

            }

            var factory = this._.factories[name];

            if (typeof factory === 'string') {
                this._.factories[name] = factory = this._toEntity(factory);

            } else if (!(factory.params instanceof HashMap)) {
                factory.params = new HashMap(factory.params);

            }

            if (factory instanceof NeonEntity) {
                return this._expandEntity(factory, null, args);

            } else {
                args = this._autowireArguments(factory.callback, factory.params, args);
                return factory.callback.apply(null, this._expandArguments(args));

            }
        },

        _expandArg: function (arg) {
            if (typeof arg === 'string' && arg.indexOf('%') > -1) {
                if (arg.match(/^%[^%]+%$/)) {
                    return this.getParam(arg.replace(/^%|%$/g, ''));

                } else {
                    return arg.replace(/%([a-z0-9_.-]+)%/i, function () {
                        return this.getParam(arguments[1]);

                    }.bind(this));
                }
            } else {
                return this.__expandArg(arg);

            }
        }
    });

    _context.mixin(Context, Container, {
        _expandArg: '__expandArg'
    });

    _context.register(Context, 'Context');

}, {
    Arrays: 'Utils.Arrays',
    HashMap: 'Utils.HashMap',
    ReflectionClass: 'Utils.ReflectionClass',
    NeonEntity: 'Nette.Neon.NeonEntity'
});

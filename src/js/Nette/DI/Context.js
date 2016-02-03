_context.invoke('Nette.DI', function(Container, Arrays, HashMap, ReflectionClass, NeonEntity, undefined) {

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
            name = name.split('.');
            var p = this._.params,
                n;

            while (name.length) {
                n = name.shift();

                if (p[n] === undefined) {
                    return false;

                }

                p = p[n];

            }

            return p !== undefined;

        },

        getParam: function(name, def) {
            name = name.split('.');
            var p = this._.params,
                n;

            while (name.length) {
                n = name.shift();

                if (p[n] === undefined) {
                    return def || null;

                }

                p = p[n];

            }

            return p;

        },

        setParam: function(name, value) {
            name = name.split('.');
            var p = this._.params,
                n;

            while (name.length > 1) {
                n = name.shift();

                if (p[n] === undefined) {
                    p[n] = {};

                }

                p = p[n];

            }

            p[name.shift()] = value;

            return this;

        },

        hasFactory: function(name) {
            return this._.factories[name] !== undefined;

        },

        addFactory: function(name, callback, params) {
            this._.factories[name] = {
                params: params || null,
                callback: callback
            };

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
                args = factory.attributes.clone().merge(args || []);
                return this._expandEntity(new NeonEntity(factory.value, args));

            } else {
                args = factory.params.clone().merge(args || []);
                return this.invoke(factory.callback, args);

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

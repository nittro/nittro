_context.invoke('Nette.DI', function(Nette, ReflectionClass, ReflectionFunction, Arrays, Strings, HashMap, Neon, NeonEntity, undefined) {

    var prepare = function (self) {
        if (!self._) {
            self._ = {};
        }

        if (!self._.services) {
            self._.services = {};
            self._.serviceDefs = {};

        }
    };

    var Container = {
        addService: function (name, service) {
            prepare(this);

            if (this._.services[name] || this._.serviceDefs[name]) {
                throw new Error('Container already has a service named "' + name + '"');

            }

            this._.services[name] = service;

            return this;

        },

        addDefinition: function (name, definition) {
            prepare(this);

            if (this._.services[name] || this._.serviceDefs[name]) {
               throw new Error('Container already has a service named "' + name + '"');

            }

            this._.serviceDefs[name] = definition;

            return this;

        },

        getService: function (name) {
            prepare(this);

            if (this._.services[name] === undefined) {
                if (this._.serviceDefs[name]) {
                    this._create(name);

                } else {
                    throw new Error('Container has no service named "' + name + '"');

                }
            }

            return this._.services[name];

        },

        _create: function (name) {
            if (!this._.serviceDefs[name]) {
                throw new Error('Container has no service "' + name + '"');

            }

            if (typeof this._.serviceDefs[name] === 'string') {
                this._.serviceDefs[name] = {
                    run: !!this._.serviceDefs[name].match(/!$/),
                    factory: this._.serviceDefs[name].replace(/!$/, '')
                };
            }

            var def = this._.serviceDefs[name],
                factory,
                obj,
                service;

            if (typeof def.factory === 'function') {
                service = this.invoke(def.factory);

                if (!service) {
                    throw new Error('Factory failed to create service "' + name + '"');

                }
            } else {
                factory = this._toEntity(def.factory);
                service = this._expandEntity(factory);

                if (service === factory) {
                    throw new Error('Invalid factory for service "' + name + '"');

                }
            }

            this._.services[name] = service;

            if (def.setup !== undefined) {
                for (var i = 0; i < def.setup.length; i++) {
                    if (typeof def.setup[i] === 'function') {
                        this.invoke(def.setup[i], null, service);

                    } else {
                        obj = this._toEntity(def.setup[i]);
                        this._expandEntity(obj, service);

                    }
                }
            }

            return service;

        },

        invoke: function (callback, args, thisArg) {
            prepare(this);
            return callback.apply(thisArg || null, this._autowireArguments(callback, args));

        },

        _autowireArguments: function (callback, args) {
            var argList = ReflectionFunction.from(callback).getArgs();

            if (args && !(args instanceof HashMap)) {
                args = new HashMap(args);

            }

            for (var i = 0; i < argList.length; i++) {
                if (args) {
                    if (args.has(argList[i])) {
                        argList[i] = args.get(argList[i]);
                        continue;

                    } else if (args.has(i)) {
                        argList[i] = args.get(i);
                        continue;

                    }
                }

                if (this.hasService(argList[i])) {
                    argList[i] = this.getService(argList[i]);
                    continue;

                }

                throw new Error('Cannot autowire argument "' + argList[i] + '" of function');

            }

            return argList;

        },

        _expandArguments: function (args) {
            for (var i = 0; i < args.length; i++) {
                args[i] = this._expandArg(args[i]);

            }

            return args;

        },

        _expandArg: function (arg) {
            if (arg instanceof NeonEntity) {
                return this._expandEntity(arg);

            } else if (typeof arg === 'string' && arg.match(/^@\S+$/)) {
                return this.getService(arg.substr(1));

            } else {
                return arg;

            }
        },

        _toEntity: function (str) {
            var m = str.match(/^([^\(]+)\((.*)\)$/);

            if (m) {
                return new NeonEntity(m[1], Neon.decode('[' + m[2] + ']'));

            } else {
                return new NeonEntity(str, new HashMap());

            }
        },

        _expandEntity: function (entity, context) {
            var m, obj, method, args;

            if (m = entity.value.match(/^(?:(@)?([^:].*?))?(?:::(.+))?$/)) {
                if (m[2]) {
                    obj = m[1] ? this.getService(m[2]) : ReflectionClass.getClass(m[2]);

                } else if (context) {
                    obj = context;

                } else {
                    throw new Error('No context for calling ' + entity.value + ' given');

                }

                if (m[3] !== undefined) {
                    method = m[3];
                    args = this._autowireArguments(obj[method], entity.attributes);
                    return obj[method].apply(obj, this._expandArguments(args));

                } else if (!m[1]) {
                    args = this._autowireArguments(obj, entity.attributes);
                    return ReflectionClass.from(obj).newInstanceArgs(this._expandArguments(args));

                } else if (entity.attributes.length) {
                    throw new Error('Invalid entity "' + entity.value + '"');

                } else {
                    return obj;

                }
            } else {
                return entity;

            }
        },

        hasService: function (name) {
            prepare(this);
            return this._.services[name] !== undefined || this._.serviceDefs[name] !== undefined;

        },

        isCreated: function (name) {
            if (!this.hasService(name)) {
                throw new Error('Container has no service named "' + name + '"');

            }

            return !!this._.services[name];

        },

        runServices: function () {
            prepare(this);

            var name, def;

            for (name in this._.serviceDefs) {
                def = this._.serviceDefs[name];

                if (typeof def === 'string' && def.match(/!$/) || def.factory !== undefined && def.run) {
                    this.getService(name);

                }
            }
        }
    };

    _context.register(Container, 'Container');

}, {
    ReflectionClass: 'Utils.ReflectionClass',
    ReflectionFunction: 'Utils.ReflectionFunction',
    Arrays: 'Utils.Arrays',
    Strings: 'Utils.Strings',
    HashMap: 'Utils.HashMap',
    Neon: 'Nette.Neon.Neon',
    NeonEntity: 'Nette.Neon.NeonEntity'
});

_context.invoke('Nette', function () {

    var prepare = function (self, need) {
        if (!self._) {
            if (need === false) return false;
            self._ = {};

        }

        if (!self._.eventEmitter) {
            if (need === false) return false;

            self._.eventEmitter = {
                listeners: {},
                defaultListeners: {},
                namespaces: []
            };
        }
    };

    var prepareNamespaces = function (emitter, namespaces) {
        return namespaces.map(function (ns) {
            var i = emitter.namespaces.indexOf(ns);

            if (i > -1) return i;

            i = emitter.namespaces.length;
            emitter.namespaces.push(ns);

            return i;

        });
    };

    var hasCommonElement = function (a, b) {
        var i = 0, j = 0;

        while (i < a.length && j < b.length) {
            if (a[i] < b[j]) i++;
            else if (a[i] > b[j]) j++;
            else return true;

        }

        return false;

    };

    var process = function (emitter, evt, op, arg1, arg2) {
        evt = (evt || '').replace(/^\s+|\s+$/g, '').split(/\s+/g);

        evt.forEach(function (e) {
            var dflt = e.split(/:/),
                ns = dflt[0].split(/\./g);

            e = ns.shift();
            ns = prepareNamespaces(emitter, ns);
            ns.sort();
            op(emitter, e, ns, dflt[1] === 'default', arg1, arg2);

        });
    };

    var add = function (emitter, evt, ns, dflt, handler, mode) {
        if (!evt) {
            throw new TypeError('No event specified');

        }

        if (dflt) {
            if (mode !== 0 || ns.length) {
                throw new TypeError("Default event handlers don't support namespaces and one()/first()");

            } else if (emitter.defaultListeners.hasOwnProperty(evt)) {
                throw new TypeError("Event '" + evt + "' already has a default listener");

            }

            emitter.defaultListeners[evt] = handler;
            return;

        }

        if (mode === 2) {
            ns.unshift(emitter.namespaces.length);

        }

        emitter.listeners[evt] || (emitter.listeners[evt] = []);
        emitter.listeners[evt].push({handler: handler, namespaces: ns, mode: mode});

    };

    var remove = function (emitter, evt, ns, dflt, handler) {
        if (!evt) {
            var listeners = dflt ? emitter.defaultListeners : emitter.listeners;

            for (evt in listeners) {
                if (listeners.hasOwnProperty(evt)) {
                    remove(emitter, evt, ns, dflt, handler);

                }
            }

            return;

        }

        if (dflt) {
            if (emitter.defaultListeners.hasOwnProperty(evt) && (!handler || emitter.defaultListeners[evt] === handler)) {
                delete emitter.defaultListeners[evt];

            }

            return;

        }

        if (!emitter.listeners[evt]) return;

        if (ns.length) {
            emitter.listeners[evt] = emitter.listeners[evt].filter(function (listener) {
                if (handler && listener.handler !== handler) return true;
                return !listener.namespaces.length || !hasCommonElement(listener.namespaces, ns);

            });
        } else if (handler) {
            emitter.listeners[evt] = emitter.listeners[evt].filter(function (listener) {
                return listener.handler !== handler;

            });
        } else {
            if (emitter.listeners.hasOwnProperty(evt)) {
                delete emitter.listeners[evt];

            }

            if (emitter.defaultListeners.hasOwnProperty(evt)) {
                delete emitter.defaultListeners[evt];

            }
        }
    };

    var trigger = function (self, evt, data) {
        var e, _ = self._.eventEmitter;

        if (typeof evt !== "object") {
            e = new NetteEvent(evt, data);

        }

        if (_.listeners.hasOwnProperty(evt)) {
            _.listeners[evt].slice().forEach(function (listener) {
                if (listener.mode === 1) {
                    remove(_, evt, [], false, listener.handler);

                } else if (listener.mode === 2) {
                    remove(_, '', [listener.namespaces[0]], false);

                }

                listener.handler.call(self, e);

            });
        }

        if (!e.isDefaultPrevented() && _.defaultListeners.hasOwnProperty(evt)) {
            _.defaultListeners[evt].call(self, e);

        }

        return e;

    };

    var NetteEventEmitter = {
        on: function (evt, handler) {
            prepare(this);
            process(this._.eventEmitter, evt, add, handler, 0);
            return this;

        },

        one: function (evt, handler) {
            prepare(this);
            process(this._.eventEmitter, evt, add, handler, 1);
            return this;

        },

        first: function (evt, handler) {
            prepare(this);
            process(this._.eventEmitter, evt, add, handler, 2);
            this._.eventEmitter.namespaces.push(null);
            return this;

        },

        off: function (evt, handler) {
            if (prepare(this, false) === false) return this;
            process(this._.eventEmitter, evt, remove, handler);
            return this;

        },

        trigger: function (evt, data) {
            if (prepare(this, false) === false) return this;
            return trigger(this, evt, data);

        }
    };

    var returnTrue = function () {
        return true;
    };

    var returnFalse = function () {
        return false;
    };

    var NetteEvent = _context.extend(function (type, data) {
        this.type = type;
        this.data = data || {};

    }, {
        preventDefault: function () {
            this.isDefaultPrevented = returnTrue;

        },

        isDefaultPrevented: returnFalse

    });

    _context.register(NetteEventEmitter, 'EventEmitter');
    _context.register(NetteEvent, 'Event');

});

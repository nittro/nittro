_context.invoke('Nette.Application', function() {

    var Storage = _context.extend(function(namespace, persistent) {
        this._.persistent = persistent;
        this._.engine = persistent ? window.localStorage : window.sessionStorage;
        this._.items = {};
        this._.namespace = namespace || '';
        this._.filters = {
            'in': [],
            out: []
        };

    }, {
        STATIC: {
            NAMESPACE_SEPARATOR: '/',
            FILTER_IN : 'in',
            FILTER_OUT : 'out'
        },

        getItem: function(key, need) {
            var value = this._.engine.getItem(this._formatKey(key));

            if (value === null) {
                if (need) {
                    throw new Error();

                }

                return null;

            }

            return this._applyFilters(this._parseValue(value), Storage.FILTER_OUT);

        },

        setItem: function(key, value) {
            value = this._stringifyValue(this._applyFilters(value, Storage.FILTER_IN));
            this._.engine.setItem(this._formatKey(key), value);

            return this;

        },

        hasItem: function(key) {
            return this._.engine.getItem(this._formatKey(key)) !== null;

        },

        removeItem: function(key) {
            this._.engine.removeItem(this._formatKey(key));
            return this;

        },

        clear: function() {
            var ns = this._.namespace + Storage.NAMESPACE_SEPARATOR,
                nsl = ns.length,
                rem = [];

            for (var i = 0; i < this._.engine.length; i++) {
                var k = this._.engine.key(i);

                if (k.substr(0, nsl) === ns) {
                    rem.push(k);

                }
            }

            while (rem.length) {
                this._.engine.removeItem(rem.shift());

            }

            return this;

        },

        walk: function(callback) {
            var ns = this._.namespace + Storage.NAMESPACE_SEPARATOR,
                nsl = ns.length;

            for (var i = 0; i < this._.engine.length; i++) {
                var k = this._.engine.key(i);

                if (k.substr(0, nsl) === ns) {
                    k = k.substr(nsl);
                    var v = this.getItem(k);
                    callback.call(v, k, v);

                }
            }
        },

        getNamespace: function(namespace) {
            return new this.constructor((this._.namespace ? this._.namespace + Storage.NAMESPACE_SEPARATOR : '') + namespace, this._.persistent);

        },

        addFilter: function(callback, type) {
            this._.filters[type].push(callback);
            return this;

        },

        _formatKey: function(key) {
            return this._.namespace + Storage.NAMESPACE_SEPARATOR + key;

        },

        _parseValue: function(value) {
            return JSON.parse(value);

        },

        _stringifyValue: function(value) {
            return JSON.stringify(value);

        },

        _applyFilters: function(value, type) {
            for (var i = 0; i < this._.filters[type].length; i++) {
                value = this._.filters[type][i](value);

            }

            return value;

        }
    });

    _context.register(Storage, 'Storage');

});

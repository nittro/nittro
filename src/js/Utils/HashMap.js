_context.invoke('Utils', function (Arrays, undefined) {

    var HashMap = _context.extend(function (src) {
        this._ = {
            keys: [],
            values: [],
            numericIndices: 0
        };

        if (src) {
            this.merge(src);

        }
    }, {
        length: 0,

        isList: function () {
            return this.length === this._.numericIndices;

        },

        clone: function (deep) {
            var o = new HashMap();
            o._.keys = this._.keys.slice();
            o._.numericIndices = this._.numericIndices;
            o.length = this.length;

            if (deep) {
                o._.values = this._.values.map(function (v) {
                    return v instanceof HashMap ? v.clone(deep) : v;
                });
            } else {
                o._.values = this._.values.slice();

            }

            return o;

        },

        merge: function (src) {
            if (src instanceof HashMap || Arrays.isArray(src)) {
                src.forEach(function(value, key) { this.set(key, value); }, this);

            } else if (typeof src === 'object' && src !== null) {
                for (var k in src) {
                    if (src.hasOwnProperty(k)) {
                        this.set(k, src[k]);

                    }
                }
            } else {
                throw new TypeError('HashMap.merge() expects the first argument to be an array or an object, ' + (typeof src) + ' given');

            }

            return this;

        },

        append: function (src) {
            if (src instanceof HashMap || Arrays.isArray(src)) {
                src.forEach(function (value, key) {
                    if (typeof key === 'number') {
                        this.push(value);

                    } else {
                        this.set(key, value);

                    }
                }, this);
            } else {
                this.merge(src);

            }

            return this;

        },

        push: function (value) {
            for (var i = 0; i < arguments.length; i++) {
                this._.keys.push(this._.numericIndices);
                this._.values.push(arguments[i]);
                this._.numericIndices++;
                this.length++;

            }

            return this;

        },

        pop: function () {
            if (!this.length) {
                return null;

            }

            var i = this.length - 1;

            if (typeof this._.keys[i] === 'number') {
                this._.numericIndices--;

            }

            this.length--;
            this._.keys.pop();
            return this._.values.pop();

        },

        shift: function () {
            if (!this.length) {
                return null;

            }

            if (typeof this._.keys[0] === 'number') {
                this._.numericIndices--;
                this._shiftKeys(1, this.length, -1);

            }

            this.length--;
            this._.keys.shift();
            return this._.values.shift();

        },

        unshift: function (value) {
            this._shiftKeys(0, this.length, 1);
            this._.keys.unshift(0);
            this._.values.unshift(value);
            return this;

        },

        _shiftKeys: function (from, to, diff) {
            for (var i = from; i < to; i++) {
                if (typeof this._.keys[i] === 'number') {
                    this._.keys[i] += diff;

                }
            }
        },

        slice: function (from, to) {
            (from === undefined) && (from = 0);
            (from < 0) && (from += this.length);
            (to === undefined) && (to = this.length);
            (to < 0) && (to += this.length);

            var o = new HashMap();

            o._.keys = this._.keys.slice(from, to).map(function(k) {
                if (typeof k === 'number') {
                    k = o._.numericIndices;
                    o._.numericIndices++;
                    return k;

                } else {
                    return k;

                }
            });

            o._.values = this._.values.slice(from, to);
            o.length = Math.max(0, from - to);

            return o;

        },

        splice: function (from, remove) {
            var values = Arrays.from(arguments),
                keys = values.slice().map(function() { return -1; }),
                removed, i;

            keys[0] = values[0];
            keys[1] = values[1];

            this._.keys.splice.apply(this._.keys, keys);
            removed = this._.values.splice.apply(this._.values, values);

            this.length = this._.keys.length;
            this._.numericIndices = 0;

            for (i = 0; i < this.length; i++) {
                if (typeof this._.keys[i] === 'number') {
                    this._.keys[i] = this._.numericIndices;
                    this._.numericIndices++;

                }
            }

            return removed;

        },

        'set': function (key, value) {
            var i = this._.keys.indexOf(key);

            if (i === -1) {
                this._.keys.push(key);
                this._.values.push(value);
                this.length++;

            } else {
                this._.values[i] = value;

            }

            return this;

        },

        'get': function (key, need) {
            var i = this._.keys.indexOf(key);

            if (i > -1) {
                return this._.values[i];

            } else if (need) {
                throw new RangeError('Key ' + key + ' not present in HashMap');

            }

            return null;

        },

        has: function (key) {
            var index = this._.keys.indexOf(key);
            return index > -1 && this._.values[index] !== undefined;

        },

        forEach: function (callback, thisArg) {
            for (var i = 0; i < this.length; i++) {
                callback.call(thisArg || null, this._.values[i], this._.keys[i], this);

            }

            return this;

        },

        map: function (callback, thisArg, recursive) {
            return this.clone(recursive).walk(callback, thisArg, recursive);

        },

        walk: function (callback, thisArg, recursive) {
            for (var i = 0; i < this.length; i++) {
                if (recursive && this._.values[i] instanceof HashMap) {
                    this._.values[i].walk(callback, thisArg, recursive);

                } else {
                    this._.values[i] = callback.call(thisArg || null, this._.values[i], this._.keys[i], this);

                }
            }

            return this;

        },

        find: function (predicate, thisArg) {
            var i = this._find(predicate, thisArg, true);
            return i === false ? null : this._.values[i];

        },

        findKey: function (predicate, thisArg) {
            var i = this._find(predicate, thisArg, true);
            return i === false ? null : this._.keys[i];

        },

        some: function (predicate, thisArg) {
            return this._find(predicate, thisArg, true) !== false;

        },

        all: function (predicate, thisArg) {
            return this._find(predicate, thisArg, false) === false;

        },

        _find: function (predicate, thisArg, expect) {
            for (var i = 0; i < this.length; i++) {
                if (predicate.call(thisArg || null, this._.values[i], this._.keys[i], this) === expect) {
                    return i;

                }
            }

            return false;

        },

        filter: function (predicate, thisArg) {
            var o = new HashMap(),
                i;

            for (i = 0; i < this.length; i++) {
                if (predicate.call(thisArg || null, this._.values[i], this._.keys[i], this)) {
                    if (typeof this._.keys[i] === 'number') {
                        o.push(this._.values[i]);

                    } else {
                        o.set(this._.keys[i], this._.values[i]);

                    }
                }
            }

            return o;

        },

        exportData: function () {
            if (this.isList()) {
                return this.getValues();

            }

            for (var i = 0, r = {}; i < this.length; i++) {
                if (this._.values[i] instanceof HashMap) {
                    r[this._.keys[i]] = this._.values[i].exportData();

                } else {
                    r[this._.keys[i]] = this._.values[i];

                }
            }

            return r;

        },

        getKeys: function () {
            return this._.keys.slice();

        },

        getValues: function () {
            return this._.values.slice();

        }
    });

    _context.register(HashMap, 'HashMap');

});

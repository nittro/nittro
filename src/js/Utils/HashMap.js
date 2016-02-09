_context.invoke('Utils', function (Arrays, undefined) {

    var HashMap = _context.extend(function (src) {
        this._ = {
            keys: [],
            values: [],
            nonNumeric: 0,
            nextNumeric: 0
        };

        if (src) {
            this.merge(src);

        }
    }, {
        STATIC: {
            from: function (data, keys) {
                if (!keys) {
                    return data instanceof HashMap ? data.clone() : new HashMap(data);

                } else if (!Arrays.isArray(keys)) {
                    throw new Error('Invalid argument supplied to HashMap.from(): the second argument must be an array');

                }

                var map = new HashMap(),
                    i, n = keys.length,
                    k,
                    arr = Arrays.isArray(data);

                for (i = 0; i < n; i++) {
                    k = arr ? i : keys[i];

                    if (data[k] !== undefined) {
                        map.set(keys[i], data[k]);

                    }
                }

                return map;

            }
        },

        length: 0,

        isList: function () {
            return this._.nonNumeric === 0;

        },

        clone: function (deep) {
            var o = new HashMap();
            o._.keys = this._.keys.slice();
            o._.nextNumeric = this._.nextNumeric;
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
                this._.keys.push(this._.nextNumeric);
                this._.values.push(arguments[i]);
                this._.nextNumeric++;
                this.length++;

            }

            return this;

        },

        pop: function () {
            if (!this.length) {
                return null;

            }

            var k = this._.keys.pop();

            if (typeof k === 'number') {
                if (k + 1 === this._.nextNumeric) {
                    this._.nextNumeric--;

                }
            } else {
                this._.nonNumeric--;

            }

            this.length--;
            return this._.values.pop();

        },

        shift: function () {
            if (!this.length) {
                return null;

            }

            if (typeof this._.keys[0] === 'number') {
                this._.nextNumeric--;
                this._shiftKeys(1, this.length, -1);

            } else {
                this._.nonNumeric--;

            }

            this.length--;
            this._.keys.shift();
            return this._.values.shift();

        },

        unshift: function (value) {
            var values = Arrays.createFrom(arguments),
                n = values.length,
                i = 0,
                keys = new Array(n);

            while (i < n) {
                keys[i] = i++;
            }

            keys.unshift(0, 0);
            values.unshift(0, 0);

            this._shiftKeys(0, this.length, n);
            this._.keys.splice.apply(this._.keys, keys);
            this._.values.splice.apply(this._.values, values);
            this._.nextNumeric += n;
            this.length += n;
            return this;

        },

        slice: function (from, to) {
            (from === undefined) && (from = 0);
            (from < 0) && (from += this.length);
            (to === undefined) && (to = this.length);
            (to < 0) && (to += this.length);

            var o = new HashMap();

            o._.keys = this._.keys.slice(from, to).map(function(k) {
                if (typeof k === 'number') {
                    k = o._.nextNumeric;
                    o._.nextNumeric++;
                    return k;

                } else {
                    o._.nonNumeric++;
                    return k;

                }
            });

            o._.values = this._.values.slice(from, to);
            o.length = o._.keys.length;

            return o;

        },

        splice: function (from, remove) {
            var values = Arrays.createFrom(arguments),
                keys = values.slice().map(function() { return -1; }),
                removed, i;

            keys[0] = values[0];
            keys[1] = values[1];

            this._.keys.splice.apply(this._.keys, keys);
            removed = this._.values.splice.apply(this._.values, values);

            this.length = this._.keys.length;
            this._.nextNumeric = 0;
            this._.nonNumeric = 0;

            for (i = 0; i < this.length; i++) {
                if (typeof this._.keys[i] === 'number') {
                    this._.keys[i] = this._.nextNumeric;
                    this._.nextNumeric++;

                } else {
                    this._.nonNumeric++;

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

                if (typeof key === 'number') {
                    if (key >= this._.nextNumeric) {
                        this._.nextNumeric = key + 1;

                    }
                } else {
                    this._.nonNumeric++;

                }
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

        map: function (callback, recursive, thisArg) {
            return this.clone(recursive).walk(callback, recursive, thisArg);

        },

        walk: function (callback, recursive, thisArg) {
            for (var i = 0; i < this.length; i++) {
                if (recursive && this._.values[i] instanceof HashMap) {
                    this._.values[i].walk(callback, recursive, thisArg);

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
                return this.getValues().map(function(v) {
                    return v instanceof HashMap ? v.exportData() : v;

                });
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

        },

        _shiftKeys: function (from, to, diff) {
            while (from < to) {
                if (typeof this._.keys[from] === 'number') {
                    this._.keys[from] += diff;

                }

                from++;

            }
        },

        _find: function (predicate, thisArg, expect) {
            for (var i = 0; i < this.length; i++) {
                if (predicate.call(thisArg || null, this._.values[i], this._.keys[i], this) === expect) {
                    return i;

                }
            }

            return false;

        }
    });

    _context.register(HashMap, 'HashMap');

});

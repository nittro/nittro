_context.invoke('Utils', function(undefined) {

    var Arrays = {
        isArray: function(a) {
            return a && a.constructor === Array;

        },

        isArrayLike: function(a) {
            return typeof a === 'object' && a.length !== undefined;

        },

        shuffle: function (a) {
            var c = a.length, t, i;

            // While there are elements in the array
            while (c--) {
                // Pick a random index
                i = (Math.random() * c) | 0;

                // And swap the last element with it
                t = a[c];
                a[c] = a[i];
                a[i] = t;
            }

            return a;

        },

        createFrom: function(a, s, e) {
            if (a.length === undefined) {
                throw new Error('Invalid argument, only array-like objects can be supplied');

            }

            return Array.prototype.slice.call(a, s || 0, e || a.length);

        },

        getKeys: function(a) {
            var keys = [], k;

            if (Arrays.isArray(a)) {
                for (k = 0; k < a.length; k++) {
                    keys.push(k);

                }
            } else {
                for (k in a) {
                    keys.push(k);

                }
            }

            return keys;

        },

        filterKeys: function() {
            var args = Arrays.createFrom(arguments),
                t = args.shift(),
                a, i, r = {}, rem;

            rem = function(k) {
                if (r[k] === undefined) {
                    r[k] = t[k];
                    delete t[k];

                }
            };

            while (args.length) {
                a = args.shift();

                if (typeof a === 'object') {
                    if (a instanceof Array) {
                        for (i = 0; i < a.length; i++) {
                            rem(a[i]);

                        }
                    } else {
                        for (i in a) {
                            rem(i);

                        }
                    }
                } else {
                    rem(a);

                }
            }
        },

        getValues: function(a) {
            var arr = [], k;

            for (k in a) {
                arr.push(a[k]);

            }

            return arr;

        },

        merge: function() {
            var args = Arrays.createFrom(arguments),
                a = args.shift(),
                r = false,
                b, i;

            if (typeof a === 'boolean') {
                r = a;
                a = args.shift();

            }

            if (!a) {
                a = [];
            }

            while (args.length) {
                b = args.shift();
                if (b instanceof Array) {
                    for (i = 0; i < b.length; i++) {
                        if (r && typeof b[i] === 'object' && Object.prototype.toString.call(b[i]) === '[object Object]') {
                            a.push(Arrays.mergeTree(r, {}, b[i]));

                        } else {
                            a.push(b[i]);

                        }
                    }
                }
            }

            return a;

        },

        mergeTree: function() {
            var r = false,
                args = Arrays.createFrom(arguments),
                ofs = 1,
                t = args.shift(),
                props = [];

            if (typeof t === 'boolean') {
                r = t;
                t = args.shift();
                ofs = 2;

            }

            while (args.length) {
                var o = args.pop(),
                    p, a, i;

                if (typeof o !== 'object' || o === null) {
                    continue;

                }

                if (!t) {
                    t = {};

                }

                for (p in o) {
                    if (!o.hasOwnProperty(p) || props.indexOf(p) !== -1) {
                        continue;

                    }

                    if (typeof o[p] === 'object') {
                        if (r) {
                            if (o[p] instanceof Array) {
                                a = [r, t[p] || null];

                                for (i = ofs; i < arguments.length; i++) {
                                    a.push(arguments[i][p] || null);

                                }

                                t[p] = Arrays.merge.apply(this, a);

                            } else {
                                a = [r, null];

                                for (i = ofs; i < arguments.length; i++) {
                                    a.push(arguments[i] ? arguments[i][p] || null : null);

                                }

                                t[p] = Arrays.mergeTree.apply(this, a) || t[p];

                            }

                        } else {
                            t[p] = t[p] === undefined ? o[p] : (o[p] === null ? t[p] : o[p]);

                        }
                    } else {
                        t[p] = o[p];

                    }

                    props.push(p);

                }
            }

            return t;

        },

        walk: function(r, a, f) {
            if (typeof r !== "boolean") {
                f = a;
                a = r;
                r = false;
            }

            var i,
                p = function(k, v) {
                    if (r && (v instanceof Array || v instanceof Object)) {
                        Arrays.walk(r, v, f);

                    } else {
                        f.call(v, k, v);

                    }
                };

            if (a instanceof Array) {
                for (i = 0; i < a.length; i++) {
                    p(i, a[i]);

                }
            } else if (a instanceof Object) {
                for (i in a) {
                    p(i, a[i]);

                }
            } else {
                p(null, a);

            }
        }
    };

    _context.register(Arrays, 'Arrays');

});

_context.invoke('Utils', function(undefined) {

    var Strings = {
        applyModifiers: function(s) {
            var f = Array.prototype.slice.call(arguments, 1),
                i = 0,
                a, m;

            for (; i < f.length; i++) {
                a = f[i].split(':');
                m = a.shift();
                a.unshift(s);
                s = Strings[m].apply(Strings, a);

            }

            return s;

        },

        toString: function(s) {
            return s === undefined ? 'undefined' : (typeof s === 'string' ? s : (s.toString !== undefined ? s.toString() : String(s)));

        },

        sprintf: function(s) {
            return Strings.vsprintf(s, Array.prototype.slice.call(arguments, 1));

        },

        vsprintf: function(s, args) {
            var n = 0;

            return s.replace(/(^|[^%](?:%%)*)%(?:(\d+)\$)?(\.\d+|\[.*?:.*?\])?([idsfa])/g, function(m, p, a, i, t) {
                if (!a) {
                    a = ++n;

                } else {
                    a = parseInt(a);

                }

                a = args[a - 1];

                switch (t) {
                    case 's':
                        return p + Strings.toString(a);

                    case 'i':
                    case 'd':
                        return p + parseInt(a);

                    case 'f':
                        a = parseFloat(a);

                        if (i && i.match(/^\.\d+$/)) {
                            a = a.toFixed(parseInt(i.substr(1)));

                        }

                        return p + a;

                    case 'a':
                        i = i && i.match(/^\[.*:.*\]$/) ? i.substr(1, i.length - 2).split(':') : [', ', ', '];
                        return a.length === 0 ? '' : p + a.slice(0, -1).join(i[0]) + (a.length > 1 ? i[1] : '') + a[a.length - 1];

                }

                return m;

            });
        },

        webalize: function(s, chars, ws) {
            if (ws) {
                s = s.replace(/\s+/g, '_');

            }

            s = s.replace(new RegExp('[^_A-Za-z\u00C0-\u017F' + Strings.escapeRegex(chars || '').replace(/\\-/g, '-') + ']+', 'g'), '-');

            return Strings.trim(s, '_-');

        },

        escapeRegex: function(s) {
            return s.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

        },

        split: function(s, re, offsetCapture, noEmpty, delimCapture) {
            if (re instanceof RegExp) {
                re = new RegExp(re.source, [re.ignoreCase ? 'i' : '', re.multiline ? 'm' : '', 'g'].filter(function(v) { return !!v; }).join(''))

            } else {
                re = new RegExp(re, 'g');

            }

            var r = [],
                len = 0;

            s = s.replace(re, function(m, p, ofs) {
                ofs = arguments[arguments.length - 2];
                p = s.substring(len, ofs);

                if (p.length && !p.match(/^[\t ]+$/) || !noEmpty) {
                    r.push(offsetCapture ? [p, len] : s.substring(len, ofs));

                }

                if (delimCapture && !m.match(/^[\t ]+$/)) {
                    r.push(offsetCapture ? [m, ofs] : m);

                }

                len = ofs + m.length;

                return m;

            });

            if (len < s.length || !noEmpty) {
                s = s.substring(len);
                (!noEmpty || (s.length && !s.match(/^[\t ]+$/))) && r.push(offsetCapture ? [s, len] : s);

            }

            return r;

        },

        trim: function(s, c) {
            if (!c) {
                c = " \t\n\r\0\x0B\xC2\xA0";

            }

            c = Strings.escapeRegex(c);
            return s.replace(new RegExp('^[' + c + ']+|[' + c + ']+$', 'i'), '');

        },

        trimLeft: function(s, c) {
            if (!c) {
                c = " \t\n\r\0\x0B\xC2\xA0";

            }

            return s.replace(new RegExp('^[' + Strings.escapeRegex(c) + ']+', 'i'), '');

        },

        trimRight: function(s, c) {
            if (!c) {
                c = " \t\n\r\0\x0B\xC2\xA0";

            }

            return s.replace(new RegExp('[' + Strings.escapeRegex(c) + ']+$', 'i'), '');

        },

        firstUpper: function(s) {
            return s.substr(0, 1).toUpperCase() + s.substr(1);

        },

        compare: function(a, b, len) {
            if (typeof a !== "string" || typeof b !== 'string') {
                return false;

            }

            if (!len) {
                len = Math.min(a.length, b.length);

            }

            return a.substr(0, len).toLowerCase() === b.substr(0, len).toLowerCase();

        },

        contains: function(h, n) {
            return h.indexOf(n) !== -1;

        },

        isNumeric: function(s) {
            return Object.prototype.toString.call(s) !== '[object Array]' && (s - parseFloat(s) + 1) >= 0;

        },

        escapeHtml: function(s) {
            return s
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');

        },

        nl2br: function(s, collapse) {
            return s.replace(collapse ? /\n+/g : /\n/g, '<br />');

        },

        random: function(len, chars) {
            chars = (chars || 'a-z0-9').replace(/.-./g, function(m, a, b) {
                a = m.charCodeAt(0);
                b = m.charCodeAt(2);
                var n = Math.abs(b - a),
                    c = new Array(n),
                    o = Math.min(a, b),
                    i = 0;

                for (; i <= n; i++) {
                    c[i] = o + i;
                }

                return String.fromCharCode.apply(null, c);

            });

            var s = [], i = len || 8, n = chars.length - 1;
            for (; i >= 0; i--) {
                s.push(chars[Math.round(Math.random() * n)]);

            }

            return s.join('');

        },

        parseArguments: function(s) {
            var args = [],
                a,
                i,
                o = 0,
                m,
                c,
                q = false,
                p = 0,
                r = {};

            r['"'] = /^"(.*?(?:[^\\](?:\\\\)+)?)"\s*(,|$)/;
            r["'"] = /^'(.*?(?:[^\\](?:\\\\)+)?)'\s*(,|$)/;

            for (i = 0; i <= s.length; i++) {
                c = i === s.length ? ',' : s.charAt(i);

                if (c.match(/['"]/) && p === 0) {
                    m = s.substr(i).match(r[c]);
                    args.push(m[1]);
                    i += m[0].length;
                    o = i + 1;

                } else if (c === '(' && !q) {
                    p++;

                } else if (c === ')' && !q) {
                    p--;

                } else if (c === '\\') {
                    q = !q;

                } else if (c === ',' && p === 0) {
                    a = s.substr(o, i - o).trim();

                    if (a.match(/^-?[0-9]+$/)) {
                        a = parseInt(a);

                    } else if (a.match(/^-?[0-9]*[.,]?[0-9]+$/)) {
                        a = parseFloat(a);

                    } else if (a.match(/^(true|false)$/i)) {
                        a = a.toLowerCase() === 'true';

                    } else if (a === 'null') {
                        a = null;

                    } else {
                        a = new Statement(a);

                    }

                    args.push(a);
                    o = i + 1;

                } else {
                    q = false;

                }
            }

            return args;

        }
    };

    var Statement = function(s) {
        this.toString = function() {
            return s;
        };
    };

    _context.register(Strings, 'Utils.Strings');
    _context.register(Statement, 'Utils.Statement');

});
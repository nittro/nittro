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
            return s === undefined ? 'undefined' : (typeof s === 'string' ? s : (s.toString !== undefined ? s.toString() : Object.prototype.toString.call(s)));

        },

        sprintf: function(s) {
            return Strings.vsprintf(s, Array.prototype.slice.call(arguments, 1));

        },

        vsprintf: function(s, args) {
            var n = 0;

            return s.replace(/%(?:(\d+)\$)?(\.\d+|\[.*?:.*?\])?([idsfa%])/g, function(m, a, p, f) {
                if (f === '%') {
                    return f;

                }

                a = a ? parseInt(a) - 1 : n++;

                if (args[a] === undefined) {
                    throw new Error('Missing parameter #' + (a + 1));

                }

                a = args[a];

                switch (f) {
                    case 's':
                        return Strings.toString(a);

                    case 'i':
                    case 'd':
                        return parseInt(a);

                    case 'f':
                        a = parseFloat(a);

                        if (p && p.match(/^\.\d+$/)) {
                            a = a.toFixed(parseInt(p.substr(1)));

                        }

                        return a;

                    case 'a':
                        p = p && p.match(/^\[.*:.*\]$/) ? p.substr(1, p.length - 2).split(':') : [', ', ', '];
                        return a.length === 0 ? '' : a.slice(0, -1).join(p[0]) + (a.length > 1 ? p[1] : '') + a[a.length - 1];

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

                if (delimCapture && (m.length && !m.match(/^[\t ]+$/) || !noEmpty)) {
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
            return Strings._trim(s, c, true, true);

        },

        trimLeft: function(s, c) {
            return Strings._trim(s, c, true, false);

        },

        trimRight: function(s, c) {
            return Strings._trim(s, c, false, true);

        },

        _trim: function (s, c, l, r) {
            if (!c) {
                c = " \t\n\r\0\x0B\xC2\xA0";

            }

            var re = [];
            c = '[' + Strings.escapeRegex(c) + ']+';
            l && re.push('^', c);
            l && r && re.push('|');
            r && re.push(c, '$');

            return s.replace(new RegExp(re.join(''), 'ig'), '');

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

            len || (len = 8);

            var s = new Array(len),
                n = chars.length - 1,
                i;

            for (i = 0; i < len; i++) {
                s[i] = chars[Math.round(Math.random() * n)];

            }

            return s.join('');

        }
    };

    _context.register(Strings, 'Strings');

});

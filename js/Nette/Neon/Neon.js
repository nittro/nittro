_context.invoke('Nette.Neon', function(Nette, HashMap, Tokenizer, Strings, Arrays, DateTime, undefined) {

    var Neon = _context.extend(function() {
        this._cbStr = this._cbStr.bind(this);

    }, {
        STATIC: {
            patterns: [
                '\'[^\'\\n]*\'|"(?:\\\\.|[^"\\\\\\n])*"', //string
                '(?:[^#"\',:=[\\]{}()\x00-\x20!`-]|[:-][^"\',\\]})\\s])(?:[^,:=\\]})(\x00-\x20]|:(?![\\s,\\]})]|$)|[ \\t]+[^#,:=\\]})(\x00-\x20])*', // literal / boolean / integer / float
                '[,:=[\\]{}()-]', // symbol
                '?:#.*', // comment
                '\\n[\\t ]*', // new line + indent
                '?:[\\t ]+' // whitespace
            ],

            brackets: {
                '{' : '}',
                '[' : ']',
                '(' : ')'
            },

            consts: {
                'true': true, 'True': true, 'TRUE': true, 'yes': true, 'Yes': true, 'YES': true, 'on': true, 'On': true, 'ON': true,
                'false': false, 'False': false, 'FALSE': false, 'no': false, 'No': false, 'NO': false, 'off': false, 'Off': false, 'OFF': false,
                'null': null, 'Null': null, 'NULL': null
            },

            indent: '    ',

            BLOCK: 1,

            encode: function(data, options) {
                var tmp, s, isList;

                if (data instanceof DateTime) {
                    return data.format('Y-m-d H:i:s O');

                } else if (data instanceof NeonEntity) {
                    tmp = Neon.encode(data.attributes);
                    return Neon.encode(data.value) + '(' + tmp.substr(1, tmp.length - 2) + ')';

                }

                if (data && typeof data === 'object') { // array or object literal
                    s = [];
                    isList = Arrays.isArray(data);

                    if (options & Neon.BLOCK) {
                        Arrays.walk(data, function(k, v) {
                            v = Neon.encode(v, Neon.BLOCK);
                            s.push(isList ? '-' : (Neon.encode(k) + ':'), Strings.contains(v, "\n") ? "\n" + Neon.indent + v.replace(/\n/g, "\n" + Neon.indent) : (' ' + v), "\n");

                        });

                        return s.length ? s.join('') : '[]';

                    } else {
                        Arrays.walk(data, function(k, v) {
                            s.push(isList ? '' : (Neon.encode(k) + ': '), Neon.encode(v), ', ');

                        });

                        s.pop(); // remove last ', '
                        return (isList ? '[' : "{") + s.join('') + (isList ? ']' : '}');

                    }
                } else if (typeof data === 'string' && !Strings.isNumeric(data)
                    && !data.match(/[\x00-\x1F]|^\d{4}|^(true|false|yes|no|on|off|null)$/i)
                    && data.match(new RegExp('^' + Neon.patterns[1] + '$'))) {

                    return data;

                } else {
                    return JSON.stringify(data);

                }
            },

            decode: function(input) {
                if (typeof input !== 'string') {
                    throw new Error('Invalid argument, must be a string');

                }

                if (!Neon.tokenizer) {
                    Neon.tokenizer = new Tokenizer(Neon.patterns, 'mi');

                }

                input = input.replace(/\r/g, '');

                var parser = new Neon(),
                    res;

                parser.input = input;
                parser.tokens = Neon.tokenizer.tokenize(input);

                res = parser.parse(0, new HashMap());

                while (parser.tokens[parser.n] !== undefined) {
                    if (parser.tokens[parser.n][0].charAt(0) === "\n") {
                        parser.n++;

                    } else {
                        parser.error();

                    }
                }

                return res;

            }
        },

        input: null,
        tokens: null,
        n: 0,
        indentTabs: null,

        parse: function(indent, result) {
            indent === undefined && (indent = null);
            result === undefined && (result = new HashMap());

            var inlineParser = (indent === null),
                value = null, key = null, entity = null,
                hasValue = false, hasKey = false,
                t;

            for (; this.n < this.tokens.length; this.n++) {
                t = this.tokens[this.n][0];

                if (t === ',') {
                    if ((!hasKey && !hasValue) || !inlineParser) {
                        this.error();

                    }

                    this.addValue(result, hasKey, key, hasValue ? value : null);
                    hasKey = hasValue = false;

                } else if (t === ':' || t === '=') {
                    if (hasKey || !hasValue) {
                        this.error();

                    }

                    if (typeof value !== 'string' && typeof value !== 'number') {
                        this.error('Unacceptable key');

                    }

                    key = Strings.toString(value);
                    hasKey = true;
                    hasValue = false;

                } else if (t === '-') {
                    if (hasKey || hasValue || inlineParser) {
                        this.error();

                    }

                    key = null;
                    hasKey = true;

                } else if (Neon.brackets[t] !== undefined) {
                    if (hasValue) {
                        if (t !== '(') {
                            this.error();

                        }

                        this.n++;

                        entity = new NeonEntity();
                        entity.value = value;
                        entity.attributes = this.parse(null, new HashMap());
                        value = entity;

                    } else {
                        this.n++;
                        value = this.parse(null, new HashMap());

                    }

                    hasValue = true;

                    if (this.tokens[this.n] === undefined || this.tokens[this.n][0] !== Neon.brackets[t]) {
                        this.error();

                    }

                } else if (t === '}' || t === ']' || t === ')') {
                    if (!inlineParser) {
                        this.error();

                    }

                    break;

                } else if (t.charAt(0) === "\n") {
                    if (inlineParser) {
                        if (hasKey || hasValue) {
                            this.addValue(result, hasKey, key, hasValue ? value : null);
                            hasKey = hasValue = false;

                        }
                    } else {
                        while (this.tokens[this.n + 1] !== undefined && this.tokens[this.n + 1][0].charAt(0) === "\n") {
                            this.n++;

                        }

                        if (this.tokens[this.n + 1] === undefined) {
                            break;

                        }

                        var newIndent = this.tokens[this.n][0].length - 1;
                        if (indent === null) {
                            indent = newIndent;

                        }

                        if (newIndent) {
                            if (this.indentTabs === null) {
                                this.indentTabs = this.tokens[this.n][0].charAt(1) === "\t";

                            }

                            if (Strings.contains(this.tokens[this.n][0], this.indentTabs ? ' ' : "\t")) {
                                this.n++;
                                this.error('Either tabs or spaces may be used for indentation, not both');

                            }
                        }

                        if (newIndent > indent) {
                            if (hasValue || !hasKey) {
                                this.n++;
                                this.error('Unexpected indentation');

                            } else {
                                this.addValue(result, key !== null, key, this.parse(newIndent, new HashMap()));

                            }

                            newIndent = this.tokens[this.n] !== undefined ? this.tokens[this.n][0].length - 1 : 0;
                            hasKey = false;

                        } else {
                            if (hasValue && !hasKey) {
                                break;

                            } else if (hasKey) {
                                this.addValue(result, key !== null, key, hasValue ? value : null);
                                hasKey = hasValue = false;

                            }
                        }

                        if (newIndent < indent) {
                            return result;

                        }
                    }
                } else {
                    if (hasValue) {
                        this.error();

                    }

                    if (t.charAt(0) === '"') {
                        value = t.substr(1, t.length - 2).replace(/\\(?:u[0-9a-f]{4}|x[0-9a-f]{2}|.)/gi, this._cbStr);

                    } else if (t.charAt(0) === "'") {
                        value = t.substr(1, t.length - 2);

                    } else if (Neon.consts[t] !== undefined) {
                        value = Neon.consts[t];

                    } else if (Strings.isNumeric(t)) {
                        value = parseFloat(t);

                    } else if (t.match(/^\d\d\d\d-\d\d?-\d\d?(?:(?:[Tt]| +)\d\d?:\d\d(?::\d\d(?:\.\d*)?)? *(?:Z|[-+]\d\d?(?::?\d\d)?)?)?$/)) {
                        value = DateTime.from(t);

                    } else {
                        value = t;

                    }

                    hasValue = true;

                }
            }

            if (inlineParser) {
                if (hasKey || hasValue) {
                    this.addValue(result, hasKey, key, hasValue ? value : null);

                }
            } else {
                if (hasValue && !hasKey) {
                    if (!result.length) {
                        result = value;

                    } else {
                        this.error();

                    }
                } else if (hasKey) {
                    this.addValue(result, key !== null, key, hasValue ? value : null);

                }
            }

            return result;

        },

        addValue: function(result, hasKey, key, value) {
            if (hasKey) {
                if (result && result.has(key)) {
                    this.error("Duplicated key " + key);

                }

                result.set(key, value);

            } else {
                result.push(value);

            }
        },

        _cbStr: function(m) {
            var mapping = {t: '\t', n: '\n', r: '\r', f: '\x0C', b: '\x08', '"': '"', '\\': '\\', '/': '/', '_': '\xC2\xA0'}

            if (mapping[m.charAt(1)] !== undefined) {
                return mapping[m.charAt(1)];

            } else if (m.charAt(1) === 'u' && m.length === 6) {
                return String.fromCharCode(parseInt(m.substr(2), 16));

            } else if (m.charAt(1) === 'x' && m.length === 4) {
                return String.fromCharCode(parseInt(m.substr(2), 16));

            } else {
                this.error('Invalid escape sequence ' + m);

            }
        },

        error: function(msg) {
            var last = this.tokens[this.n] !== undefined ? this.tokens[this.n] : null,
                pos = Tokenizer.getCoordinates(this.input, last ? last[1] : this.input.length),
                token = last ? last[0].substr(0, 40).replace(/\n/g, '<new line>') : 'end';

            throw new Error((msg || 'Unexpected %s').replace(/%s/g, token) + ' on line ' + pos[0] + ', column ' + pos[1]);

        }

    });

    var NeonEntity = this.NeonEntity = function(value, attributes) {
        this.value = value || null;
        this.attributes = attributes || null;

    };

    _context.register(Neon, 'Neon');
    _context.register(NeonEntity, 'NeonEntity');

}, {
    HashMap: 'Utils.HashMap',
    Strings: 'Utils.Strings',
    Arrays: 'Utils.Arrays',
    DateTime: 'Utils.DateTime',
    Tokenizer: 'Nette.Utils.Tokenizer'
});

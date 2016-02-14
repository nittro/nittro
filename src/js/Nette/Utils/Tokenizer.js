_context.invoke('Nette.Utils', function(Nette, Strings, Arrays, HashMap, undefined) {

    var Tokenizer = _context.extend(function(patterns, matchCase) {
        var types = false;

        if (!Arrays.isArray(patterns)) {
            if (patterns instanceof HashMap) {
                types = patterns.getKeys();
                patterns = patterns.getValues();

            } else {
                var tmp = patterns, type;
                types = [];
                patterns = [];

                for (type in tmp) {
                    if (tmp.hasOwnProperty(type)) {
                        types.push(type);
                        patterns.push(tmp[type]);

                    }
                }
            }
        }

        this._ = {
            pattern: '(' + patterns.join(')|(') + ')',
            types: types,
            matchCase: matchCase
        };
    }, {
        STATIC: {
            getCoordinates: function(text, offset) {
                text = text.substr(0, offset);
                var m = text.match(/\n/g);

                return [(m ? m.length : 0) + 1, offset - ("\n" + text).lastIndexOf("\n") + 1];

            }
        },

        tokenize: function(input) {
            var re, tokens, pos, n;

            if (this._.types) {
                re = new RegExp(this._.pattern, 'gm' + (this._.matchCase ? '' : 'i'));
                tokens = [];
                pos = 0;
                n = this._.types.length;

                input.replace(re, function () {
                    var ofs = arguments[n + 1],
                        i;

                    if (ofs > pos) {
                        tokens.push([input.substr(pos, ofs - pos), pos, null]);

                    }

                    for (i = 1; i <= n; i++) {
                        if (arguments[i] !== undefined) {
                            tokens.push([arguments[i], ofs, this._.types[i - 1]]);
                            pos = ofs + arguments[0].length;
                            return;

                        }
                    }

                    throw new Error('Unknown token type: ' + arguments[0]);

                }.bind(this));

                if (pos + 1 < input.length) {
                    tokens.push([input.substr(pos), pos, null]);

                }
            } else {
                tokens = Strings.split(input, new RegExp(this._.pattern, 'm' + (this._.matchCase ? '' : 'i')), true, true, true);

            }

            return tokens;

        }
    });

    _context.register(Tokenizer, 'Tokenizer');

}, {
    Strings: 'Utils.Strings',
    Arrays: 'Utils.Arrays',
    HashMap: 'Utils.HashMap'
});

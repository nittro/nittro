_context.invoke('Nette.Utils', function(Nette, Strings, Arrays, undefined) {

    var Tokenizer = _context.extend(function(patterns, flags) {
        this._ = {
            pattern: '(' + patterns.join(')|(') + ')',
            flags: flags,
            types: Arrays.isArray(patterns) ? false : Arrays.getKeys(patterns)
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
            var re, tokens, len, type, t, i;

            if (this._.types) {
                re = new RegExp('^(?:' + this._.pattern + ')', this._.flags);
                re.global = true;
                tokens = input.match(re);
                len = 0;

                if (!tokens) {
                    return [];

                }

                for (t = 0; t < tokens.length; t++) {
                    type = null;

                    for (i = 1; i <= this._.types.length; i++) {
                        if (tokens[t][i] === undefined) {
                            break;

                        } else if (tokens[t][i]) {
                            type = this._.types[i - 1];
                            break;

                        }
                    }

                    tokens[t] = [tokens[t][0], len, type];
                    len += tokens[t][0].length;

                }
            } else {
                tokens = Strings.split(input, new RegExp(this._.pattern, 'mi'), true, true, true);

            }

            return tokens;

        }
    });

    _context.register(Tokenizer, 'Tokenizer');

}, {
    Strings: 'Utils.Strings',
    Arrays: 'Utils.Arrays'
});

_context.invoke('Nette.Application.Routing', function (Nette, Strings, Arrays) {

    var URLRoute = _context.extend(Nette.Object, function (mask) {
        URLRoute.Super.call(this);
        this._.mask = this._prepareMask(mask);

    }, {
        STATIC: {
            styles: {
                'int': parseInt,
                'float': parseFloat,
                'bool': function(v) { return !v.match(/^(?:0|false|)$/); }
            }
        },

        match: function (url) {
            var params = this.tryMatch(url);

            if (params) {
                Arrays.mergeTree(params, url.getParams());
                this.trigger('match', params);

            }
        },

        tryMatch: function (url) {
            var match = this._.mask.pattern.exec(url.getPath().replace(/^\/|\/$/g, ''));

            if (!match) {
                return null;

            }

            var params = {},
                i, n, p, v;

            match.shift();

            for (i = 0, n = this._.mask.map.length; i < n; i++) {
                p = this._.mask.map[i];
                v = decodeURIComponent(match[i]);

                if (p.style) {
                    params[p.name] = URLRoute.styles[p.style].call(null, v);

                } else {
                    params[p.name] = v;

                }
            }

            return params;

        },

        _prepareMask: function (mask) {
            var reTop = /^([<\[\]\(])|^([^<\[\]\(]+)/,
                reParam = /^([^ #>]+)(?: +([^ #>]+))?(?: +#([^ >]+))? *>/,
                reParen = /\((?!\?:)/g,
                reOptional = /^\?:/,
                match, param,
                map = [],
                pattern = ['^'];

            mask = mask.replace(/^\/|\/$/g, '');

            while (mask.length) {
                match = reTop.exec(mask);

                if (!match) {
                    throw new Error('Invalid mask, error near ' + mask.substr(0, 10));

                }

                mask = mask.substr(match[0].length);

                if (match[1] === '<') {
                    param = reParam.exec(mask);

                    if (!param) {
                        throw new Error('Invalid mask, error near ' + mask.substr(0, 10));

                    }

                    mask = mask.substr(param[0].length);

                    if (param[2]) {
                        param[2] = param[2].replace(reParen, '(?:');

                    } else {
                        param[2] = '[^/]+';

                    }

                    pattern.push('(', param[2], ')');

                    if (param[3] && !(param[3] in URLRoute.styles)) {
                        throw new Error('Unknown parameter style: ' + param[3]);

                    }

                    map.push({
                        name: param[1],
                        style: param[3] || null
                    });

                } else if (match[1] === '[') {
                    pattern.push('(?:');

                } else if (match[1] === ']') {
                    pattern.push(')?');

                } else if (match[1] === '(') {
                    pattern.push(reOptional.test(mask) ? '(' : '(?:');

                } else {
                    pattern.push(Strings.escapeRegex(match[2]));

                }
            }

            pattern.push('$');

            return {
                pattern: new RegExp(pattern.join('')),
                map: map
            };
        }
    });

    _context.register(URLRoute, 'URLRoute');

}, {
    Strings: 'Utils.Strings',
    Arrays: 'Utils.Arrays'
});

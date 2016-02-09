_context.invoke('Utils', function (undefined) {

    var DateInterval = function (interval) {
        this._ = {
            initialized: false,
            interval: interval
        };
    };

    DateInterval.from = function (interval) {
        return new DateInterval(interval);

    };

    var intervalNames = [
        'year',
        'month',
        'week',
        'day',
        'hour',
        'minute',
        'second',
        'millisecond'
    ];

    var intervalLengths = [
        31536000000,
        604800000,
        2678400000,
        86400000,
        3600000,
        60000,
        1000,
        1
    ];

    var intervalHelpers = [
        { pattern: /^y(?:ears?)?$/, toString: function(n) { return n === 1 ? 'year' : 'years' } },
        { pattern: /^mon(?:ths?)?$/, toString: function(n) { return n === 1 ? 'month' : 'months' } },
        { pattern: /^w(?:eeks?)?$/, toString: function(n) { return n === 1 ? 'week' : 'weeks' } },
        { pattern: /^d(?:ays?)?$/, toString: function(n) { return n === 1 ? 'day' : 'days' } },
        { pattern: /^h(?:ours?)?$/, toString: function(n) { return n === 1 ? 'hour' : 'hours' } },
        { pattern: /^min(?:utes?)?$/, toString: function(n) { return n === 1 ? 'minute' : 'minutes' } },
        { pattern: /^s(?:ec(?:onds?)?)?$/, toString: function(n) { return n === 1 ? 'second' : 'seconds' } },
        { pattern: /^millis(?:econds?)?$|^ms$/, toString: function(n) { return n === 1 ? 'millisecond' : 'milliseconds' } }
    ];


    var separators = [', ', ' and '];


    DateInterval.setHelpers = function (helpers) {
        // @todo check helpers are valid
        intervalHelpers = helpers;

    };

    DateInterval.setSeparators = function (separator, last) {
        separators = [separator, last];

    };

    function getValue(interval) {
        if (typeof interval === 'number') {
            return interval;
        } else if (interval instanceof DateInterval) {
            return interval.getLength();
        } else {
            return DateInterval.from(interval).getLength();
        }
    }

    DateInterval.prototype.add = function (interval) {
        this._initialize();
        this._.interval += getValue(interval);
        return this;

    };

    DateInterval.prototype.subtract = function (interval) {
        this._initialize();
        this._.interval -= getValue(interval);
        return this;

    };

    DateInterval.prototype.isNegative = function () {
        this._initialize();
        return this._.interval < 0;

    };

    DateInterval.prototype.getLength = function () {
        this._initialize();
        return this._.interval;

    };

    DateInterval.prototype.valueOf = function () {
        return this.getLength();

    };


    function formatAuto(interval, precision) {
        if (precision === true) {
            precision = intervalNames.length;

        } else if (!precision) {
            precision = 2;

        }

        var i, v, str = [], last, sign = '';

        if (interval < 0) {
            sign = '-';
            interval = -interval;

        }

        for (i = 0; i < intervalNames.length; i++) {
            if (interval >= intervalLengths[i]) {
                precision--;
                v = interval / intervalLengths[i];
                v = precision === 0 ? Math.round(v) : Math.floor(v);
                str.push(v + ' ' + intervalHelpers[i].toString(v));
                interval -= v * intervalLengths[i];

                if (precision === 0) {
                    break;

                }
            }
        }

        if (str.length > 2) {
            last = str.pop();
            return sign + str.join(separators[0]) + (separators[1] || separators[0]) + last;

        } else {
            return sign + str.join(separators[1] || separators[0]);

        }
    }

    function format(interval, pattern) {
        var sign = interval < 0 ? '-' : '+';
        interval = Math.abs(interval);

        return (pattern + '').replace(/%(.)/g, function (m, f) {
            var v, pad = false;

            switch (f) {
                case '%':
                    return '%';

                case 'y':
                    m = intervalLengths[0];
                    break;

                case 'w':
                    m = intervalLengths[1];
                    break;

                case 'm':
                    pad = true;
                case 'n':
                    m = intervalLengths[2];
                    break;

                case 'd':
                    pad = true;
                case 'j':
                    m = intervalLengths[3];
                    break;

                case 'H':
                    pad = true;
                case 'G':
                    m = intervalLengths[4];
                    break;

                case 'i':
                    pad = true;
                case 'I':
                    m = intervalLengths[5];
                    break;

                case 's':
                    pad = true;
                case 'S':
                    m = intervalLengths[6];
                    break;

                case '-':
                    return sign === '-' ? sign : '';

                case '+':
                    return sign;

                default:
                    throw new Error('Unknown format modifier: %' + f);

            }

            v = Math.floor(interval / m);
            interval -= m * v;
            return pad && v < 10 ? '0' + v : v;

        });
    }

    DateInterval.prototype.format = function (pattern) {
        this._initialize();

        if (typeof pattern === 'boolean' || typeof pattern === 'number' || !pattern) {
            return formatAuto(this._.interval, pattern);

        } else {
            return format(this._.interval, pattern);

        }
    };

    DateInterval.prototype._initialize = function () {
        if (this._.initialized) {
            return;
        }

        this._.initialized = true;

        if (typeof this._.interval === 'number') {
            return;

        }

        var interval = this._.interval;

        if (interval instanceof DateInterval) {
            this._.interval = interval.getLength();

        } else if (typeof interval === 'string') {
            if (interval.match(/^\s*(?:\+|-)?\s*\d+\s*$/)) {
                this._.interval = parseInt(interval.trim());

            } else {
                var res = 0,
                    sign = 1,
                    rest;

                rest = interval.replace(/\s*(\+|-)?\s*(\d+)\s+(\S+)\s*/g, function (m, s, n, k) {
                    if (s !== undefined) {
                        sign = s === '+' ? 1 : -1;

                    }

                    k = k.toLowerCase();
                    n = parseInt(n) * sign;
                    m = null;

                    for (var i = 0; i < intervalHelpers.length; i++) {
                        if (intervalHelpers[i].pattern.test(k)) {
                            m = intervalLengths[i];
                            break;
                        }
                    }

                    if (m === null) {
                        throw new Error('Unknown keyword: "' + k + '"');

                    }

                    res += n * m;

                    return '';

                });

                if (rest.length) {
                    throw new Error('Invalid interval specification "' + interval + '", didn\'t understand "' + rest + '"');

                }

                this._.interval = res;

            }
        } else {
            throw new Error('Invalid interval specification, expected string, number or a DateInterval instance');

        }
    };

    _context.register(DateInterval, 'DateInterval');

});

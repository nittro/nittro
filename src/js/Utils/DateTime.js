_context.invoke('Utils', function(Strings, Arrays, DateInterval, undefined) {

	var DateTime = function(d) {
		this._ = {
			initialized: false,
			date: d || new Date()
		};
	};

    DateTime.keywords = {
        weekdays: {
            abbrev: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        months: {
            abbrev: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            full: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        },
        relative: {
            now: 'now',
            today: 'today',
            tomorrow: 'tomorrow',
            yesterday: 'yesterday',
            noon: 'noon',
            midnight: 'midnight',
            at: 'at'
        }
    };

	DateTime.from = function(s) {
		return new DateTime(s);

	};

	DateTime.now = function () {
		return new DateTime();
	};

	DateTime.isDateObject = function(o) {
		return typeof o === 'object' && o && o.date !== undefined && o.timezone !== undefined && o.timezone_type !== undefined;

	};

	DateTime.isLeapYear = function(y) {
		return y % 4 === 0 && y % 100 !== 0 || y % 400 === 0;

	};

    DateTime.isModifyString = function (str) {
        var kw = DateTime.keywords.relative,
            re = new RegExp('(?:^(?:' + [kw.now, kw.yesterday, kw.tomorrow, kw.today].map(Strings.escapeRegex).join('|') + '))|' + Strings.escapeRegex(kw.noon) + '|' + Strings.escapeRegex(kw.midnight) + '|\\d?\\d(?::\\d\\d|\\s*(?:am|pm))(?:\\d\\d)?(?:\\s*(?:am|pm))?|(?:[-+]\\s*)?\\d+\\s+[^\\d\\s]', 'i');
        return re.test(str);
    };

	DateTime.getDaysInMonth = function(m, y) {
		return m === 2 ? (DateTime.isLeapYear(y) ? 29 : 28) : (m in {4:1,6:1,9:1,11:1} ? 30 : 31);

	};

	var ni = function() { throw new Error('Not implemented!'); },
		pad = function(n) {
			return (n < 10) ? '0' + n : n;
		};

	var formatTz = function (offset) {
		if ((typeof offset === 'string' || offset instanceof String) && offset.match(/(\+|-)\d\d:\d\d/)) {
			return offset;

		}

		if (typeof offset !== 'number') {
			offset = parseInt(offset);

		}

		return (offset < 0 ? '+' : '-') + pad(parseInt(Math.abs(offset) / 60)) + ':' + pad(Math.abs(offset) % 60)

	};

	DateTime.getLocalTzOffset = function () {
		return formatTz(new Date().getTimezoneOffset());

	};

	DateTime.formatModifiers = {
		d: function(d, u) { return pad(u ? d.getUTCDate() : d.getDate()); },
		D: function(d, u) { return DateTime.keywords.weekdays.abbrev[u ? d.getUTCDay() : d.getDay()]; },
		j: function(d, u) { return u ? d.getUTCDate() : d.getDate(); },
		l: function(d, u) { return DateTime.keywords.weekdays.full[u ? d.getUTCDay() : d.getDay()]; },
		N: function(d, u, n) { n = u ? d.getUTCDay() : d.getDay(); return n === 0 ? 7 : n; },
		S: function(d, u, n) { n = u ? d.getUTCDate() : d.getDate(); n %= 10; return n === 0 || n > 3 ? 'th' : ['st', 'nd', 'rd'][n - 1]; },
		w: function(d, u) { return u ? d.getUTCDay() : d.getDay(); },
		z: function(d, u, n, m, y, M) { n = u ? d.getUTCDate() : d.getDate(); n--; y = u ? d.getUTCFullYear() : d.getFullYear(); m = 0; M = u ? d.getUTCMonth() : d.getMonth(); while (m < M) n += DateTime.getDaysInMonth(m++, y); return n; },
		W: ni,
		F: function(d, u) { return DateTime.keywords.months.full[u ? d.getUTCMonth() : d.getMonth()]; },
		m: function(d, u) { return pad((u ? d.getUTCMonth() : d.getMonth()) + 1); },
		M: function(d, u) { return DateTime.keywords.months.abbrev[u ? d.getUTCMonth() : d.getMonth()]; },
		n: function(d, u) { return (u ? d.getUTCMonth() : d.getMonth()) + 1; },
		t: function(d, u) { return DateTime.getDaysInMonth(u ? d.getUTCMonth() : d.getMonth(), u ? d.getUTCFullYear() : d.getFullYear()); },
		L: function(d, u) { return DateTime.isLeapYear(u ? d.getUTCFullYear() : d.getFullYear()) ? 1 : 0; },
		o: ni,
		Y: function(d, u) { return u ? d.getUTCFullYear() : d.getFullYear(); },
		y: function(d, u) { return (u ? d.getUTCFullYear() : d.getFullYear()).toString().substr(-2); },
		a: function(d, u, h) { h = u ? d.getUTCHours() : d.getHours(); return h >= 0 && h < 12 ? 'am' : 'pm'; },
		A: function(d, u) { return DateTime.formatModifiers.a(d, u).toUpperCase(); },
		g: function(d, u, h) { h = u ? d.getUTCHours() : d.getHours(); return h === 0 ? 12 : (h > 12 ? h - 12 : h); },
		G: function(d, u) { return u ? d.getUTCHours() : d.getHours(); },
		h: function(d, u) { return pad(DateTime.formatModifiers.g(d, u)); },
		H: function(d, u) { return pad(u ? d.getUTCHours() : d.getHours()); },
		i: function(d, u) { return pad(u ? d.getUTCMinutes() : d.getMinutes()); },
		s: function(d, u) { return pad(u ? d.getUTCSeconds() : d.getSeconds()); },
		u: function(d, u) { return (u ? d.getUTCMilliseconds() : d.getMilliseconds()) * 1000; },
		e: ni,
		I: ni,
		O: function (d, u) { return DateTime.formatModifiers.P(d, u).replace(':', ''); },
		P: function (d, u) { return u ? '+00:00' : formatTz(d.getTimezoneOffset()); },
		T: ni,
		Z: function (d, u) { return u ? 0 : d.getTimezoneOffset() * -60; },
		c: function (d, u) { return DateTime.from(d).format('Y-m-d\\TH:i:sP', u); },
		r: function (d, u) { return DateTime.from(d).format('D, n M Y G:i:s O', u); },
		U: function(d) { return Math.round(d.getTime() / 1000); }
	};

	DateTime.prototype.format = function(f, utc) {
		this._initialize();

		var d = this._.date,
			pattern = Strings.escapeRegex(Arrays.getKeys(DateTime.formatModifiers).join(',')).replace(/,/g, '|'),
			re = new RegExp('(\\\\*)(' + pattern + ')', 'g');

		return f.replace(re, function(s, c, m) {
			if (c.length % 2) {
				return c.substr(1) + m;

			}

			return c + '' + (DateTime.formatModifiers[m](d, utc));

		});

	};

	[
        'getTime',
        'getDate', 'getDay', 'getMonth', 'getFullYear',
        'getHours', 'getMinutes', 'getSeconds', 'getMilliseconds', 'getTimezoneOffset',
        'getUTCDate', 'getUTCDay', 'getUTCMonth', 'getUTCFullYear',
        'getUTCHours', 'getUTCMinutes', 'getUTCSeconds', 'getUTCMilliseconds',
        'toDateString', 'toISOString', 'toJSON',
        'toLocaleDateString', 'toLocaleFormat', 'toLocaleTimeString',
        'toString', 'toTimeString', 'toUTCString'
    ].forEach(function (method) {
        DateTime.prototype[method] = function () {
            this._initialize();
            return this._.date[method].apply(this._.date, arguments);

        };
    });

    [
        'setTime',
        'setDate', 'setMonth', 'setFullYear',
        'setHours', 'setMinutes', 'setSeconds', 'setMilliseconds',
        'setUTCDate', 'setUTCMonth', 'setUTCFullYear',
        'setUTCHours', 'setUTCMinutes', 'setUTCSeconds', 'setUTCMilliseconds'
    ].forEach(function (method) {
        DateTime.prototype[method] = function () {
            this._initialize();
            this._.date[method].apply(this._.date, arguments);
            return this;

        };
    });

	DateTime.prototype.getTimestamp = function() {
		this._initialize();
		return Math.round(this._.date.getTime() / 1000);

	};

	DateTime.prototype.getDateObject = function () {
		this._initialize();
		return this._.date;

	};

	DateTime.prototype.valueOf = function () {
		return this.getTimestamp();

	};

	DateTime.prototype.modify = function(s) {
		this._initialize();
		var t = this._.date.getTime(), r,
            re, kw = DateTime.keywords.relative;

        if (s instanceof DateInterval) {
            this._.date = new Date(t + s.getLength());
            return this;

        }

		s = s.toLowerCase();

        re = new RegExp('^(' + [kw.yesterday, kw.tomorrow, kw.now, kw.today].map(Strings.escapeRegex).join('|') + ')\\s*(?:' + Strings.escapeRegex(kw.at) + '\\s*)?');

		if (r = s.match(re)) {
			s = s.substr(r[0].length);

			switch (r[1]) {
				case kw.now:
				case kw.today:
					t = Date.now();
					break;

				case kw.yesterday:
					t -= 86400000;
					break;

				case kw.tomorrow:
					t += 86400000;
					break;

			}
		}

        re = new RegExp('^(' + Strings.escapeRegex(kw.noon) + '|' + Strings.escapeRegex(kw.midnight) + '|\\d\\d?(?::\\d\\d|\\s*(?:am|pm))(?::\\d\\d)?(?:\\s*(?:am|pm))?)\\s*');

        if (r = s.match(re)) {
			s = s.substr(r[0].length);

			t = new Date(t);

			if (r[1] === kw.noon) {
				t.setHours(12, 0, 0, 0);

			} else if (r[1] === kw.midnight) {
				t.setHours(0, 0, 0, 0);

			} else {
				r = r[1].match(/^(\d\d?)(?::(\d\d))?(?::(\d\d))?(?:\s*(am|pm))?$/);
				r[1] = parseInt(r[1]);
				r[2] = r[2] ? parseInt(r[2]) : 0;
				r[3] = r[3] ? parseInt(r[3]) : 0;

				if (r[4]) {
					if (r[4] === 'am' && r[1] === 12) {
						r[1] = 0;

					} else if (r[4] === 'pm' && r[1] < 12) {
						r[1] += 12;

					}
				}

				t.setHours(r[1], r[2], r[3], 0);

			}

			t = t.getTime();

		}

        if (s.length && !s.match(/^\s+$/)) {
            t += DateInterval.from(s).getLength();

        }

		this._.date = new Date(t);
		return this;

	};

	DateTime.prototype.modifyClone = function(s) {
		return DateTime.from(this).modify(s);

	};

	DateTime.prototype._initialize = function() {
		if (this._.initialized) {
			return;

		}

		this._.initialized = true;

		if (typeof this._.date === 'string') {
			var m;

			if (m = this._.date.match(/^@(\d+)$/)) {
				this._.date = new Date(m[1] * 1000);

			} else if (m = this._.date.match(/^(\d\d\d\d-\d\d-\d\d)[ T](\d\d:\d\d(?::\d\d(?:\.\d+)?)?)([-+]\d\d:?\d\d)?$/)) {
				this._.date = new Date(m[1] + 'T' + m[2] + (m[3] || ''));

			} else if (DateTime.isModifyString(this._.date)) {
				var s = this._.date;
				this._.date = new Date();
				this.modify(s);

			} else {
				this._.date = new Date(this._.date);

			}
		} else if (typeof this._.date === 'number') {
			this._.date = new Date(this._.date);

		} else if (DateTime.isDateObject(this._.date)) {
			var s = this._.date.date;

			if (this._.date.timezone_type !== 3 || this._.date.timezone === 'UTC') {
				s += ' ' + this._.date.timezone;

			}

			this._.date = new Date(s);

		} else if (this._.date instanceof DateTime) {
			this._.date = new Date(this._.date.getTime());

		}
	};

    _context.register(DateTime, 'DateTime');

});

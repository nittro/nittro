describe('Utils.DateTime', function () {

    var DateTime;

    beforeAll(function () {
        DateTime = _context.lookup('Utils.DateTime')
    });

    describe('isLeapYear()', function () {
        it('should return true if a given year is a leap year', function () {
            expect(DateTime.isLeapYear(2000)).toBe(true);
            expect(DateTime.isLeapYear(2004)).toBe(true);
            expect(DateTime.isLeapYear(2001)).toBe(false);
            expect(DateTime.isLeapYear(2100)).toBe(false);

        });
    });

    describe('getDaysInMonth()', function () {
        it('should return the number of days in a given month of a given year', function () {
            expect(DateTime.getDaysInMonth(1, 2015)).toBe(31);
            expect(DateTime.getDaysInMonth(2, 2015)).toBe(28);
            expect(DateTime.getDaysInMonth(4, 2015)).toBe(30);
            expect(DateTime.getDaysInMonth(2, 2016)).toBe(29);
        });
    });

    describe('getTime()', function () {
        it('should return the current UNIX timestamp in milliseconds', function () {
            var testDate = new DateTime(new Date(1454663100000));
            expect(testDate.getTime()).toBe(1454663100000);
        });
    });

    describe('getTimestamp()', function () {
        it('should return the current UNIX timestamp in seconds', function () {
            var testDate = new DateTime(new Date(1454663100000));
            expect(testDate.getTimestamp()).toBe(1454663100);
        });
    });

    describe('format()', function () {
        it('should return the date in the specified format', function () {
            var testDate = new DateTime(new Date('February 5, 2016 10:05:00'));
            expect(testDate.format('Y-m-d H:i:s')).toBe('2016-02-05 10:05:00');
            expect(testDate.format('D, j. n. G:i:s')).toBe('Fri, 5. 2. 10:05:00');
            expect(testDate.format('l, F jS')).toBe('Friday, February 5th');

        });

        it('should return the date in the specified format in UTC if the second argument is true', function () {
            var testDate = new DateTime(new Date(1454663100000));
            expect(testDate.format('Y-m-d H:i:s', true)).toBe('2016-02-05 09:05:00');

        });
    });

    describe('getDateObject()', function () {
        it('should return the internal Date object', function () {
            var date = new Date(1454663100000),
                testDate = new DateTime(date);
            expect(testDate.getDateObject()).toBe(date);
        });
    });

    describe('valueOf()', function () {
        it('should return the same thing as getTimestamp()', function () {
            var testDate = new DateTime(new Date(1454663100000));
            expect(testDate.valueOf()).toBe(testDate.getTimestamp());
            expect(testDate * 1).toBe(testDate.getTimestamp());
        });
    });

    describe('modify()', function () {
        it('should accept basic English time descriptors', function () {
            var testDate = new DateTime(new Date(1454663100000)),
                now;

            testDate.modify('yesterday');
            expect(testDate.getTimestamp()).toBe(1454576700);

            testDate.modify('now');
            now = Math.round(Date.now() / 1000);
            expect(testDate.getTimestamp()).toBe(now);

            testDate = new DateTime(new Date(1454663100000));
            testDate.modify('tomorrow');
            expect(testDate.getTimestamp()).toBe(1454749500);

            testDate.modify('today at noon');
            now = new Date();
            now.setHours(12, 0, 0, 0);
            expect(testDate.getTime()).toBe(now.getTime());

            now = new Date();
            testDate = new DateTime(now);
            testDate.modify('tomorrow 15:00');

            now.setDate(now.getDate() + 1);
            now.setHours(15, 0, 0, 0);
            expect(testDate.getTime()).toBe(now.getTime());

        });

        it('should accept relative offsets', function () {
            var testDate = new DateTime(new Date(1454663100000));
            testDate.modify('+1 day');
            expect(testDate.getTimestamp()).toBe(1454749500);

            testDate.modify('+3 hours');
            expect(testDate.getTimestamp()).toBe(1454760300);
        });
    });

    describe('from()', function () {
        it('should create a new DateTime object set to the specified date', function () {
            var testDate = DateTime.from(1454760300000);
            expect(testDate.getDateObject().getTime()).toBe(1454760300000);
        });
    });

    describe('modifyClone()', function () {
        it('should return a clone modified by the argument', function () {
            var testDate = DateTime.from(1454760300000);
            expect(testDate.modifyClone('+3 hours').getTime()).toBe(1454771100000);
        });
    });

    describe('now()', function () {
        it('should return a new DateTime object with the current timestamp', function () {
            var now = Math.round(Date.now() / 1000),
                testDate = DateTime.now();
            expect(testDate.getTimestamp()).toBe(now);
        });
    });

});

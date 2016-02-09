describe('Utils.DateInterval', function () {

    var DateInterval,
        testInterval;

    beforeAll(function () {
        DateInterval = _context.lookup('Utils.DateInterval');

    });

    describe('constructor', function () {
        it('should accept a string', function () {
            testInterval = new DateInterval('1 hour 12 seconds');
            expect(testInterval.getLength()).toBe(3612000);
        });
    });

    describe('from()', function () {
        it('should create a new DateInterval instance', function () {
            testInterval = DateInterval.from(3600000);
            expect(testInterval instanceof DateInterval).toBe(true);
        });
    });

    describe('getLength()', function () {
        it('should return the length of the interval in milliseconds', function () {
            testInterval = new DateInterval(3600000);
            expect(testInterval.getLength()).toBe(3600000);
        });
    });

    describe('isNegative()', function () {
        it('should return true if the interval is negative', function () {
            testInterval = new DateInterval('4 hours');
            expect(testInterval.isNegative()).toBe(false);
            testInterval = new DateInterval('-4 hours');
            expect(testInterval.isNegative()).toBe(true);
        });
    });

    describe('add()', function () {
        it('should add the specified value to the interval', function () {
            testInterval = new DateInterval('1 hour');
            testInterval.add(12000);
            expect(testInterval.getLength()).toBe(3612000);
        });

        it('should accept a string or another DateInterval instance as well', function () {
            testInterval = new DateInterval('1 hour');
            testInterval.add('12 seconds');
            expect(testInterval.getLength()).toBe(3612000);
            testInterval = new DateInterval('1 hour');
            testInterval.add(new DateInterval('12 seconds'));
            expect(testInterval.getLength()).toBe(3612000);
        });
    });

    describe('subtract()', function () {
        it('should subtract the specified value from the interval', function () {
            testInterval = new DateInterval('1 hour');
            testInterval.subtract(12000);
            expect(testInterval.getLength()).toBe(3588000);
        });

        it('should accept a string or another DateInterval instance as well', function () {
            testInterval = new DateInterval('1 hour');
            testInterval.subtract('12 seconds');
            expect(testInterval.getLength()).toBe(3588000);
            testInterval = new DateInterval('1 hour');
            testInterval.subtract(new DateInterval('12 seconds'));
            expect(testInterval.getLength()).toBe(3588000);
        });
    });

    describe('valueOf()', function () {
        it('should return the same value as getLenght()', function () {
            testInterval = new DateInterval('1 hour');
            expect(testInterval * 1).toBe(testInterval.getLength());
        });
    });

    describe('format()', function () {
        it('should format the interval as a string', function () {
            testInterval = new DateInterval('2 days 21 hours 39 minutes 1 second');
            expect(testInterval.format()).toBe('2 days and 22 hours');
            expect(testInterval.format(true)).toBe('2 days, 21 hours, 39 minutes and 1 second');
            expect(testInterval.format(false)).toBe('2 days and 22 hours');
            expect(testInterval.format(3)).toBe('2 days, 21 hours and 39 minutes');
            expect(testInterval.format('%G hours and %I minutes')).toBe('69 hours and 39 minutes');
        });
    });

});

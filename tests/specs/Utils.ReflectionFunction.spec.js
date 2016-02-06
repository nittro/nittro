describe('Utils.ReflectionFunction', function () {

    var ReflectionFunction, testReflection, testFunction;

    beforeAll(function () {
        ReflectionFunction = _context.lookup('Utils.ReflectionFunction');

        testFunction = function(a, b, c) {
            return Math.pow(a, b) / c;
        };
    });

    describe('from()', function () {
        it('should create a new ReflectionFunction instance', function () {
            testReflection = ReflectionFunction.from(testFunction);
            expect(testReflection instanceof ReflectionFunction).toBe(true);
        });

        it('should return the same object if existing reflection is passed', function () {
            var notADolly = ReflectionFunction.from(testReflection);
            expect(notADolly).toBe(testReflection);
        });
    });

    describe('getArgs()', function () {
        it('should return the reflected function\'s argument list', function () {
            expect(testReflection.getArgs()).toEqual(['a', 'b', 'c']);
        });
    });

    describe('invoke()', function () {
        it('should call the reflected function with the specified context and arguments', function () {
            expect(testReflection.invoke(null, 2, 3, 4)).toBe(2);
        });
    });

    describe('invokeArgs()', function () {
        it('should call the reflected function with the specified context and named arguments', function () {
            expect(testReflection.invokeArgs(null, {c: 4, b: 3, a: 2})).toBe(2);
        });
    });

});

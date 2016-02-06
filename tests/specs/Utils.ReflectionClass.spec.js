describe('Utils.ReflectionClass', function () {

    var ReflectionClass, TestClass, testReflection;

    beforeAll(function () {
        ReflectionClass = _context.lookup('Utils.ReflectionClass');

        TestClass = _context.extend(function(a, b, c) {
            this._ = [].slice.call(arguments);
        }, {
            getA: function () { return this._[0]; },
            getB: function () { return this._[1]; },
            getC: function () { return this._[2]; },
            foo: true
        });

        _context.register(TestClass, '__Test.TestClass');

    });

    describe('from()', function () {
        it('should create a new ReflectionClass instance', function () {
            testReflection = ReflectionClass.from(TestClass);
            expect(testReflection instanceof ReflectionClass).toBe(true);
        });

        it('should return the same object if existing reflection is passed', function () {
            var notADolly = ReflectionClass.from(testReflection);
            expect(notADolly).toBe(testReflection);
        });
    });

    describe('getClass()', function () {
        it('should return the specified class\'s constructor', function () {
            var testClassLetsHope = ReflectionClass.getClass('__Test.TestClass');
            expect(testClassLetsHope).toBe(TestClass);
        });
    });

    describe('getClassName()', function () {
        it('should return the fully qualified name of the provided constructor', function () {
            expect(ReflectionClass.getClassName(TestClass)).toBe('__Test.TestClass');
        });
    });

    describe('hasProperty()', function () {
        it('should return true if the specified property exist in the reflected class\'s prototype and isn\'t a function', function () {
            expect(testReflection.hasProperty('foo')).toBe(true);
            expect(testReflection.hasProperty('bar')).toBe(false);
            expect(testReflection.hasProperty('getA')).toBe(false);
        });
    });

    describe('hasMethod()', function () {
        it('should return true if the specified property exist in the reflected class\'s prototype and is a function', function () {
            expect(testReflection.hasMethod('foo')).toBe(false);
            expect(testReflection.hasMethod('getA')).toBe(true);
        });
    });

    describe('newInstance()', function () {
        it('should create a new instance with the specified arguments', function () {
            var testInstance = testReflection.newInstance('valueA', 'valueB', 'valueC');
            expect(testInstance instanceof TestClass).toBe(true);
            expect(testInstance.getA()).toBe('valueA');
            expect(testInstance.getB()).toBe('valueB');
            expect(testInstance.getC()).toBe('valueC');
        });
    });

    describe('newInstanceArgs()', function () {
        it('should create a new instance with the specified arguments array', function () {
            var testInstance = testReflection.newInstanceArgs(['valueA', 'valueB', 'valueC']);
            expect(testInstance instanceof TestClass).toBe(true);
            expect(testInstance.getA()).toBe('valueA');
            expect(testInstance.getB()).toBe('valueB');
            expect(testInstance.getC()).toBe('valueC');
        });
    });
});

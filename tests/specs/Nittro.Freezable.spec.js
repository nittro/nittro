describe('Nittro.Freezable', function () {

    var Freezable,
        TestClass,
        testInstance;

    beforeAll(function () {
        Freezable = _context.lookup('Nittro.Freezable');

        TestClass = function () {
            this._ = { prop1: null, prop2: null };
        };

        TestClass.prototype.getProp1 = function () {
            return this._.prop1;
        };

        TestClass.prototype.setProp1 = function(value) {
            this._updating('prop1');
            this._.prop1 = value;
            return this;
        };

        TestClass.prototype.getProp2 = function () {
            return this._.prop2;
        };

        TestClass.prototype.setProp2 = function(value) {
            this._updating('prop2');
            this._.prop2 = value;
            return this;
        };

        _context.mixin(TestClass, Freezable);

        testInstance = new TestClass();

    });

    describe('freeze()', function () {
        it('should prevent further modifications to the object', function () {
            expect(testInstance.isFrozen()).toBe(false);

            testInstance.setProp1('foo');
            testInstance.setProp2('bar');

            expect(testInstance.getProp1()).toBe('foo');
            expect(testInstance.getProp2()).toBe('bar');

            testInstance.freeze();

            expect(testInstance.isFrozen()).toBe(true);
            expect(function() { testInstance.setProp1('baz'); }).toThrow(new Error('Cannot update property "prop1" of a frozen object'));
            expect(function() { testInstance.setProp2('baz'); }).toThrow(new Error('Cannot update property "prop2" of a frozen object'));

        });
    });

});

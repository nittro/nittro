describe('_context', function() {

    var Person, joe;

    beforeAll(function () {
        Person = _context.extend(function(name) {
            this._name = name;

        }, {
            getName: function () {
                return this._name;
            }
        });

        _context.register(Person, '__Test._context.Person');
        joe = new Person('Joe');

    });

    describe('extend()', function() {
        it('should create a class and extend its prototype', function () {
            expect(Person).toEqual(jasmine.any(Function));
            expect(Person.prototype.getName).toEqual(jasmine.any(Function));

        });
    });

    describe('lookup()', function() {
        it('should retrieve an object from the internal registry', function () {
            expect(_context.lookup('__Test._context.Person')).toBe(Person);
        });
    });

    describe('lookupClass()', function () {
        it('should return the internal class name for an object', function () {
            expect(_context.lookupClass(Person)).toBe('__Test._context.Person');
            expect(_context.lookupClass(joe)).toBe('__Test._context.Person');
        });
    });

    describe('invoke()', function () {
        it('should invoke the callback within the specified namespace', function () {
            _context.invoke('__Test._context', function () {
                expect(this.Person).toBe(Person);
            });
        });

        it('should import classes from the current namespace', function () {
            var _Person = Person;

            _context.invoke('__Test._context', function(Person) {
                expect(Person).toBe(_Person);
            });
        });

        it('should import classes defined in the "imports" argument', function () {
            var _Person = Person;

            _context.invoke(function(Person) {
                expect(Person).toBe(_Person);
            }, {
                Person: '__Test._context.Person'
            });
        });
    });

    describe('mixin()', function () {
        var Sentient = {
            inventPhilosophicalShit: function () {
                return 42;
            }
        };

        it('should extend existing classes with new functionality', function () {
            _context.mixin(Person, Sentient);
            expect(joe.inventPhilosophicalShit()).toBe(42);
        });
    });

});

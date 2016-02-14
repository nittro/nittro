describe('Nittro.DI.Context', function () {

    var Context,
        Container,
        TestClass,
        testInstance;

    beforeAll(function () {
        Context = _context.lookup('Nittro.DI.Context');
        Container = _context.lookup('Nittro.DI.Container');

        TestClass = function(baz) {
            this.foo = 'bar';
            this.baz = baz || null;
        };

        _context.register(TestClass, '__Test.Nittro.DI.Context.TestClass');

        testInstance = new Context({
            params: {
                param1: 'value1',
                param2: {
                    subparam1: 'subvalue1',
                    subparam2: 'subvalue2',
                    subparam3: [
                        'a', 'b', 'c'
                    ]
                }
            },
            services: {
                testService: '__Test.Nittro.DI.Context.TestClass(%param2.subparam1%)'
            },
            factories: {
                testFactory1: '__Test.Nittro.DI.Context.TestClass("splat")',
                testFactory2: { callback: function(baz) { return new TestClass(baz); }, params: ['ooomph']}
            }
        });
    });

    it('should implement the Nittro.DI.Container mixin', function () {
        for (var method in Container) {
            if (Container.hasOwnProperty(method) && typeof Container[method] === 'function') {
                expect(Context.prototype[method]).toEqual(jasmine.any(Function));

            }
        }
    });

    it('should extend service creation, allowing parameter extrapolation', function () {
        var service = testInstance.getService('testService');
        expect(service.baz).toBe('subvalue1');
    });

    describe('hasParam()', function () {
        it('should return true if the specified parameter exists', function () {
            expect(testInstance.hasParam('param1')).toBe(true);
            expect(testInstance.hasParam('param2.subparam2')).toBe(true);
            expect(testInstance.hasParam('nonexistentParam')).toBe(false);
        });
    });

    describe('getParam()', function () {
        it('should return the specified parameter or the default value if the parameter doesn\'t exist', function () {
            expect(testInstance.getParam('param1')).toBe('value1');
            expect(testInstance.getParam('param2.subparam3')).toEqual(['a', 'b', 'c']);
            expect(testInstance.getParam('param2.subparam3.1')).toBe('b');
            expect(testInstance.getParam('nonexistentParam')).toBe(null);
            expect(testInstance.getParam('nonexistentParam', 34)).toBe(34);
        });
    });

    describe('setParam()', function () {
        it('should set the specified parameter to the specified value', function () {
            testInstance.setParam('param1', 'foo');
            expect(testInstance.getParam('param1')).toBe('foo');
            testInstance.setParam('param3', 42);
            expect(testInstance.getParam('param3')).toBe(42);
            testInstance.setParam('param2.subparam3.3', 'seventyseven');
            expect(testInstance.getParam('param2.subparam3')).toEqual(['a', 'b', 'c', 'seventyseven']);
        });
    });


    describe('hasFactory()', function () {
        it('should return true if the instance has the specified factory', function () {
            expect(testInstance.hasFactory('testFactory1')).toBe(true);
            expect(testInstance.hasFactory('nonexistentFactory')).toBe(false);
        });
    });

    describe('addFactory()', function () {
        it('should add the specified factory to the instance', function () {
            testInstance.addFactory('testFactory3', '__Test.Nittro.DI.Context.TestClass(baz: "splurt")');
            testInstance.addFactory('testFactory4', function(baz) { return new TestClass(baz); }, { baz: 'slurp' });
            expect(testInstance.hasFactory('testFactory3')).toBe(true);
            expect(testInstance.hasFactory('testFactory4')).toBe(true);
        });
    });

    describe('create()', function () {
        it('should create a new instance using the specified factory', function () {
            var created;

            created = testInstance.create('testFactory1');
            expect(created.baz).toBe('splat');

            created = testInstance.create('testFactory2');
            expect(created.baz).toBe('ooomph');

            created = testInstance.create('testFactory3');
            expect(created.baz).toBe('splurt');

            created = testInstance.create('testFactory4');
            expect(created.baz).toBe('slurp');

            created = testInstance.create('testFactory4', ['vrooom']);
            expect(created.baz).toBe('vrooom');
        });
    });

});

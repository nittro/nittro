describe('Nette.DI.Container', function () {

    var Container,
        TestClass,
        testInstance,
        TestService;

    beforeAll(function () {
        Container = _context.lookup('Nette.DI.Container');

        TestClass = function () { };
        _context.mixin(TestClass, Container);

        TestService = function (baz) {
            this.foo = 'bar';
            this.baz = baz || null;
        };

        TestService.prototype.getFoo = function() {
            return this.foo;
        };

        TestService.prototype.setFoo = function (foo) {
            this.foo = foo;
            return this;
        };

        _context.register(TestService, '__Test.Nette.DI.Container.TestService');

    });

    beforeEach(function () {
        testInstance = new TestClass();
    });

    afterEach(function () {
        testInstance = null;
    });

    describe('hasService()', function () {
        it('should return true if the container has the specified service', function () {
            expect(testInstance.hasService('testService')).toBe(false);
        });
    });

    describe('addService()', function () {
        it('should add a service to the container', function () {
            testInstance.addService('testService', new TestService());
            expect(testInstance.hasService('testService')).toBe(true);
        });

        it('should fail if the container already has a service of the same name', function () {
            testInstance.addService('testService', new TestService());
            expect(function() { testInstance.addService('testService', new TestService()); }).toThrow(new Error('Container already has a service named "testService"'));
        });
    });

    describe('getService()', function () {
        it('should return the specified service', function () {
            var testService = new TestService();
            testInstance.addService('testService', testService);
            expect(testInstance.getService('testService')).toBe(testService);
        });
    });

    describe('addServiceDefinition()', function () {
        it('should add a service definition to the container', function () {
            testInstance.addServiceDefinition('testService1', {
                factory: function() { return new TestService(); },
                setup: [
                    '::setFoo("bak")'
                ]
            });

            expect(testInstance.hasService('testService1')).toBe(true);
            expect(testInstance.isServiceCreated('testService1')).toBe(false);

            var testService = testInstance.getService('testService1');
            expect(testService instanceof TestService).toBe(true);
            expect(testService.getFoo()).toBe('bak');
        });

        it('should accept a string as a service definition', function () {
            testInstance.addServiceDefinition('testService2', '__Test.Nette.DI.Container.TestService("splat")');

            expect(testInstance.hasService('testService2')).toBe(true);
            expect(testInstance.isServiceCreated('testService2')).toBe(false);

            var testService = testInstance.getService('testService2');
            expect(testService instanceof TestService).toBe(true);
            expect(testService.baz).toBe('splat');
        });
    });

    describe('runServices()', function () {
        it('should create any services which have the "run" flag set to true and haven\'t been created yet', function () {
            testInstance.addServiceDefinition('testService1', { factory: '__Test.Nette.DI.Container.TestService("splat")', run: true });
            testInstance.addServiceDefinition('testService2', '__Test.Nette.DI.Container.TestService("blurp")!');
            testInstance.addServiceDefinition('testService3', { factory: '__Test.Nette.DI.Container.TestService("non-splat")' });
            testInstance.addServiceDefinition('testService4', '__Test.Nette.DI.Container.TestService("unblurp")');

            testInstance.runServices();

            expect(testInstance.isServiceCreated('testService1')).toBe(true);
            expect(testInstance.isServiceCreated('testService2')).toBe(true);
            expect(testInstance.isServiceCreated('testService3')).toBe(false);
            expect(testInstance.isServiceCreated('testService4')).toBe(false);

        });
    });

});

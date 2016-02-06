describe('Nette.EventEmitter', function () {

    var NetteEventEmitter,
        NetteEvent,
        TestObject,
        testInstance,
        listeners;

    beforeAll(function () {
        NetteEventEmitter = _context.lookup('Nette.EventEmitter');
        NetteEvent = _context.lookup('Nette.Event');

        TestObject = function() {};
        _context.mixin(TestObject, NetteEventEmitter);
        testInstance = new TestObject();

        listeners = {
            all: function() {},
            one: function() {},
            first: function() {},
            prevent: function(evt) { evt.preventDefault() },
            def: function() {},
            ns: function() {},
            data: function(evt) {}
        };

        spyOn(listeners, 'all');
        spyOn(listeners, 'one');
        spyOn(listeners, 'first');
        spyOn(listeners, 'prevent').and.callThrough();
        spyOn(listeners, 'def');
        spyOn(listeners, 'ns');
        spyOn(listeners, 'data');

    });

    describe('mixin', function () {
        it('should define the on(), one(), first(), off() and trigger() methods', function () {
            expect(NetteEventEmitter).toEqual({
                on: jasmine.any(Function),
                one: jasmine.any(Function),
                first: jasmine.any(Function),
                off: jasmine.any(Function),
                trigger: jasmine.any(Function)
            });
        });
    });



    describe('on()', function () {
        it('should bind an event listener and return this', function () {
            expect(testInstance.on('event1 event2', listeners.all)).toBe(testInstance);
            expect(testInstance.on('event2.testns', listeners.ns)).toBe(testInstance);
        });

        it('should support binding a default listener', function () {
            expect(testInstance.on('event1:default', listeners.def)).toBe(testInstance);
        });
    });


    describe('one()', function () {
        it('should bind a listener for the first occurrence of each of the specified events', function () {
            expect(testInstance.one('event1 event2', listeners.one)).toBe(testInstance);
        });
    });


    describe('first()', function () {
        it('should bind a listener to the first occurrence of any of the specified event', function () {
            expect(testInstance.first('event1 event2', listeners.first)).toBe(testInstance);
        });
    });


    describe('trigger()', function () {
        it('should trigger the specified event', function () {
            testInstance.trigger('event1');
            testInstance.trigger('event1');
            testInstance.trigger('event2');
            expect(listeners.all).toHaveBeenCalledTimes(3);
            expect(listeners.one).toHaveBeenCalledTimes(2);
            expect(listeners.first).toHaveBeenCalledTimes(1);
            expect(listeners.def).toHaveBeenCalledTimes(2);
            expect(listeners.ns).toHaveBeenCalledTimes(1);
        });

        it('shouldn\'t invoke the default handler if evt.preventDefault() has been called', function () {
            testInstance.on('event1', listeners.prevent);
            testInstance.trigger('event1');
            expect(listeners.all).toHaveBeenCalledTimes(4);
            expect(listeners.prevent).toHaveBeenCalledTimes(1);
            expect(listeners.def).toHaveBeenCalledTimes(2);
        });

        it('should pass data to the event handlers', function () {
            testInstance.on('event3', listeners.data);

            var data = { foo: 1, bar: 2, baz: 3 };
            testInstance.trigger('event3', data);

            expect(listeners.data.calls.mostRecent()).toEqual({ object: testInstance, args: [ new NetteEvent('event3', data) ], returnValue: undefined });

        });
    });

    describe('off()', function () {
        it('should remove the specified listeners', function () {
            testInstance.off(null, listeners.all);
            testInstance.trigger('event1');
            expect(listeners.all).toHaveBeenCalledTimes(4);

            testInstance.off('.testns');
            testInstance.trigger('event2');
            expect(listeners.ns).toHaveBeenCalledTimes(1);
        });
    });

});

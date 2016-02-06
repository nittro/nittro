describe('Nette.Object', function () {

    var NetteObject = _context.lookup('Nette.Object');

    it('should implement the EventEmitter mixin', function () {
        expect(NetteObject.prototype).toEqual({
            constructor: NetteObject,
            on: jasmine.any(Function),
            one: jasmine.any(Function),
            first: jasmine.any(Function),
            off: jasmine.any(Function),
            trigger: jasmine.any(Function)
        });
    });

});

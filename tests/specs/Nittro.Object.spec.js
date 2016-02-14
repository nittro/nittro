describe('Nittro.Object', function () {

    var NittroObject = _context.lookup('Nittro.Object');

    it('should implement the EventEmitter mixin', function () {
        expect(NittroObject.prototype).toEqual({
            constructor: NittroObject,
            on: jasmine.any(Function),
            one: jasmine.any(Function),
            first: jasmine.any(Function),
            off: jasmine.any(Function),
            trigger: jasmine.any(Function)
        });
    });

});

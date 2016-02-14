describe('Nittro.Neon.Neon', function () {

    var Neon,
        testData,
        expectedData;

    beforeAll(function () {
        Neon = _context.lookup('Nittro.Neon.Neon');

    });

    describe('decode()', function () {
        it('should decode blocks of NEON data', function () {
            testData = "\na: {1, 2, }\nb: 1";
            expectedData = {a:[1, 2], b: 1};
            expect(Neon.decode(testData).exportData()).toEqual(expectedData);

            testData = "a: 1\nb: 2";
            expectedData = {a: 1, b: 2};
            expect(Neon.decode(testData).exportData()).toEqual(expectedData);

            testData = "\na: x\n- x";
            expectedData = {a: 'x', 0: 'x'};
            expect(Neon.decode(testData).exportData()).toEqual(expectedData);

            testData = "\n- x\na: x";
            expectedData = {0: 'x', a: 'x'};
            expect(Neon.decode(testData).exportData()).toEqual(expectedData);

            testData = "a:\n\t- 1\n\t-\n\t\t- 2\nb:\n\t- 3\nc: null\n- 4";
            expectedData = {a: [1, [2]], b: [3], c: null, 0: 4};
            expect(Neon.decode(testData).exportData()).toEqual(expectedData);
        });
    });

});

describe('Utils.HashMap', function () {

    var HashMap = _context.lookup('Utils.HashMap'),
        hashMap;

    describe('constructor', function () {
        it('should create a new HashMap instance', function () {
            hashMap = new HashMap();
            expect(hashMap instanceof HashMap).toBe(true);
        });
    });

    describe('set()', function () {
        it('should set a new item in the HashMap', function () {
            expect(hashMap.length).toBe(0);
            hashMap.set('item', 42);
            expect(hashMap.length).toBe(1);
        });

        it('should override previous value of the same key', function () {
            hashMap.set('item', 43);
            expect(hashMap.length).toBe(1);
        });
    });

    describe('get()', function () {
        it('should return an existing value from the HashMap', function () {
            expect(hashMap.get('item')).toBe(43);
        });

        it('should throw an error when the key doesn\'t exist and "need" is true', function () {
            expect(function() { hashMap.get('nonexistent', true); }).toThrow(new RangeError('Key nonexistent not present in HashMap'));
        });

        it('should NOT throw an error when the key doesn\'t exist and "need" is NOT true', function () {
            expect(function() { hashMap.get('nonexistent'); }).not.toThrow();
            expect(hashMap.get('nonexistent')).toBe(null);
        });
    });

    describe('has()', function () {
        it('should return true if the specified key exists in the HashMap', function () {
            expect(hashMap.has('item')).toBe(true);
        });
        it('should return false if the specified key doesn\'t exist in the HashMap', function () {
            expect(hashMap.has('nonexistent')).toBe(false);
        });
    });

    describe('push()', function () {
        it('should add an item at the end of the HashMap', function () {
            hashMap.push('value');
            expect(hashMap.length).toBe(2);
        });

        it('should support adding multiple items', function () {
            hashMap.push('value2', 'value3', 'value4');
            expect(hashMap.length).toBe(5);
        });

        it('should add incremental keys', function () {
            expect(hashMap._.keys).toEqual(['item', 0, 1, 2, 3]);
        });
    });

    describe('shift()', function () {
        it('should remove the first item from the HashMap', function () {
            var item = hashMap.shift();
            expect(item).toBe(43);
            expect(hashMap.length).toBe(4);
        });

        it('should shift numeric keys', function () {
            hashMap.shift();
            expect(hashMap._.keys).toEqual([0, 1, 2]);
        });
    });

    describe('pop()', function () {
        it('should remove the last item from the HashMap', function () {
            var item = hashMap.pop();
            expect(item).toBe('value4');
            expect(hashMap.length).toBe(2);
        });

        it('should update the internal next numeric key value', function () {
            expect(hashMap._.nextNumeric).toBe(2);
        });
    });

    describe('unshift()', function () {
        it('should insert a new item at the start of the HashMap', function () {
            hashMap.unshift('value5');
            expect(hashMap.length).toBe(3);
        });

        it('should work with multiple items', function () {
            hashMap.unshift('value6', 'value7', 'value8');
            expect(hashMap.length).toBe(6);
        });

        it('should shift existing keys accordingly', function () {
            expect(hashMap._.keys).toEqual([0, 1, 2, 3, 4, 5]);
        });
    });

});

describe('Utils.HashMap', function () {

    var HashMap = _context.lookup('Utils.HashMap'),
        testMap, babyMap, items;

    describe('constructor', function () {
        it('should create a new HashMap instance', function () {
            testMap = new HashMap();
            expect(testMap instanceof HashMap).toBe(true);
        });
    });

    describe('set()', function () {
        it('should set a new item in the HashMap', function () {
            expect(testMap.length).toBe(0);
            testMap.set('item', 42);
            expect(testMap.length).toBe(1);
        });

        it('should override previous value of the same key', function () {
            testMap.set('item', 43);
            expect(testMap.length).toBe(1);
        });
    });

    describe('get()', function () {
        it('should return an existing value from the HashMap', function () {
            expect(testMap.get('item')).toBe(43);
        });

        it('should throw an error when the key doesn\'t exist and "need" is true', function () {
            expect(function() { testMap.get('nonexistent', true); }).toThrow(new RangeError('Key nonexistent not present in HashMap'));
        });

        it('should NOT throw an error when the key doesn\'t exist and "need" is NOT true', function () {
            expect(function() { testMap.get('nonexistent'); }).not.toThrow();
            expect(testMap.get('nonexistent')).toBe(null);
        });
    });

    describe('has()', function () {
        it('should return true if the specified key exists in the HashMap', function () {
            expect(testMap.has('item')).toBe(true);
        });
        it('should return false if the specified key doesn\'t exist in the HashMap', function () {
            expect(testMap.has('nonexistent')).toBe(false);
        });
    });

    describe('push()', function () {
        it('should add an item at the end of the HashMap', function () {
            testMap.push('value');
            expect(testMap.length).toBe(2);
        });

        it('should support adding multiple items', function () {
            testMap.push('value2', 'value3', 'value4');
            expect(testMap.length).toBe(5);
        });

        it('should add incremental keys', function () {
            expect(testMap._.keys).toEqual(['item', 0, 1, 2, 3]);
        });
    });

    describe('shift()', function () {
        it('should remove the first item from the HashMap', function () {
            var item = testMap.shift();
            expect(item).toBe(43);
            expect(testMap.length).toBe(4);
        });

        it('should shift numeric keys', function () {
            testMap.shift();
            expect(testMap._.keys).toEqual([0, 1, 2]);
        });
    });

    describe('pop()', function () {
        it('should remove the last item from the HashMap', function () {
            var item = testMap.pop();
            expect(item).toBe('value4');
            expect(testMap.length).toBe(2);
        });

        it('should update the internal next numeric key value', function () {
            expect(testMap._.nextNumeric).toBe(2);
        });
    });

    describe('unshift()', function () {
        it('should insert a new item at the start of the HashMap', function () {
            testMap.unshift('value5');
            expect(testMap.length).toBe(3);
        });

        it('should work with multiple items', function () {
            testMap.unshift('value6', 'value7', 'value8');
            expect(testMap.length).toBe(6);
        });

        it('should shift existing keys accordingly', function () {
            expect(testMap._.keys).toEqual([0, 1, 2, 3, 4, 5]);
        });
    });

    describe('isList()', function () {
        it('should return true if all keys in the HashMap are numeric', function () {
            expect(testMap.isList()).toBe(true);
        });
        it('should return false if any key in the HashMap is non-numeric', function () {
            testMap.set('item', 42);
            expect(testMap.isList()).toBe(false);
        });
    });

    describe('merge()', function () {
        it('should merge the passed data into the HashMap', function () {
            testMap.merge({ item2: 3.14, item3: 2.8 });
            expect(testMap.length).toBe(9);
        });

        it('should override existing keys', function () {
            testMap.merge({ item2: 'foo', item3: 'bar' });
            expect(testMap.length).toBe(9);
            expect(testMap.get('item3')).toBe('bar');
        });
    });

    describe('append()', function () {
        it('should append the passed data at the end of the HashMap', function () {
            testMap.append([1, 2, 3]);
            expect(testMap.length).toBe(12);
        });

        it('should override existing non-numeric keys', function () {
            testMap.append({item3: 'baz', item4: 'wookie'});
            expect(testMap.length).toBe(13);
            expect(testMap.get('item3')).toBe('baz');
        });
    });

    describe('clone()', function () {
        it('should perform a shallow copy of the HashMap', function () {
            babyMap = new HashMap([7, 8, 9]);
            testMap.set('babyMap', babyMap);

            var dolly = testMap.clone();
            expect(dolly.length).toBe(testMap.length);
            expect(dolly.get('babyMap')).toBe(babyMap);
        });

        it('should perform a deep copy of the HashMap if "deep" is true', function () {
            var dolly = testMap.clone(true);
            expect(dolly.length).toBe(testMap.length);
            expect(dolly.get('babyMap')).not.toBe(babyMap);
            expect(dolly.get('babyMap').length).toBe(babyMap.length);

            babyMap = null;

        });
    });

    describe('slice()', function () {
        it('should return a reindexed copy of the HashMap', function () {
            testMap = new HashMap();
            testMap.set(3, 'foo');
            testMap.set(4, 'bar');
            testMap.set(7, 'baz');

            var slice = testMap.slice();
            expect(slice.length).toBe(testMap.length);
            expect(slice._.keys).toEqual([0, 1, 2]);
        });

        it('should return the specified portion of the HashMap', function () {
            var slice = testMap.slice(0, 1);
            expect(slice.length).toBe(1);
            expect(slice.get(0)).toBe('foo');

            slice = testMap.slice(-1);
            expect(slice.length).toBe(1);
            expect(slice.get(0)).toBe('baz');

            slice = testMap.slice(0, -1);
            expect(slice.length).toBe(2);
            expect(slice._.values).toEqual(['foo', 'bar']);
        });
    });

    describe('splice()', function () {
        it('should remove the specified items from the HashMap', function () {
            items = testMap.splice(0, 2);
            expect(items.length).toBe(2);
            expect(testMap.length).toBe(1);
        });

        it('should return the removed items', function () {
            expect(items).toEqual(['foo', 'bar']);
        });

        it('should reindex the HashMap', function () {
            expect(testMap._.keys).toEqual([0]);
        });

        it('should insert new items at the specified location', function () {
            testMap.splice(0, 0, 'value1', 'value2');
            expect(testMap.length).toBe(3);
            expect(testMap._.values).toEqual(['value1', 'value2', 'baz']);
        });
    });

});

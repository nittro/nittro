describe('Utils.DOM', function () {

    var DOM, rootElem, listeners;

    beforeAll(function () {
        DOM = _context.lookup('Utils.DOM');

        listeners = {
            click: function () {}
        };
    });

    afterAll(function () {
        rootElem && document.body.removeChild(rootElem);
        rootElem = null;
    });

    describe('create()', function () {
        it('creates the specified DOM element, optionally setting attributes', function () {
            var elem = DOM.create('div');
            expect(elem).toEqual(jasmine.any(HTMLDivElement));
            expect(elem.nodeName).toBe('DIV');

            rootElem = elem;
            document.body.appendChild(rootElem);
        });
    });

    describe('setAttributes()', function () {
        it('sets the specified attributes to the given DOM element', function () {
            DOM.setAttributes(rootElem, {id: 'dom-test'});
            expect(rootElem.getAttribute('id')).toBe('dom-test');
        });
    });

    describe('createFromHtml()', function () {
        it('creates the specified DOM elements from the provided HTML string', function () {
            var elems = DOM.createFromHtml('<div class="test-class"></div> <div class="test-class"></div> <div class="test-class" id="test-div-3"></div>');
            expect(elems.length).toBe(3);

            expect(elems[0].getAttribute('class')).toBe('test-class');
            expect(elems[1].getAttribute('class')).toBe('test-class');
            expect(elems[2].getAttribute('class')).toBe('test-class');
            expect(elems[2].getAttribute('id')).toBe('test-div-3');

            elems.forEach(function(elem) {
                rootElem.appendChild(elem);
            });
        });
    });

    describe('html()', function () {
        it('sets the specified DOM element\'s innerHTML to the specified string', function () {
            DOM.html(document.getElementById('test-div-3'), '<div id="test-div-4"><span id="test-span-1"></span> <span id="test-span-2"></span></div>');
            expect(document.getElementById('test-div-3').childNodes.length).toBe(1);
            expect(document.getElementById('test-div-3').innerHTML).toBe('<div id="test-div-4"><span id="test-span-1"></span> <span id="test-span-2"></span></div>');
        });
    });

    describe('getByClassName()', function () {
        it('returns all elements which have the specified class', function () {
            expect(DOM.getByClassName('test-class').length).toBe(3);
            expect(DOM.getByClassName('nonexistent').length).toBe(0);
        });
    });

    describe('getById()', function () {
        it('returns the element with the matching ID, or null if none found', function () {
            expect(DOM.getById('test-div-3')).toBe(document.getElementById('test-div-3'));
            expect(DOM.getById('nonexistent')).toBe(null);
        });
    });

    describe('getChildren()', function () {
        it('returns non-text children of the specified element', function () {
            expect(document.getElementById('test-div-4').childNodes.length).toBe(3);
            expect(DOM.getChildren(document.getElementById('test-div-4')).length).toBe(2);
        });
    });

    describe('closest()', function () {
        it('should return the closest element with a matching node name and optionally class name', function () {
            var elem = DOM.closest(DOM.getById('test-span-1'), 'div');
            expect(elem).toEqual(jasmine.any(HTMLDivElement));
            expect(elem.getAttribute('id')).toBe('test-div-4');

            elem = DOM.closest(DOM.getById('test-span-1'), 'div', 'test-class');
            expect(elem).toEqual(jasmine.any(HTMLDivElement));
            expect(elem.getAttribute('id')).toBe('test-div-3');

            elem = DOM.closest(DOM.getById('test-span-1'), 'span');
            expect(elem).toBe(document.getElementById('test-span-1'));

            elem = DOM.closest(DOM.getById('test-span-1'), 'span', 'nonexistent');
            expect(elem).toBe(null);
        });
    });

    describe('setStyle()', function () {
        it('should set the elements\' style properties', function () {
            DOM.setStyle(rootElem, 'display', 'none');
            expect(rootElem.style.display).toBe('none');
            DOM.setStyle(rootElem, {display: ''});
            expect(rootElem.style.display).toBe('');
        });
    });

    describe('contains()', function () {
        it('should return true if the second argument is a descendant of the first argument', function () {
            var elem = DOM.getById('test-span-1');
            expect(DOM.contains(rootElem, elem)).toBe(true);
            expect(DOM.contains(elem, rootElem)).toBe(false);
        });
    });

    describe('addListener()', function () {
        it('should add an event listener', function () {
            spyOn(listeners, 'click');
            DOM.addListener(rootElem, 'click', listeners.click);
            DOM.getById('test-span-1').click();
            expect(listeners.click).toHaveBeenCalled();
        });
    });

    describe('removeListener()', function () {
        it('should remove an event listener', function () {
            spyOn(listeners, 'click');
            DOM.removeListener(rootElem, 'click', listeners.click);
            DOM.getById('test-span-1').click();
            expect(listeners.click).not.toHaveBeenCalled();
        });
    });

    describe('addClass()', function () {
        it('should add a class', function () {
            DOM.addClass(rootElem, 'classList-test');
            expect(rootElem.getAttribute('class')).toBe('classList-test');
        });
    });

    describe('toggleClass()', function () {
        it('should toggle a class', function () {
            DOM.toggleClass(rootElem, 'classList-test');
            expect(rootElem.getAttribute('class')).toBe('');
        });

        it('should toggle a class to the state specified by the third argument', function () {
            DOM.toggleClass(rootElem, 'classList-test', true);
            expect(rootElem.getAttribute('class')).toBe('classList-test');
            DOM.toggleClass(rootElem, 'classList-test', true);
            expect(rootElem.getAttribute('class')).toBe('classList-test');
        });
    });

    describe('hasClass()', function () {
        it('should return true if the element has the specified class', function () {
            expect(DOM.hasClass(rootElem, 'classList-test')).toBe(true);
            expect(DOM.hasClass(rootElem, 'nonexistent')).toBe(false);
        });
    });

    describe('removeClass()', function () {
        it('should remove the specified class from the element', function () {
            DOM.removeClass(rootElem, 'classList-test');
            expect(DOM.hasClass(rootElem, 'classList-test')).toBe(false);
        });
    });

    describe('getData()', function () {
        it('should retrieve data from the element\'s dataset', function () {
            var jsonData = {foo: 2, bar: 3.4, baz: true};
            DOM.html(DOM.getById('test-span-1'), '<span id="test-span-data" data-test-int="42" data-test-float="3.4" data-test-bool="true" data-test-json="' + JSON.stringify(jsonData).replace(/"/g, '&quot;') + '"></span>');

            var elem = DOM.getById('test-span-data');
            expect(DOM.getData(elem, 'testInt')).toBe(42);
            expect(DOM.getData(elem, 'testFloat')).toBe(3.4);
            expect(DOM.getData(elem, 'testBool')).toBe(true);
            expect(DOM.getData(elem, 'testJson')).toEqual(jsonData);

        });
    });

    describe('setData()', function () {
        it('should set data in element\'s dataset', function () {
            var elem = DOM.getById('test-span-data');
            DOM.setData(elem, 'testInt', 43);
            expect(DOM.getData(elem, 'testInt')).toBe(43);
        });
    });

});

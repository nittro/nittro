_context.invoke('Nette.Application.Routing', function (Nette, DOM) {

    var DOMRoute = _context.extend(Nette.Object, function (selector) {
        DOMRoute.Super.call(this);
        this._.selector = this._prepareSelector(selector);

    }, {
        match: function () {
            var matches;

            if (this._.selector.type === 'id') {
                var elem = DOM.getById(this._.selector.value);
                matches = elem ? [elem] : [];

            } else {
                matches = DOM.getByClassName(this._.selector.value);

            }

            if (matches.length) {
                this.trigger('match', matches);

            }
        },

        _prepareSelector: function (selector) {
            if (selector.match(/^[^.#]|[\s>\[:+]/)) {
                throw new Error('Invalid selector');

            }

            return {
                type: selector.charAt(0) === '#' ? 'id' : 'class',
                value: selector.substr(1)
            };
        }
    });

    _context.register(DOMRoute, 'DOMRoute');

}, {
    DOM: 'Utils.DOM'
});

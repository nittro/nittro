_context.invoke('Nette.Application.Routing', function (Nette, DOMRoute, URLRoute, Url) {

    var Router = _context.extend(Nette.Object, function (page) {
        Router.Super.call(this);

        this._.page = page;
        this._.routes = {
            dom: {},
            url: {}
        };

        this._.page.on('setup', this._matchAll.bind(this));

    }, {
        getDOMRoute: function (selector) {
            if (!(selector in this._.routes.dom)) {
                this._.routes.dom[selector] = new DOMRoute(selector);

            }

            return this._.routes.dom[selector];

        },

        getURLRoute: function (mask) {
            if (!(mask in this._.routes.url)) {
                this._.routes.url[mask] = new URLRoute(mask);

            }

            return this._.routes.url[mask];

        },

        _matchAll: function () {
            var k, url = Url.fromCurrent();

            for (k in this._.routes.url) {
                this._.routes.url[k].match(url);

            }

            for (k in this._.routes.dom) {
                this._.routes.dom[k].match();

            }
        }
    });

    _context.register(Router, 'Router');

}, {
    Url: 'Utils.Url'
});

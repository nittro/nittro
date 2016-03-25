_context.invoke('Nittro.Widgets', function (Arrays, Strings, DOM, undefined) {

    var Paginator = _context.extend('Nittro.Object', function(page, options) {
        Paginator.Super.call(this);

        this._.pageService = page;
        this._.options = Arrays.mergeTree({}, Paginator.defaults, options);
        this._.container = this._.options.container;
        this._.scrollContainer = this._resolveScrollContainer(this._.options.container, this._.options.scrollContainer);

        if (this._.options.pageSize === null) {
            this._.options.pageSize = this._computePageSize();

        }

        if (this._.options.margin === null) {
            this._.options.margin = this._computeMargin();

        }

        this._.page = this._.options.currentPage;
        this._.nextThreshold = this._computeNextThreshold();
        this._.handleScroll = this._handleScroll.bind(this);

        DOM.addListener(this._getScrollListener(), 'scroll', this._.handleScroll);

    }, {
        STATIC: {
            defaults: {
                container: null,
                scrollContainer: null,
                template: null,
                items: null,
                margin: null,
                currentPage: 1,
                pageSize: null
            }
        },

        destroy: function () {
            DOM.removeListener(this._getScrollListener(), 'scroll', this._.handleScroll);
            this._.container = this._.scrollContainer = this._.options = null;

        },

        _handleScroll: function () {
            if (this._.nextThreshold !== null && this._.scrollContainer.scrollTop > this._.nextThreshold) {
                this._.nextThreshold = null;

                this._renderNextPage().then(function() {
                    this._.nextThreshold = this._computeNextThreshold();

                }.bind(this));
            }
        },

        _getScrollListener: function () {
            return this._.scrollContainer === document.body ? window : this._.scrollContainer;
        },

        _renderNextPage: function () {
            return new Promise(function(fulfill, reject) {
                this._.page++;

                if (Arrays.isArray(this._.options.items)) {
                    var items = this._.options.items.slice((this._.page - 1) * this._.options.pageSize, this._.page * this._.options.pageSize);
                    items.forEach(this._renderItem.bind(this));

                    if (items.length === this._.options.pageSize) {
                        fulfill();
                    } else {
                        reject();
                    }
                } else {
                    this._.pageService.open(this._.options.items.replace(/%page%/, this._.page))
                        .then(function(payload) {
                            for (var id in payload.snippets) {
                                fulfill();
                                return;
                            }

                            reject();

                        }.bind(this), reject);
                }
            }.bind(this));
        },

        _renderItem: function (data) {
            var tpl = DOM.getById(this._.options.template).innerHTML;

            tpl = tpl.replace(/%([a-z0-9_.-]+)%/gi, function () {
                var path = arguments[1].split(/\./g),
                    cursor = data,
                    i, p, n = path.length;

                for (i = 0; i < n; i++) {
                    p = path[i];

                    if (Arrays.isArray(cursor) && p.match(/^\d+$/)) {
                        p = parseInt(p);

                    }

                    if (cursor[p] === undefined) {
                        return '';

                    }

                    cursor = cursor[p];

                }

                return cursor;

            });

            var elem = DOM.create('div');
            DOM.html(elem, tpl);

            DOM.getChildren(elem).forEach(function (node) {
                this._.container.appendChild(node);
            }.bind(this));

        },

        _computePageSize: function () {
            return DOM.getChildren(this._.container).length;
        },

        _computeMargin: function () {
            return window.innerHeight / 2;
        },

        _computeNextThreshold: function () {
            if (!this._.container.lastElementChild) {
                return null;
            }

            var ofs = this._.container.lastElementChild.getBoundingClientRect().top;
            return Math.max(0, ofs + document.body.scrollTop - window.innerHeight - this._.options.margin);

        },

        _resolveScrollContainer: function (elem, scrollContainer) {
            if (scrollContainer === 'auto') {
                scrollContainer = elem;

                function isScrollable(elem) {
                    var style = window.getComputedStyle(elem);
                    return style.overflow === 'auto' || style.overflow === 'scroll'
                        || style.overflowX === 'auto' || style.overflowX === 'scroll'
                        || style.overflowY === 'auto' || style.overflowY === 'scroll';
                }

                while (scrollContainer && scrollContainer !== document.body && !isScrollable(scrollContainer)) {
                    scrollContainer = scrollContainer.parentNode;

                }
            } else if (scrollContainer === null) {
                scrollContainer = document.body;

            }

            return scrollContainer;

        }
    });

    _context.register(Paginator, 'Paginator');

}, {
    Arrays: 'Utils.Arrays',
    Strings: 'Utils.Strings',
    DOM: 'Utils.DOM'
});

_context.invoke('Nette.Page', function (DOM) {

    var Transitions = _context.extend(function(duration) {
        this._ = {
            duration: duration || false,
            ready: true,
            queue: [],
            support: false,
            property: null
        };

        try {
            var s = DOM.create('span').style;

            this._.support = [
                'transition',
                'WebkitTransition',
                'MozTransition',
                'msTransition',
                'OTransition'
            ].some(function(prop) {
                if (prop in s) {
                    this._.property = prop;
                    return true;
                }
            }.bind(this));

            s = null;

        } catch (e) { }

    }, {
        transitionOut: function (elements) {
            return this._begin(elements, 'transition-out');

        },

        transitionIn: function (elements) {
            return this._begin(elements, 'transition-in');

        },

        _begin: function (elements, className) {
            if (!this._.support || !this._.duration || !elements.length) {
                return Promise.resolve(elements);

            } else {
                return this._resolve(elements, className);

            }
        },

        _resolve: function (elements, className) {
            if (!this._.ready) {
                return new Promise(function (resolve) {
                    this._.queue.push([elements, className, resolve]);

                }.bind(this));
            }

            this._.ready = false;

            if (className === 'transition-in') {
                var foo = window.pageXOffset; // needed to force layout and thus run asynchronously

            }

            DOM.addClass(elements, 'transition-active ' + className);
            DOM.removeClass(elements, 'transition-middle');

            var duration = this._getDuration(elements);

            var promise = new Promise(function (resolve) {
                window.setTimeout(function () {
                    DOM.removeClass(elements, 'transition-active ' + className);

                    if (className === 'transition-out') {
                        DOM.addClass(elements, 'transition-middle');

                    }

                    this._.ready = true;

                    resolve(elements);

                }.bind(this), duration);
            }.bind(this));

            promise.then(function () {
                if (this._.queue.length) {
                    var q = this._.queue.shift();

                    this._resolve(q[0], q[1]).then(function () {
                        q[2](q[0]);

                    });
                }
            }.bind(this));

            return promise;

        },

        _getDuration: function (elements) {
            if (!window.getComputedStyle) {
                return this._.duration;

            }

            var durations = [],
                prop = this._.property + 'Duration';

            elements.forEach(function (elem) {
                var duration = window.getComputedStyle(elem)[prop];

                if (duration) {
                    duration = (duration + '').trim().split(/\s*,\s*/g).map(function (v) {
                        v = v.match(/^(\d+)(m?s)$/);

                        if (v) {
                            return parseFloat(v[1]) * (v[2] === 'ms' ? 1 : 1000);

                        } else {
                            return 0;

                        }
                    });

                    durations.push.apply(durations, duration.filter(function(v) { return v > 0; }));

                }
            });

            if (durations.length) {
                return Math.max.apply(null, durations);

            } else {
                return this._.duration;

            }
        }
    });

    _context.register(Transitions, 'Transitions');

}, {
    DOM: 'Utils.DOM'
});

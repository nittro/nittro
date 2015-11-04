_context.invoke('Nette.Widgets', function (DOM, Arrays) {

    var FlashMessages = _context.extend(function (options) {
        this._ = {
            options: Arrays.mergeTree({}, FlashMessages.defaults, options),
            globalHolder: DOM.create('div', {'class': 'flash-global-holder'})
        };

        this._.options.layer.appendChild(this._.globalHolder);

        if (!this._.options.positioning) {
            this._.options.positioning = FlashMessages.basicPositioning;

        }

    }, {
        STATIC: {
            defaults: {
                layer: null,
                minMargin: 20,
                positioning: null
            },
            basicPositioning: [
                function(target, elem, minMargin) {
                    var res = {
                        name: 'below',
                        left: target.left + (target.width - elem.width) / 2,
                        top: target.bottom
                    };

                    if (target.bottom + elem.height + minMargin < window.innerHeight && res.left > 0 && res.left + elem.width < window.innerWidth) {
                        return res;

                    }
                },
                function (target, elem, minMargin) {
                    var res = {
                        name: 'rightOf',
                        left: target.right,
                        top: target.top + (target.height - elem.height) / 2
                    };

                    if (target.right + elem.width + minMargin < window.innerWidth && res.top > 0 && res.top + elem.height < window.innerHeight) {
                        return res;

                    }
                },
                function (target, elem, minMargin) {
                    var res = {
                        name: 'above',
                        left: target.left + (target.width - elem.width) / 2,
                        top: target.top - elem.height
                    };

                    if (target.top > elem.height + minMargin && res.left > 0 && res.left + elem.width < window.innerWidth) {
                        return res;

                    }
                },
                function (target, elem, minMargin) {
                    var res = {
                        name: 'leftOf',
                        left: target.left - elem.width,
                        top: target.top + (target.height - elem.height) / 2
                    };

                    if (target.left > elem.width + minMargin && res.top > 0 && res.top + elem.height < window.innerHeight) {
                        return res;

                    }
                }
            ]
        },
        add: function (target, type, content, rich) {
            var elem = DOM.create('div', {
                'class': 'flash flash-' + (type || 'info')
            });

            if (target && typeof target === 'string') {
                target = DOM.getById(target);

            }

            if (rich) {
                DOM.html(elem, content);

            } else {
                elem.textContent = content;

            }

            DOM.setStyle(elem, 'opacity', 0);
            this._.options.layer.appendChild(elem);

            var style = {},
                timeout = Math.max(2000, Math.round(elem.textContent.split(/\s+/).length / 0.003));

            if (target) {
                var fixed = this._hasFixedParent(target),
                    elemRect = this._getRect(elem),
                    targetRect = this._getRect(target),
                    position;

                if (fixed) {
                    style.position = 'fixed';

                }

                for (var i = 0; i < this._.options.positioning.length; i++) {
                    if (position = this._.options.positioning[i].call(null, targetRect, elemRect, this._.options.minMargin)) {
                        break;

                    }
                }

                if (position) {
                    style.left = position.left;
                    style.top = position.top;

                    if (!fixed) {
                        style.left += window.pageXOffset;
                        style.top += window.pageYOffset;

                    }

                    style.left += 'px';
                    style.top += 'px';
                    style.opacity = '';

                    DOM.setStyle(elem, style);
                    this._show(elem, position.name, timeout);
                    return;

                }
            }

            this._.globalHolder.appendChild(elem);
            DOM.setStyle(elem, 'opacity', '');
            this._show(elem, 'global', timeout);

        },

        _show: function (elem, position, timeout) {
            DOM.addClass(elem, 'flash-show flash-' + position);

            window.setTimeout(function () {
                var foo = window.pageYOffset; // need to force css recalculation
                DOM.removeClass(elem, 'flash-show');
                this._bindHide(elem, timeout);

            }.bind(this), 1);
        },

        _bindHide: function (elem, timeout) {
            var hide = function () {
                DOM.removeListener(document, 'mousemove', hide);
                DOM.removeListener(document, 'mousedown', hide);
                DOM.removeListener(document, 'keydown', hide);
                DOM.removeListener(document, 'touchstart', hide);

                window.setTimeout(function () {
                    DOM.addClass(elem, 'flash-hide');

                    window.setTimeout(function () {
                        elem.parentNode.removeChild(elem);

                    }, 1000);
                }, timeout);
            }.bind(this);

            DOM.addListener(document, 'mousemove', hide);
            DOM.addListener(document, 'mousedown', hide);
            DOM.addListener(document, 'keydown', hide);
            DOM.addListener(document, 'touchstart', hide);

        },

        _hasFixedParent: function (elem) {
            do {
                if (elem.style.position === 'fixed') return true;
                elem = elem.offsetParent;

            } while (elem && elem !== document.documentElement && elem !== document.body);

            return false;

        },

        _getRect: function (elem) {
            var rect = elem.getBoundingClientRect();

            return {
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                width: 'width' in rect ? rect.width : (rect.right - rect.left),
                height: 'height' in rect ? rect.height : (rect.bottom - rect.top)
            };
        }
    });

    _context.register(FlashMessages, 'FlashMessages');

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays'
});

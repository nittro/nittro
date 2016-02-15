_context.invoke('Nittro.Widgets', function(DOM, Arrays) {

    var Dialog = _context.extend('Nittro.Object', function(options) {
        Dialog.Super.call(this);

        this._.options = Arrays.mergeTree({}, Dialog.getDefaults(this.constructor), options);
        this._.visible = false;
        this._.scrollPosition = null;

        this._.elms = {
            holder : DOM.createFromHtml(this._.options.templates.holder),
            wrapper : DOM.createFromHtml(this._.options.templates.wrapper),
            content : DOM.createFromHtml(this._.options.templates.content),
            buttons : DOM.createFromHtml(this._.options.templates.buttons)
        };

        this._.elms.holder.appendChild(this._.elms.wrapper);
        this._.elms.wrapper.appendChild(this._.elms.content);

        if (this._.options.text) {
            this._.options.html = '<p>' + this._.options.text + '</p>';

        }

        DOM.html(this._.elms.content, this._.options.html);

        if (this._.options.buttons) {
            this._.elms.wrapper.appendChild(this._.elms.buttons);
            this._createButtons();
            DOM.addListener(this._.elms.buttons, 'click', this._handleButtons.bind(this));

        }

        this.on('button:default', function() {
            this.hide();

        });

        if (this._.options.keyMap) {
            this._prepareKeymap();

        }

        DOM.addListener(this._.elms.holder, 'touchmove', this._handleTouchScroll.bind(this));
        this._.options.layer.appendChild(this._.elms.holder);
        this._handleKey = this._handleKey.bind(this);
        this._handleScroll = this._handleScroll.bind(this);

    }, {
        STATIC: {
            defaults: {
                html: null,
                text: null,
                buttons: null,
                keyMap: {},
                templates: {
                    holder : '<div class="nittro-dialog-holder"></div>',
                    wrapper : '<div class="nittro-dialog-inner"></div>',
                    content : '<div class="nittro-dialog-content"></div>',
                    buttons : '<div class="nittro-dialog-buttons"></div>',
                    button : '<button></button>'
                },
                layer: null
            },
            getDefaults: function (type) {
                var defaults = type.defaults || {},
                    k;

                do {
                    type = type.Super;

                    if (type.defaults) {
                        for (k in type.defaults) {
                            if (type.defaults.hasOwnProperty(k) && !defaults.hasOwnProperty(k)) {
                                defaults[k] = type.defaults[k];

                            }
                        }
                    }
                } while (type && type !== Dialog);

                return defaults;

            },
            setDefaults: function(options) {
                Arrays.mergeTree(Dialog.defaults, options);

            }
        },

        isVisible: function() {
            return this._.visible;

        },

        show: function() {
            if (this._.visible) {
                return;

            }

            this._.visible = true;
            this.trigger('show');

            if (this._.keyMap) {
                DOM.addListener(document, 'keydown', this._handleKey);

            }

            this._.scrollLock = {
                left: window.pageXOffset,
                top: window.pageYOffset
            };

            if (/ipod|ipad|iphone/i.test(navigator.userAgent)) {
                this._.scrollPosition = window.pageYOffset;
                window.scrollTo(0, 0);
                this._.scrollLock.left = 0;
                this._.scrollLock.top = 0;

            }

            DOM.addListener(window, 'scroll', this._handleScroll);
            DOM.addClass(this._.elms.holder, 'visible');

        },

        hide: function() {
            if (!this._.visible) {
                return;

            }

            this._.visible = false;

            if (this._.keyMap) {
                DOM.removeListener(document, 'keydown', this._handleKey);

            }

            DOM.removeListener(window, 'scroll', this._handleScroll);

            if (/ipod|ipad|iphone/i.test(navigator.userAgent)) {
                window.scrollTo(0, this._.scrollPosition);
                this._.scrollPosition = null;

            }

            DOM.removeClass(this._.elms.holder, 'visible');
            this.trigger('hide');

        },

        getContent: function() {
            return this._.elms.content;

        },

        getButtons: function() {
            return this._.elms.buttons;

        },

        destroy: function () {
            if (this._.visible) {
                this.one('hide', this.destroy);
                this.hide();

            } else {
                this._.options.layer.removeChild(this._.elms.holder);
                this.off();

                window.setTimeout(function(k) {
                    for (k in this._.elms) {
                        this._.elms[k] = null;
                    }
                }.bind(this), 10);

            }
        },



        _createButtons: function () {
            var value, btn, def;

            for (value in this._.options.buttons) {
                btn = DOM.createFromHtml(this._.options.templates.button);

                def = this._.options.buttons[value];

                if (typeof def === 'string') {
                    def = { label: def, type: 'button' };

                }

                DOM.setData(btn, 'value', value);
                DOM.addClass(btn, 'nittro-dialog-button', def.type === 'button' ? 'nittro-dialog-button-text' : 'nittro-dialog-button-plain');
                btn.textContent = def.label;

                this._.elms.buttons.appendChild(btn);

            }
        },

        _handleButtons: function (evt) {
            evt.preventDefault();

            this.trigger('button', {
                value: DOM.getData(evt.target, 'value')
            });
        },

        _prepareKeymap: function () {
            var keyMap = {},
                v, k;

            for (v in this._.options.keyMap) {
                k = this._.options.keyMap[v];

                if (!(k instanceof Array)) {
                    k = [k];

                }

                k.forEach(function (k) {
                    keyMap[k] = v;

                });
            }

            this._.keyMap = keyMap;

        },

        _handleKey: function(evt) {
            if (evt.target.tagName.toLowerCase() === 'textarea') return;

            if (evt.which in this._.keyMap) {
                evt.preventDefault();

                this.trigger('button', {
                    value: this._.keyMap[evt.which]
                });
            }
        },

        _handleTouchScroll: function (evt) {
            if (this._.elms.holder === evt.target) {
                evt.preventDefault();

            }
        },

        _handleScroll: function () {
            window.scrollTo(this._.scrollLock.left, this._.scrollLock.top);

        }
    });

    _context.register(Dialog, 'Dialog');

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays'
});

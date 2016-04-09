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

        if (this._.options.classes) {
            DOM.addClass(this._.elms.holder, this._.options.classes);
            
        }

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
                classes: null,
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
                window.setTimeout(function() {
                    this.destroy();

                }.bind(this), 1000);

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
;
_context.invoke('Nittro.Widgets', function (Dialog, Arrays, ReflectionClass) {

	var Confirm = _context.extend(Dialog, function (options) {
		if (!(this instanceof Confirm)) {
			var dlg = ReflectionClass.from(Confirm).newInstanceArgs(arguments);
			window.setTimeout(function() { dlg.show(); }, 1);
			return dlg;

		}

		Confirm.Super.call(this, this._prepareOptions(arguments));

		this._.promise = new Promise(function (fulfill, reject) {
            this.on('button', function(evt) {
                this.destroy();

                if (evt.data.value === 'confirm') {
                    fulfill();

                } else {
                    reject();

                }
            });
        }.bind(this));

	}, {
        STATIC: {
            defaults: {
                classes: 'nittro-dialog-confirm',
                buttons: {
                    confirm: 'OK',
                    cancel: {label: 'Cancel', type: 'text'}
                },
                keyMap: {
                    confirm: 13,
                    cancel: 27
                }
            },
            setDefaults: function(defaults) {
                Arrays.mergeTree(Confirm.defaults, defaults);

            }
        },

		_prepareOptions: function (args) {
			var options = args[0];

			if (typeof options === 'string') {
				options = {
					text: options
				};

				if (args.length > 1) {
					options.buttons = {
						confirm: args[1]
					};

					if (args.length > 2) {
						if (typeof args[2] === 'string') {
							options.buttons.cancel = {label: args[2], type: 'text'};

						} else {
							options.buttons.cancel = args[2];

						}
					} else {
						options.buttons.cancel = {label: 'Cancel', type: 'text'};

					}
				}
			}

			return options;

		},

		then: function (onfulfill, onreject) {
            return this._.promise.then(onfulfill, onreject);

        }
	});

    _context.register(Confirm, 'Confirm');

}, {
	ReflectionClass: 'Utils.ReflectionClass',
    Arrays: 'Utils.Arrays'
});
;
_context.invoke('Nittro.Widgets', function (DOM, Arrays, Confirm) {

    var AutoConfirm = _context.extend(function(page, options) {
        this._ = {
            page: page,
            options: Arrays.mergeTree(true, {}, AutoConfirm.defaults, options)
        };

        this._.page.on('create-request', this._handleRequest.bind(this));

    }, {
        STATIC: {
            defaults: {
                prompt: 'Are you sure?',
                confirm: 'Yes',
                cancel: 'No'
            }
        },

        _handleRequest: function (evt) {
            if (!evt.data.context || !DOM.hasClass(evt.data.context, 'nittro-confirm')) {
                return;

            } else if (DOM.getData(evt.data.context, 'confirmed')) {
                DOM.setData(evt.data.context, 'confirmed', null);
                return;

            }

            evt.preventDefault();

            var prompt = DOM.getData(evt.data.context, 'prompt') || this._.options.prompt,
                confirm = DOM.getData(evt.data.context, 'confirm') || this._.options.confirm,
                cancel = DOM.getData(evt.data.context, 'cancel') || this._.options.cancel;

            Confirm(prompt, confirm, cancel).then(function() {
                DOM.setData(evt.data.context, 'confirmed', true);

                if (evt.data.context instanceof HTMLFormElement) {
                    this._.page.sendForm(evt.data.context);

                } else {
                    this._.page.openLink(evt.data.context);

                }
            }.bind(this), function() {
                DOM.setData(evt.data.context, 'confirmed', null);

            });
        }
    });

    _context.register(AutoConfirm, 'AutoConfirm');

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays'
});
;
_context.invoke('Nittro.Widgets', function(Dialog, Form, DOM, Arrays) {

    var FormDialog = _context.extend(Dialog, function(formLocator, options) {
        FormDialog.Super.call(this, options);

        this._.elms.form = this.getContent().getElementsByTagName('form').item(0);
        this._.formLocator = formLocator;
        this._.form = formLocator.getForm(this._.elms.form);

        DOM.addListener(this._.elms.form, 'submit', this._handleSubmit.bind(this));
        this.on('button', this._handleButton.bind(this));

        if (this._.options.autoFocus) {
            this.on('show', this._autoFocus.bind(this));

        }
    }, {
        STATIC: {
            defaults: {
                classes: 'nittro-dialog-form',
                hideOnSuccess: true,
                autoFocus: true,
                buttons: {
                    confirm: 'OK',
                    cancel: {label: 'Cancel', type: 'text'}
                },
                keyMap: {
                    confirm: 13,
                    cancel: 27
                }
            },
            setDefaults: function(defaults) {
                Arrays.mergeTree(FormDialog.defaults, defaults);

            }
        },

        setValues: function(values) {
            this._.form.setValues(values);
            return this;

        },

        reset: function() {
            this._.form.reset();
            return this;

        },

        getForm: function() {
            return this._.form;

        },

        _handleSubmit: function(evt) {
            if (!evt.defaultPrevented) {
                if (this._.options.hideOnSuccess) {
                    this.hide();

                }

                this.trigger('success');

            }
        },

        _handleButton: function(evt) {
            if (evt.data.value === 'confirm') {
                evt.preventDefault();
                this._.form.submit();

            } else {
                this._.form.reset();

            }
        },

        _autoFocus: function () {
            try {
                this._.form.getElements().item(0).focus();

            } catch (e) { /* noop */ }
        },

        destroy: function () {
            this._.formLocator.removeForm(this._.elms.form);
            FormDialog.Super.prototype.destroy.call(this);

        }
    });

    _context.register(FormDialog, 'FormDialog');

}, {
    Form: 'Nittro.Forms.Form',
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays'
});
;
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

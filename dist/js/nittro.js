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

    var Paginator = _context.extend('Nittro.Object', function(ajax, page, options) {
        Paginator.Super.call(this);

        this._.ajaxService = ajax;
        this._.pageService = page;
        this._.options = Arrays.mergeTree({}, Paginator.defaults, options);
        this._.container = this._.options.container;
        this._.viewport = this._resolveViewport(this._.options.container, this._.options.viewport);

        if (this._.options.pageSize === null) {
            throw new Error('You must specify the page size (number of items per page)');

        }

        if (this._.options.pageCount === null) {
            throw new Error('You must specify the page count');

        }

        if (this._.options.margin === null) {
            this._.options.margin = this._computeMargin();

        }

        if (this._.options.history === null) {
            this._.options.history = !!this._.options.url;

        }

        if (typeof this._.options.itemRenderer === 'string') {
            this._.template = DOM.getById(this._.options.itemRenderer).innerHTML;

        } else if (typeof this._.options.template === 'string') {
            this._.template = this._.options.template;

        }

        if (this._.options.responseProcessor === null) {
            this._.options.responseProcessor = this._processResponse.bind(this);

        }

        this._.firstPage = this._.lastPage = this._.currentPage = this._.options.currentPage;
        this._.lock = false;
        this._.previousItems = null;
        this._.previousLock = {
            time: Date.now() + 1000,
            threshold: this._computeElemOffset(this._.container.firstElementChild)
        };
        this._.previousThreshold = this._computePreviousThreshold();
        this._.nextThreshold = this._computeNextThreshold();
        this._.handleScroll = this._handleScroll.bind(this);

        var prevElem = this._.container.tagName.toLowerCase();
        this._.prevContainer = DOM.create(prevElem, {'class': 'paginator-previous'});
        this._.container.insertBefore(this._.prevContainer, this._.container.firstChild);

        this._.pageThresholds = [
            {
                page: this._.currentPage,
                threshold: this._computeElemOffset(this._.prevContainer.nextElementSibling) + this._getScrollTop()
            }
        ];

        if (Arrays.isArray(this._.options.items)) {
            this._getItems(this._.options.currentPage);

        }

        this._preparePreviousPage();

        DOM.addListener(this._.viewport, 'scroll', this._.handleScroll);

    }, {
        STATIC: {
            defaults: {
                container: null,
                viewport: null,
                itemRenderer: null,
                template: null,
                items: null,
                url: null,
                responseProcessor: null,
                history: null,
                margin: null,
                currentPage: 1,
                pageCount: null,
                pageSize: null
            }
        },

        destroy: function () {
            DOM.removeListener(this._.viewport, 'scroll', this._.handleScroll);
            this._.container = this._.viewport = this._.options = null;

        },

        _handleScroll: function () {
            if (this._.lock) {
                return;

            }

            this._.lock = true;

            window.requestAnimationFrame(function() {
                this._.lock = false;

                var top = this._getScrollTop(),
                    i, t, p, n;

                if (this._.nextThreshold !== null && top > this._.nextThreshold) {
                    this._.nextThreshold = null;
                    this._renderNextPage();

                } else if (this._.previousLock) {
                    if (this._.previousLock.time < Date.now() && top > this._.previousLock.threshold) {
                        this._.previousLock = null;

                    }
                } else if (this._.previousThreshold !== null && top < this._.previousThreshold) {
                    this._.previousThreshold = null;
                    this._renderPreviousPage();

                }

                if ((!this._.previousLock || this._.previousLock.time < Date.now()) && this._.options.history) {
                    for (i = 1, t = this._.pageThresholds.length; i <= t; i++) {
                        p = this._.pageThresholds[i - 1];
                        n = this._.pageThresholds[i];

                        if (top > p.threshold && (!n || top < n.threshold) && p.page !== this._.currentPage) {
                            this._.currentPage = p.page;
                            this._.pageService.saveHistoryState(this._getPageUrl(p.page), null, true);
                            break;

                        }
                    }
                }
            }.bind(this));
        },

        _getPageUrl: function(page) {
            var url = this._.options.url;

            if (typeof url === 'function') {
                return url.call(null, page);

            } else {
                return url.replace(/%page%/g, page);

            }
        },

        _getItems: function(page) {
            if (Arrays.isArray(this._.options.items)) {
                var args = new Array(this._.options.pageSize),
                    items;

                args.unshift((page - 1) * this._.options.pageSize, this._.options.pageSize);
                items = this._.options.items.splice.apply(this._.options.items, args);
                return Promise.resolve(items);

            } else {
                var url = this._getPageUrl(page);

                return this._.ajaxService.get(url)
                    .then(this._.options.responseProcessor)
                    .then(function(items) { return Arrays.isArray(items) ? items : []; });
            }
        },

        _processResponse: function(response) {
            return response.getPayload().items || [];

        },

        _preparePreviousPage: function() {
            if (this._.firstPage > 1) {
                this._.previousItems = this._getItems(this._.firstPage - 1).then(function(items) {
                    return items
                        .map(this._createItem.bind(this))
                        .map(function(elem) {
                            this._.prevContainer.appendChild(elem);
                            return elem;

                        }.bind(this));
                }.bind(this));
            } else {
                this._.previousItems = Promise.resolve(null);

            }
        },

        _renderPreviousPage: function() {
            return this._.previousItems.then(function(items) {
                if (!items) {
                    return;

                }

                this._.firstPage--;

                var scrollTop = this._getScrollTop(),
                    style = window.getComputedStyle(this._.prevContainer),
                    first = items[0],
                    existing = this._.prevContainer.nextElementSibling || null,
                    itemStyle = window.getComputedStyle(first),
                    pt = parseFloat(style.paddingTop.replace(/px$/, '')),
                    pb = parseFloat(style.paddingBottom.replace(/px$/, '')),
                    m = 0,
                    delta;

                if (!style.display.match(/flex$/) && itemStyle.float === 'none') {
                    m = Math.max(parseFloat(itemStyle.marginTop.replace(/px$/, '')), parseFloat(itemStyle.marginBottom.replace(/px$/, '')));

                }

                delta = this._.prevContainer.clientHeight - pt - pb - m;
                scrollTop += delta;

                while (items.length) {
                    this._.container.insertBefore(items.shift(), existing);

                }

                window.requestAnimationFrame(function() {
                    this._setScrollTop(scrollTop);

                    this._.pageThresholds.forEach(function(t) {
                        t.threshold += delta
                    });

                    this._.pageThresholds.unshift({
                        page: this._.firstPage,
                        threshold: this._computeElemOffset(first) + scrollTop
                    });

                }.bind(this));

                this._preparePreviousPage();
                this._.previousThreshold = this._computePreviousThreshold();

            }.bind(this));
        },

        _renderNextPage: function() {
            return this._getItems(this._.lastPage + 1).then(function(items) {
                this._.lastPage++;

                items = items.map(this._createItem.bind(this));

                var first = items[0];

                while (items.length) {
                    this._.container.appendChild(items.shift());

                }

                this._.nextThreshold = this._computeNextThreshold();

                this._.pageThresholds.push({
                    page: this._.lastPage,
                    threshold: this._computeElemOffset(first) + this._getScrollTop()
                });

            }.bind(this));
        },

        _createItem: function(data) {
            var item = this._renderItem(data);

            if (typeof item === 'string') {
                item = DOM.createFromHtml(item);

            }

            if (Arrays.isArray(item)) {
                throw new Error("Rendered item contains more than one root HTML element");

            }

            return item;

        },

        _renderItem: function(data) {
            if (typeof data === 'string') {
                return data;

            } else if (this._.template) {
                return this._.template.replace(/%([a-z0-9_.-]+)%/gi, function () {
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

                    return Strings.escapeHtml(cursor + '');

                });
            } else {
                return this._.options.itemRenderer.call(null, data);

            }
        },

        _computePreviousThreshold: function() {
            return this._.firstPage > 1 ? this._.options.margin : null;

        },

        _computeNextThreshold: function() {
            if (!this._.container.lastElementChild || this._.lastPage >= this._.options.pageCount) {
                return null;
            }

            var ofs = this._computeElemOffset(this._.container.lastElementChild, 'bottom');
            return Math.max(0, ofs + this._getScrollTop() - this._getViewportHeight() - this._.options.margin);

        },

        _computeElemOffset: function(elem, edge) {
            var offset = elem.getBoundingClientRect()[edge || 'top'];

            if (this._.viewport !== window) {
                offset -= this._.viewport.getBoundingClientRect().top;

            }

            return offset;

        },

        _computeMargin: function () {
            return this._getViewportHeight() / 2;

        },

        _getViewportHeight: function() {
            return this._.viewport.clientHeight || this._.viewport.innerHeight;

        },

        _getScrollTop: function() {
            return this._.viewport === window ? window.pageYOffset : this._.viewport.scrollTop;
        },

        _setScrollTop: function(to) {
            if (this._.viewport === window) {
                window.scrollTo(0, to);
            } else {
                this._.viewport.scrollTop = to;
            }
        },

        _resolveViewport: function (elem, viewport) {
            if (viewport === 'auto') {
                viewport = elem;

                function isScrollable(elem) {
                    var style = window.getComputedStyle(elem);
                    return style.overflow === 'auto' || style.overflow === 'scroll'
                        || style.overflowY === 'auto' || style.overflowY === 'scroll';
                }

                while (viewport && viewport !== document.body && !isScrollable(viewport)) {
                    viewport = viewport.parentNode;

                }
            } else if (viewport === null) {
                return window;

            }

            return !viewport || viewport === document.body ? window : viewport;

        }
    });

    _context.register(Paginator, 'Paginator');

}, {
    Arrays: 'Utils.Arrays',
    Strings: 'Utils.Strings',
    DOM: 'Utils.DOM'
});
;
_context.invoke('Nittro.Widgets', function(Form, Vendor, DOM, Arrays, Strings) {

    var DropZone = _context.extend('Nittro.Object', function(form, elem, options) {
        DropZone.Super.call(this);

        this._.form = form || null;
        this._.elem = null;
        this._.field = null;
        this._.rules = null;
        this._.files = [];
        this._.dragElems = [];
        this._.options = Arrays.mergeTree({}, DropZone.defaults, options);

        this.validate = this.validate.bind(this);
        this._serialize = this._serialize.bind(this);
        this._handleDragEvent = this._handleDragEvent.bind(this);
        this._handleDrop = this._handleDrop.bind(this);
        this._handleFieldChange = this._handleFieldChange.bind(this);

        if (this._.form) {
            this._.form.on('validate', this.validate);
            this._.form.on('serialize', this._serialize);

            this.on('error:default', function(evt) {
                this._.form.trigger('error', {
                    elem: this._.field || this._.elem,
                    message: evt.data.message
                });
            }.bind(this));
        }

        if (this._.options.allowedTypes) {
            this._.options.allowedTypes = this._normalizeTypes(this._.options.allowedTypes);

        }

        if (this._.options.maxSize) {
            this._.options.maxSize = this._normalizeMaxSize(this._.options.maxSize);

        }

        if (this._.options.field) {
            this._.field = this._.options.field;
            this._.rules = DOM.getData(this._.field, 'nette-rules');
            this._.options.fieldName = this._.field.name;
            this._.options.required = this._.field.required;
            this._.options.multiple = this._.field.multiple;

            if (this._.field.accept) {
                this._.options.allowedTypes = this._normalizeTypes(this._.field.accept);

            } else if (this._.options.allowedTypes) {
                this._.field.accept = this._formatAccept(this._.options.allowedTypes);

            }

            this._.options.field = null;
            this._.field.required = false;
            this._.field.removeAttribute('data-nette-rules');

            DOM.addListener(this._.field, 'change', this._handleFieldChange);

        }

        if (elem) {
            this.attach(elem);

        }
    }, {
        STATIC: {
            create: function(formLocator, from) {
                if (!(from instanceof HTMLInputElement) || from.type !== 'file') {
                    throw new Error('Invalid argument, must be a file input');

                }

                var form = from.form ? formLocator.getForm(from.form) : null;

                return new DropZone(form, null, {
                    field: from
                });
            },

            TYPES: {

            },

            defaults: {
                field: null,
                fieldName: null,
                required: false,
                allowedTypes: null,
                maxSize: null,
                multiple: true,

                messages: {
                    empty: 'This field is required.',
                    invalidType: 'File %s isn\'t an allowed kind of file',
                    exceededSize: 'File %s is too large.'
                }
            }
        },

        attach: function(elem) {
            this.detach();

            this._.dragElems = [];
            this._.elem = elem;

            DOM.addListener(document.body, 'dragenter', this._handleDragEvent);
            DOM.addListener(document.body, 'dragover', this._handleDragEvent);
            DOM.addListener(document.body, 'dragleave', this._handleDragEvent);
            DOM.addListener(document.body, 'drop', this._handleDrop);

        },

        detach: function() {
            if (this._.elem) {
                DOM.removeListener(document.body, 'dragenter', this._handleDragEvent);
                DOM.removeListener(document.body, 'dragover', this._handleDragEvent);
                DOM.removeListener(document.body, 'dragleave', this._handleDragEvent);
                DOM.removeListener(document.body, 'drop', this._handleDrop);
                this._.dragElems = [];
                this._.elem = null;

            }
        },

        setAllowedTypes: function(allowedTypes) {
            this._.options.allowedTypes = allowedTypes ? this._normalizeTypes(allowedTypes) : null;
            return this;

        },

        setMaxSize: function(size) {
            this._.options.maxSize = size ? this._normalizeMaxSize(size) : null;
            return this;

        },

        setRequired: function(required) {
            this._.options.required = required !== false;
            return this;

        },

        setMultiple: function(multiple) {
            this._.options.multiple = multiple !== false;
            return this;

        },

        setFieldName: function(fieldName) {
            this._.options.fieldName = fieldName;
            return this;

        },

        hasFiles: function() {
            return this._.files.length > 0;

        },

        getFiles: function() {
            return this._.files.slice();

        },

        getFile: function(index) {
            return this._.files[index] || null;

        },

        isImage: function(file) {
            return /^image\/.+$/i.test(file.type);

        },

        loadImages: function() {
            var queue = [];

            this._.files.forEach(function(file) {
                if (file.type.match(/^image\/.+$/i)) {
                    queue.push(this.loadImage(file));
                }
            }.bind(this));

            return Promise.all(queue);

        },

        loadImage: function(file) {
            return new Promise(function(fulfill, reject) {
                var reader = new FileReader(),
                    image = new Image();

                reader.onload = function() {
                    image.src = reader.result;
                    fulfill(image);
                };

                reader.onerror = function() {
                    reject();
                };

                reader.readAsDataURL(file);

            });
        },

        removeFile: function(file) {
            if (typeof file !== 'number') {
                file = this._.files.indexOf(file);

            }

            if (file >= 0 && file < this._.files.length) {
                this._.files.splice(file, 1);

            }

            return this;

        },

        destroy: function() {
            this.detach();
            this.off();
            this._.files = [];
            this._.form = null;

            if (this._.form) {
                this._.form.off('validate', this.validate);
                this._.form.off('serialize', this._serialize);

            }

            if (this._.field) {
                DOM.removeListener(this._.field, 'change', this._handleFieldChange);

            }
        },

        validate: function(evt) {
            if (this._.options.required && !this._.files.length) {
                evt.preventDefault();
                this.trigger('error', { message: this._formatErrorMessage('empty') });

            }
        },

        formatSize: function(bytes) {
            var units = ['kB', 'MB', 'GB', 'TB'],
                unit = 'B';

            while (bytes > 1024 && units.length) {
                unit = units.shift();
                bytes /= 1024;

            }

            return (unit === 'B' ? bytes : bytes.toFixed(2)) + ' ' + unit;

        },

        _addFiles: function(files) {
            var i = 0,
                n = this._.options.multiple ? files.length : 1;

            if (!this._.options.multiple) {
                this._.files = [];

            }

            if (this._.field && this._.rules && !Vendor.validateControl(this._.field, this._.rules, false, { value: files })) {
                return;

            }

            var errors = [],
                evt;

            for (; i < n; i++) try {
                this._validateFile(files.item(i));

                evt = this.trigger('file', {
                    file: files.item(i),
                    index: this._.files.length
                });

                if (!evt.isDefaultPrevented()) {
                    this._.files.push(files.item(i));

                }
            } catch (e) {
                if (e instanceof ValidationError) {
                    errors.push(e.message);

                } else {
                    throw e;

                }
            }

            if (errors.length) {
                this.trigger('error', { message: errors.join("\n") });

            }
        },

        _validateFile: function(file) {
            if (!this._validateType(file.name, file.type)) {
                throw new ValidationError(this._formatErrorMessage('invalidType', [file.name, file.type]));

            } else if (!this._validateSize(file.size)) {
                throw new ValidationError(this._formatErrorMessage('exceededSize', [file.name, this.formatSize(file.size), this.formatSize(this._.options.maxSize)]));

            }
        },

        _validateType: function(name, type) {
            if (!this._.options.allowedTypes) {
                return true;

            }

            return this._.options.allowedTypes.some(function(pattern) {
                if (pattern.charAt(0) === '.') {
                    return !name || name.match(new RegExp(Strings.escapeRegex(pattern) + '$', 'i'));

                } else {
                    return !type || type.match(new RegExp('^' + Strings.escapeRegex(pattern).replace(/\/\\\*$/, '/.+') + '$', 'i'));

                }
            });
        },

        _validateSize: function(size) {
            return !this._.options.maxSize || size <= this._.options.maxSize;
        },

        _handleFieldChange: function() {
            if (this._.field.files.length) {
                this._addFiles(this._.field.files);

                if (this._.form) {
                    this._.form.setValue(this._.options.fieldName, null);

                }
            }
        },

        _handleDrop: function(evt) {
            this._.dragElems = [];

            if (evt.defaultPrevented) {
                return;

            }

            evt.preventDefault();

            var drop = this.trigger('drop', {
                target: evt.target,
                allowed: evt.target === this._.elem || DOM.contains(this._.elem, evt.target)
            });

            if (drop.data.allowed) {
                this._addFiles(evt.dataTransfer.files);

            }
        },

        _handleDragEvent: function(evt) {
            evt.preventDefault();

            if (evt.type === 'dragenter') {
                if (this._.dragElems.indexOf(evt.target) === -1) {
                    this._.dragElems.push(evt.target);

                }

                if (this._.dragElems.length === 1) {
                    this.trigger('body-enter', { files: evt.dataTransfer.files });

                }

                if (evt.target === this._.elem) {
                    this.trigger('zone-enter', { files: evt.dataTransfer.files });

                }
            } else if (evt.type === 'dragleave') {
                var index = this._.dragElems.indexOf(evt.target);

                if (index > -1) {
                    this._.dragElems.splice(index, 1);

                }

                if (evt.target === this._.elem) {
                    this.trigger('zone-leave');

                }

                if (!this._.dragElems.length) {
                    this.trigger('body-leave');

                }
            }
        },

        _serialize: function(evt) {
            for (var i = 0; i < this._.files.length; i++) {
                evt.data.append(this._.options.fieldName, this._.files[i]);

            }
        },

        _formatAccept: function(allowedTypes) {
            return allowedTypes.join(',');

        },

        _normalizeTypes: function(allowedTypes) {
            if (typeof allowedTypes === 'string') {
                return allowedTypes.trim().split(/\s*,\s*/g);

            }

            return allowedTypes;

        },

        _normalizeMaxSize: function(size) {
            if (typeof size === 'string') {
                var unit;

                if (unit = size.match(/(k|M|G|T)?B$/)) {
                    unit = unit[1];
                    size = size.replace(/(k|M|G|T)?B$/, '');

                } else {
                    unit = 'B';

                }

                size = parseFloat(size.trim());

                switch (unit) {
                    case 'T': size *= 1024;
                    case 'G': size *= 1024;
                    case 'M': size *= 1024;
                    case 'k': size *= 1024;
                }
            }

            return size;

        },

        _formatErrorMessage: function(type, params) {
            var message = this._.options.messages[type];

            if (params) {
                message = Strings.vsprintf(message, params);

            }

            return message;

        }
    });

    var ValidationError = _context.extend(Error, function(message) {
        ValidationError.Super.call(this, message);
    });

    _context.register(DropZone, 'DropZone');

}, {
    Form: 'Nittro.Forms.Form',
    Vendor: 'Nittro.Forms.Vendor',
    Arrays: 'Utils.Arrays',
    Strings: 'Utils.Strings',
    DOM: 'Utils.DOM'
});

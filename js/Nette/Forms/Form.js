_context.invoke('Nette.Forms', function (DOM, Arrays, DateTime, FormData, Vendor, undefined) {

    var Form = _context.extend('Nette.Object', function (form) {
        Form.Super.call(this);

        if (typeof form === 'string') {
            form = DOM.getById(form);

        }

        if (!form || !(form instanceof HTMLFormElement)) {
            throw new TypeError('Invalid argument, must be a HTMLFormElement');

        }

        this._.form = form;
        this._.form.noValidate = 'novalidate';
        this._.submittedBy = null;

        DOM.addListener(this._.form, 'submit', this._handleSubmit.bind(this));
        DOM.addListener(this._.form, 'reset', this._handleReset.bind(this));

    }, {
        getElement: function (name) {
            return name ? this._.form.elements.namedItem(name) : this._.form;

        },

        setSubmittedBy: function (value) {
            this._.submittedBy = value;
            return this;

        },

        validate: function () {
            if (!Vendor.validateForm(this._.form)) {
                return false;

            }

            var evt = this.trigger('validate');
            return !evt.isDefaultPrevented();

        },

        setValues: function (values, reset) {
            var i, elem, name, value, names = [];
            values || (values = {});

            for (i = 0; i < this._.form.elements.length; i++) {
                elem = this._.form.elements.item(i);
                name = elem.name;
                value = undefined;

                if (!name || names.indexOf(name) > -1 || elem.tagName.toLowerCase() === 'button' || elem.type in {'submit':1, 'reset':1, 'button':1, 'image':1}) {
                    continue;

                }

                names.push(name);

                if (name.indexOf('[') > -1) {
                    value = values;

                    name.replace(/]/g, '').split(/\[/g).some(function (key) {
                        if (key === '') {
                            return true;

                        } else if (!(key in value)) {
                            value = undefined;
                            return true;

                        } else {
                            value = value[key];
                            return false;

                        }
                    });
                } else if (name in values) {
                    value = values[name];

                }

                if (value === undefined) {
                    if (reset && !DOM.hasClass(elem, 'no-reset')) {
                        value = null;

                    } else {
                        continue;

                    }
                }

                this.setValue(name, value);

            }
        },

        setValue: function (elem, value) {
            if (typeof elem === 'string') {
                elem = this._.form.elements.namedItem(elem);

            }

            var i,
                toStr = function(v) { return '' + v; };

            if (!elem) {
                throw new TypeError('Invalid argument to setValue(), must be (the name of) an existing form element');

            } else if (!elem.tagName) {
                if ('length' in elem) {
                    for (i = 0; i < elem.length; i++) {
                        this.setValue(elem[i], value);

                    }
                }
            } else if (elem.type === 'radio') {
                elem.checked = value !== null && elem.value === toStr(value);

            } else if (elem.type === 'file') {
                if (value === null) {
                    value = elem.parentNode.innerHTML;
                    DOM.html(elem.parentNode, value);

                }
            } else if (elem.tagName.toLowerCase() === 'select') {
                var single = elem.type === 'select-one',
                    arr = Arrays.isArray(value),
                    v;

                if (arr) {
                    value = value.map(toStr);

                } else {
                    value = toStr(value);

                }

                for (i = 0; i < elem.options.length; i++) {
                    v = arr ? value.indexOf(elem.options.item(i).value) > -1 : value === elem.options.item(i).value;
                    elem.options.item(i).selected = v;

                    if (v && single) {
                        break;

                    }
                }
            } else if (elem.type === 'checkbox') {
                elem.checked = Arrays.isArray(value) ? value.map(toStr).indexOf(elem.value) > -1 : !!value;

            } else if (elem.type === 'date') {
                elem.value = value ? DateTime.from(value).format('Y-m-d') : '';

            } else if (elem.type === 'datetime-local' || elem.type === 'datetime') {
                elem.value = value ? DateTime.from(value).format('Y-m-d\\TH:i:s') : '';

            } else {
                elem.value = value !== null ? toStr(value) : '';

            }

            return this;

        },

        serialize: function () {
            var elem, i,
                data = new FormData(),
                names = [],
                value;

            for (i = 0; i < this._.form.elements.length; i++) {
                elem = this._.form.elements.item(i);

                if (elem.name && names.indexOf(elem.name) === -1 && (elem.type === 'submit' && elem.name === this._.submittedBy || !(elem.type in {button: 1, reset: 1}))) {
                    names.push(elem.name);

                }
            }

            for (i = 0; i < names.length; i++) {
                elem = this._.form.elements.namedItem(names[i]);

                if (Vendor.isDisabled(elem)) {
                    continue;

                }

                value = Vendor.getEffectiveValue(elem);

                if (Arrays.isArray(value) || value instanceof FileList) {
                    for (var j = 0; j < value.length; j++) {
                        data.append(names[i], value[j]);

                    }
                } else {
                    data.append(names[i], value);

                }
            }

            this.trigger('serialize', data);

            return data;

        },

        submit: function (by) {
            var evt;

            if (by) {
                var btn = this._.form.elements.namedItem(by);

                if (btn && btn.type === 'submit') {
                    evt = document.createEvent('MouseEvents');
                    evt.initMouseEvent('click', true, true, window);
                    btn.dispatchEvent(evt);
                    return this;

                } else {
                    throw new TypeError('Unknown element or not a submit button: ' + by);

                }
            }

            evt = document.createEvent('HTMLEvents');
            evt.initEvent('submit', true, true);
            this._.form.dispatchEvent(evt);

            return this;

        },

        reset: function () {
            this._.form.reset();
            return this;

        },

        _handleSubmit: function (evt) {
            if (this.trigger('submit').isDefaultPrevented()) {
                evt.preventDefault();
                return;

            }

            if (!this.validate()) {
                evt.preventDefault();

            }
        },

        _handleReset: function (evt) {
            if (evt.target !== this._.form) {
                return;

            }

            var elem, i;

            for (i = 0; i < this._.form.elements.length; i++) {
                elem = this._.form.elements.item(i);

                if (!DOM.hasClass(elem, 'no-reset')) {
                    if (elem.tagName.toLowerCase() === 'select' || elem.type === 'hidden') {
                        this.setValue(elem, DOM.getData(elem, 'defaultValue') || '');

                    } else if (elem.type === 'file') {
                        this.setValue(elem, null);

                    }
                }
            }

            this.trigger('reset');

        }
    });

    _context.register(Form, 'Form');

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays',
    DateTime: 'Utils.DateTime',
    FormData: 'Nette.Ajax.FormData'
});

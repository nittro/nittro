_context.invoke('Nette.Widgets', function(Dialog, Form, DOM, Arrays) {

    var FormDialog = _context.extend(Dialog, function(formLocator, options) {
        FormDialog.Super.call(this, options);

        this._.elms.form = this.getContent().getElementsByTagName('form').item(0);
        this._.formLocator = formLocator;
        this._.form = formLocator.getForm(this._.elms.form);

        DOM.addListener(this._.elms.form, 'submit', this._handleSubmit.bind(this));
        this.on('button', this._handleButton.bind(this));

    }, {
        STATIC: {
            defaults: {
                hideOnSuccess: true,
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

        destroy: function () {
            this._.formLocator.removeForm(this._.elms.form);
            FormDialog.Super.prototype.destroy.call(this);

        }
    });

    _context.register(FormDialog, 'FormDialog');

}, {
    Form: 'Nette.Forms.Form',
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays'
});

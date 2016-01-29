_context.invoke('Nette.Forms', function (Form, Vendor) {

    var Locator = _context.extend(function (flashMessages) {
        this._ = {
            flashMessages: flashMessages,
            registry: {},
            anonId: 0
        };

        Vendor.addError = this._handleError.bind(this);

    }, {
        getForm: function (id) {
            var elem;

            if (typeof id !== 'string') {
                elem = id;

                if (!elem.getAttribute('id')) {
                    elem.setAttribute('id', 'frm-anonymous' + (++this._.anonId));

                }

                id = elem.getAttribute('id');

            }

            if (!(id in this._.registry)) {
                this._.registry[id] = new Form(elem || id);
                this._.registry[id].on('error:default', this._showError.bind(this));

            }

            return this._.registry[id];

        },

        removeForm: function (id) {
            if (typeof id !== 'string') {
                id = id.getAttribute('id');

            }

            if (id in this._.registry) {
                delete this._.registry[id];

            }
        },

        _handleError: function (elem, msg) {
            var frm = this.getForm(elem.form);
            frm.trigger('error', {elem: elem, message: msg});

        },

        _showError: function (evt) {
            this._.flashMessages.add(evt.data.elem, 'warning', evt.data.message);

            if (evt.data.elem && typeof evt.data.elem.focus === 'function') {
                evt.data.elem.focus();

            }
        }
    });

    _context.register(Locator, 'Locator');

});

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

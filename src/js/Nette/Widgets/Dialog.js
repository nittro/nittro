_context.invoke('Nette.Widgets', function(DialogBase, DOM, Arrays) {

    var Dialog = _context.extend(DialogBase, function(options) {
        Dialog.Super.call(this, options);

        if (this._.options.text) {
            this._.options.html = '<p>' + this._.options.text + '</p>';

        }

        DOM.html(this._.elms.content, this._.options.html);

    }, {
        STATIC: {
            defaults: {
                html: null,
                text: null
            },
            setDefaults: function(options) {
                Arrays.mergeTree(Dialog.defaults, options);

            }
        }
    });

    _context.register(Dialog, 'Dialog');

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays'
});

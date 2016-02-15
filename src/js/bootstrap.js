_context.invoke(function(Nittro) {

    Nittro.Widgets.Dialog.setDefaults({
        layer: document.body
    });

    var di = new Nittro.DI.Context({
        params: {
            flashes: {
                layer: document.body
            },
            page: {
                whitelistLinks: false,
                whitelistForms: false,
                defaultTransition: '.transition-fade, .transition-slide'
            }
        },
        services: {
            'persistentStorage': 'Nittro.Application.Storage(null, true)',
            'sessionStorage': 'Nittro.Application.Storage(null, false)',
            'ajax': {
                factory: 'Nittro.Ajax.Service()',
                run: true,
                setup: [
                    '::addTransport(Nittro.Ajax.Transport.Native())'
                ]
            },
            'router': 'Nittro.Application.Routing.Router(@page)!',
            'page': {
                factory: 'Nittro.Page.Service(options: %page%)',
                run: true,
                setup: [
                    '::setFormLocator()'
                ]
            },
            'transitions': 'Nittro.Page.Transitions(300)',
            'formLocator': 'Nittro.Forms.Locator()',
            'flashMessages': 'Nittro.Widgets.FlashMessages(%flashes%)'
        },
        factories: {
            formDialog: 'Nittro.Widgets.FormDialog(@formLocator)'
        }
    });

    this.di = di;
    di.runServices();

});


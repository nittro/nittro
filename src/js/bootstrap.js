_context.invoke(function(Nittro) {

    Nittro.Widgets.DialogBase.setDefaults({
        layer: document.body
    });

    var di = new Nittro.DI.Context({
        params: {
            basePath: '',
            flashes: {
                layer: document.body
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
            'page': 'Nittro.Page.Service(@ajax, @transitions, @formLocator, @flashMessages)!',
            'transitions': 'Nittro.Page.Transitions(300)',
            'formLocator': 'Nittro.Forms.Locator(@flashMessages)',
            'flashMessages': 'Nittro.Widgets.FlashMessages(%flashes%)'
        },
        factories: {
            formDialog: 'Nittro.Widgets.FormDialog(@formLocator)'
        }
    });

    this.di = di;
    di.runServices();

});


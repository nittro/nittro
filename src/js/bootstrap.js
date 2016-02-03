window._stack || (window._stack = []);

_stack.push(function(Nette) {

    Nette.Widgets.DialogBase.setDefaults({
        layer: document.body
    });

    var di = new Nette.DI.Context({
        params: {
            basePath: '',
            flashes: {
                layer: document.body
            }
        },
        services: {
            'persistentStorage': 'Nette.Application.Storage(null, true)',
            'sessionStorage': 'Nette.Application.Storage(null, false)',
            'ajax': {
                factory: 'Nette.Ajax.Service()',
                run: true,
                setup: [
                    '::addTransport(Nette.Ajax.Transport.Native())'
                ]
            },
            'router': 'Nette.Application.Routing.Router()!',
            'page': 'Nette.Page.Service()!',
            'transitions': 'Nette.Page.Transitions(300)',
            'formLocator': 'Nette.Forms.Locator()',
            'flashMessages': 'Nette.Widgets.FlashMessages(options: %flashes%)'
        },
        factories: {
            formDialog: 'Nette.Widgets.FormDialog()'
        }
    });

    this.di = di;
    di.runServices();

});


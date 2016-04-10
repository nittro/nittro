_context.invoke(function(Nittro, DOM, Arrays) {

    var params = DOM.getById('nittro-params'),
        defaults = {
            basePath: '',
            page: {
                whitelistLinks: false,
                whitelistForms: false,
                defaultTransition: '.transition-auto'
            },
            flashes: {
                layer: document.body
            }
        };

    if (params && params.nodeName.toLowerCase() === 'script' && params.type === 'application/json') {
        params = Arrays.mergeTree(defaults, JSON.parse(params.textContent.trim()));

    } else {
        params = defaults;

    }

    Nittro.Widgets.Dialog.setDefaults({
        layer: document.body
    });

    var di = new Nittro.DI.Context({
        params: params,
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
            'router': 'Nittro.Application.Routing.Router(basePath: %basePath%)!',
            'page': {
                factory: 'Nittro.Page.Service(options: %page%)',
                run: true,
                setup: [
                    '::setFormLocator()'
                ]
            },
            'transitions': 'Nittro.Page.Transitions(300)',
            'formLocator': 'Nittro.Forms.Locator()',
            'flashMessages': 'Nittro.Widgets.FlashMessages(%flashes%)',
            'autoConfirm': 'Nittro.Widgets.AutoConfirm(options: null)!'
        },
        factories: {
            formDialog: 'Nittro.Widgets.FormDialog()',
            paginator: 'Nittro.Widgets.Paginator()',
            dropZone: 'Nittro.Widgets.DropZone::create()'
        }
    });

    this.di = di;
    di.runServices();

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays'
});

_context.invoke('Nette.Ajax', function (Request) {

    var Service = _context.extend('Nette.Object', function () {
        Service.Super.call(this);

        this._.transports = [];

    }, {
        addTransport: function (transport) {
            this._.transports.push(transport);
            return this;

        },

        'get': function (url, data) {
            return this.dispatch(this.createRequest(url, 'get', data));

        },

        post: function (url, data) {
            return this.dispatch(this.createRequest(url, 'post', data));

        },

        createRequest: function (url, method, data) {
            var request = new Request(url, method, data);
            this.trigger('request-created', {request: request});
            return request;

        },

        dispatch: function (request) {
            request.freeze();

            for (var i = 0; i < this._.transports.length; i++) {
                try {
                    return this._.transports[i].dispatch(request);

                } catch (e) { console.log(e); }
            }

            throw new Error('No transport is able to dispatch this request');

        }
    });

    _context.register(Service, 'Service');

});

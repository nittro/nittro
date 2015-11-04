_context.invoke('Nette.Ajax', function () {

    var Response = _context.extend(function(status, payload, headers) {
        this._ = {
            status: status,
            payload: payload,
            headers: headers
        };
    }, {
        getStatus: function () {
            return this._.status;

        },

        getPayload: function () {
            return this._.payload;

        },

        getHeader: function (name) {
            return this._.headers[name.toLowerCase()];

        },

        getAllHeaders: function () {
            return this._.headers;

        }
    });

    _context.register(Response, 'Response');

});

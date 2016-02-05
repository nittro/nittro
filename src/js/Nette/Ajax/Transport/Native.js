_context.invoke('Nette.Ajax.Transport', function (Response, FormData, Url) {

    var Native = _context.extend(function() {

    }, {
        STATIC: {
            createXhr: function () {
                if (window.XMLHttpRequest) {
                    return new XMLHttpRequest();

                } else if (window.ActiveXObject) {
                    try {
                        return new ActiveXObject('Msxml2.XMLHTTP');

                    } catch (e) {
                        return new ActiveXObject('Microsoft.XMLHTTP');

                    }
                }
            }
        },

        dispatch: function (request) {
            var xhr = Native.createXhr(),
                adv = this.checkSupport(xhr),
                self = this;

            var abort = function () {
                xhr.abort();

            };

            var cleanup = function () {
                request.off('abort', abort);

            };

            request.on('abort', abort);

            return new Promise(function (fulfill, reject) {
                if (request.isAborted()) {
                    cleanup();
                    reject(self._createError(xhr, {type: 'abort'}));

                }

                self._bindEvents(request, xhr, adv, cleanup, fulfill, reject);

                xhr.open(request.getMethod(), request.getUrl().toAbsolute(), true);

                var data = self._formatData(request, xhr);
                self._addHeaders(request, xhr);
                xhr.send(data);

            });
        },

        checkSupport: function (xhr) {
            var adv;

            if (!(adv = 'addEventListener' in xhr) && !('onreadystatechange' in xhr)) {
                throw new Error('Unsupported XHR implementation');

            }

            return adv;

        },

        _bindEvents: function (request, xhr, adv, cleanup, fulfill, reject) {
            var self = this;

            var onLoad = function (evt) {
                cleanup();

                if (xhr.status === 200) {
                    var response = self._createResponse(xhr);
                    request.trigger('success', response);
                    fulfill(response);

                } else {
                    var err = self._createError(xhr, evt);
                    request.trigger('error', err);
                    reject(err);

                }
            };

            var onError = function (evt) {
                cleanup();
                var err = self._createError(xhr, evt);
                request.trigger('error', err);
                reject(err);

            };

            var onProgress = function (evt) {
                request.trigger('progress', {
                    lengthComputable: evt.lengthComputable,
                    loaded: evt.loaded,
                    total: evt.total
                });
            };

            if (adv) {
                xhr.addEventListener('load', onLoad, false);
                xhr.addEventListener('error', onError, false);
                xhr.addEventListener('abort', onError, false);

                if ('upload' in xhr) {
                    xhr.upload.addEventListener('progress', onProgress, false);

                }
            } else {
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            onLoad();

                        } else {
                            onError();

                        }
                    }
                };

                if ('ontimeout' in xhr) {
                    xhr.ontimeout = onError;

                }

                if ('onerror' in xhr) {
                    xhr.onerror = onError;

                }

                if ('onload' in xhr) {
                    xhr.onload = onLoad;

                }
            }
        },

        _addHeaders: function (request, xhr) {
            var headers = request.getHeaders(),
                h;

            for (h in headers) {
                if (headers.hasOwnProperty(h)) {
                    xhr.setRequestHeader(h, headers[h]);

                }
            }

            if (!headers.hasOwnProperty('X-Requested-With')) {
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

            }
        },

        _formatData: function (request, xhr) {
            var data = request.getData();

            if (data instanceof FormData) {
                data = data.exportData(request.isGet() || request.isMethod('HEAD'));

                if (!(data instanceof window.FormData)) {
                    data = Url.buildQuery(data, true);
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

                }
            } else {
                data = Url.buildQuery(data);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

            }

            return data;

        },

        _createResponse: function (xhr) {
            var payload,
                headers = {};

            (xhr.getAllResponseHeaders() || '').trim().split(/\r\n/g).forEach(function(header) {
                if (header && !header.match(/^\s+$/)) {
                    header = header.match(/^\s*([^:]+):\s*(.+)\s*$/);
                    headers[header[1].toLowerCase()] = header[2];

                }
            });

            if (headers['content-type'] === 'application/json') {
                payload = JSON.parse(xhr.responseText || '{}');

            } else {
                payload = xhr.responseText;

            }

            return new Response(xhr.status, payload, headers);

        },

        _createError: function (xhr, evt) {
            var response = null;

            if (xhr.readyState === 4 && xhr.status !== 0) {
                response = this._createResponse(xhr);

            }

            if (evt && evt.type === 'abort') {
                return {
                    type: 'abort',
                    status: null,
                    response: response
                };
            } else if (xhr.status === 0) {
                return {
                    type: 'connection',
                    status: null,
                    response: response
                };
            } else if (xhr.status !== 200) {
                return {
                    type: 'response',
                    status: xhr.status,
                    response: response
                };
            }

            return {
                type: 'unknown',
                status: xhr.status,
                response: response
            };
        }
    });

    _context.register(Native, 'Native');

}, {
    Url: 'Utils.Url',
    Response: 'Nette.Ajax.Response',
    FormData: 'Nette.Ajax.FormData'
});

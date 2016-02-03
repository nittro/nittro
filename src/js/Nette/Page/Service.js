_context.invoke('Nette.Page', function (DOM, Url, Snippet) {

    var Service = _context.extend('Nette.Object', function (ajax, transitions, formLocator, flashMessages) {
        Service.Super.call(this);

        this._.ajax = ajax;
        this._.transitions = transitions;
        this._.formLocator = formLocator;
        this._.flashMessages = flashMessages;
        this._.snippets = {};
        this._.request = null;
        this._.transitioning = null;
        this._.setup = false;
        this._.currentPhase = Snippet.INACTIVE;
        this._.currentUrl = Url.fromCurrent();

        DOM.addListener(document, 'click', this._handleClick.bind(this));
        DOM.addListener(document, 'submit', this._handleSubmit.bind(this));
        DOM.addListener(window, 'popstate', this._handleState.bind(this));
        this.on('error:default', this._showError.bind(this));

        this._checkReady();

    }, {
        open: function (url, method, data) {
            return this._createRequest(url, method, data);

        },

        openLink: function (link, evt) {
            return this._createRequest(link.href, 'get', null, evt, link);

        },

        sendForm: function (form, evt) {
            var frm = this._.formLocator.getForm(form),
                data = frm.serialize();

            return this._createRequest(form.action, form.method, data, evt, form)
                .then(function () {
                    frm.reset();

                });
        },

        _handleState: function () {
            var url = Url.fromCurrent(),
                request;

            if (url.compare(this._.currentUrl) <= Url.PART.HASH) {
                return;

            }

            this._.currentUrl = url;
            request = this._.ajax.createRequest(url);

            try {
                this._dispatchRequest(request);

            } catch (e) {
                document.location.href = url.toAbsolute();

            }
        },

        _pushState: function (payload, url) {
            if (payload.postGet) {
                url = payload.url;

            }

            this._.currentUrl = Url.from(url);
            window.history.pushState(null, payload.title || document.title, this._.currentUrl.toAbsolute());

        },

        _checkReady: function () {
            if (document.readyState === 'loading') {
                DOM.addListener(document, 'readystatechange', this._checkReady.bind(this));
                return;

            }

            if (!this._.setup) {
                this._.setup = true;

                window.setTimeout(function () {
                    this._setup();
                    this._showHtmlFlashes();
                    this.trigger('update');

                }.bind(this), 1);
            }
        },

        _handleClick: function (evt) {
            if (evt.defaultPrevented || evt.ctrlKey || evt.shiftKey || evt.altKey || evt.metaKey) {
                return;

            }

            var btn = DOM.closest(evt.target, 'button') || DOM.closest(evt.target, 'input'),
                frm;

            if (btn && btn.type === 'submit') {
                if (btn.form && DOM.hasClass(btn.form, 'ajax')) {
                    frm = this._.formLocator.getForm(btn.form);
                    frm.setSubmittedBy(btn.name || null);

                }

                return;

            }

            var link = DOM.closest(evt.target, 'a', 'ajax'),
                url;

            if (!link || !(url = Url.from(link.href)).isLocal() || url.compare() === Url.PART.HASH) {
                return;

            }

            this.openLink(link, evt);

        },

        _handleSubmit: function (evt) {
            if (evt.defaultPrevented) {
                return;

            }

            if (!(evt.target instanceof HTMLFormElement) || !DOM.hasClass(evt.target, 'ajax')) {
                return;

            }

            this.sendForm(evt.target, evt);

        },

        _createRequest: function (url, method, data, evt, context) {
            if (this._.request) {
                this._.request.abort();

            }

            var request = this._.ajax.createRequest(url, method, data);

            try {
                var p = this._dispatchRequest(request, context, true);
                evt && evt.preventDefault();
                return p;

            } catch (e) {
                return Promise.reject(e);

            }
        },

        _dispatchRequest: function (request, elem, pushState) {
            this._.request = request;

            var xhr = this._.ajax.dispatch(request); // may throw exception

            var transitionTargets,
                removeTarget = null,
                transition = null;

            if (elem) {
                transitionTargets = this._getTransitionTargets(elem);
                removeTarget = this._getRemoveTarget(elem);

                if (removeTarget) {
                    DOM.addClass(removeTarget, 'transition-remove');
                    transitionTargets.push(removeTarget);

                }

                transition = this._.transitions.transitionOut(transitionTargets);
                this._.transitioning = transitionTargets;

            }

            var p = Promise.all([xhr, transition, removeTarget, pushState || false]);
            p.then(this._handleResponse.bind(this), this._handleError.bind(this));
            return p;

        },

        _handleResponse: function (queue) {
            if (!this._.request) {
                this._cleanup();
                return;

            }

            var response = queue[0],
                transitionTargets = queue[1] || this._.transitioning || [],
                removeTarget = queue[2],
                pushState = queue[3],
                payload = response.getPayload(),
                data,
                setup = {},
                teardown = {},
                dynamic = {},
                id;

            if (typeof payload !== 'object' || !payload) {
                this._cleanup();
                return;

            }

            data = payload && 'snippets' in payload ? payload.snippets : {};

            if (payload && 'flashes' in payload) {
                this._showFlashes(payload.flashes);

            }

            if (payload && 'redirect' in payload) {
                if (payload.allowAjax !== false && Url.from(payload.redirect).isLocal()) {
                    this._dispatchRequest(this._.ajax.createRequest(payload.redirect), null, pushState);

                } else {
                    document.location.href = payload.redirect;

                }

                return;

            } else if (pushState) {
                this._pushState(payload || {}, this._.request.getUrl());

            }

            this._.request = this._.transitioning = null;

            if (removeTarget) {
                this._cleanupChildSnippets(removeTarget, teardown);
                this._cleanupForms(removeTarget);

                if (this.isSnippet(removeTarget)) {
                    teardown[removeTarget.id] = true;

                }
            }

            for (id in data) {
                if (data.hasOwnProperty(id)) {
                    this._prepareSnippet(id, setup, teardown, dynamic);

                }
            }

            this._teardown(teardown);

            if (removeTarget) {
                transitionTargets.splice(transitionTargets.indexOf(removeTarget), 1);
                removeTarget.parentNode.removeChild(removeTarget);
                removeTarget = null;

            }

            this._setupDynamic(dynamic, data, setup, transitionTargets);
            this._setup(setup, data);
            this._showHtmlFlashes();

            this.trigger('update', payload);

            this._.transitions.transitionIn(transitionTargets)
                .then(function () {
                    this._cleanupDynamic(dynamic);

                }.bind(this));

        },

        _cleanup: function () {
            this._.request = null;

            if (this._.transitioning) {
                this._.transitions.transitionIn(this._.transitioning);
                this._.transitioning = null;

            }
        },

        _showFlashes: function (flashes) {
            var id, i;

            for (id in flashes) {
                if (flashes.hasOwnProperty(id) && flashes[id]) {
                    for (i = 0; i < flashes[id].length; i++) {
                        this._.flashMessages.add(null, flashes[id][i].type, flashes[id][i].message);

                    }
                }
            }
        },

        _showHtmlFlashes: function () {
            var elms = DOM.getByClassName('flashes-src'),
                i, n, data;

            for (i = 0, n = elms.length; i < n; i++) {
                data = JSON.parse(elms[i].textContent.trim());
                elms[i].parentNode.removeChild(elms[i]);
                this._showFlashes(data);

            }
        },

        _handleError: function (err) {
            this._cleanup();
            this.trigger('error', err);

        },

        _showError: function (evt) {
            this._.flashMessages.add(null, 'error', 'There was an error processing your request. Please try again later.');

        },

        getSnippet: function (id) {
            if (!this._.snippets[id]) {
                this._.snippets[id] = new Snippet(id, this._.currentPhase);

            }

            return this._.snippets[id];

        },

        isSnippet: function (elem) {
            return (typeof elem === 'string' ? elem : elem.id) in this._.snippets;

        },

        _prepareSnippet: function (id, setup, teardown, dynamic) {
            if (this._.snippets[id] && this._.snippets[id].getState() === Snippet.RUN_SETUP) {
                teardown[id] = false;

            }

            var snippet = DOM.getById(id);

            if (snippet) {
                this._cleanupChildSnippets(snippet, teardown);
                this._cleanupForms(snippet);
                setup[id] = true;

            } else {
                dynamic[id] = true;

            }
        },

        _cleanupChildSnippets: function (elem, teardown) {
            for (var i in this._.snippets) {
                if (this._.snippets.hasOwnProperty(i) && this._.snippets[i].getState() === Snippet.RUN_SETUP && this._.snippets[i].getElement() !== elem && DOM.contains(elem, this._.snippets[i].getElement())) {
                    teardown[i] = true;

                }
            }
        },

        _cleanupForms: function (snippet) {
            if (snippet.tagName.toLowerCase() === 'form') {
                this._.formLocator.removeForm(snippet);

            } else {
                var forms = snippet.getElementsByTagName('form'),
                    i;

                for (i = 0; i < forms.length; i++) {
                    this._.formLocator.removeForm(forms.item(i));

                }
            }
        },

        _teardown: function (snippets) {
            this._setSnippetsState(snippets, Snippet.PREPARE_TEARDOWN);
            this._setSnippetsState(snippets, Snippet.RUN_TEARDOWN);
            this._setSnippetsState(snippets, Snippet.INACTIVE);

            this.trigger('teardown');

            for (var id in snippets) {
                if (snippets.hasOwnProperty(id) && snippets[id]) {
                    delete this._.snippets[id];

                }
            }
        },

        _setup: function (snippets, data) {
            if (data) {
                for (var id in snippets) {
                    if (snippets.hasOwnProperty(id) && snippets[id]) {
                        DOM.html(id, data[id] || '');

                    }
                }
            }

            this.trigger('setup');

            this._setSnippetsState(this._.snippets, Snippet.PREPARE_SETUP);
            this._setSnippetsState(this._.snippets, Snippet.RUN_SETUP);

        },

        _setupDynamic: function (snippets, data, setup, transitionTargets) {
            var id, snippet;

            for (id in snippets) {
                if (snippets.hasOwnProperty(id)) {
                    if (snippet = this._prepareDynamic(id, data[id])) {
                        transitionTargets.push(snippet);
                        setup[id] = false;

                    }
                }
            }
        },

        _cleanupDynamic: function (snippets) {
            for (var id in snippets) {
                if (snippets.hasOwnProperty(id)) {
                    DOM.removeClass(DOM.getById(id), 'transition-add');

                }
            }
        },

        _setSnippetsState: function (snippets, state) {
            this._.currentPhase = state;

            for (var id in snippets) {
                if (snippets.hasOwnProperty(id)) {
                    this.getSnippet(id).setState(state);

                }
            }
        },

        _prepareDynamic: function (id, data) {
            var container = null;

            DOM.getByClassName('snippet-container').some(function (elem) {
                var pattern = new RegExp('^' + DOM.getData(elem, 'dynamicMask') + '$');

                if (pattern.test(id)) {
                    container = elem;
                    return true;

                }
            });

            if (!container) {
                return null;

            }

            var elem = (DOM.getData(container, 'dynamicElement') || 'div').split(/\./g),
                insertMode = DOM.getData(container, 'dynamicInsertMode') || 'append';

            elem[0] = DOM.create(elem[0], {
                id: id,
                'class': 'transition-add'
            });

            if (elem.length > 1) {
                DOM.addClass.apply(null, elem);

            }

            elem = elem[0];
            DOM.html(elem, data);

            switch (insertMode) {
                case 'append':
                    container.appendChild(elem);
                    break;

                case 'prepend':
                    if (container.hasChildNodes()) {
                        container.insertBefore(elem, container.firstChild);

                    } else {
                        container.appendChild(elem);

                    }
                    break;

                default:
                    if (insertMode.match(/^sorted:/i)) {
                        this._insertSortedSnippet(container, elem, insertMode.substr(7));

                    } else {
                        throw new TypeError('Invalid insert mode for dynamic snippet container ' + container.getAttribute('id'));

                    }
                    break;
            }

            return elem;

        },

        _insertSortedSnippet: function(container, snippet, descriptor) {
            var search = [], children = DOM.getChildren(container),
                x, d, s, a, o, e, val, i, c = 0, n = children.length, f;

            if (!n) {
                container.appendChild(snippet);
                return;

            }

            val = function(e, s, a, d) {
                var n = e.getElementsByClassName(s);

                if (!n.length) {
                    return null;

                } else if (a) {
                    return n[0].getAttribute(a);

                } else if (d) {
                    return DOM.getData(n[0], d);

                } else {
                    return n[0].textContent;

                }
            };

            descriptor = descriptor.trim().split(/\s*;\s*/);

            while (descriptor.length) {
                x = descriptor.shift();

                if (s = x.match(/^(.+?)(?:\[(.+?)\])?(?:<(.+?)>)?(?:\s+(.+?))?$/i)) {
                    o = s[4] || null;
                    d = s[3] || null;
                    a = s[2] || null;
                    s = s[1];

                    if (s.match(/^[^.]|[\s#\[>+:]/)) {
                        throw new TypeError('Invalid selector for sorted insert mode in container #' + container.getAttribute('id'));

                    }

                    search.push({
                        sel: s.substr(1),
                        attr: a,
                        data: d,
                        asc: o ? o.match(/^[1tay]/i) : true,
                        value: val(snippet, s.substr(1), a, d)
                    });
                }
            }

            for (s = 0; s < search.length; s++) {
                x = search[s];
                f = false;

                for (i = c; i < n; i++) {
                    e = children[i];
                    d = val(e, x.sel, x.attr, x.data);

                    if (x.asc) {
                        if (x.value > d) {
                            c = i;

                        } else if (x.value < d) {
                            n = i;
                            break;

                        } else if (!f) {
                            c = i;
                            f = true;

                        }
                    } else {
                        if (x.value < d) {
                            c = i;

                        } else if (x.value > d) {
                            n = i;
                            break;

                        } else if (!f) {
                            c = i;
                            f = true;

                        }
                    }
                }

                if (n === c) {
                    container.insertBefore(snippet, children[n]);
                    return;

                } else if (n === c + 1 && !f) {
                    if (c >= children.length - 1) {
                        container.appendChild(snippet);

                    } else {
                        container.insertBefore(snippet, children[c + 1]);

                    }
                    return;

                }
            }

            if (x.asc) {
                if (n >= children.length) {
                    container.appendChild(snippet);

                } else {
                    container.insertBefore(snippet, children[n]);

                }
            } else {
                container.insertBefore(snippet, children[c]);

            }
        },

        _getTransitionTargets: function (elem) {
            var sel = DOM.getData(elem, 'transition'),
                elms = [];

            if (!sel) {
                return elms;

            }

            sel.trim().split(/\s*,\s*/g).forEach(function (sel) {
                if (sel.match(/^[^.#]|[\s\[>+:]/)) {
                    throw new TypeError('Invalid transition selector, only single-level .class and #id are allowed');

                }

                if (sel.charAt(0) === '#') {
                    sel = DOM.getById(sel.substr(1));
                    sel && elms.push(sel);

                } else {
                    var matching = DOM.getByClassName(sel.substr(1));
                    elms.push.apply(elms, matching);

                }
            });

            return elms;

        },

        _getRemoveTarget: function (elem) {
            var id = DOM.getData(elem, 'dynamicRemove');
            return id ? DOM.getById(id) : null;

        }
    });

    _context.register(Service, 'Service');

}, {
    DOM: 'Utils.DOM',
    Url: 'Utils.Url'
});

_context.invoke('Utils', function (Arrays, Strings, undefined) {

    var map = function (args, callback) {
        args = Arrays.createFrom(args);

        if (Arrays.isArray(args[0])) {
            for (var i = 0, elems = args[0], ret = []; i < elems.length; i++) {
                args[0] = getElem(elems[i]);

                if (args[0]) {
                    ret.push(callback.apply(null, args));

                } else {
                    ret.push(args[0]);

                }
            }

            return ret;

        } else {
            args[0] = getElem(args[0]);

            if (args[0]) {
                return callback.apply(null, args);

            } else {
                return args[0];

            }
        }
    };

    var getElem = function (elem) {
        Arrays.isArray(elem) && (elem = elem[0]);
        return typeof elem === 'string' ? DOM.getById(elem) : elem;

    };

    var getPrefixed = function (elem, prop) {
        if (Arrays.isArray(elem)) {
            elem = elem[0];

        }

        if (prop in elem.style) {
            return prop;

        }


        var p = prop.charAt(0).toUpperCase() + prop.substr(1),
            variants = ['webkit' + p, 'moz' + p, 'o' + p, 'ms' + p],
            i;

        for (i = 0; i < variants.length; i++) {
            if (variants[i] in elem.style) {
                return variants[i];

            }
        }

        return prop;

    };

    var DOM = {
        getByClassName: function (className) {
            return Arrays.createFrom(document.getElementsByClassName(className));

        },

        getById: function (id) {
            return document.getElementById(id);

        },

        getChildren: function (elem) {
            return Arrays.createFrom(elem.childNodes).filter(function (node) {
                return node.nodeType === 1;

            });
        },

        closest: function (elem, nodeName, className) {
            return map(arguments, function (elem, nodeName, className) {
                while (elem) {
                    if (elem.nodeType === 1 && (!nodeName || elem.nodeName.toLowerCase() === nodeName) && (!className || DOM.hasClass(elem, className))) {
                        return elem;

                    }

                    elem = elem.parentNode;

                }

                return null;
            });
        },

        create: function (elem, attrs) {
            elem = document.createElement(elem);

            if (attrs) {
                DOM.setAttributes(elem, attrs);

            }

            return elem;

        },

        createFromHtml: function (html) {
            var container = DOM.create('div');
            DOM.html(container, html);
            html = DOM.getChildren(container);

            html.forEach(function (e) {
                container.removeChild(e);
            });

            container = null;

            return html.length > 1 ? html : html[0];

        },

        setAttributes: function (elem, attrs) {
            return map([elem], function (elem) {
                for (var a in attrs) {
                    if (attrs.hasOwnProperty(a)) {
                        elem.setAttribute(a, attrs[a]);

                    }
                }

                return elem;

            });
        },

        setStyle: function (elem, prop, value, prefix) {
            if (prop && typeof prop === 'object') {
                prefix = value;
                value = prop;

                for (prop in value) {
                    if (value.hasOwnProperty(prop)) {
                        DOM.setStyle(elem, prop, value[prop], prefix);

                    }
                }

                return elem;

            }

            if (prefix !== false) {
                prop = getPrefixed(elem, prop);

            }

            return map([elem], function (elem) {
                elem.style[prop] = value;

            });
        },

        html: function (elem, html) {
            return map([elem], function (elem) {
                elem.innerHTML = html;

                Arrays.createFrom(elem.getElementsByTagName('script')).forEach(function (elem) {
                    if (!elem.type || elem.type.toLowerCase() === 'text/javascript') {
                        var load = elem.hasAttribute('src'),
                            src = load ? elem.src : (elem.text || elem.textContent || elem.innerHTML || ''),
                            script = DOM.create('script', {type: 'text/javascript'});

                        if (load) {
                            script.src = src;

                        } else {
                            try {
                                script.appendChild(document.createTextNode(src));

                            } catch (e) {
                                script.text = src;

                            }
                        }

                        elem.parentNode.insertBefore(script, elem);
                        elem.parentNode.removeChild(elem);

                    }
                });
            });
        },

        contains: null,
        addListener: null,
        removeListener: null,
        addClass: null,
        removeClass: null,
        toggleClass: null,
        hasClass: null,
        getData: null,
        setData: null
    };



    var rnative = /^[^{]+\{\s*\[native \w/;

    if (rnative.test(document.documentElement.compareDocumentPosition) || rnative.test(document.documentElement.contains)) {
        DOM.contains = function( a, b ) {
            var adown = a.nodeType === 9 ? a.documentElement : a,
                bup = b && b.parentNode;
            return a === bup || !!( bup && bup.nodeType === 1 && (
                    adown.contains
                        ? adown.contains( bup )
                        : a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
                ));
        };
    } else {
        DOM.contains = function( a, b ) {
            if ( b ) {
                while ( (b = b.parentNode) ) {
                    if ( b === a ) {
                        return true;
                    }
                }
            }
            return false;
        };
    }


    if ('addEventListener' in document) {
        DOM.addListener = function (elem, evt, listener) {
            return map(arguments, function (elem, evt, listener) {
                elem.addEventListener(evt, listener, false);
                return elem;

            });
        };

        DOM.removeListener = function (elem, evt, listener) {
            return map(arguments, function (elem, evt, listener) {
                elem.removeEventListener(evt, listener, false);
                return elem;

            });
        };
    } else if ('attachEvent' in document) {
        DOM.addListener = function (elem, evt, listener) {
            return map(arguments, function (elem, evt, listener) {
                elem.attachEvent('on' + evt, listener);
                return elem;

            });
        };

        DOM.removeListener = function (elem, evt, listener) {
            return map(arguments, function (elem, evt, listener) {
                elem.detachEvent('on' + evt, listener);
                return elem;

            });
        };
    } else {
        throw new Error('Unsupported browser');

    }


    var testElem = DOM.create('span'),
        prepare = function(args, asStr) {
            args = Arrays.createFrom(args, 1).join(' ').trim();
            return asStr ? args : args.split(/\s+/g);
        };

    if ('classList' in testElem) {
        testElem.classList.add('c1', 'c2');

        if (testElem.classList.contains('c2')) {
            DOM.addClass = function (elem, classes) {
                classes = prepare(arguments);

                return map([elem], function (elem) {
                    elem.classList.add.apply(elem.classList, classes);
                    return elem;

                });
            };

            DOM.removeClass = function (elem, classes) {
                classes = prepare(arguments);

                return map([elem], function (elem) {
                    elem.classList.remove.apply(elem.classList, classes);
                    return elem;

                });
            };
        } else {
            DOM.addClass = function (elem, classes) {
                classes = prepare(arguments);

                return map([elem], function (elem) {
                    classes.forEach(function (c) {
                        elem.classList.add(c);

                    });

                    return elem;

                });
            };

            DOM.removeClass = function (elem, classes) {
                classes = prepare(arguments);

                return map([elem], function (elem) {
                    classes.forEach(function (c) {
                        elem.classList.remove(c);

                    });

                    return elem;

                });
            };
        }

        testElem.classList.toggle('c1', true);

        if (testElem.classList.contains('c1')) {
            DOM.toggleClass = function (elem, classes, value) {
                classes = classes.trim().split(/\s+/g);

                return map([elem], function (elem) {
                    if (value === undefined) {
                        classes.forEach(function (c) {
                            elem.classList.toggle(c);

                        });
                    } else {
                        classes.forEach(function (c) {
                            elem.classList.toggle(c, !!value);

                        });
                    }

                    return elem;

                });
            };
        } else {
            DOM.toggleClass = function (elem, classes, value) {
                classes = classes.trim().split(/\s+/g);

                return map([elem], function (elem) {
                    classes.forEach(function (c) {
                        if (value === undefined || value === elem.classList.contains(c)) {
                            elem.classList.toggle(c);

                        }
                    });

                    return elem;

                });
            };
        }

        DOM.hasClass = function (elem, classes) {
            elem = getElem(elem);
            classes = prepare(arguments);

            for (var i = 0; i < classes.length; i++) {
                if (!elem.classList.contains(classes[i])) {
                    return false;

                }
            }

            return true;

        };
    } else {
        DOM.addClass = function (elem, classes) {
            classes = prepare(arguments, true);

            return map([elem], function (elem) {
                elem.className += (elem.className ? ' ' : '') + classes;
                return elem;

            });
        };

        DOM.removeClass = function (elem, classes) {
            classes = prepare(arguments).map(Strings.escapeRegex);

            return map([elem], function (elem) {
                if (!elem.className) return elem;

                elem.className = elem.className.replace(new RegExp('(?:^|\s+)(?:' + classes.join('|') + '(?:\s+|$)', 'g'), ' ').trim();
                return elem;

            });
        };

        DOM.toggleClass = function (elem, classes, value) {
            classes = classes.trim().split(/\s+/g);

            return map([elem], function (elem) {
                var current = (elem.className || '').trim().split(/\s+/g);

                classes.forEach(function (c) {
                    var i = current.indexOf(c),
                        has = i > -1;

                    if (value !== false && !has) {
                        current.push(c);

                    } else if (value !== true && has) {
                        current.splice(i, 1);

                    }
                });

                elem.className = current.join(' ');
                return elem;

            });
        };

        DOM.hasClass = function (elem, classes) {
            elem = getElem(elem);
            if (!elem.className) return false;
            classes = prepare(arguments);

            var current = elem.className.trim().split(/\s+/g);

            for (var i = 0; i < classes.length; i++) {
                if (current.indexOf(classes[i]) === -1) {
                    return false;

                }
            }

            return true;

        };
    }

    var reint = /^-?(?:(?:0|[1-9]\d*)|[1-9]\d*e(?:\+|-)\d+)$/i,
        refloat = /^-?(?:(?:0|[1-9]\d*)\.\d+|[1-9]\d*\.\d+e(?:\+|-)\d+)$/i,
        rebool = /^(?:true|false)$/i,
        renull = /^null$/i;

    var parseData = function (value) {
        switch (true) {
            case reint.test(value): return parseInt(value);
            case refloat.test(value): return parseFloat(value);
            case rebool.test(value): return value.toLowerCase() === 'true';
            case renull.test(value): return null;
            default:
                try {
                    return JSON.parse(value);

                } catch (e) {
                    return value;

                }
        }
    };

    testElem.setAttribute('data-test-prop', 'test-value');

    if ('dataset' in testElem && 'testProp' in testElem.dataset) {
        DOM.getData = function (elem, key) {
            return parseData(getElem(elem).dataset[key]);

        };

        DOM.setData = function (elem, key, value) {
            return map([elem], function (elem) {
                elem.dataset[key] = JSON.stringify(value);
                return elem;

            });
        };
    } else {
        var key2attr = function (key) {
                return 'data-' + key.replace(/[A-Z]/g, function (m) {
                    return '-' + m[0].toLowerCase();
                });
            };

        DOM.getData = function (elem, key) {
            return parseData(getElem(elem).getAttribute(key2attr(key)));

        };

        DOM.setData = function (elem, key, value) {
            return map([elem], function (elem) {
                elem.setAttribute(key2attr(key), JSON.stringify(value));
                return elem;

            });
        };
    }

    testElem = null;

    _context.register(DOM, 'DOM');

});

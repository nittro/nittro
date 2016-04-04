!function(){function a(a){global.setImmediate?setImmediate(a):global.importScripts?setTimeout(a):(c++,d[c]=a,global.postMessage(c,"*"))}function b(c){"use strict";function d(a,b,c,d){if(2==i)return d();if("object"!=typeof j&&"function"!=typeof j||"function"!=typeof a)d();else try{var e=0;a.call(j,function(a){e++||(j=a,b())},function(a){e++||(j=a,c())})}catch(f){j=f,c()}}function e(){var a;try{a=j&&j.then}catch(b){return j=b,i=2,e()}d(a,function(){i=1,e()},function(){i=2,e()},function(){try{1==i&&"function"==typeof f?j=f(j):2==i&&"function"==typeof g&&(j=g(j),i=1)}catch(b){return j=b,l()}j==h?(j=TypeError(),l()):d(a,function(){l(3)},l,function(){l(1==i&&3)})})}if("function"!=typeof c&&void 0!=c)throw TypeError();if("object"!=typeof this||this&&this.then)throw TypeError();var f,g,h=this,i=0,j=0,k=[];h.promise=h,h.resolve=function(b){return f=h.fn,g=h.er,i||(j=b,i=1,a(e)),h},h.reject=function(b){return f=h.fn,g=h.er,i||(j=b,i=2,a(e)),h},h._d=1,h.then=function(a,c){if(1!=this._d)throw TypeError();var d=new b;return d.fn=a,d.er=c,3==i?d.resolve(j):4==i?d.reject(j):k.push(d),d},h["catch"]=function(a){return h.then(null,a)};var l=function(a){i=a||4,k.map(function(a){3==i&&a.resolve(j)||a.reject(j)})};try{"function"==typeof c&&c(h.resolve,h.reject)}catch(m){h.reject(m)}return h}global=this;var c=1,d={},e=!1;global.setImmediate||global.addEventListener("message",function(b){if(b.source==global)if(e)a(d[b.data]);else{e=!0;try{d[b.data]()}catch(b){}delete d[b.data],e=!1}}),b.resolve=function(a){if(1!=this._d)throw TypeError();return a instanceof b?a:new b(function(b){b(a)})},b.reject=function(a){if(1!=this._d)throw TypeError();return new b(function(b,c){c(a)})},b.all=function(a){function c(b,e){if(e)return d.resolve(e);if(b)return d.reject(b);var f=a.reduce(function(a,b){return b&&b.then?a+1:a},0);0==f&&d.resolve(a),a.map(function(b,d){b&&b.then&&b.then(function(b){return a[d]=b,c(),b},c)})}if(1!=this._d)throw TypeError();if(!(a instanceof Array))return b.reject(TypeError());var d=new b;return c(),d},b.race=function(a){function c(b,e){if(e)return d.resolve(e);if(b)return d.reject(b);var f=a.reduce(function(a,b){return b&&b.then?a+1:a},0);0==f&&d.resolve(a),a.map(function(a,b){a&&a.then&&a.then(function(a){c(null,a)},c)})}if(1!=this._d)throw TypeError();if(!(a instanceof Array))return b.reject(TypeError());if(0==a.length)return new b;var d=new b;return c(),d},b._d=1,"undefined"!=typeof module?module.exports=b:global.Promise=global.Promise||b}();;
/**
 * NetteForms - simple form validation.
 *
 * This file is part of the Nette Framework (https://nette.org)
 * Copyright (c) 2004 David Grudl (https://davidgrudl.com)
 */

(function(global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return factory(global);
		});
	} else if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = factory(global);
	} else {
		global.Nette = factory(global);

	}

}(typeof window !== 'undefined' ? window : this, function(window) {

'use strict';

var Nette = {};

/**
 * Attaches a handler to an event for the element.
 */
Nette.addEvent = function(element, on, callback) {
	var original = element['on' + on];
	element['on' + on] = function() {
		if (typeof original === 'function' && original.apply(element, arguments) === false) {
			return false;
		}
		return callback.apply(element, arguments);
	};
};


/**
 * Returns the value of form element.
 */
Nette.getValue = function(elem) {
	var i;
	if (!elem) {
		return null;

	} else if (!elem.tagName) { // RadioNodeList, HTMLCollection, array
		return elem[0] ? Nette.getValue(elem[0]) : null;

	} else if (elem.type === 'radio') {
		var elements = elem.form.elements; // prevents problem with name 'item' or 'namedItem'
		for (i = 0; i < elements.length; i++) {
			if (elements[i].name === elem.name && elements[i].checked) {
				return elements[i].value;
			}
		}
		return null;

	} else if (elem.type === 'file') {
		return elem.files || elem.value;

	} else if (elem.tagName.toLowerCase() === 'select') {
		var index = elem.selectedIndex,
			options = elem.options,
			values = [];

		if (elem.type === 'select-one') {
			return index < 0 ? null : options[index].value;
		}

		for (i = 0; i < options.length; i++) {
			if (options[i].selected) {
				values.push(options[i].value);
			}
		}
		return values;

	} else if (elem.name && elem.name.match(/\[\]$/)) { // multiple elements []
		var elements = elem.form.elements[elem.name].tagName ? [elem] : elem.form.elements[elem.name],
			values = [];

		for (i = 0; i < elements.length; i++) {
			if (elements[i].type !== 'checkbox' || elements[i].checked) {
				values.push(elements[i].value);
			}
		}
		return values;

	} else if (elem.type === 'checkbox') {
		return elem.checked;

	} else if (elem.tagName.toLowerCase() === 'textarea') {
		return elem.value.replace("\r", '');

	} else {
		return elem.value.replace("\r", '').replace(/^\s+|\s+$/g, '');
	}
};


/**
 * Returns the effective value of form element.
 */
Nette.getEffectiveValue = function(elem) {
	var val = Nette.getValue(elem);
	if (elem.getAttribute) {
		if (val === elem.getAttribute('data-nette-empty-value')) {
			val = '';
		}
	}
	return val;
};


/**
 * Validates form element against given rules.
 */
Nette.validateControl = function(elem, rules, onlyCheck, value) {
	elem = elem.tagName ? elem : elem[0]; // RadioNodeList
	rules = rules || Nette.parseJSON(elem.getAttribute('data-nette-rules'));
	value = value === undefined ? {value: Nette.getEffectiveValue(elem)} : value;

	for (var id = 0, len = rules.length; id < len; id++) {
		var rule = rules[id],
			op = rule.op.match(/(~)?([^?]+)/),
			curElem = rule.control ? elem.form.elements.namedItem(rule.control) : elem;

		if (!curElem) {
			continue;
		}

		rule.neg = op[1];
		rule.op = op[2];
		rule.condition = !!rule.rules;
		curElem = curElem.tagName ? curElem : curElem[0]; // RadioNodeList

		var curValue = elem === curElem ? value : {value: Nette.getEffectiveValue(curElem)},
			success = Nette.validateRule(curElem, rule.op, rule.arg, curValue);

		if (success === null) {
			continue;
		} else if (rule.neg) {
			success = !success;
		}

		if (rule.condition && success) {
			if (!Nette.validateControl(elem, rule.rules, onlyCheck, value)) {
				return false;
			}
		} else if (!rule.condition && !success) {
			if (Nette.isDisabled(curElem)) {
				continue;
			}
			if (!onlyCheck) {
				var arr = Nette.isArray(rule.arg) ? rule.arg : [rule.arg],
					message = rule.msg.replace(/%(value|\d+)/g, function(foo, m) {
						return Nette.getValue(m === 'value' ? curElem : elem.form.elements.namedItem(arr[m].control));
					});
				Nette.addError(curElem, message);
			}
			return false;
		}
	}
	return true;
};


/**
 * Validates whole form.
 */
Nette.validateForm = function(sender) {
	var form = sender.form || sender,
		scope = false;

	if (form['nette-submittedBy'] && form['nette-submittedBy'].getAttribute('formnovalidate') !== null) {
		var scopeArr = Nette.parseJSON(form['nette-submittedBy'].getAttribute('data-nette-validation-scope'));
		if (scopeArr.length) {
			scope = new RegExp('^(' + scopeArr.join('-|') + '-)');
		} else {
			return true;
		}
	}

	var radios = {}, i, elem;

	for (i = 0; i < form.elements.length; i++) {
		elem = form.elements[i];

		if (elem.tagName && !(elem.tagName.toLowerCase() in {input: 1, select: 1, textarea: 1, button: 1})) {
			continue;

		} else if (elem.type === 'radio') {
			if (radios[elem.name]) {
				continue;
			}
			radios[elem.name] = true;
		}

		if ((scope && !elem.name.replace(/]\[|\[|]|$/g, '-').match(scope)) || Nette.isDisabled(elem)) {
			continue;
		}

		if (!Nette.validateControl(elem)) {
			return false;
		}
	}
	return true;
};


/**
 * Check if input is disabled.
 */
Nette.isDisabled = function(elem) {
	if (elem.type === 'radio') {
		for (var i = 0, elements = elem.form.elements; i < elements.length; i++) {
			if (elements[i].name === elem.name && !elements[i].disabled) {
				return false;
			}
		}
		return true;
	}
	return elem.disabled;
};


/**
 * Display error message.
 */
Nette.addError = function(elem, message) {
	if (message) {
		alert(message);
	}
	if (elem.focus) {
		elem.focus();
	}
};


/**
 * Expand rule argument.
 */
Nette.expandRuleArgument = function(form, arg) {
	if (arg && arg.control) {
		arg = Nette.getEffectiveValue(form.elements.namedItem(arg.control));
	}
	return arg;
};


/**
 * Validates single rule.
 */
Nette.validateRule = function(elem, op, arg, value) {
	value = value === undefined ? {value: Nette.getEffectiveValue(elem)} : value;

	if (op.charAt(0) === ':') {
		op = op.substr(1);
	}
	op = op.replace('::', '_');
	op = op.replace(/\\/g, '');

	var arr = Nette.isArray(arg) ? arg.slice(0) : [arg];
	for (var i = 0, len = arr.length; i < len; i++) {
		arr[i] = Nette.expandRuleArgument(elem.form, arr[i]);
	}
	return Nette.validators[op]
		? Nette.validators[op](elem, Nette.isArray(arg) ? arr : arr[0], value.value, value)
		: null;
};


Nette.validators = {
	filled: function(elem, arg, val) {
		return val !== '' && val !== false && val !== null
			&& (!Nette.isArray(val) || !!val.length)
			&& (!window.FileList || !(val instanceof window.FileList) || val.length);
	},

	blank: function(elem, arg, val) {
		return !Nette.validators.filled(elem, arg, val);
	},

	valid: function(elem, arg, val) {
		return Nette.validateControl(elem, null, true);
	},

	equal: function(elem, arg, val) {
		if (arg === undefined) {
			return null;
		}

		function toString(val) {
			if (typeof val === 'number' || typeof val === 'string') {
				return '' + val;
			} else {
				return val === true ? '1' : '';
			}
		}

		val = Nette.isArray(val) ? val : [val];
		arg = Nette.isArray(arg) ? arg : [arg];
		loop:
		for (var i1 = 0, len1 = val.length; i1 < len1; i1++) {
			for (var i2 = 0, len2 = arg.length; i2 < len2; i2++) {
				if (toString(val[i1]) === toString(arg[i2])) {
					continue loop;
				}
			}
			return false;
		}
		return true;
	},

	notEqual: function(elem, arg, val) {
		return arg === undefined ? null : !Nette.validators.equal(elem, arg, val);
	},

	minLength: function(elem, arg, val) {
		return val.length >= arg;
	},

	maxLength: function(elem, arg, val) {
		return val.length <= arg;
	},

	length: function(elem, arg, val) {
		arg = Nette.isArray(arg) ? arg : [arg, arg];
		return (arg[0] === null || val.length >= arg[0]) && (arg[1] === null || val.length <= arg[1]);
	},

	email: function(elem, arg, val) {
		return (/^("([ !#-[\]-~]|\\[ -~])+"|[-a-z0-9!#$%&'*+\/=?^_`{|}~]+(\.[-a-z0-9!#$%&'*+\/=?^_`{|}~]+)*)@([0-9a-z\u00C0-\u02FF\u0370-\u1EFF]([-0-9a-z\u00C0-\u02FF\u0370-\u1EFF]{0,61}[0-9a-z\u00C0-\u02FF\u0370-\u1EFF])?\.)+[a-z\u00C0-\u02FF\u0370-\u1EFF]([-0-9a-z\u00C0-\u02FF\u0370-\u1EFF]{0,17}[a-z\u00C0-\u02FF\u0370-\u1EFF])?$/i).test(val);
	},

	url: function(elem, arg, val, value) {
		if (!(/^[a-z\d+.-]+:/).test(val)) {
			val = 'http://' + val;
		}
		if ((/^https?:\/\/((([-_0-9a-z\u00C0-\u02FF\u0370-\u1EFF]+\.)*[0-9a-z\u00C0-\u02FF\u0370-\u1EFF]([-0-9a-z\u00C0-\u02FF\u0370-\u1EFF]{0,61}[0-9a-z\u00C0-\u02FF\u0370-\u1EFF])?\.)?[a-z\u00C0-\u02FF\u0370-\u1EFF]([-0-9a-z\u00C0-\u02FF\u0370-\u1EFF]{0,17}[a-z\u00C0-\u02FF\u0370-\u1EFF])?|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\[[0-9a-f:]{3,39}\])(:\d{1,5})?(\/\S*)?$/i).test(val)) {
			value.value = val;
			return true;
		}
		return false;
	},

	regexp: function(elem, arg, val) {
		var parts = typeof arg === 'string' ? arg.match(/^\/(.*)\/([imu]*)$/) : false;
		try {
			return parts && (new RegExp(parts[1], parts[2].replace('u', ''))).test(val);
		} catch (e) {}
	},

	pattern: function(elem, arg, val) {
		try {
			return typeof arg === 'string' ? (new RegExp('^(?:' + arg + ')$')).test(val) : null;
		} catch (e) {}
	},

	integer: function(elem, arg, val) {
		return (/^-?[0-9]+$/).test(val);
	},

	'float': function(elem, arg, val, value) {
		val = val.replace(' ', '').replace(',', '.');
		if ((/^-?[0-9]*[.,]?[0-9]+$/).test(val)) {
			value.value = val;
			return true;
		}
		return false;
	},

	min: function(elem, arg, val) {
		return Nette.validators.range(elem, [arg, null], val);
	},

	max: function(elem, arg, val) {
		return Nette.validators.range(elem, [null, arg], val);
	},

	range: function(elem, arg, val) {
		return Nette.isArray(arg) ?
			((arg[0] === null || parseFloat(val) >= arg[0]) && (arg[1] === null || parseFloat(val) <= arg[1])) : null;
	},

	submitted: function(elem, arg, val) {
		return elem.form['nette-submittedBy'] === elem;
	},

	fileSize: function(elem, arg, val) {
		if (window.FileList) {
			for (var i = 0; i < val.length; i++) {
				if (val[i].size > arg) {
					return false;
				}
			}
		}
		return true;
	},

	image: function (elem, arg, val) {
		if (window.FileList && val instanceof window.FileList) {
			for (var i = 0; i < val.length; i++) {
				var type = val[i].type;
				if (type && type !== 'image/gif' && type !== 'image/png' && type !== 'image/jpeg') {
					return false;
				}
			}
		}
		return true;
	}
};


/**
 * Process all toggles in form.
 */
Nette.toggleForm = function(form, elem) {
	var i;
	Nette.toggles = {};
	for (i = 0; i < form.elements.length; i++) {
		if (form.elements[i].tagName.toLowerCase() in {input: 1, select: 1, textarea: 1, button: 1}) {
			Nette.toggleControl(form.elements[i], null, null, !elem);
		}
	}

	for (i in Nette.toggles) {
		Nette.toggle(i, Nette.toggles[i], elem);
	}
};


/**
 * Process toggles on form element.
 */
Nette.toggleControl = function(elem, rules, success, firsttime, value) {
	rules = rules || Nette.parseJSON(elem.getAttribute('data-nette-rules'));
	value = value === undefined ? {value: Nette.getEffectiveValue(elem)} : value;

	var has = false,
		handled = [],
		handler = function () {
			Nette.toggleForm(elem.form, elem);
		},
		curSuccess;

	for (var id = 0, len = rules.length; id < len; id++) {
		var rule = rules[id],
			op = rule.op.match(/(~)?([^?]+)/),
			curElem = rule.control ? elem.form.elements.namedItem(rule.control) : elem;

		if (!curElem) {
			continue;
		}

		curSuccess = success;
		if (success !== false) {
			rule.neg = op[1];
			rule.op = op[2];
			var curValue = elem === curElem ? value : {value: Nette.getEffectiveValue(curElem)};
			curSuccess = Nette.validateRule(curElem, rule.op, rule.arg, curValue);
			if (curSuccess === null) {
				continue;

			} else if (rule.neg) {
				curSuccess = !curSuccess;
			}
			if (!rule.rules) {
				success = curSuccess;
			}
		}

		if ((rule.rules && Nette.toggleControl(elem, rule.rules, curSuccess, firsttime, value)) || rule.toggle) {
			has = true;
			if (firsttime) {
				var oldIE = !document.addEventListener, // IE < 9
					name = curElem.tagName ? curElem.name : curElem[0].name,
					els = curElem.tagName ? curElem.form.elements : curElem;

				for (var i = 0; i < els.length; i++) {
					if (els[i].name === name && !Nette.inArray(handled, els[i])) {
						Nette.addEvent(els[i], oldIE && els[i].type in {checkbox: 1, radio: 1} ? 'click' : 'change', handler);
						handled.push(els[i]);
					}
				}
			}
			for (var id2 in rule.toggle || []) {
				if (Object.prototype.hasOwnProperty.call(rule.toggle, id2)) {
					Nette.toggles[id2] = Nette.toggles[id2] || (rule.toggle[id2] ? curSuccess : !curSuccess);
				}
			}
		}
	}
	return has;
};


Nette.parseJSON = function(s) {
	s = s || '[]';
	if (s.substr(0, 3) === '{op') {
		return eval('[' + s + ']'); // backward compatibility
	}
	return window.JSON && window.JSON.parse ? JSON.parse(s) : eval(s);
};


/**
 * Displays or hides HTML element.
 */
Nette.toggle = function(id, visible, srcElement) {
	var elem = document.getElementById(id);
	if (elem) {
		elem.style.display = visible ? '' : 'none';
	}
};


/**
 * Setup handlers.
 */
Nette.initForm = function(form) {
	form.noValidate = 'novalidate';

	Nette.addEvent(form, 'submit', function(e) {
		if (!Nette.validateForm(form)) {
			if (e && e.stopPropagation) {
				e.stopPropagation();
			} else if (window.event) {
				event.cancelBubble = true;
			}
			return false;
		}
	});

	Nette.addEvent(form, 'click', function(e) {
		e = e || event;
		var target = e.target || e.srcElement;
		form['nette-submittedBy'] = (target.type in {submit: 1, image: 1}) ? target : null;
	});

	Nette.toggleForm(form);
};


/**
 * @private
 */
Nette.initOnLoad = function() {
	Nette.addEvent(window, 'load', function() {
		for (var i = 0; i < document.forms.length; i++) {
			var form = document.forms[i];
			for (var j = 0; j < form.elements.length; j++) {
				if (form.elements[j].getAttribute('data-nette-rules')) {
					Nette.initForm(form);
					break;
				}
			}
		}
	});
};


/**
 * Determines whether the argument is an array.
 */
Nette.isArray = function(arg) {
	return Object.prototype.toString.call(arg) === '[object Array]';
};


/**
 * Search for a specified value within an array.
 */
Nette.inArray = function(arr, val) {
	if ([].indexOf) {
		return arr.indexOf(val) > -1;
	} else {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] === val) {
				return true;
			}
		}
		return false;
	}
};


/**
 * Converts string to web safe characters [a-z0-9-] text.
 */
Nette.webalize = function(s) {
	s = s.toLowerCase();
	var res = '', i, ch;
	for (i = 0; i < s.length; i++) {
		ch = Nette.webalizeTable[s.charAt(i)];
		res += ch ? ch : s.charAt(i);
	}
	return res.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

Nette.webalizeTable = {\u00e1: 'a', \u00e4: 'a', \u010d: 'c', \u010f: 'd', \u00e9: 'e', \u011b: 'e', \u00ed: 'i', \u013e: 'l', \u0148: 'n', \u00f3: 'o', \u00f4: 'o', \u0159: 'r', \u0161: 's', \u0165: 't', \u00fa: 'u', \u016f: 'u', \u00fd: 'y', \u017e: 'z'};

return Nette;
}));
;
var _context = (function() {
    var t = {},
        api,
        loaded = [],
        loading = {},
        indexOf = Array.prototype.indexOf,
        REQ_TIMEOUT = 30000,
        undefined,
        doc = document,
        loc = doc.location,
        elem = function(n) { return doc.createElement(n); },
        win = window,
        setTimeout = function(c, t) { return win.setTimeout(c, t); },
        clearTimeout = function(t) { return win.clearTimeout(t); },
        promise = Promise;

    if (typeof indexOf !== 'function') {
        indexOf = function(e) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] === e) {
                    return i;
                }
            }

            return -1;

        }
    }

    var resolver = null;

    var resolveUrl = function(u) {
        resolver || (resolver = elem('a'));
        resolver.href = u;
        return resolver.href;
    };


    var isRelative = function(u) {
        try {
            var len = /^https?:\/\/.+?(\/|$)/i.exec(loc.href)[0].length;
            return u.substr(0, len) === loc.href.substr(0, len);

        } catch (err) {
            return false;

        }
    };

    var xhrFactory = (function(o, f) {
        while(o.length) {
            try {
                f = o.shift();
                f();

                return f;

            } catch (e) {}
        }

        return function() { throw new Error(); };

    })([
        function() { return new XMLHttpRequest(); },
        function() { return new ActiveXObject('Msxml2.XMLHTTP'); },
        function() { return new ActiveXObject('Msxml3.XMLHTTP'); },
        function() { return new ActiveXObject('Microsoft.XMLHTTP'); }
    ]);

    var xdrFactory = (function() {
        try {
            if ('withCredentials' in new XMLHttpRequest()) {
                return function() { return new XMLHttpRequest(); };

            } else if (win.XDomainRequest !== undefined) {
                return function() { return new win.XDomainRequest(); };

            }

        } catch (err) { }

        return function() { throw new Error(); };

    })();

    var xhr = function(u) {
        return new promise(function(fulfill, reject) {
            var req,
                m;

            if (isRelative(u)) {
                req = xhrFactory();

            } else {
                req = xdrFactory();

            }

            req.open('GET', u, true);

            var f = function () {
                m && clearTimeout(m);
                fulfill(req);
            };

            var r = function () {
                m && clearTimeout(m);
                reject(req);
            };

            if ('onsuccess' in req) {
                req.onsuccess = f;
                req.onerror = r;

            } else if (win.XDomainRequest !== undefined && req instanceof win.XDomainRequest) {
                req.onload = f;
                req.onerror = r;

            } else {
                req.onreadystatechange = function() {
                    if (req.readyState !== 4) {
                        return;

                    }

                    if (req.status === 200) {
                        f();

                    } else {
                        r();

                    }
                };
            }

            req.send();

            m = setTimeout(function() {
                if (req.readyState && req.readyState < 4) try {
                    req.abort();

                } catch (err) { }

                m = null;
                r();

            }, REQ_TIMEOUT);

        });
    };

    var exec = function(s, t, u) {
        var e;

        if (!t) {
            if (u.match(/\.(?:less|css)/i)) {
                t = 'text/css';

            } else  {
                t = 'text/javascript';

            }
        } else {
            t = t.replace(/\s*;.*$/, '').toLowerCase();

        }

        if (t === 'text/css') {
            e = elem('style');
            e.type = t;

            u = u.replace(/[^\/]+$/, '');
            s = s.replace(/url\s*\(('|")?(?:\.\/)?(.+?)\1\)/, function (m, q, n) {
                q || (q = '"');

                if (n.match(/^(?:(?:https?:)?\/)?\//)) {
                    return 'url(' + q + n + q + ')';

                } else {
                    return 'url(' + q + resolveUrl(u + n) + q + ')';

                }
            });

            if (e.styleSheet) {
                e.styleSheet.cssText = s;

            } else {
                e.appendChild(doc.createTextNode(s));

            }

            doc.head.appendChild(e);

        } else {
            e = elem('script');
            e.type = 'text/javascript';
            e.text = s;
            doc.head.appendChild(e).parentNode.removeChild(e);

        }

    };

    var map = {
        names: [],
        classes: []
    };

    var lookup = function(s, c) {
        var i = map.names.indexOf(s);

        if (i > -1) {
            return map.classes[i];

        }

        var r = t,
            p = s.split('.'),
            n;

        while (p.length) {
            n = p.shift();
            if (r[n] === undefined) {
                if (c) {
                    r[n] = {};

                } else {
                    throw new Error(s + ' not found in context');

                }
            }

            r = r[n];

        }

        map.names.push(s);
        map.classes.push(r);

        return r;

    };

    var lookupClass = function (o) {
        if (typeof o === 'object' && o.constructor !== Object) {
            o = o.constructor;

        }

        if (typeof o !== 'function' && typeof o !== 'object') {
            throw new Error('Cannot lookup class name of non-object');

        }

        var i = map.classes.indexOf(o);

        return i === -1 ? false : map.names[i];

    };



    var load = function () {
        var u, a, p = promise.resolve(true);

        for (a = 0; a < arguments.length; a++) {
            if (typeof arguments[a] === 'function') {
                p = p.then(function(f) {
                    return function () {
                        return invoke(f);

                    };
                }(arguments[a]));

            } else if (typeof arguments[a] === 'string') {
                u = resolveUrl(arguments[a]);

                if (indexOf.call(loaded, u) === -1) {
                    if (loading[u]) {
                        p = p.then(function (p) {
                            return function () {
                                return p;

                            };
                        }(loading[u]));
                    } else {
                        p = loading[u] = function (p, u) {
                            return new promise(function (f, r) {
                                xhr(u).then(function (xhr) {
                                    p.then(function () {
                                        exec(xhr.responseText, xhr.getResponseHeader('Content-Type'), u);
                                        delete loading[u];
                                        loaded.push(u);
                                        f();

                                    }, r);
                                });
                            });

                        }(p, u);
                    }
                }
            }
        }

        return a = {
            then: function (fulfilled, rejected) {
                p.then(function () {
                    fulfilled && invoke(fulfilled);
                }, function () {
                    rejected && invoke(rejected);
                });

                return a;

            }
        };
    };


    var nsStack = [];


    var invoke = function(ns, f, i) {
        if (i === undefined && typeof ns === 'function') {
            i = f;
            f = ns;
            ns = null;

        }

        if (ns) {
            nsStack.unshift(ns, ns = lookup(ns, true));

        } else {
            ns = t;
            nsStack.unshift(null, ns);

        }

        var params = f.length ? f.toString().match(/^function\s*\((.*?)\)/i)[1].split(/\s*,\s*/) : [],
            args = [],
            p, c, r;

        for (p = 0; p < params.length; p++) {
            if (params[p] === 'context') {
                args.push(api);

            } else if (params[p] === '_NS_') {
                args.push(ns);

            } else if (params[p] === 'undefined') {
                args.push(undefined);

            } else if (i !== undefined && params[p] in i) {
                c = i[params[p]];

                if (typeof c === 'string') {
                    c = lookup(c);

                }

                args.push(c);

            } else if (ns[params[p]] !== undefined) {
                args.push(ns[params[p]]);

            } else if (t[params[p]] !== undefined) {
                args.push(t[params[p]]);

            } else {
                throw new Error('"' + params[p] + '" not found in context');

            }
        }

        r = f.apply(ns, args);

        nsStack.shift();
        nsStack.shift();
        return r;

    };

    var register = function (constructor, name) {
        var ns = name.split(/\./g),
            key = ns.pop();

        if (ns.length) {
            ns = lookup(ns.join('.'), true);

        } else {
            if (nsStack.length && nsStack[0] !== null) {
                name = nsStack[0] + '.' + name;
                ns = nsStack[1];

            } else {
                ns = t;

            }
        }

        ns[key] = constructor;

        map.names.push(name);
        map.classes.push(constructor);
        return api;

    };

    var __ns = function () {
        if (arguments.length) {
            nsStack.unshift(arguments[0], arguments[1]);

        } else {
            nsStack.shift();
            nsStack.shift();
        }
    };

    var extend = function (parent, constructor, proto) {
        if (!proto) {
            proto = constructor;
            constructor = parent;
            parent = null;

        }

        if (!parent) {
            parent = Object;

        } else if (typeof parent === 'string') {
            parent = lookup(parent);

        }

        var tmp = function () {};
        tmp.prototype = parent.prototype;
        constructor.prototype = new tmp();
        constructor.prototype.constructor = constructor;
        constructor.Super = parent;

        if (proto) {
            if (proto.hasOwnProperty('STATIC') && proto.STATIC) {
                copyProps(constructor, proto.STATIC);

            }

            copyProps(constructor.prototype, proto);

        }

        return constructor;

    };

    var mixin = function (target, source, map) {
        if (typeof source === 'string') {
            source = lookup(source);

        }

        copyProps(target.prototype, source, map);
        return target;

    };

    var copyProps = function (target, source, map) {
        var key;

        for (key in source) {
            if (source.hasOwnProperty(key) && key !== 'STATIC') {
                target[map && key in map ? map[key] : key] = source[key];

            }
        }
    };

    return api = {
        lookup: lookup,
        lookupClass: lookupClass,
        invoke: invoke,
        load: load,
        extend: extend,
        mixin: mixin,
        register: register,
        __ns: __ns
    };

})();
;
_context.invoke('Utils', function(undefined) {

    var Strings = {
        applyModifiers: function(s) {
            var f = Array.prototype.slice.call(arguments, 1),
                i = 0,
                a, m;

            for (; i < f.length; i++) {
                a = f[i].split(':');
                m = a.shift();
                a.unshift(s);
                s = Strings[m].apply(Strings, a);

            }

            return s;

        },

        toString: function(s) {
            return s === undefined ? 'undefined' : (typeof s === 'string' ? s : (s.toString !== undefined ? s.toString() : Object.prototype.toString.call(s)));

        },

        sprintf: function(s) {
            return Strings.vsprintf(s, Array.prototype.slice.call(arguments, 1));

        },

        vsprintf: function(s, args) {
            var n = 0;

            return s.replace(/%(?:(\d+)\$)?(\.\d+|\[.*?:.*?\])?([idsfa%])/g, function(m, a, p, f) {
                if (f === '%') {
                    return f;

                }

                a = a ? parseInt(a) - 1 : n++;

                if (args[a] === undefined) {
                    throw new Error('Missing parameter #' + (a + 1));

                }

                a = args[a];

                switch (f) {
                    case 's':
                        return Strings.toString(a);

                    case 'i':
                    case 'd':
                        return parseInt(a);

                    case 'f':
                        a = parseFloat(a);

                        if (p && p.match(/^\.\d+$/)) {
                            a = a.toFixed(parseInt(p.substr(1)));

                        }

                        return a;

                    case 'a':
                        p = p && p.match(/^\[.*:.*\]$/) ? p.substr(1, p.length - 2).split(':') : [', ', ', '];
                        return a.length === 0 ? '' : a.slice(0, -1).join(p[0]) + (a.length > 1 ? p[1] : '') + a[a.length - 1];

                }

                return m;

            });
        },

        webalize: function(s, chars, ws) {
            if (ws) {
                s = s.replace(/\s+/g, '_');

            }

            s = s.replace(new RegExp('[^_A-Za-z\u00C0-\u017F' + Strings.escapeRegex(chars || '').replace(/\\-/g, '-') + ']+', 'g'), '-');

            return Strings.trim(s, '_-');

        },

        escapeRegex: function(s) {
            return s.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

        },

        split: function(s, re, offsetCapture, noEmpty, delimCapture) {
            if (re instanceof RegExp) {
                re = new RegExp(re.source, [re.ignoreCase ? 'i' : '', re.multiline ? 'm' : '', 'g'].filter(function(v) { return !!v; }).join(''))

            } else {
                re = new RegExp(re, 'g');

            }

            var r = [],
                len = 0;

            s = s.replace(re, function(m, p, ofs) {
                ofs = arguments[arguments.length - 2];
                p = s.substring(len, ofs);

                if (p.length && !p.match(/^[\t ]+$/) || !noEmpty) {
                    r.push(offsetCapture ? [p, len] : s.substring(len, ofs));

                }

                if (delimCapture && (m.length && !m.match(/^[\t ]+$/) || !noEmpty)) {
                    r.push(offsetCapture ? [m, ofs] : m);

                }

                len = ofs + m.length;

                return m;

            });

            if (len < s.length || !noEmpty) {
                s = s.substring(len);
                (!noEmpty || (s.length && !s.match(/^[\t ]+$/))) && r.push(offsetCapture ? [s, len] : s);

            }

            return r;

        },

        trim: function(s, c) {
            return Strings._trim(s, c, true, true);

        },

        trimLeft: function(s, c) {
            return Strings._trim(s, c, true, false);

        },

        trimRight: function(s, c) {
            return Strings._trim(s, c, false, true);

        },

        _trim: function (s, c, l, r) {
            if (!c) {
                c = " \t\n\r\0\x0B\xC2\xA0";

            }

            var re = [];
            c = '[' + Strings.escapeRegex(c) + ']+';
            l && re.push('^', c);
            l && r && re.push('|');
            r && re.push(c, '$');

            return s.replace(new RegExp(re.join(''), 'ig'), '');

        },

        firstUpper: function(s) {
            return s.substr(0, 1).toUpperCase() + s.substr(1);

        },

        compare: function(a, b, len) {
            if (typeof a !== "string" || typeof b !== 'string') {
                return false;

            }

            if (!len) {
                len = Math.min(a.length, b.length);

            }

            return a.substr(0, len).toLowerCase() === b.substr(0, len).toLowerCase();

        },

        contains: function(h, n) {
            return h.indexOf(n) !== -1;

        },

        isNumeric: function(s) {
            return Object.prototype.toString.call(s) !== '[object Array]' && (s - parseFloat(s) + 1) >= 0;

        },

        escapeHtml: function(s) {
            return s
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');

        },

        nl2br: function(s, collapse) {
            return s.replace(collapse ? /\n+/g : /\n/g, '<br />');

        },

        random: function(len, chars) {
            chars = (chars || 'a-z0-9').replace(/.-./g, function(m, a, b) {
                a = m.charCodeAt(0);
                b = m.charCodeAt(2);
                var n = Math.abs(b - a),
                    c = new Array(n),
                    o = Math.min(a, b),
                    i = 0;

                for (; i <= n; i++) {
                    c[i] = o + i;
                }

                return String.fromCharCode.apply(null, c);

            });

            len || (len = 8);

            var s = new Array(len),
                n = chars.length - 1,
                i;

            for (i = 0; i < len; i++) {
                s[i] = chars[Math.round(Math.random() * n)];

            }

            return s.join('');

        }
    };

    _context.register(Strings, 'Strings');

});
;
_context.invoke('Utils', function(undefined) {

    var Arrays = {
        isArray: function(a) {
            return a && a.constructor === Array;

        },

        isArrayLike: function(a) {
            return typeof a === 'object' && a.length !== undefined;

        },

        shuffle: function (a) {
            var c = a.length, t, i;

            // While there are elements in the array
            while (c--) {
                // Pick a random index
                i = (Math.random() * c) | 0;

                // And swap the last element with it
                t = a[c];
                a[c] = a[i];
                a[i] = t;
            }

            return a;

        },

        createFrom: function(a, s, e) {
            if (a.length === undefined) {
                throw new Error('Invalid argument, only array-like objects can be supplied');

            }

            return Array.prototype.slice.call(a, s || 0, e || a.length);

        },

        getKeys: function(a) {
            var keys = [], k;

            if (Arrays.isArray(a)) {
                for (k = 0; k < a.length; k++) {
                    keys.push(k);

                }
            } else {
                for (k in a) {
                    keys.push(k);

                }
            }

            return keys;

        },

        filterKeys: function() {
            var args = Arrays.createFrom(arguments),
                t = args.shift(),
                a, i, r = {}, rem;

            rem = function(k) {
                if (r[k] === undefined) {
                    r[k] = t[k];
                    delete t[k];

                }
            };

            while (args.length) {
                a = args.shift();

                if (typeof a === 'object') {
                    if (a instanceof Array) {
                        for (i = 0; i < a.length; i++) {
                            rem(a[i]);

                        }
                    } else {
                        for (i in a) {
                            rem(i);

                        }
                    }
                } else {
                    rem(a);

                }
            }
        },

        getValues: function(a) {
            var arr = [], k;

            for (k in a) {
                arr.push(a[k]);

            }

            return arr;

        },

        merge: function() {
            var args = Arrays.createFrom(arguments),
                a = args.shift(),
                r = false,
                b, i;

            if (typeof a === 'boolean') {
                r = a;
                a = args.shift();

            }

            if (!a) {
                a = [];
            }

            while (args.length) {
                b = args.shift();
                if (b instanceof Array) {
                    for (i = 0; i < b.length; i++) {
                        if (r && typeof b[i] === 'object' && Object.prototype.toString.call(b[i]) === '[object Object]') {
                            a.push(Arrays.mergeTree(r, {}, b[i]));

                        } else {
                            a.push(b[i]);

                        }
                    }
                }
            }

            return a;

        },

        mergeTree: function() {
            var r = false,
                args = Arrays.createFrom(arguments),
                ofs = 1,
                t = args.shift(),
                props = [];

            if (typeof t === 'boolean') {
                r = t;
                t = args.shift();
                ofs = 2;

            }

            while (args.length) {
                var o = args.pop(),
                    p, a, i;

                if (typeof o !== 'object' || o === null) {
                    continue;

                }

                if (!t) {
                    t = {};

                }

                for (p in o) {
                    if (!o.hasOwnProperty(p) || props.indexOf(p) !== -1) {
                        continue;

                    }

                    if (typeof o[p] === 'object') {
                        if (r) {
                            if (o[p] instanceof Array) {
                                a = [r, t[p] || null];

                                for (i = ofs; i < arguments.length; i++) {
                                    a.push(arguments[i][p] || null);

                                }

                                t[p] = Arrays.merge.apply(this, a);

                            } else {
                                a = [r, null];

                                for (i = ofs; i < arguments.length; i++) {
                                    a.push(arguments[i] ? arguments[i][p] || null : null);

                                }

                                t[p] = Arrays.mergeTree.apply(this, a) || t[p];

                            }

                        } else {
                            t[p] = t[p] === undefined ? o[p] : (o[p] === null ? t[p] : o[p]);

                        }
                    } else {
                        t[p] = o[p];

                    }

                    props.push(p);

                }
            }

            return t;

        },

        walk: function(r, a, f) {
            if (typeof r !== "boolean") {
                f = a;
                a = r;
                r = false;
            }

            var i,
                p = function(k, v) {
                    if (r && (v instanceof Array || v instanceof Object)) {
                        Arrays.walk(r, v, f);

                    } else {
                        f.call(v, k, v);

                    }
                };

            if (a instanceof Array) {
                for (i = 0; i < a.length; i++) {
                    p(i, a[i]);

                }
            } else if (a instanceof Object) {
                for (i in a) {
                    p(i, a[i]);

                }
            } else {
                p(null, a);

            }
        }
    };

    _context.register(Arrays, 'Arrays');

});
;
_context.invoke('Utils', function (Arrays, undefined) {

    var HashMap = _context.extend(function (src) {
        this._ = {
            keys: [],
            values: [],
            nonNumeric: 0,
            nextNumeric: 0
        };

        if (src) {
            this.merge(src);

        }
    }, {
        STATIC: {
            from: function (data, keys) {
                if (!keys) {
                    return data instanceof HashMap ? data.clone() : new HashMap(data);

                } else if (!Arrays.isArray(keys)) {
                    throw new Error('Invalid argument supplied to HashMap.from(): the second argument must be an array');

                }

                var map = new HashMap(),
                    i, n = keys.length,
                    k,
                    arr = Arrays.isArray(data);

                for (i = 0; i < n; i++) {
                    k = arr ? i : keys[i];

                    if (data[k] !== undefined) {
                        map.set(keys[i], data[k]);

                    }
                }

                return map;

            }
        },

        length: 0,

        isList: function () {
            return this._.nonNumeric === 0;

        },

        clone: function (deep) {
            var o = new HashMap();
            o._.keys = this._.keys.slice();
            o._.nextNumeric = this._.nextNumeric;
            o.length = this.length;

            if (deep) {
                o._.values = this._.values.map(function (v) {
                    return v instanceof HashMap ? v.clone(deep) : v;
                });
            } else {
                o._.values = this._.values.slice();

            }

            return o;

        },

        merge: function (src) {
            if (src instanceof HashMap || Arrays.isArray(src)) {
                src.forEach(function(value, key) { this.set(key, value); }, this);

            } else if (typeof src === 'object' && src !== null) {
                for (var k in src) {
                    if (src.hasOwnProperty(k)) {
                        this.set(k, src[k]);

                    }
                }
            } else {
                throw new TypeError('HashMap.merge() expects the first argument to be an array or an object, ' + (typeof src) + ' given');

            }

            return this;

        },

        append: function (src) {
            if (src instanceof HashMap || Arrays.isArray(src)) {
                src.forEach(function (value, key) {
                    if (typeof key === 'number') {
                        this.push(value);

                    } else {
                        this.set(key, value);

                    }
                }, this);
            } else {
                this.merge(src);

            }

            return this;

        },

        push: function (value) {
            for (var i = 0; i < arguments.length; i++) {
                this._.keys.push(this._.nextNumeric);
                this._.values.push(arguments[i]);
                this._.nextNumeric++;
                this.length++;

            }

            return this;

        },

        pop: function () {
            if (!this.length) {
                return null;

            }

            var k = this._.keys.pop();

            if (typeof k === 'number') {
                if (k + 1 === this._.nextNumeric) {
                    this._.nextNumeric--;

                }
            } else {
                this._.nonNumeric--;

            }

            this.length--;
            return this._.values.pop();

        },

        shift: function () {
            if (!this.length) {
                return null;

            }

            if (typeof this._.keys[0] === 'number') {
                this._.nextNumeric--;
                this._shiftKeys(1, this.length, -1);

            } else {
                this._.nonNumeric--;

            }

            this.length--;
            this._.keys.shift();
            return this._.values.shift();

        },

        unshift: function (value) {
            var values = Arrays.createFrom(arguments),
                n = values.length,
                i = 0,
                keys = new Array(n);

            while (i < n) {
                keys[i] = i++;
            }

            keys.unshift(0, 0);
            values.unshift(0, 0);

            this._shiftKeys(0, this.length, n);
            this._.keys.splice.apply(this._.keys, keys);
            this._.values.splice.apply(this._.values, values);
            this._.nextNumeric += n;
            this.length += n;
            return this;

        },

        slice: function (from, to) {
            (from === undefined) && (from = 0);
            (from < 0) && (from += this.length);
            (to === undefined) && (to = this.length);
            (to < 0) && (to += this.length);

            var o = new HashMap();

            o._.keys = this._.keys.slice(from, to).map(function(k) {
                if (typeof k === 'number') {
                    k = o._.nextNumeric;
                    o._.nextNumeric++;
                    return k;

                } else {
                    o._.nonNumeric++;
                    return k;

                }
            });

            o._.values = this._.values.slice(from, to);
            o.length = o._.keys.length;

            return o;

        },

        splice: function (from, remove) {
            var values = Arrays.createFrom(arguments),
                keys = values.slice().map(function() { return -1; }),
                removed, i;

            keys[0] = values[0];
            keys[1] = values[1];

            this._.keys.splice.apply(this._.keys, keys);
            removed = this._.values.splice.apply(this._.values, values);

            this.length = this._.keys.length;
            this._.nextNumeric = 0;
            this._.nonNumeric = 0;

            for (i = 0; i < this.length; i++) {
                if (typeof this._.keys[i] === 'number') {
                    this._.keys[i] = this._.nextNumeric;
                    this._.nextNumeric++;

                } else {
                    this._.nonNumeric++;

                }
            }

            return removed;

        },

        'set': function (key, value) {
            var i = this._.keys.indexOf(key);

            if (i === -1) {
                this._.keys.push(key);
                this._.values.push(value);
                this.length++;

                if (typeof key === 'number') {
                    if (key >= this._.nextNumeric) {
                        this._.nextNumeric = key + 1;

                    }
                } else {
                    this._.nonNumeric++;

                }
            } else {
                this._.values[i] = value;

            }

            return this;

        },

        'get': function (key, need) {
            var i = this._.keys.indexOf(key);

            if (i > -1) {
                return this._.values[i];

            } else if (need) {
                throw new RangeError('Key ' + key + ' not present in HashMap');

            }

            return null;

        },

        has: function (key) {
            var index = this._.keys.indexOf(key);
            return index > -1 && this._.values[index] !== undefined;

        },

        forEach: function (callback, thisArg) {
            for (var i = 0; i < this.length; i++) {
                callback.call(thisArg || null, this._.values[i], this._.keys[i], this);

            }

            return this;

        },

        map: function (callback, recursive, thisArg) {
            return this.clone(recursive).walk(callback, recursive, thisArg);

        },

        walk: function (callback, recursive, thisArg) {
            for (var i = 0; i < this.length; i++) {
                if (recursive && this._.values[i] instanceof HashMap) {
                    this._.values[i].walk(callback, recursive, thisArg);

                } else {
                    this._.values[i] = callback.call(thisArg || null, this._.values[i], this._.keys[i], this);

                }
            }

            return this;

        },

        find: function (predicate, thisArg) {
            var i = this._find(predicate, thisArg, true);
            return i === false ? null : this._.values[i];

        },

        findKey: function (predicate, thisArg) {
            var i = this._find(predicate, thisArg, true);
            return i === false ? null : this._.keys[i];

        },

        some: function (predicate, thisArg) {
            return this._find(predicate, thisArg, true) !== false;

        },

        all: function (predicate, thisArg) {
            return this._find(predicate, thisArg, false) === false;

        },

        filter: function (predicate, thisArg) {
            var o = new HashMap(),
                i;

            for (i = 0; i < this.length; i++) {
                if (predicate.call(thisArg || null, this._.values[i], this._.keys[i], this)) {
                    if (typeof this._.keys[i] === 'number') {
                        o.push(this._.values[i]);

                    } else {
                        o.set(this._.keys[i], this._.values[i]);

                    }
                }
            }

            return o;

        },

        exportData: function () {
            if (this.isList()) {
                return this.getValues().map(function(v) {
                    return v instanceof HashMap ? v.exportData() : v;

                });
            }

            for (var i = 0, r = {}; i < this.length; i++) {
                if (this._.values[i] instanceof HashMap) {
                    r[this._.keys[i]] = this._.values[i].exportData();

                } else {
                    r[this._.keys[i]] = this._.values[i];

                }
            }

            return r;

        },

        getKeys: function () {
            return this._.keys.slice();

        },

        getValues: function () {
            return this._.values.slice();

        },

        _shiftKeys: function (from, to, diff) {
            while (from < to) {
                if (typeof this._.keys[from] === 'number') {
                    this._.keys[from] += diff;

                }

                from++;

            }
        },

        _find: function (predicate, thisArg, expect) {
            for (var i = 0; i < this.length; i++) {
                if (predicate.call(thisArg || null, this._.values[i], this._.keys[i], this) === expect) {
                    return i;

                }
            }

            return false;

        }
    });

    _context.register(HashMap, 'HashMap');

});
;
_context.invoke('Utils', function(Strings, undefined) {

    var Url = function(s) {
        var cur = document.location.href.match(Url.PARSER_REGEXP),
			src = s === null || s === '' || s === undefined ? cur : s.match(Url.PARSER_REGEXP),
            noHost = !src[4],
            path = src[6] || '';

        if (noHost && path.charAt(0) !== '/') {
            if (path.length) {
                path = Url.getDirName(cur[6] || '') + '/' + path.replace(/^\.\//, '');

            } else {
                path = cur[6];

            }
        }

        this._ = {
            protocol: src[1] || cur[1] || '',
            username: (noHost ? src[2] || cur[2] : src[2]) || '',
            password: (noHost ? src[3] || cur[3] : src[3]) || '',
            hostname: src[4] || cur[4] || '',
            port: (noHost ? src[5] || cur[5] : src[5]) || '',
            path: path,
            params: Url.parseQuery((noHost && !src[6] ? src[7] || cur[7] : src[7]) || ''),
            hash: (noHost && !src[6] && !src[7] ? src[8] || cur[8] : src[8]) || ''
        };
    };

    Url.prototype.getProtocol = function() {
        return this._.protocol;

    };

    Url.prototype.getUsername = function() {
        return this._.username;

    };

    Url.prototype.getPassword = function() {
        return this._.password;

    };

    Url.prototype.getHostname = function() {
        return this._.hostname;

    };

    Url.prototype.getPort = function() {
        return this._.port;

    };

    Url.prototype.getAuthority = function() {
        var a = '';

        if (this._.username) {
            if (this._.password) {
                a += this._.username + ':' + this._.password + '@';

            } else {
                a += this._.username + '@';

            }
        }

        a += this._.hostname;

        if (this._.port) {
            a += ':' + this._.port;

        }

        return a;

    };

    Url.prototype.getPath = function() {
        return this._.path;

    };

    Url.prototype.getQuery = function() {
        var q = Url.buildQuery(this._.params);
        return q.length ? '?' + q : '';

    };

    Url.prototype.getParam = function(n) {
        return this._.params[n];

    };

    Url.prototype.hasParam = function(n) {
        return this._.params[n] !== undefined;

    };

    Url.prototype.getParams = function() {
        return this._.params;

    };

    Url.prototype.getHash = function() {
        return this._.hash;

    };


    Url.prototype.setProtocol = function(protocol) {
        this._.protocol = protocol ? Strings.trimRight(protocol, ':') + ':' : '';
        return this;

    };

    Url.prototype.setUsername = function(username) {
        this._.username = username;
        return this;

    };

    Url.prototype.setPassword = function(password) {
        this._.password = password;
        return this;

    };

    Url.prototype.setHostname = function(hostname) {
        this._.hostname = hostname;
        return this;

    };

    Url.prototype.setPort = function(port) {
        this._.port = port;
        return this;

    };

    Url.prototype.setPath = function(path) {
        this._.path = path ? '/' + Strings.trimLeft(path, '/') : '';
        return this;

    };

    Url.prototype.setQuery = function(query) {
        this._.params = Url.parseQuery(query);
        return this;

    };

    Url.prototype.setParam = function(n, v) {
        this._.params[n] = v;
        return this;

    };

    Url.prototype.addParams = function(p) {
        if (p instanceof Array && (p.length < 1 || 'name' in p[0])) {
            for (var i = 0; i < p.length; i++) {
                this._.params[p[i].name] = p[i].value;

            }
        } else {
            for (var k in p) {
                if (p[k] !== undefined) {
                    this._.params[k] = p[k];

                }
            }
        }

        return this;

    };

    Url.prototype.getParams = function () {
        return this._.params;

    };

    Url.prototype.setParams = function(p) {
        this._.params = {};
        this.addParams(p);
        return this;

    };

    Url.prototype.removeParam = function(n) {
        delete this._.params[n];
        return this;

    };

    Url.prototype.setHash = function(hash) {
        this._.hash = hash ? '#' + Strings.trimLeft(hash, '#') : '';
        return this;

    };


    Url.prototype.toAbsolute = function() {
        return this._.protocol + '//' + this.getAuthority() + this._.path + this.getQuery() + this._.hash;

    };

    Url.prototype.toLocal = function () {
        return this._.path + this.getQuery() + this._.hash;

    };

    Url.prototype.toRelative = function(to) {
        to = Url.from(to || document.location.href);

        if (to.getProtocol() !== this.getProtocol()) {
            return this.toAbsolute();

        }

        if (to.getAuthority() !== this.getAuthority()) {
            return '//' + this.getAuthority() + this.getPath() + this.getQuery() + this.getHash();

        }

        if (to.getPath() !== this.getPath()) {
            return Url.getRelativePath(to.getPath(), this.getPath()) + this.getQuery() + this.getHash();

        }

        var qto = to.getQuery(), qthis = this.getQuery();
        if (qto !== qthis) {
            return qthis + this.getHash();

        }

        return to.getHash() === this.getHash() ? '' : this.getHash();

    };

    Url.prototype.toString = function() {
        return this.toAbsolute();

    };

    Url.prototype.isLocal = function() {
        return this.compare(Url.fromCurrent()) < Url.PART.PORT;

    };

    Url.prototype.compare = function(to) {
        if (!(to instanceof Url)) {
            to = Url.from(to);

        }

        var r = 0;

        this.getProtocol() !== to.getProtocol() && (r |= Url.PART.PROTOCOL);
        this.getUsername() !== to.getUsername() && (r |= Url.PART.USERNAME);
        this.getPassword() !== to.getPassword() && (r |= Url.PART.PASSWORD);
        this.getHostname() !== to.getHostname() && (r |= Url.PART.HOSTNAME);
        this.getPort() !== to.getPort() && (r |= Url.PART.PORT);
        this.getPath() !== to.getPath() && (r |= Url.PART.PATH);
        this.getQuery() !== to.getQuery() && (r |= Url.PART.QUERY);
        this.getHash() !== to.getHash() && (r |= Url.PART.HASH);

        return r;

    };

    /**
     * 1: protocol
     * 2: user
     * 3: pass
     * 4: host
     * 5: port
     * 6: path
     * 7: query
     * 8: hash
     * @type {RegExp}
     */
    Url.PARSER_REGEXP = /^(?:([^:/]+:)?\/\/(?:([^\/@]+?)(?::([^\/@]+))?@)?(?:([^/]+?)(?::(\d+))?(?=\/|$))?)?(.*?)(\?.*?)?(#.*)?$/;
    Url.PART = {
        PROTOCOL: 128,
        USERNAME: 64,
        PASSWORD: 32,
        HOSTNAME: 16,
        PORT: 8,
        PATH: 4,
        QUERY: 2,
        HASH: 1
    };

    Url.from = function(s) {
        return s instanceof Url ? new Url(s.toAbsolute()) : new Url(typeof s === 'string' || s === null || s === undefined ? s : Strings.toString(s));

    };

    Url.fromCurrent = function() {
        return new Url();

    };

    Url.getDirName = function (path) {
        return path.replace(/(^|\/)[^\/]*$/, '');

    };

    Url.getRelativePath = function(from, to) {
        from = Strings.trimLeft(from, '/').split('/');
        from.pop(); // last element is either a file or empty because the previous element is a directory

        if (!to.match(/^\//)) {
            return to.replace(/^\.\//, '');

        }

        to = Strings.trimLeft(to, '/').split('/');

        var e = 0,
            f,
            t,
            o = [],
            n = Math.min(from.length, to.length);

        for (; e < n; e++) {
            if (from[e] !== to[e]) {
                break;

            }
        }

        for (f = e; f < from.length; f++) {
            o.push('..');

        }

        for (t = e; t < to.length; t++) {
            o.push(to[t]);

        }

        return o.join('/');

    };

    Url.buildQuery = function(data, pairs) {
        var q = [], n, en = encodeURIComponent;

        var val = function (v) {
            if (v === undefined) {
                return null;

            } else if (typeof v === 'boolean') {
                return v ? 1 : 0;

            } else {
                return en('' + v);

            }
        };

        var flatten = function(a, n) {
            var r = [], i;

            if (Array.isArray(a)) {
                for (i = 0; i < a.length; i++) {
                    r.push(en(n + '[]') + '=' + val(a[i]));

                }
            } else {
                for (i in a) {
                    if (typeof a[i] === 'object') {
                        r.push(flatten(a[i], n + '[' + i + ']'));

                    } else {
                        r.push(en(n + '[' + i + ']') + '=' + val(a[i]));

                    }
                }
            }

            return r.filter(function(v) { return v !== null }).join('&');

        };

        for (n in data) {
            if (data[n] === null || data[n] === undefined) {
                continue;

            } else if (pairs) {
                q.push(en(data[n].name) + '=' + val(data[n].value));

            } else if (typeof data[n] === 'object') {
                q.push(flatten(data[n], n));

            } else {
                q.push(en(n) + '=' + val(data[n]));

            }
        }

        return q.filter(function(v) { return v !== null; }).join('&');

    };

    Url.parseQuery = function(s) {
        if (s.match(/^\??$/)) {
            return {};

        }

        s = Strings.trimLeft(s, '?').split('&');

        var p = {}, a = false, c, d, k, i, m, n, v;

        var convertType = function(v) {
            if (v.match(/^\d+$/)) {
                return parseInt(v);

            } else if (v.match(/^\d*\.\d+$/)) {
                return parseFloat(v);

            }

            return v;

        };

        for (i = 0; i < s.length; i++) {
            m = s[i].split('=');
            n = decodeURIComponent(m.shift());
            v = convertType(decodeURIComponent(m.join('=')));

            if (n.indexOf('[') !== -1) {
                n = n.replace(/\]/g, '');
                d = n.split('[');
                c = p;
                a = false;

                if (n.match(/\[$/)) {
                    d.pop();
                    a = true;

                }

                n = d.pop();

                while (d.length) {
                    k = d.shift();

                    if (c[k] === undefined) {
                        c[k] = {};

                    }

                    c = c[k];

                }

                if (a) {
                    if (c[n] === undefined) {
                        c[n] = [v];

                    } else {
                        c[n].push(v);

                    }
                } else {
                    c[n] = v;

                }
            } else {
                p[n] = v;

            }
        }

        return p;

    };

    _context.register(Url, 'Url');

});
;
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
        Arrays.isArrayLike(elem) && elem !== window && (elem = elem[0]);
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

    var parseData = function (value) {
        if (!value) return null;

        try {
            return JSON.parse(value);

        } catch (e) {
            return value;

        }
    };

    var DOM = {
        getByClassName: function (className, context) {
            return Arrays.createFrom((context || document).getElementsByClassName(className));

        },

        getById: function (id) {
            return document.getElementById(id);

        },

        find: function (sel, context) {
            var elems = [];
            sel = sel.trim().split(/\s*,\s*/g);

            sel.forEach(function (s) {
                var m = s.match(/^#([^\s\[>+:\.]+)\s+\.([^\s\[>+:]+)$/);

                if (m) {
                    elems.push.apply(elems, DOM.getByClassName(m[2], DOM.getById(m[1])));
                    return;

                } else if (s.match(/^[^.#]|[\s\[>+:]/)) {
                    throw new TypeError('Invalid selector "' + s + '", only single-level .class and #id or "#id .class" are allowed');

                }

                if (s.charAt(0) === '#') {
                    m = DOM.getById(s.substr(1));

                    if (m) {
                        elems.push(m);

                    }
                } else {
                    m = DOM.getByClassName(s.substr(1), context);
                    elems.push.apply(elems, m);

                }
            });

            return elems;

        },

        getChildren: function (elem) {
            return Arrays.createFrom(elem.childNodes || '').filter(function (node) {
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

        contains: function( a, b ) {
            var adown = a.nodeType === 9 ? a.documentElement : a,
                bup = b && b.parentNode;

            return a === bup || !!( bup && bup.nodeType === 1 && (
                    adown.contains
                        ? adown.contains( bup )
                        : a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
                ));
        },

        addListener: function (elem, evt, listener) {
            return map(arguments, function (elem, evt, listener) {
                elem.addEventListener(evt, listener, false);
                return elem;

            });
        },
        removeListener: function (elem, evt, listener) {
            return map(arguments, function (elem, evt, listener) {
                elem.removeEventListener(evt, listener, false);
                return elem;

            });
        },

        getData: function (elem, key) {
            return parseData(getElem(elem).getAttribute('data-' + key));

        },
        setData: function (elem, key, value) {
            return map([elem], function (elem) {
                elem.setAttribute('data-' + key, JSON.stringify(value));
                return elem;

            });
        },

        addClass: null,
        removeClass: null,
        toggleClass: null,
        hasClass: null
    };


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

    testElem = null;

    _context.register(DOM, 'DOM');

});
;
_context.invoke('Utils', function(undefined) {

    var ReflectionClass = function(c) {
        this._ = {
            reflectedClass: typeof c === "string" ? ReflectionClass.getClass(c) : c
        };
    };

    ReflectionClass.from = function(c) {
        return c instanceof ReflectionClass ? c : new ReflectionClass(c);

    };

    ReflectionClass.getClass = function(name) {
        return _context.lookup(name);

    };

    ReflectionClass.getClassName = function(obj, need) {
        var className = _context.lookupClass(obj);

        if (className === false && need) {
            throw new Error('Unknown class');

        }

        return className;

    };

    ReflectionClass.prototype.hasProperty = function(name) {
        return this._.reflectedClass.prototype[name] !== undefined && typeof this._.reflectedClass.prototype[name] !== "function";

    };

    ReflectionClass.prototype.hasMethod = function(name) {
        return this._.reflectedClass.prototype[name] !== undefined && typeof this._.reflectedClass.prototype[name] === "function";

    };

    ReflectionClass.prototype.newInstance = function() {
        return this.newInstanceArgs(arguments);

    };

    ReflectionClass.prototype.newInstanceArgs = function(args) {
        var inst, ret, tmp = function() {};
        tmp.prototype = this._.reflectedClass.prototype;
        inst = new tmp();
        ret = this._.reflectedClass.apply(inst, args);

        return Object(ret) === ret ? ret : inst;

    };

    _context.register(ReflectionClass, 'ReflectionClass');

});
;
_context.invoke('Utils', function(Arrays, undefined) {

    var ReflectionFunction = function(f) {
        this._ = {
            reflectedFunction: f,
            argsList: f.length ? f.toString().match(/^function\s*\(\s*(.*?)\s*\)/i)[1].split(/\s*,\s*/) : []
        };

    };

    ReflectionFunction.from = function(f) {
        return f instanceof ReflectionFunction ? f : new ReflectionFunction(f);

    };

    ReflectionFunction.prototype.invoke = function(context) {
        var args = Arrays.createFrom(arguments);
        args.shift();

        return this._.reflectedFunction.apply(context, args);

    };

    ReflectionFunction.prototype.getArgs = function () {
        return this._.argsList;

    };

    ReflectionFunction.prototype.invokeArgs = function(context, args) {
        var list = [];
        for (var i = 0; i < this._.argsList.length; i++) {
            if (args[this._.argsList[i]] === undefined) {
                throw new Error('Parameter "' + this._.argsList[i] + '" was not provided in argument list');

            }

            list.push(args[this._.argsList[i]]);

        }

        return this._.reflectedFunction.apply(context, list);

    };

    _context.register(ReflectionFunction, 'ReflectionFunction');

});
;
_context.invoke('Nittro', function () {

    var prepare = function (self, need) {
        if (!self._) {
            if (need === false) return false;
            self._ = {};

        }

        if (!self._.eventEmitter) {
            if (need === false) return false;

            self._.eventEmitter = {
                listeners: {},
                defaultListeners: {},
                namespaces: []
            };
        }
    };

    var prepareNamespaces = function (emitter, namespaces) {
        return namespaces.map(function (ns) {
            var i = emitter.namespaces.indexOf(ns);

            if (i > -1) return i;

            i = emitter.namespaces.length;
            emitter.namespaces.push(ns);

            return i;

        });
    };

    var hasCommonElement = function (a, b) {
        var i = 0, j = 0;

        while (i < a.length && j < b.length) {
            if (a[i] < b[j]) i++;
            else if (a[i] > b[j]) j++;
            else return true;

        }

        return false;

    };

    var process = function (emitter, evt, op, arg1, arg2) {
        evt = (evt || '').replace(/^\s+|\s+$/g, '').split(/\s+/g);

        evt.forEach(function (e) {
            var dflt = e.split(/:/),
                ns = dflt[0].split(/\./g);

            e = ns.shift();
            ns = prepareNamespaces(emitter, ns);
            ns.sort();
            op(emitter, e, ns, dflt[1] === 'default', arg1, arg2);

        });
    };

    var add = function (emitter, evt, ns, dflt, handler, mode) {
        if (!evt) {
            throw new TypeError('No event specified');

        }

        if (dflt) {
            if (mode !== 0 || ns.length) {
                throw new TypeError("Default event handlers don't support namespaces and one()/first()");

            } else if (emitter.defaultListeners.hasOwnProperty(evt)) {
                throw new TypeError("Event '" + evt + "' already has a default listener");

            }

            emitter.defaultListeners[evt] = handler;
            return;

        }

        if (mode === 2) {
            ns.unshift(emitter.namespaces.length);

        }

        emitter.listeners[evt] || (emitter.listeners[evt] = []);
        emitter.listeners[evt].push({handler: handler, namespaces: ns, mode: mode});

    };

    var remove = function (emitter, evt, ns, dflt, handler) {
        if (!evt) {
            var listeners = dflt ? emitter.defaultListeners : emitter.listeners;

            for (evt in listeners) {
                if (listeners.hasOwnProperty(evt)) {
                    remove(emitter, evt, ns, dflt, handler);

                }
            }

            return;

        }

        if (dflt) {
            if (emitter.defaultListeners.hasOwnProperty(evt) && (!handler || emitter.defaultListeners[evt] === handler)) {
                delete emitter.defaultListeners[evt];

            }

            return;

        }

        if (!emitter.listeners[evt]) return;

        if (ns.length) {
            emitter.listeners[evt] = emitter.listeners[evt].filter(function (listener) {
                if (handler && listener.handler !== handler) return true;
                return !listener.namespaces.length || !hasCommonElement(listener.namespaces, ns);

            });
        } else if (handler) {
            emitter.listeners[evt] = emitter.listeners[evt].filter(function (listener) {
                return listener.handler !== handler;

            });
        } else {
            if (emitter.listeners.hasOwnProperty(evt)) {
                delete emitter.listeners[evt];

            }

            if (emitter.defaultListeners.hasOwnProperty(evt)) {
                delete emitter.defaultListeners[evt];

            }
        }
    };

    var trigger = function (self, evt, data) {
        var e, _ = self._.eventEmitter;

        if (typeof evt !== "object") {
            e = new NittroEvent(evt, data);

        }

        if (_.listeners.hasOwnProperty(evt)) {
            _.listeners[evt].slice().forEach(function (listener) {
                if (listener.mode === 1) {
                    remove(_, evt, [], false, listener.handler);

                } else if (listener.mode === 2) {
                    remove(_, '', [listener.namespaces[0]], false);

                }

                listener.handler.call(self, e);

            });
        }

        if (!e.isDefaultPrevented() && _.defaultListeners.hasOwnProperty(evt)) {
            _.defaultListeners[evt].call(self, e);

        }

        return e;

    };

    var NittroEventEmitter = {
        on: function (evt, handler) {
            prepare(this);
            process(this._.eventEmitter, evt, add, handler, 0);
            return this;

        },

        one: function (evt, handler) {
            prepare(this);
            process(this._.eventEmitter, evt, add, handler, 1);
            return this;

        },

        first: function (evt, handler) {
            prepare(this);
            process(this._.eventEmitter, evt, add, handler, 2);
            this._.eventEmitter.namespaces.push(null);
            return this;

        },

        off: function (evt, handler) {
            if (prepare(this, false) === false) return this;
            process(this._.eventEmitter, evt, remove, handler);
            return this;

        },

        trigger: function (evt, data) {
            if (prepare(this, false) === false) return this;
            return trigger(this, evt, data);

        }
    };

    var returnTrue = function () {
        return true;
    };

    var returnFalse = function () {
        return false;
    };

    var NittroEvent = _context.extend(function (type, data) {
        this.type = type;
        this.data = data || {};

    }, {
        preventDefault: function () {
            this.isDefaultPrevented = returnTrue;

        },

        isDefaultPrevented: returnFalse

    });

    _context.register(NittroEventEmitter, 'EventEmitter');
    _context.register(NittroEvent, 'Event');

});
;
_context.invoke('Nittro', function () {

    var prepare = function (self, need) {
        if (!self._) {
            if (need === false) return false;
            self._ = {};

        }

        if (!self._.hasOwnProperty('frozen')) {
            if (need === false) return false;
            self._.frozen = false;

        }
    };

    var Freezable = {
        freeze: function () {
            prepare(this);
            this._.frozen = true;
            return this;

        },

        isFrozen: function () {
            if (prepare(this, false) === false) {
                return false;

            }

            return this._.frozen;

        },

        _updating: function (prop) {
            if (prepare(this, false) === false) {
                return this;

            }

            if (this._.frozen) {
                var className = _context.lookupClass(this) || 'object';

                if (prop) {
                    prop = ' "' + prop + '"';

                }

                throw new Error('Cannot update property' + prop + ' of a frozen ' + className);

            }

            return this;

        }
    };


    _context.register(Freezable, 'Freezable');

});
;
_context.invoke('Nittro', function () {

    var Object = _context.extend(function () {
        this._ = { };

    }, {

    });

    _context.mixin(Object, 'Nittro.EventEmitter');
    _context.register(Object, 'Object');

});
;
_context.invoke('Nittro.Ajax', function(undefined) {

    var FormData = _context.extend(function() {
        this._dataStorage = [];
        this._upload = false;

    }, {
        append: function(name, value) {
            if (value === undefined || value === null) {
                return this;

            }

            if (this._isFile(value)) {
                this._upload = true;

            } else if (typeof value === 'object' && 'valueOf' in value && /string|number|boolean/.test(typeof value.valueOf()) && !arguments[2]) {
                return this.append(name, value.valueOf(), true);

            } else if (!/string|number|boolean/.test(typeof value)) {
                throw new Error('Only scalar values and File/Blob objects can be appended to FormData, ' + (typeof value) + ' given');

            }

            this._dataStorage.push({ name: name, value: value });

            return this;

        },

        isUpload: function() {
            return this._upload;

        },

        _isFile: function(value) {
            return window.File !== undefined && value instanceof window.File || window.Blob !== undefined && value instanceof window.Blob;

        },

        mergeData: function(data) {
            for (var i = 0; i < data.length; i++) {
                this.append(data[i].name, data[i].value);

            }

            return this;

        },

        exportData: function(forcePlain) {
            if (!forcePlain && this.isUpload() && window.FormData !== undefined) {
                var fd = new window.FormData(),
                    i;

                for (i = 0; i < this._dataStorage.length; i++) {
                    fd.append(this._dataStorage[i].name, this._dataStorage[i].value);

                }

                return fd;

            } else {
                return this._dataStorage.filter(function(e) {
                    return !this._isFile(e.value);

                }, this);

            }
        }
    });

    _context.register(FormData, 'FormData');

});
;
_context.invoke('Nittro.Ajax', function (Url, FormData, undefined) {

    var Request = _context.extend('Nittro.Object', function(url, method, data) {
        this._ = {
            url: Url.from(url),
            method: (method || 'GET').toUpperCase(),
            data: data || {},
            headers: {},
            normalized: false,
            aborted: false
        };
    }, {
        getUrl: function () {
            this._normalize();
            return this._.url;

        },

        getMethod: function () {
            return this._.method;

        },

        isGet: function () {
            return this._.method === 'GET';

        },

        isPost: function () {
            return this._.method === 'POST';

        },

        isMethod: function (method) {
            return method.toUpperCase() === this._.method;

        },

        getData: function () {
            this._normalize();
            return this._.data;

        },

        getHeaders: function () {
            return this._.headers;

        },

        setUrl: function (url) {
            this._updating('url');
            this._.url = Url.from(url);
            return this;

        },

        setMethod: function (method) {
            this._updating('method');
            this._.method = method.toLowerCase();
            return this;

        },

        setData: function (k, v) {
            this._updating('data');

            if (k === null) {
                this._.data = {};

            } else if (v === undefined && typeof k === 'object') {
                for (v in k) {
                    if (k.hasOwnProperty(v)) {
                        this._.data[v] = k[v];

                    }
                }
            } else {
                this._.data[k] = v;

            }

            return this;

        },

        setHeader: function (header, value) {
            this._updating('headers');
            this._.headers[header] = value;
            return this;

        },

        setHeaders: function (headers) {
            this._updating('headers');

            for (var header in headers) {
                if (headers.hasOwnProperty(header)) {
                    this._.headers[header] = headers[header];

                }
            }

            return this;

        },

        abort: function () {
            if (!this._.aborted) {
                this._.aborted = true;
                this.trigger('abort');

            }

            return this;

        },

        isAborted: function () {
            return this._.aborted;

        },

        _normalize: function() {
            if (this._.normalized || !this.isFrozen()) {
                return;

            }

            this._.normalized = true;

            if (this._.method === 'GET' || this._.method === 'HEAD') {
                this._.url.addParams(this._.data instanceof FormData ? this._.data.exportData(true) : this._.data);
                this._.data = {};

            }
        }
    });

    _context.mixin(Request, 'Nittro.Freezable');
    _context.register(Request, 'Request');

}, {
    Url: 'Utils.Url'
});
;
_context.invoke('Nittro.Ajax', function () {

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
;
_context.invoke('Nittro.Ajax', function (Request) {

    var Service = _context.extend('Nittro.Object', function () {
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
;
_context.invoke('Nittro.Ajax.Transport', function (Response, FormData, Url) {

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

            if (headers['content-type'] && headers['content-type'].split(/;/)[0] === 'application/json') {
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
    Response: 'Nittro.Ajax.Response',
    FormData: 'Nittro.Ajax.FormData'
});
;
_context.invoke('Nittro.Page', function (DOM, undefined) {

    var Snippet = _context.extend(function (id, state) {
        this._ = {
            id: id,
            container: false,
            state: typeof state === 'number' ? state : Snippet.INACTIVE,
            data: {},
            handlers: [
                [], [], [], []
            ]
        };
    }, {
        STATIC: {
            INACTIVE: -1,
            PREPARE_SETUP: 0,
            RUN_SETUP: 1,
            PREPARE_TEARDOWN: 2,
            RUN_TEARDOWN: 3
        },

        getId: function () {
            return this._.id;

        },

        setup: function (prepare, run) {
            if (prepare && !run) {
                run = prepare;
                prepare = null;

            }

            if (prepare) {
                if (this._.state === Snippet.PREPARE_SETUP) {
                    prepare(this.getElement());

                } else {
                    this._.handlers[Snippet.PREPARE_SETUP].push(prepare);

                }
            }

            if (run) {
                if (this._.state === Snippet.RUN_SETUP) {
                    run(this.getElement());

                } else {
                    this._.handlers[Snippet.RUN_SETUP].push(run);

                }
            }

            return this;

        },

        teardown: function (prepare, run) {
            if (prepare && !run) {
                run = prepare;
                prepare = null;

            }

            if (prepare) {
                if (this._.state === Snippet.PREPARE_TEARDOWN) {
                    prepare(this.getElement());

                } else {
                    this._.handlers[Snippet.PREPARE_TEARDOWN].push(prepare);

                }
            }

            if (run) {
                if (this._.state === Snippet.RUN_TEARDOWN) {
                    run(this.getElement());

                } else {
                    this._.handlers[Snippet.RUN_TEARDOWN].push(run);

                }
            }

            return this;

        },

        setState: function (state) {
            if (state === Snippet.INACTIVE) {
                this._.state = state;

                this._.handlers.forEach(function (queue) {
                    queue.splice(0, queue.length);

                });

            } else if (state - 1 === this._.state) {
                this._.state = state;

                var elm = this.getElement();

                this._.handlers[this._.state].forEach(function (handler) {
                    handler(elm);

                });

                this._.handlers[this._.state].splice(0, this._.handlers[this._.state].length);

            }

            return this;

        },

        getState: function () {
            return this._.state;

        },

        getData: function (key, def) {
            return key in this._.data ? this._.data[key] : (def === undefined ? null : def);

        },

        setData: function (key, value) {
            this._.data[key] = value;
            return this;

        },

        setContainer: function () {
            this._.container = true;
            return this;

        },

        isContainer: function () {
            return this._.container;

        },

        getElement: function () {
            return DOM.getById(this._.id);

        }
    });

    _context.register(Snippet, 'Snippet');

}, {
    DOM: 'Utils.DOM'
});
;
_context.invoke('Nittro.Page', function (Snippet, DOM) {

    var SnippetHelpers = {
        _getTransitionTargets: function (elem) {
            var sel = DOM.getData(elem, 'transition');

            if (sel === null && !DOM.getData(elem, 'dynamic-remove')) {
                sel = this._.options.defaultTransition;

            }

            return sel ? DOM.find(sel) : [];

        },

        _getRemoveTargets: function (elem) {
            var sel = DOM.getData(elem, 'dynamic-remove');
            return sel ? DOM.find(sel) : [];

        },

        _getDynamicContainerCache: function () {
            if (this._.containerCache === null) {
                this._.containerCache = DOM.getByClassName('snippet-container')
                    .map(function (elem) {
                        return elem.id;
                    });
            }

            return this._.containerCache;

        },

        _clearDynamicContainerCache: function () {
            this._.containerCache = null;

        },

        _getDynamicContainer: function (id) {
            var cache = this._getDynamicContainerCache(),
                i, n, container, data;

            for (i = 0, n = cache.length; i < n; i++) {
                container = this.getSnippet(cache[i]);

                if (!container.isContainer()) {
                    data = this._prepareDynamicContainer(container);

                } else {
                    data = container.getData('_container');

                }

                if (data.mask.test(id)) {
                    return data;

                }
            }

            throw new Error('Dynamic snippet #' + id + ' has no container');

        },

        _applySnippets: function (snippets, removeElms) {
            var setup = {},
                teardown = {},
                dynamic = [],
                containers = {};

            this._clearDynamicContainerCache();

            this._prepareStaticSnippets(snippets, setup, teardown, dynamic, removeElms);
            this._prepareDynamicSnippets(dynamic, snippets, containers);
            this._prepareRemoveTargets(removeElms, teardown);

            this._teardown(teardown);

            this._applyRemove(removeElms);
            this._applyContainers(containers, teardown);
            this._applySetup(setup, snippets);

            this._setup();

            return dynamic.map(function (snippet) {
                if (!snippet.elem) {
                    DOM.addClass(snippet.content, 'dynamic-add');
                    return snippet.content;

                } else {
                    DOM.addClass(snippet.elem, 'dynamic-update');
                    return snippet.elem;

                }
            });
        },

        _prepareDynamicContainer: function (snippet) {
            var elem = snippet.getElement(),
                data = {
                    id: snippet.getId(),
                    mask: new RegExp('^' + DOM.getData(elem, 'dynamic-mask') + '$'),
                    element: DOM.getData(elem, 'dynamic-element') || 'div',
                    sort: DOM.getData(elem, 'dynamic-sort') || 'append',
                    sortCache: DOM.getData(elem, 'dynamic-sort-cache') === false ? false : null
                };

            snippet.setContainer();
            snippet.setData('_container', data);
            return data;

        },

        _prepareRemoveTargets: function (removeElms, teardown) {
            for (var i = 0; i < removeElms.length; i++) {
                this._prepareRemoveTarget(removeElms[i], teardown);

            }
        },

        _prepareRemoveTarget: function (elem, teardown) {
            this._cleanupChildSnippets(elem, teardown);
            this._cleanupForms(elem);

            if (this.isSnippet(elem)) {
                teardown[elem.id] = true;

            }
        },

        _prepareStaticSnippets: function (snippets, setup, teardown, dynamic, removeElms) {
            for (var id in snippets) {
                if (snippets.hasOwnProperty(id)) {
                    this._prepareStaticSnippet(id, setup, teardown, dynamic, removeElms);

                }
            }
        },

        _prepareStaticSnippet: function (id, setup, teardown, dynamic, removeElms) {
            if (this._.snippets[id] && this._.snippets[id].getState() === Snippet.RUN_SETUP) {
                teardown[id] = false;

            }

            var snippet = DOM.getById(id),
                dyn;

            if (snippet) {
                dyn = DOM.hasClass(snippet.parentNode, 'snippet-container');

                if (!removeElms.length || removeElms.indexOf(snippet) === -1) {
                    this._cleanupChildSnippets(snippet, teardown);
                    this._cleanupForms(snippet);

                    if (dyn) {
                        dynamic.push({id: id, elem: snippet});

                    } else {
                        setup[id] = snippet;

                    }
                } else {
                    dynamic.push({id: id});

                }
            } else {
                dynamic.push({id: id});

            }
        },

        _prepareDynamicSnippets: function (dynamic, snippets, containers) {
            for (var i = 0; i < dynamic.length; i++) {
                this._prepareDynamicSnippet(dynamic[i], snippets[dynamic[i].id], containers);

            }
        },

        _prepareDynamicSnippet: function (snippet, content, containers) {
            var container = this._getDynamicContainer(snippet.id);

            snippet.content = this._createDynamic(container.element, snippet.id, content);

            if (!containers[container.id]) {
                containers[container.id] = [];

            }

            containers[container.id].push(snippet);

        },

        _createDynamic: function (elem, id, html) {
            elem = elem.split(/\./g);
            elem[0] = DOM.create(elem[0], { id: id });

            if (elem.length > 1) {
                DOM.addClass.apply(null, elem);

            }

            elem = elem[0];
            DOM.html(elem, html);
            return elem;

        },

        _applyRemove: function (removeElms) {
            removeElms.forEach(function (elem) {
                elem.parentNode.removeChild(elem);

            });
        },

        _applySetup: function (snippets, data) {
            for (var id in snippets) {
                if (snippets.hasOwnProperty(id)) {
                    DOM.html(snippets[id], data[id]);

                }
            }
        },

        _applyContainers: function (containers, teardown) {
            for (var id in containers) {
                if (containers.hasOwnProperty(id)) {
                    this._applyDynamic(this.getSnippet(id), containers[id], teardown);

                }
            }
        },

        _applyDynamic: function (container, snippets, teardown) {
            var containerData = container.getData('_container');

            if (containerData.sort === 'append') {
                this._appendDynamic(container.getElement(), snippets);

            } else if (containerData.sort === 'prepend') {
                this._prependDynamic(container.getElement(), snippets);

            } else {
                this._sortDynamic(containerData, container.getElement(), snippets, teardown);

            }
        },

        _appendDynamic: function (elem, snippets) {
            snippets.forEach(function (snippet) {
                if (snippet.elem) {
                    DOM.html(snippet.elem, snippet.content.innerHTML);

                } else {
                    elem.appendChild(snippet.content);

                }
            });
        },

        _prependDynamic: function (elem, snippets) {
            var first = elem.firstChild;

            snippets.forEach(function (snippet) {
                if (snippet.elem) {
                    DOM.html(snippet.elem, snippet.content.innerHTML);

                } else {
                    elem.insertBefore(snippet.content, first);

                }
            });
        },

        _sortDynamic: function (container, elem, snippets, teardown) {
            var sortData = this._getSortData(container, elem, teardown);
            this._mergeSortData(sortData, snippets.map(function(snippet) { return snippet.content; }));

            var sorted = this._applySort(sortData);
            snippets = this._getSnippetMap(snippets);

            this._insertSorted(elem, sorted, snippets);

        },

        _insertSorted: function (container, sorted, snippets) {
            var i = 0, n = sorted.length, tmp;

            tmp = container.firstElementChild;

            while (i < n && sorted[i] in snippets && !snippets[sorted[i]].elem) {
                container.insertBefore(snippets[sorted[i]].content, tmp);
                i++;

            }

            while (n > i && sorted[n - 1] in snippets && !snippets[sorted[n - 1]].elem) {
                n--;

            }

            for (; i < n; i++) {
                if (sorted[i] in snippets) {
                    if (snippets[sorted[i]].elem) {
                        snippets[sorted[i]].elem.innerHTML = '';

                        if (snippets[sorted[i]].elem.previousElementSibling !== (i > 0 ? DOM.getById(sorted[i - 1]) : null)) {
                            container.insertBefore(snippets[sorted[i]].elem, i > 0 ? DOM.getById(sorted[i - 1]).nextElementSibling : container.firstElementChild);

                        }

                        while (tmp = snippets[sorted[i]].content.firstChild) {
                            snippets[sorted[i]].elem.appendChild(tmp);

                        }
                    } else {
                        container.insertBefore(snippets[sorted[i]].content, DOM.getById(sorted[i - 1]).nextElementSibling);

                    }
                }
            }

            while (n < sorted.length) {
                container.appendChild(snippets[sorted[n]].content);
                n++;

            }
        },

        _getSnippetMap: function (snippets) {
            var map = {};

            snippets.forEach(function (snippet) {
                map[snippet.id] = snippet;
            });

            return map;

        },

        _applySort: function (sortData) {
            var sorted = [],
                id;

            for (id in sortData.snippets) {
                sorted.push({ id: id, values: sortData.snippets[id] });

            }

            sorted.sort(this._compareDynamic.bind(this, sortData.descriptor));
            return sorted.map(function(snippet) { return snippet.id; });

        },

        _compareDynamic: function (descriptor, a, b) {
            var i, n, v;

            for (i = 0, n = descriptor.length; i < n; i++) {
                v = a.values[i] < b.values[i] ? -1 : (a.values[i] > b.values[i] ? 1 : 0);

                if (v !== 0) {
                    return v * (descriptor[i].asc ? 1 : -1);

                }
            }

            return 0;

        },

        _getSortData: function (container, elem, teardown) {
            var sortData = container.sortCache;

            if (!sortData) {
                sortData = this._buildSortData(container, elem, teardown);

                if (container.sortCache !== false) {
                    container.sortCache = sortData;

                }
            } else {
                for (var id in sortData.snippets) {
                    if (id in teardown && teardown[id]) {
                        delete sortData.snippets[id];

                    }
                }
            }

            return sortData;

        },

        _buildSortData: function (container, elem, teardown) {
            var sortData = {
                descriptor: container.sort.trim().split(/\s*,\s*/g).map(this._parseDescriptor.bind(this, container.id)),
                snippets: {}
            };

            this._mergeSortData(sortData, DOM.getChildren(elem), teardown);

            return sortData;

        },

        _mergeSortData: function (sortData, snippets, teardown) {
            snippets.forEach(function (snippet) {
                var id = snippet.id;

                if (!teardown || !(id in teardown) || !teardown[id]) {
                    sortData.snippets[id] = this._extractSortData(snippet, sortData.descriptor);

                }
            }.bind(this));
        },

        _extractSortData: function (snippet, descriptor) {
            return descriptor.map(function (field) {
                return field.extractor(snippet);

            });
        },

        _parseDescriptor: function (id, descriptor) {
            var m = descriptor.match(/^(.+?)(?:\[(.+?)\])?(?:\((.+?)\))?(?:\s+(.+?))?$/),
                sel, attr, prop, asc;

            if (!m) {
                throw new Error('Invalid sort descriptor: ' + descriptor);

            }

            sel = m[1];
            attr = m[2];
            prop = m[3];
            asc = m[4];

            if (sel.match(/^[^.]|[\s#\[>+:]/)) {
                throw new TypeError('Invalid selector for sorted insert mode in container #' + id);

            }

            sel = sel.substr(1);
            asc = asc ? /^[1tay]/i.test(asc) : true;

            if (attr) {
                return {extractor: this._getAttrExtractor(sel, attr), asc: asc};

            } else if (prop) {
                return {extractor: this._getDataExtractor(sel, prop), asc: asc};

            } else {
                return {extractor: this._getTextExtractor(sel), asc: asc};

            }
        },

        _getAttrExtractor: function (sel, attr) {
            return function (elem) {
                elem = elem.getElementsByClassName(sel);
                return elem.length ? elem[0].getAttribute(attr) || null : null;
            };
        },

        _getDataExtractor: function (sel, prop) {
            return function (elem) {
                elem = elem.getElementsByClassName(sel);
                return elem.length ? DOM.getData(elem[0], prop) : null;
            };
        },

        _getTextExtractor: function (sel) {
            return function (elem) {
                elem = elem.getElementsByClassName(sel);
                return elem.length ? elem[0].textContent : null;
            };
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

        _setup: function () {
            this.trigger('setup');

            this._setSnippetsState(this._.snippets, Snippet.PREPARE_SETUP);
            this._setSnippetsState(this._.snippets, Snippet.RUN_SETUP);

        },

        _setSnippetsState: function (snippets, state) {
            this._.currentPhase = state;

            for (var id in snippets) {
                if (snippets.hasOwnProperty(id)) {
                    this.getSnippet(id).setState(state);

                }
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
            if (!this._.formLocator) {
                return;

            }

            if (snippet.tagName.toLowerCase() === 'form') {
                this._.formLocator.removeForm(snippet);

            } else {
                var forms = snippet.getElementsByTagName('form'),
                    i;

                for (i = 0; i < forms.length; i++) {
                    this._.formLocator.removeForm(forms.item(i));

                }
            }
        }
    };

    _context.register(SnippetHelpers, 'SnippetHelpers');

}, {
    DOM: 'Utils.DOM'
});
;
_context.invoke('Nittro.Page', function (DOM, Arrays) {

    var Transitions = _context.extend(function(duration) {
        this._ = {
            duration: duration || false,
            ready: true,
            queue: [],
            support: false,
            property: null
        };

        try {
            var s = DOM.create('span').style;

            this._.support = [
                'transition',
                'WebkitTransition',
                'MozTransition',
                'msTransition',
                'OTransition'
            ].some(function(prop) {
                if (prop in s) {
                    this._.property = prop;
                    return true;
                }
            }.bind(this));

            s = null;

        } catch (e) { }

    }, {
        transitionOut: function (elements) {
            return this._begin(elements, 'transition-out');

        },

        transitionIn: function (elements) {
            return this._begin(elements, 'transition-in');

        },

        _begin: function (elements, className) {
            if (!this._.support || !this._.duration || !elements.length) {
                return Promise.resolve(elements);

            } else {
                return this._resolve(elements, className);

            }
        },

        _resolve: function (elements, className) {
            if (!this._.ready) {
                return new Promise(function (resolve) {
                    this._.queue.push([elements, className, resolve]);

                }.bind(this));
            }

            this._.ready = false;

            if (className === 'transition-in') {
                var foo = window.pageXOffset; // needed to force layout and thus run asynchronously

            }

            DOM.addClass(elements, 'transition-active ' + className);
            DOM.removeClass(elements, 'transition-middle');

            var duration = this._getDuration(elements);

            var promise = new Promise(function (resolve) {
                window.setTimeout(function () {
                    DOM.removeClass(elements, 'transition-active ' + className);

                    if (className === 'transition-out') {
                        DOM.addClass(elements, 'transition-middle');

                    }

                    this._.ready = true;

                    resolve(elements);

                }.bind(this), duration);
            }.bind(this));

            promise.then(function () {
                if (this._.queue.length) {
                    var q = this._.queue.shift();

                    this._resolve(q[0], q[1]).then(function () {
                        q[2](q[0]);

                    });
                }
            }.bind(this));

            return promise;

        },

        _getDuration: function (elements) {
            if (!window.getComputedStyle) {
                return this._.duration;

            }

            var durations = [],
                prop = this._.property + 'Duration';

            elements.forEach(function (elem) {
                var duration = window.getComputedStyle(elem)[prop];

                if (duration) {
                    duration = (duration + '').trim().split(/\s*,\s*/g).map(function (v) {
                        v = v.match(/^((?:\d*\.)?\d+)(m?s)$/);

                        if (v) {
                            return parseFloat(v[1]) * (v[2] === 'ms' ? 1 : 1000);

                        } else {
                            return 0;

                        }
                    });

                    durations.push.apply(durations, duration.filter(function(v) { return v > 0; }));

                }
            });

            if (durations.length) {
                return Math.max.apply(null, durations);

            } else {
                return this._.duration;

            }
        }
    });

    _context.register(Transitions, 'Transitions');

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays'
});
;
_context.invoke('Nittro.Page', function (DOM, Arrays, Url, SnippetHelpers, Snippet) {

    var Service = _context.extend('Nittro.Object', function (ajax, transitions, flashMessages, options) {
        Service.Super.call(this);

        this._.ajax = ajax;
        this._.transitions = transitions;
        this._.flashMessages = flashMessages;
        this._.request = null;
        this._.snippets = {};
        this._.containerCache = null;
        this._.currentPhase = Snippet.INACTIVE;
        this._.transitioning = null;
        this._.setup = false;
        this._.currentUrl = Url.fromCurrent();
        this._.options = Arrays.mergeTree({}, Service.defaults, options);

        DOM.addListener(document, 'click', this._handleClick.bind(this));
        DOM.addListener(document, 'submit', this._handleSubmit.bind(this));
        DOM.addListener(window, 'popstate', this._handleState.bind(this));
        this.on('error:default', this._showError.bind(this));

        this._checkReady();

    }, {
        STATIC: {
            defaults: {
                whitelistRedirects: false,
                whitelistLinks: true,
                whitelistForms: true,
                defaultTransition: null
            }
        },

        setFormLocator: function (formLocator) {
            this._.formLocator = formLocator;
            return this;

        },

        open: function (url, method, data) {
            return this._createRequest(url, method, data);

        },

        openLink: function (link, evt) {
            return this._createRequest(link.href, 'get', null, evt, link);

        },

        sendForm: function (form, evt) {
            this._checkFormLocator(true);

            var frm = this._.formLocator.getForm(form),
                data = frm.serialize();

            return this._createRequest(form.action, form.method, data, evt, form)
                .then(function () {
                    frm.reset();

                });
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

        _checkFormLocator: function (need) {
            if (this._.formLocator) {
                return true;

            } else if (!need) {
                return false;

            }

            throw new Error("Nittro/Page service: Form support wasn't enabled. Please install Nittro/Application and inject the FormLocator service using the setFormLocator() method.");

        },

        _handleState: function () {
            var url = Url.fromCurrent(),
                request;

            if (!this._checkUrl(url)) {
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

            if (payload.title) {
                document.title = payload.title;

            }

            this._.currentUrl = Url.from(url);
            window.history.pushState(null, document.title, this._.currentUrl.toAbsolute());

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

        _checkLink: function (link) {
            return this._.options.whitelistLinks ? DOM.hasClass(link, 'ajax') : !DOM.hasClass(link, 'noajax');

        },

        _handleClick: function (evt) {
            if (evt.defaultPrevented || evt.ctrlKey || evt.shiftKey || evt.altKey || evt.metaKey) {
                return;

            }

            if (this._checkFormLocator() && this._handleButton(evt)) {
                return;

            }

            var link = DOM.closest(evt.target, 'a');

            if (!link || !this._checkLink(link) || !this._checkUrl(link.href)) {
                return;

            }

            this.openLink(link, evt);

        },

        _checkForm: function (form) {
            return this._.options.whitelistForms ? DOM.hasClass(form, 'ajax') : !DOM.hasClass(form, 'noajax');

        },

        _handleButton: function(evt) {
            var btn = DOM.closest(evt.target, 'button') || DOM.closest(evt.target, 'input'),
                frm;

            if (btn && btn.type === 'submit') {
                if (btn.form && this._checkForm(btn.form)) {
                    frm = this._.formLocator.getForm(btn.form);
                    frm.setSubmittedBy(btn.name || null);

                }

                return true;

            }
        },

        _handleSubmit: function (evt) {
            if (evt.defaultPrevented || !this._checkFormLocator()) {
                return;

            }

            if (!(evt.target instanceof HTMLFormElement) || !this._checkForm(evt.target) || !this._checkUrl(evt.target.action)) {
                return;

            }

            this.sendForm(evt.target, evt);

        },

        _createRequest: function (url, method, data, evt, context) {
            if (this._.request) {
                this._.request.abort();

            }

            var create = this.trigger('create-request', {
                url: url,
                method: method,
                data: data,
                context: context
            });

            if (create.isDefaultPrevented()) {
                evt && evt.preventDefault();
                return Promise.reject();

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

        _dispatchRequest: function (request, context, pushState) {
            this._.request = request;

            var xhr = this._.ajax.dispatch(request); // may throw exception

            var transitionElms,
                removeElms,
                transition;

            if (context) {
                transitionElms = this._getTransitionTargets(context);
                removeElms = this._getRemoveTargets(context);

                if (removeElms.length) {
                    DOM.addClass(removeElms, 'dynamic-remove');

                }

                this._.transitioning = transitionElms.concat(removeElms);
                transition = this._.transitions.transitionOut(this._.transitioning.slice());

            } else {
                transitionElms = [];
                removeElms = [];
                transition = null;

            }

            var p = Promise.all([xhr, transitionElms, removeElms, pushState || false, transition]);
            return p.then(this._handleResponse.bind(this), this._handleError.bind(this));

        },

        _handleResponse: function (queue) {
            if (!this._.request) {
                this._cleanup();
                return null;

            }

            var response = queue[0],
                transitionElms = queue[1] || this._.transitioning || [],
                removeElms = queue[2],
                pushState = queue[3],
                payload = response.getPayload();

            if (typeof payload !== 'object' || !payload) {
                this._cleanup();
                return null;

            }

            this._showFlashes(payload.flashes);

            if (this._tryRedirect(payload, pushState)) {
                return payload;

            } else if (pushState) {
                this._pushState(payload, this._.request.getUrl());

            }

            this._.request = this._.transitioning = null;

            var dynamic = this._applySnippets(payload.snippets || {}, removeElms);
            DOM.toggleClass(dynamic, 'transition-middle', true);

            this._showHtmlFlashes();

            this.trigger('update', payload);

            this._.transitions.transitionIn(transitionElms.concat(dynamic))
                .then(function () {
                    DOM.removeClass(dynamic, 'dynamic-add dynamic-update');

                });

            return payload;

        },

        _checkUrl: function(url) {
            var d = Url.fromCurrent().compare(url);
            return d === 0 || d < Url.PART.PORT && d > Url.PART.HASH;

        },

        _checkRedirect: function (payload) {
            return !this._.options.whitelistRedirects !== !payload.allowAjax && this._checkUrl(payload.redirect);

        },

        _tryRedirect: function (payload, pushState) {
            if ('redirect' in payload) {
                if (this._checkRedirect(payload)) {
                    this._dispatchRequest(this._.ajax.createRequest(payload.redirect), null, pushState);

                } else {
                    document.location.href = payload.redirect;

                }

                return true;

            }
        },

        _cleanup: function () {
            this._.request = null;

            if (this._.transitioning) {
                this._.transitions.transitionIn(this._.transitioning);
                this._.transitioning = null;

            }
        },

        _showFlashes: function (flashes) {
            if (!flashes) {
                return;

            }

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

        _handleError: function (evt) {
            this._cleanup();
            this.trigger('error', evt);

        },

        _showError: function (evt) {
            if (evt.data.type === 'connection') {
                this._.flashMessages.add(null, 'error', 'There was an error connecting to the server. Please check your internet connection and try again.');

            } else if (evt.data.type !== 'abort') {
                this._.flashMessages.add(null, 'error', 'There was an error processing your request. Please try again later.');

            }
        }
    });

    _context.mixin(Service, SnippetHelpers);

    _context.register(Service, 'Service');

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays',
    Url: 'Utils.Url'
});
;
_context.invoke('Nittro.Widgets', function (DOM, Arrays) {

    var FlashMessages = _context.extend(function (options) {
        this._ = {
            options: Arrays.mergeTree({}, FlashMessages.defaults, options),
            globalHolder: DOM.create('div', {'class': 'flash-global-holder'})
        };

        this._.options.layer.appendChild(this._.globalHolder);

        if (!this._.options.positioning) {
            this._.options.positioning = FlashMessages.basicPositioning;

        }

    }, {
        STATIC: {
            defaults: {
                layer: null,
                minMargin: 20,
                positioning: null
            },
            basicPositioning: [
                function(target, elem, minMargin) {
                    var res = {
                        name: 'below',
                        left: target.left + (target.width - elem.width) / 2,
                        top: target.bottom
                    };

                    if (target.bottom + elem.height + minMargin < window.innerHeight && res.left > 0 && res.left + elem.width < window.innerWidth) {
                        return res;

                    }
                },
                function (target, elem, minMargin) {
                    var res = {
                        name: 'rightOf',
                        left: target.right,
                        top: target.top + (target.height - elem.height) / 2
                    };

                    if (target.right + elem.width + minMargin < window.innerWidth && res.top > 0 && res.top + elem.height < window.innerHeight) {
                        return res;

                    }
                },
                function (target, elem, minMargin) {
                    var res = {
                        name: 'above',
                        left: target.left + (target.width - elem.width) / 2,
                        top: target.top - elem.height
                    };

                    if (target.top > elem.height + minMargin && res.left > 0 && res.left + elem.width < window.innerWidth) {
                        return res;

                    }
                },
                function (target, elem, minMargin) {
                    var res = {
                        name: 'leftOf',
                        left: target.left - elem.width,
                        top: target.top + (target.height - elem.height) / 2
                    };

                    if (target.left > elem.width + minMargin && res.top > 0 && res.top + elem.height < window.innerHeight) {
                        return res;

                    }
                }
            ]
        },
        add: function (target, type, content, rich) {
            var elem = DOM.create('div', {
                'class': 'flash flash-' + (type || 'info')
            });

            if (target && typeof target === 'string') {
                target = DOM.getById(target);

            }

            if (rich) {
                DOM.html(elem, content);

            } else {
                elem.textContent = content;

            }

            DOM.setStyle(elem, 'opacity', 0);
            this._.options.layer.appendChild(elem);

            var style = {},
                timeout = Math.max(2000, Math.round(elem.textContent.split(/\s+/).length / 0.003));

            if (target) {
                var fixed = this._hasFixedParent(target),
                    elemRect = this._getRect(elem),
                    targetRect = this._getRect(target),
                    position;

                if (fixed) {
                    style.position = 'fixed';

                }

                for (var i = 0; i < this._.options.positioning.length; i++) {
                    if (position = this._.options.positioning[i].call(null, targetRect, elemRect, this._.options.minMargin)) {
                        break;

                    }
                }

                if (position) {
                    style.left = position.left;
                    style.top = position.top;

                    if (!fixed) {
                        style.left += window.pageXOffset;
                        style.top += window.pageYOffset;

                    }

                    style.left += 'px';
                    style.top += 'px';
                    style.opacity = '';

                    DOM.setStyle(elem, style);
                    this._show(elem, position.name, timeout);
                    return;

                }
            }

            this._.globalHolder.appendChild(elem);
            DOM.setStyle(elem, 'opacity', '');
            this._show(elem, 'global', timeout);

        },

        _show: function (elem, position, timeout) {
            DOM.addClass(elem, 'flash-show flash-' + position);

            window.setTimeout(function () {
                var foo = window.pageYOffset; // need to force css recalculation
                DOM.removeClass(elem, 'flash-show');
                this._bindHide(elem, timeout);

            }.bind(this), 1);
        },

        _bindHide: function (elem, timeout) {
            var hide = function () {
                DOM.removeListener(document, 'mousemove', hide);
                DOM.removeListener(document, 'mousedown', hide);
                DOM.removeListener(document, 'keydown', hide);
                DOM.removeListener(document, 'touchstart', hide);

                window.setTimeout(function () {
                    DOM.addClass(elem, 'flash-hide');

                    window.setTimeout(function () {
                        elem.parentNode.removeChild(elem);

                    }, 1000);
                }, timeout);
            }.bind(this);

            DOM.addListener(document, 'mousemove', hide);
            DOM.addListener(document, 'mousedown', hide);
            DOM.addListener(document, 'keydown', hide);
            DOM.addListener(document, 'touchstart', hide);

        },

        _hasFixedParent: function (elem) {
            do {
                if (elem.style.position === 'fixed') return true;
                elem = elem.offsetParent;

            } while (elem && elem !== document.documentElement && elem !== document.body);

            return false;

        },

        _getRect: function (elem) {
            var rect = elem.getBoundingClientRect();

            return {
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                width: 'width' in rect ? rect.width : (rect.right - rect.left),
                height: 'height' in rect ? rect.height : (rect.bottom - rect.top)
            };
        }
    });

    _context.register(FlashMessages, 'FlashMessages');

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays'
});
;
_context.invoke('Utils', function (undefined) {

    var DateInterval = function (interval) {
        this._ = {
            initialized: false,
            interval: interval
        };
    };

    DateInterval.from = function (interval) {
        return new DateInterval(interval);

    };

    var intervalNames = [
        'year',
        'month',
        'week',
        'day',
        'hour',
        'minute',
        'second',
        'millisecond'
    ];

    var intervalLengths = [
        31536000000,
        604800000,
        2678400000,
        86400000,
        3600000,
        60000,
        1000,
        1
    ];

    var intervalHelpers = [
        { pattern: /^y(?:ears?)?$/, toString: function(n) { return n === 1 ? 'year' : 'years' } },
        { pattern: /^mon(?:ths?)?$/, toString: function(n) { return n === 1 ? 'month' : 'months' } },
        { pattern: /^w(?:eeks?)?$/, toString: function(n) { return n === 1 ? 'week' : 'weeks' } },
        { pattern: /^d(?:ays?)?$/, toString: function(n) { return n === 1 ? 'day' : 'days' } },
        { pattern: /^h(?:ours?)?$/, toString: function(n) { return n === 1 ? 'hour' : 'hours' } },
        { pattern: /^min(?:utes?)?$/, toString: function(n) { return n === 1 ? 'minute' : 'minutes' } },
        { pattern: /^s(?:ec(?:onds?)?)?$/, toString: function(n) { return n === 1 ? 'second' : 'seconds' } },
        { pattern: /^millis(?:econds?)?$|^ms$/, toString: function(n) { return n === 1 ? 'millisecond' : 'milliseconds' } }
    ];


    var separators = [', ', ' and '];


    DateInterval.setHelpers = function (helpers) {
        // @todo check helpers are valid
        intervalHelpers = helpers;

    };

    DateInterval.setSeparators = function (separator, last) {
        separators = [separator, last];

    };

    function getValue(interval) {
        if (typeof interval === 'number') {
            return interval;
        } else if (interval instanceof DateInterval) {
            return interval.getLength();
        } else {
            return DateInterval.from(interval).getLength();
        }
    }

    DateInterval.prototype.add = function (interval) {
        this._initialize();
        this._.interval += getValue(interval);
        return this;

    };

    DateInterval.prototype.subtract = function (interval) {
        this._initialize();
        this._.interval -= getValue(interval);
        return this;

    };

    DateInterval.prototype.isNegative = function () {
        this._initialize();
        return this._.interval < 0;

    };

    DateInterval.prototype.getLength = function () {
        this._initialize();
        return this._.interval;

    };

    DateInterval.prototype.valueOf = function () {
        return this.getLength();

    };


    function formatAuto(interval, precision) {
        if (precision === true) {
            precision = intervalNames.length;

        } else if (!precision) {
            precision = 2;

        }

        var i, v, str = [], last, sign = '';

        if (interval < 0) {
            sign = '-';
            interval = -interval;

        }

        for (i = 0; i < intervalNames.length; i++) {
            if (interval >= intervalLengths[i]) {
                precision--;
                v = interval / intervalLengths[i];
                v = precision === 0 ? Math.round(v) : Math.floor(v);
                str.push(v + ' ' + intervalHelpers[i].toString(v));
                interval -= v * intervalLengths[i];

                if (precision === 0) {
                    break;

                }
            }
        }

        if (str.length > 2) {
            last = str.pop();
            return sign + str.join(separators[0]) + (separators[1] || separators[0]) + last;

        } else {
            return sign + str.join(separators[1] || separators[0]);

        }
    }

    function format(interval, pattern) {
        var sign = interval < 0 ? '-' : '+';
        interval = Math.abs(interval);

        return (pattern + '').replace(/%(.)/g, function (m, f) {
            var v, pad = false;

            switch (f) {
                case '%':
                    return '%';

                case 'y':
                    m = intervalLengths[0];
                    break;

                case 'w':
                    m = intervalLengths[1];
                    break;

                case 'm':
                    pad = true;
                case 'n':
                    m = intervalLengths[2];
                    break;

                case 'd':
                    pad = true;
                case 'j':
                    m = intervalLengths[3];
                    break;

                case 'H':
                    pad = true;
                case 'G':
                    m = intervalLengths[4];
                    break;

                case 'i':
                    pad = true;
                case 'I':
                    m = intervalLengths[5];
                    break;

                case 's':
                    pad = true;
                case 'S':
                    m = intervalLengths[6];
                    break;

                case '-':
                    return sign === '-' ? sign : '';

                case '+':
                    return sign;

                default:
                    throw new Error('Unknown format modifier: %' + f);

            }

            v = Math.floor(interval / m);
            interval -= m * v;
            return pad && v < 10 ? '0' + v : v;

        });
    }

    DateInterval.prototype.format = function (pattern) {
        this._initialize();

        if (typeof pattern === 'boolean' || typeof pattern === 'number' || !pattern) {
            return formatAuto(this._.interval, pattern);

        } else {
            return format(this._.interval, pattern);

        }
    };

    DateInterval.prototype._initialize = function () {
        if (this._.initialized) {
            return;
        }

        this._.initialized = true;

        if (typeof this._.interval === 'number') {
            return;

        }

        var interval = this._.interval;

        if (interval instanceof DateInterval) {
            this._.interval = interval.getLength();

        } else if (typeof interval === 'string') {
            if (interval.match(/^\s*(?:\+|-)?\s*\d+\s*$/)) {
                this._.interval = parseInt(interval.trim());

            } else {
                var res = 0,
                    sign = 1,
                    rest;

                rest = interval.replace(/\s*(\+|-)?\s*(\d+)\s+(\S+)\s*/g, function (m, s, n, k) {
                    if (s !== undefined) {
                        sign = s === '+' ? 1 : -1;

                    }

                    k = k.toLowerCase();
                    n = parseInt(n) * sign;
                    m = null;

                    for (var i = 0; i < intervalHelpers.length; i++) {
                        if (intervalHelpers[i].pattern.test(k)) {
                            m = intervalLengths[i];
                            break;
                        }
                    }

                    if (m === null) {
                        throw new Error('Unknown keyword: "' + k + '"');

                    }

                    res += n * m;

                    return '';

                });

                if (rest.length) {
                    throw new Error('Invalid interval specification "' + interval + '", didn\'t understand "' + rest + '"');

                }

                this._.interval = res;

            }
        } else {
            throw new Error('Invalid interval specification, expected string, number or a DateInterval instance');

        }
    };

    _context.register(DateInterval, 'DateInterval');

});
;
_context.invoke('Utils', function(Strings, Arrays, DateInterval, undefined) {

	var DateTime = function(d) {
		this._ = {
			initialized: false,
			date: d || new Date()
		};
	};

    DateTime.keywords = {
        weekdays: {
            abbrev: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        months: {
            abbrev: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            full: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        },
        relative: {
            now: 'now',
            today: 'today',
            tomorrow: 'tomorrow',
            yesterday: 'yesterday',
            noon: 'noon',
            midnight: 'midnight',
            at: 'at'
        }
    };

	DateTime.from = function(s) {
		return new DateTime(s);

	};

	DateTime.now = function () {
		return new DateTime();
	};

	DateTime.isDateObject = function(o) {
		return typeof o === 'object' && o && o.date !== undefined && o.timezone !== undefined && o.timezone_type !== undefined;

	};

	DateTime.isLeapYear = function(y) {
		return y % 4 === 0 && y % 100 !== 0 || y % 400 === 0;

	};

    DateTime.isModifyString = function (str) {
        var kw = DateTime.keywords.relative,
            re = new RegExp('(?:^(?:' + [kw.now, kw.yesterday, kw.tomorrow, kw.today].map(Strings.escapeRegex).join('|') + '))|' + Strings.escapeRegex(kw.noon) + '|' + Strings.escapeRegex(kw.midnight) + '|\\d?\\d(?::\\d\\d|\\s*(?:am|pm))(?:\\d\\d)?(?:\\s*(?:am|pm))?|(?:[-+]\\s*)?\\d+\\s+[^\\d\\s]', 'i');
        return re.test(str);
    };

	DateTime.getDaysInMonth = function(m, y) {
		return m === 2 ? (DateTime.isLeapYear(y) ? 29 : 28) : (m in {4:1,6:1,9:1,11:1} ? 30 : 31);

	};

	var ni = function() { throw new Error('Not implemented!'); },
		pad = function(n) {
			return (n < 10) ? '0' + n : n;
		};

	var formatTz = function (offset) {
		if ((typeof offset === 'string' || offset instanceof String) && offset.match(/(\+|-)\d\d:\d\d/)) {
			return offset;

		}

		if (typeof offset !== 'number') {
			offset = parseInt(offset);

		}

		return (offset < 0 ? '+' : '-') + pad(parseInt(Math.abs(offset) / 60)) + ':' + pad(Math.abs(offset) % 60)

	};

	DateTime.getLocalTzOffset = function () {
		return formatTz(new Date().getTimezoneOffset());

	};

	DateTime.formatModifiers = {
		d: function(d, u) { return pad(u ? d.getUTCDate() : d.getDate()); },
		D: function(d, u) { return DateTime.keywords.weekdays.abbrev[u ? d.getUTCDay() : d.getDay()]; },
		j: function(d, u) { return u ? d.getUTCDate() : d.getDate(); },
		l: function(d, u) { return DateTime.keywords.weekdays.full[u ? d.getUTCDay() : d.getDay()]; },
		N: function(d, u, n) { n = u ? d.getUTCDay() : d.getDay(); return n === 0 ? 7 : n; },
		S: function(d, u, n) { n = u ? d.getUTCDate() : d.getDate(); n %= 10; return n === 0 || n > 3 ? 'th' : ['st', 'nd', 'rd'][n - 1]; },
		w: function(d, u) { return u ? d.getUTCDay() : d.getDay(); },
		z: function(d, u, n, m, y, M) { n = u ? d.getUTCDate() : d.getDate(); n--; y = u ? d.getUTCFullYear() : d.getFullYear(); m = 0; M = u ? d.getUTCMonth() : d.getMonth(); while (m < M) n += DateTime.getDaysInMonth(m++, y); return n; },
		W: ni,
		F: function(d, u) { return DateTime.keywords.months.full[u ? d.getUTCMonth() : d.getMonth()]; },
		m: function(d, u) { return pad((u ? d.getUTCMonth() : d.getMonth()) + 1); },
		M: function(d, u) { return DateTime.keywords.months.abbrev[u ? d.getUTCMonth() : d.getMonth()]; },
		n: function(d, u) { return (u ? d.getUTCMonth() : d.getMonth()) + 1; },
		t: function(d, u) { return DateTime.getDaysInMonth(u ? d.getUTCMonth() : d.getMonth(), u ? d.getUTCFullYear() : d.getFullYear()); },
		L: function(d, u) { return DateTime.isLeapYear(u ? d.getUTCFullYear() : d.getFullYear()) ? 1 : 0; },
		o: ni,
		Y: function(d, u) { return u ? d.getUTCFullYear() : d.getFullYear(); },
		y: function(d, u) { return (u ? d.getUTCFullYear() : d.getFullYear()).toString().substr(-2); },
		a: function(d, u, h) { h = u ? d.getUTCHours() : d.getHours(); return h >= 0 && h < 12 ? 'am' : 'pm'; },
		A: function(d, u) { return DateTime.formatModifiers.a(d, u).toUpperCase(); },
		g: function(d, u, h) { h = u ? d.getUTCHours() : d.getHours(); return h === 0 ? 12 : (h > 12 ? h - 12 : h); },
		G: function(d, u) { return u ? d.getUTCHours() : d.getHours(); },
		h: function(d, u) { return pad(DateTime.formatModifiers.g(d, u)); },
		H: function(d, u) { return pad(u ? d.getUTCHours() : d.getHours()); },
		i: function(d, u) { return pad(u ? d.getUTCMinutes() : d.getMinutes()); },
		s: function(d, u) { return pad(u ? d.getUTCSeconds() : d.getSeconds()); },
		u: function(d, u) { return (u ? d.getUTCMilliseconds() : d.getMilliseconds()) * 1000; },
		e: ni,
		I: ni,
		O: function (d, u) { return DateTime.formatModifiers.P(d, u).replace(':', ''); },
		P: function (d, u) { return u ? '+00:00' : formatTz(d.getTimezoneOffset()); },
		T: ni,
		Z: function (d, u) { return u ? 0 : d.getTimezoneOffset() * -60; },
		c: function (d, u) { return DateTime.from(d).format('Y-m-d\\TH:i:sP', u); },
		r: function (d, u) { return DateTime.from(d).format('D, n M Y G:i:s O', u); },
		U: function(d) { return Math.round(d.getTime() / 1000); }
	};

	DateTime.prototype.format = function(f, utc) {
		this._initialize();

		var d = this._.date,
			pattern = Strings.escapeRegex(Arrays.getKeys(DateTime.formatModifiers).join(',')).replace(/,/g, '|'),
			re = new RegExp('(\\\\*)(' + pattern + ')', 'g');

		return f.replace(re, function(s, c, m) {
			if (c.length % 2) {
				return c.substr(1) + m;

			}

			return c + '' + (DateTime.formatModifiers[m](d, utc));

		});

	};

	[
        'getTime',
        'getDate', 'getDay', 'getMonth', 'getFullYear',
        'getHours', 'getMinutes', 'getSeconds', 'getMilliseconds', 'getTimezoneOffset',
        'getUTCDate', 'getUTCDay', 'getUTCMonth', 'getUTCFullYear',
        'getUTCHours', 'getUTCMinutes', 'getUTCSeconds', 'getUTCMilliseconds',
        'toDateString', 'toISOString', 'toJSON',
        'toLocaleDateString', 'toLocaleFormat', 'toLocaleTimeString',
        'toString', 'toTimeString', 'toUTCString'
    ].forEach(function (method) {
        DateTime.prototype[method] = function () {
            this._initialize();
            return this._.date[method].apply(this._.date, arguments);

        };
    });

    [
        'setTime',
        'setDate', 'setMonth', 'setFullYear',
        'setHours', 'setMinutes', 'setSeconds', 'setMilliseconds',
        'setUTCDate', 'setUTCMonth', 'setUTCFullYear',
        'setUTCHours', 'setUTCMinutes', 'setUTCSeconds', 'setUTCMilliseconds'
    ].forEach(function (method) {
        DateTime.prototype[method] = function () {
            this._initialize();
            this._.date[method].apply(this._.date, arguments);
            return this;

        };
    });

	DateTime.prototype.getTimestamp = function() {
		this._initialize();
		return Math.round(this._.date.getTime() / 1000);

	};

	DateTime.prototype.getDateObject = function () {
		this._initialize();
		return this._.date;

	};

	DateTime.prototype.valueOf = function () {
		return this.getTimestamp();

	};

	DateTime.prototype.modify = function(s) {
		this._initialize();
		var t = this._.date.getTime(), r,
            re, kw = DateTime.keywords.relative;

        if (s instanceof DateInterval) {
            this._.date = new Date(t + s.getLength());
            return this;

        }

		s = s.toLowerCase();

        re = new RegExp('^(' + [kw.yesterday, kw.tomorrow, kw.now, kw.today].map(Strings.escapeRegex).join('|') + ')\\s*(?:' + Strings.escapeRegex(kw.at) + '\\s*)?');

		if (r = s.match(re)) {
			s = s.substr(r[0].length);

			switch (r[1]) {
				case kw.now:
				case kw.today:
					t = Date.now();
					break;

				case kw.yesterday:
					t -= 86400000;
					break;

				case kw.tomorrow:
					t += 86400000;
					break;

			}
		}

        re = new RegExp('^(' + Strings.escapeRegex(kw.noon) + '|' + Strings.escapeRegex(kw.midnight) + '|\\d\\d?(?::\\d\\d|\\s*(?:am|pm))(?::\\d\\d)?(?:\\s*(?:am|pm))?)\\s*');

        if (r = s.match(re)) {
			s = s.substr(r[0].length);

			t = new Date(t);

			if (r[1] === kw.noon) {
				t.setHours(12, 0, 0, 0);

			} else if (r[1] === kw.midnight) {
				t.setHours(0, 0, 0, 0);

			} else {
				r = r[1].match(/^(\d\d?)(?::(\d\d))?(?::(\d\d))?(?:\s*(am|pm))?$/);
				r[1] = parseInt(r[1]);
				r[2] = r[2] ? parseInt(r[2]) : 0;
				r[3] = r[3] ? parseInt(r[3]) : 0;

				if (r[4]) {
					if (r[4] === 'am' && r[1] === 12) {
						r[1] = 0;

					} else if (r[4] === 'pm' && r[1] < 12) {
						r[1] += 12;

					}
				}

				t.setHours(r[1], r[2], r[3], 0);

			}

			t = t.getTime();

		}

        if (s.length && !s.match(/^\s+$/)) {
            t += DateInterval.from(s).getLength();

        }

		this._.date = new Date(t);
		return this;

	};

	DateTime.prototype.modifyClone = function(s) {
		return DateTime.from(this).modify(s);

	};

	DateTime.prototype._initialize = function() {
		if (this._.initialized) {
			return;

		}

		this._.initialized = true;

		if (typeof this._.date === 'string') {
			var m;

			if (m = this._.date.match(/^@(\d+)$/)) {
				this._.date = new Date(m[1] * 1000);

			} else if (m = this._.date.match(/^(\d\d\d\d-\d\d-\d\d)[ T](\d\d:\d\d(?::\d\d(?:\.\d+)?)?)([-+]\d\d:?\d\d)?$/)) {
				this._.date = new Date(m[1] + 'T' + m[2] + (m[3] || ''));

			} else if (DateTime.isModifyString(this._.date)) {
				var s = this._.date;
				this._.date = new Date();
				this.modify(s);

			} else {
				this._.date = new Date(this._.date);

			}
		} else if (typeof this._.date === 'number') {
			this._.date = new Date(this._.date);

		} else if (DateTime.isDateObject(this._.date)) {
			var s = this._.date.date;

			if (this._.date.timezone_type !== 3 || this._.date.timezone === 'UTC') {
				s += ' ' + this._.date.timezone;

			}

			this._.date = new Date(s);

		} else if (this._.date instanceof DateTime) {
			this._.date = new Date(this._.date.getTime());

		}
	};

    _context.register(DateTime, 'DateTime');

});
;
_context.invoke('Nittro.Utils', function(Nittro, Strings, Arrays, HashMap, undefined) {

    var Tokenizer = _context.extend(function(patterns, matchCase) {
        var types = false;

        if (!Arrays.isArray(patterns)) {
            if (patterns instanceof HashMap) {
                types = patterns.getKeys();
                patterns = patterns.getValues();

            } else {
                var tmp = patterns, type;
                types = [];
                patterns = [];

                for (type in tmp) {
                    if (tmp.hasOwnProperty(type)) {
                        types.push(type);
                        patterns.push(tmp[type]);

                    }
                }
            }
        }

        this._ = {
            pattern: '(' + patterns.join(')|(') + ')',
            types: types,
            matchCase: matchCase
        };
    }, {
        STATIC: {
            getCoordinates: function(text, offset) {
                text = text.substr(0, offset);
                var m = text.match(/\n/g);

                return [(m ? m.length : 0) + 1, offset - ("\n" + text).lastIndexOf("\n") + 1];

            }
        },

        tokenize: function(input) {
            var re, tokens, pos, n;

            if (this._.types) {
                re = new RegExp(this._.pattern, 'gm' + (this._.matchCase ? '' : 'i'));
                tokens = [];
                pos = 0;
                n = this._.types.length;

                input.replace(re, function () {
                    var ofs = arguments[n + 1],
                        i;

                    if (ofs > pos) {
                        tokens.push([input.substr(pos, ofs - pos), pos, null]);

                    }

                    for (i = 1; i <= n; i++) {
                        if (arguments[i] !== undefined) {
                            tokens.push([arguments[i], ofs, this._.types[i - 1]]);
                            pos = ofs + arguments[0].length;
                            return;

                        }
                    }

                    throw new Error('Unknown token type: ' + arguments[0]);

                }.bind(this));

                if (pos + 1 < input.length) {
                    tokens.push([input.substr(pos), pos, null]);

                }
            } else {
                tokens = Strings.split(input, new RegExp(this._.pattern, 'm' + (this._.matchCase ? '' : 'i')), true, true, true);

            }

            return tokens;

        }
    });

    _context.register(Tokenizer, 'Tokenizer');

}, {
    Strings: 'Utils.Strings',
    Arrays: 'Utils.Arrays',
    HashMap: 'Utils.HashMap'
});
;
_context.invoke('Nittro.Neon', function(Nittro, HashMap, Tokenizer, Strings, Arrays, DateTime, undefined) {

    var Neon = _context.extend(function() {
        this._cbStr = this._cbStr.bind(this);

    }, {
        STATIC: {
            patterns: [
                '\'[^\'\\n]*\'|"(?:\\\\.|[^"\\\\\\n])*"', //string
                '(?:[^#"\',:=[\\]{}()\x00-\x20!`-]|[:-][^"\',\\]})\\s])(?:[^,:=\\]})(\x00-\x20]|:(?![\\s,\\]})]|$)|[ \\t]+[^#,:=\\]})(\x00-\x20])*', // literal / boolean / integer / float
                '[,:=[\\]{}()-]', // symbol
                '?:#.*', // comment
                '\\n[\\t ]*', // new line + indent
                '?:[\\t ]+' // whitespace
            ],

            brackets: {
                '{' : '}',
                '[' : ']',
                '(' : ')'
            },

            consts: {
                'true': true, 'True': true, 'TRUE': true, 'yes': true, 'Yes': true, 'YES': true, 'on': true, 'On': true, 'ON': true,
                'false': false, 'False': false, 'FALSE': false, 'no': false, 'No': false, 'NO': false, 'off': false, 'Off': false, 'OFF': false,
                'null': null, 'Null': null, 'NULL': null
            },

            indent: '    ',

            BLOCK: 1,

            encode: function(data, options) {
                var tmp, s, isList;

                if (data instanceof DateTime) {
                    return data.format('Y-m-d H:i:s O');

                } else if (data instanceof NeonEntity) {
                    tmp = Neon.encode(data.attributes);
                    return Neon.encode(data.value) + '(' + tmp.substr(1, tmp.length - 2) + ')';

                }

                if (data && typeof data === 'object') { // array or object literal
                    s = [];
                    isList = Arrays.isArray(data);

                    if (options & Neon.BLOCK) {
                        Arrays.walk(data, function(k, v) {
                            v = Neon.encode(v, Neon.BLOCK);
                            s.push(isList ? '-' : (Neon.encode(k) + ':'), Strings.contains(v, "\n") ? "\n" + Neon.indent + v.replace(/\n/g, "\n" + Neon.indent) : (' ' + v), "\n");

                        });

                        return s.length ? s.join('') : '[]';

                    } else {
                        Arrays.walk(data, function(k, v) {
                            s.push(isList ? '' : (Neon.encode(k) + ': '), Neon.encode(v), ', ');

                        });

                        s.pop(); // remove last ', '
                        return (isList ? '[' : "{") + s.join('') + (isList ? ']' : '}');

                    }
                } else if (typeof data === 'string' && !Strings.isNumeric(data)
                    && !data.match(/[\x00-\x1F]|^\d{4}|^(true|false|yes|no|on|off|null)$/i)
                    && data.match(new RegExp('^' + Neon.patterns[1] + '$'))) {

                    return data;

                } else {
                    return JSON.stringify(data);

                }
            },

            decode: function(input) {
                if (typeof input !== 'string') {
                    throw new Error('Invalid argument, must be a string');

                }

                if (!Neon.tokenizer) {
                    Neon.tokenizer = new Tokenizer(Neon.patterns);

                }

                input = input.replace(/\r/g, '');

                var parser = new Neon(),
                    res;

                parser.input = input;
                parser.tokens = Neon.tokenizer.tokenize(input);

                res = parser.parse(0, new HashMap());

                while (parser.tokens[parser.n] !== undefined) {
                    if (parser.tokens[parser.n][0].charAt(0) === "\n") {
                        parser.n++;

                    } else {
                        parser.error();

                    }
                }

                return res;

            }
        },

        input: null,
        tokens: null,
        n: 0,
        indentTabs: null,

        parse: function(indent, result) {
            indent === undefined && (indent = null);
            result === undefined && (result = new HashMap());

            var inlineParser = (indent === null),
                value = null, key = null, entity = null,
                hasValue = false, hasKey = false,
                t;

            for (; this.n < this.tokens.length; this.n++) {
                t = this.tokens[this.n][0];

                if (t === ',') {
                    if ((!hasKey && !hasValue) || !inlineParser) {
                        this.error();

                    }

                    this.addValue(result, hasKey, key, hasValue ? value : null);
                    hasKey = hasValue = false;

                } else if (t === ':' || t === '=') {
                    if (hasKey || !hasValue) {
                        this.error();

                    }

                    if (typeof value !== 'string' && typeof value !== 'number') {
                        this.error('Unacceptable key');

                    }

                    key = Strings.toString(value);
                    hasKey = true;
                    hasValue = false;

                } else if (t === '-') {
                    if (hasKey || hasValue || inlineParser) {
                        this.error();

                    }

                    key = null;
                    hasKey = true;

                } else if (Neon.brackets[t] !== undefined) {
                    if (hasValue) {
                        if (t !== '(') {
                            this.error();

                        }

                        this.n++;

                        entity = new NeonEntity();
                        entity.value = value;
                        entity.attributes = this.parse(null, new HashMap());
                        value = entity;

                    } else {
                        this.n++;
                        value = this.parse(null, new HashMap());

                    }

                    hasValue = true;

                    if (this.tokens[this.n] === undefined || this.tokens[this.n][0] !== Neon.brackets[t]) {
                        this.error();

                    }

                } else if (t === '}' || t === ']' || t === ')') {
                    if (!inlineParser) {
                        this.error();

                    }

                    break;

                } else if (t.charAt(0) === "\n") {
                    if (inlineParser) {
                        if (hasKey || hasValue) {
                            this.addValue(result, hasKey, key, hasValue ? value : null);
                            hasKey = hasValue = false;

                        }
                    } else {
                        while (this.tokens[this.n + 1] !== undefined && this.tokens[this.n + 1][0].charAt(0) === "\n") {
                            this.n++;

                        }

                        if (this.tokens[this.n + 1] === undefined) {
                            break;

                        }

                        var newIndent = this.tokens[this.n][0].length - 1;
                        if (indent === null) {
                            indent = newIndent;

                        }

                        if (newIndent) {
                            if (this.indentTabs === null) {
                                this.indentTabs = this.tokens[this.n][0].charAt(1) === "\t";

                            }

                            if (Strings.contains(this.tokens[this.n][0], this.indentTabs ? ' ' : "\t")) {
                                this.n++;
                                this.error('Either tabs or spaces may be used for indentation, not both');

                            }
                        }

                        if (newIndent > indent) {
                            if (hasValue || !hasKey) {
                                this.n++;
                                this.error('Unexpected indentation');

                            } else {
                                this.addValue(result, key !== null, key, this.parse(newIndent, new HashMap()));

                            }

                            newIndent = this.tokens[this.n] !== undefined ? this.tokens[this.n][0].length - 1 : 0;
                            hasKey = false;

                        } else {
                            if (hasValue && !hasKey) {
                                break;

                            } else if (hasKey) {
                                this.addValue(result, key !== null, key, hasValue ? value : null);
                                hasKey = hasValue = false;

                            }
                        }

                        if (newIndent < indent) {
                            return result;

                        }
                    }
                } else {
                    if (hasValue) {
                        this.error();

                    }

                    if (t.charAt(0) === '"') {
                        value = t.substr(1, t.length - 2).replace(/\\(?:u[0-9a-f]{4}|x[0-9a-f]{2}|.)/gi, this._cbStr);

                    } else if (t.charAt(0) === "'") {
                        value = t.substr(1, t.length - 2);

                    } else if (Neon.consts[t] !== undefined) {
                        value = Neon.consts[t];

                    } else if (Strings.isNumeric(t)) {
                        value = parseFloat(t);

                    } else if (t.match(/^\d\d\d\d-\d\d?-\d\d?(?:(?:[Tt]| +)\d\d?:\d\d(?::\d\d(?:\.\d*)?)? *(?:Z|[-+]\d\d?(?::?\d\d)?)?)?$/)) {
                        value = DateTime.from(t);

                    } else {
                        value = t;

                    }

                    hasValue = true;

                }
            }

            if (inlineParser) {
                if (hasKey || hasValue) {
                    this.addValue(result, hasKey, key, hasValue ? value : null);

                }
            } else {
                if (hasValue && !hasKey) {
                    if (!result.length) {
                        result = value;

                    } else {
                        this.error();

                    }
                } else if (hasKey) {
                    this.addValue(result, key !== null, key, hasValue ? value : null);

                }
            }

            return result;

        },

        addValue: function(result, hasKey, key, value) {
            if (hasKey) {
                if (result && result.has(key)) {
                    this.error("Duplicated key " + key);

                }

                result.set(key, value);

            } else {
                result.push(value);

            }
        },

        _cbStr: function(m) {
            var mapping = {t: '\t', n: '\n', r: '\r', f: '\x0C', b: '\x08', '"': '"', '\\': '\\', '/': '/', '_': '\xC2\xA0'}

            if (mapping[m.charAt(1)] !== undefined) {
                return mapping[m.charAt(1)];

            } else if (m.charAt(1) === 'u' && m.length === 6) {
                return String.fromCharCode(parseInt(m.substr(2), 16));

            } else if (m.charAt(1) === 'x' && m.length === 4) {
                return String.fromCharCode(parseInt(m.substr(2), 16));

            } else {
                this.error('Invalid escape sequence ' + m);

            }
        },

        error: function(msg) {
            var last = this.tokens[this.n] !== undefined ? this.tokens[this.n] : null,
                pos = Tokenizer.getCoordinates(this.input, last ? last[1] : this.input.length),
                token = last ? last[0].substr(0, 40).replace(/\n/g, '<new line>') : 'end';

            throw new Error((msg || 'Unexpected %s').replace(/%s/g, token) + ' on line ' + pos[0] + ', column ' + pos[1]);

        }

    });

    var NeonEntity = this.NeonEntity = function(value, attributes) {
        this.value = value || null;
        this.attributes = attributes || null;

    };

    _context.register(Neon, 'Neon');
    _context.register(NeonEntity, 'NeonEntity');

}, {
    HashMap: 'Utils.HashMap',
    Strings: 'Utils.Strings',
    Arrays: 'Utils.Arrays',
    DateTime: 'Utils.DateTime',
    Tokenizer: 'Nittro.Utils.Tokenizer'
});
;
_context.invoke('Nittro.Forms', function (DOM, Arrays) {

    if (!window.Nette || !window.Nette.validators) {
        throw new Error('Nette/Forms vendor netteForms.js asset has not been loaded');

    }

    var VendorForms = window.Nette;
    _context.register(VendorForms, 'Vendor');

    VendorForms.addEvent = DOM.addListener;

    VendorForms.validators.mimeType = function(elem, arg, val) {
        if (!Arrays.isArray(arg)) {
            arg = arg.trim().split(/\s*,\s*/);

        }

        try {
            if (!val.length) return false;

            for (var i = 0; i < val.length; i++) {
                if (arg.indexOf(val[i].type) === -1 && arg.indexOf(val[i].type.replace(/\/.*/, '/*')) === -1) {
                    return false;

                }
            }
        } catch (e) {}

        return true;

    };

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays'
});
;
_context.invoke('Nittro.Forms', function (DOM, Arrays, DateTime, FormData, Vendor, undefined) {

    var Form = _context.extend('Nittro.Object', function (form) {
        Form.Super.call(this);

        if (typeof form === 'string') {
            form = DOM.getById(form);

        }

        if (!form || !(form instanceof HTMLFormElement)) {
            throw new TypeError('Invalid argument, must be a HTMLFormElement');

        }

        this._.form = form;
        this._.form.noValidate = 'novalidate';
        this._.submittedBy = null;

        DOM.addListener(this._.form, 'submit', this._handleSubmit.bind(this));
        DOM.addListener(this._.form, 'reset', this._handleReset.bind(this));

    }, {
        getElement: function (name) {
            return name ? this._.form.elements.namedItem(name) : this._.form;

        },

        setSubmittedBy: function (value) {
            this._.submittedBy = value;
            return this;

        },

        validate: function () {
            if (!Vendor.validateForm(this._.form)) {
                return false;

            }

            var evt = this.trigger('validate');
            return !evt.isDefaultPrevented();

        },

        setValues: function (values, reset) {
            var i, elem, name, value, names = [];
            values || (values = {});

            for (i = 0; i < this._.form.elements.length; i++) {
                elem = this._.form.elements.item(i);
                name = elem.name;
                value = undefined;

                if (!name || names.indexOf(name) > -1 || elem.tagName.toLowerCase() === 'button' || elem.type in {'submit':1, 'reset':1, 'button':1, 'image':1}) {
                    continue;

                }

                names.push(name);

                if (name.indexOf('[') > -1) {
                    value = values;

                    name.replace(/]/g, '').split(/\[/g).some(function (key) {
                        if (key === '') {
                            return true;

                        } else if (!(key in value)) {
                            value = undefined;
                            return true;

                        } else {
                            value = value[key];
                            return false;

                        }
                    });
                } else if (name in values) {
                    value = values[name];

                }

                if (value === undefined) {
                    if (reset && !DOM.hasClass(elem, 'no-reset')) {
                        value = null;

                    } else {
                        continue;

                    }
                }

                this.setValue(name, value);

            }
        },

        setValue: function (elem, value) {
            if (typeof elem === 'string') {
                elem = this._.form.elements.namedItem(elem);

            }

            var i,
                toStr = function(v) { return '' + v; };

            if (!elem) {
                throw new TypeError('Invalid argument to setValue(), must be (the name of) an existing form element');

            } else if (!elem.tagName) {
                if ('length' in elem) {
                    for (i = 0; i < elem.length; i++) {
                        this.setValue(elem[i], value);

                    }
                }
            } else if (elem.type === 'radio') {
                elem.checked = value !== null && elem.value === toStr(value);

            } else if (elem.type === 'file') {
                if (value === null) {
                    value = elem.parentNode.innerHTML;
                    DOM.html(elem.parentNode, value);

                }
            } else if (elem.tagName.toLowerCase() === 'select') {
                var single = elem.type === 'select-one',
                    arr = Arrays.isArray(value),
                    v;

                if (arr) {
                    value = value.map(toStr);

                } else {
                    value = toStr(value);

                }

                for (i = 0; i < elem.options.length; i++) {
                    v = arr ? value.indexOf(elem.options.item(i).value) > -1 : value === elem.options.item(i).value;
                    elem.options.item(i).selected = v;

                    if (v && single) {
                        break;

                    }
                }
            } else if (elem.type === 'checkbox') {
                elem.checked = Arrays.isArray(value) ? value.map(toStr).indexOf(elem.value) > -1 : !!value;

            } else if (elem.type === 'date') {
                elem.value = value ? DateTime.from(value).format('Y-m-d') : '';

            } else if (elem.type === 'datetime-local' || elem.type === 'datetime') {
                elem.value = value ? DateTime.from(value).format('Y-m-d\\TH:i:s') : '';

            } else {
                elem.value = value !== null ? toStr(value) : '';

            }

            return this;

        },

        serialize: function () {
            var elem, i,
                data = new FormData(),
                names = [],
                value;

            for (i = 0; i < this._.form.elements.length; i++) {
                elem = this._.form.elements.item(i);

                if (elem.name && names.indexOf(elem.name) === -1 && (elem.type === 'submit' && elem.name === this._.submittedBy || !(elem.type in {button: 1, reset: 1}))) {
                    names.push(elem.name);

                }
            }

            for (i = 0; i < names.length; i++) {
                elem = this._.form.elements.namedItem(names[i]);

                if (Vendor.isDisabled(elem)) {
                    continue;

                }

                value = Vendor.getEffectiveValue(elem);

                if (Arrays.isArray(value) || value instanceof FileList) {
                    for (var j = 0; j < value.length; j++) {
                        data.append(names[i], value[j]);

                    }
                } else {
                    data.append(names[i], value);

                }
            }

            this.trigger('serialize', data);

            return data;

        },

        submit: function (by) {
            var evt;

            if (by) {
                var btn = this._.form.elements.namedItem(by);

                if (btn && btn.type === 'submit') {
                    evt = document.createEvent('MouseEvents');
                    evt.initMouseEvent('click', true, true, window);
                    btn.dispatchEvent(evt);
                    return this;

                } else {
                    throw new TypeError('Unknown element or not a submit button: ' + by);

                }
            }

            evt = document.createEvent('HTMLEvents');
            evt.initEvent('submit', true, true);
            this._.form.dispatchEvent(evt);

            return this;

        },

        reset: function () {
            this._.form.reset();
            return this;

        },

        _handleSubmit: function (evt) {
            if (this.trigger('submit').isDefaultPrevented()) {
                evt.preventDefault();
                return;

            }

            if (!this.validate()) {
                evt.preventDefault();

            }
        },

        _handleReset: function (evt) {
            if (evt.target !== this._.form) {
                return;

            }

            var elem, i;

            for (i = 0; i < this._.form.elements.length; i++) {
                elem = this._.form.elements.item(i);

                if (!DOM.hasClass(elem, 'no-reset')) {
                    if (elem.type === 'hidden') {
                        this.setValue(elem, DOM.getData(elem, 'default-value') || '');

                    } else if (elem.type === 'file') {
                        this.setValue(elem, null);

                    }
                }
            }

            this.trigger('reset');

        }
    });

    _context.register(Form, 'Form');

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays',
    DateTime: 'Utils.DateTime',
    FormData: 'Nittro.Ajax.FormData'
});
;
_context.invoke('Nittro.Forms', function (Form, Vendor) {

    var Locator = _context.extend(function (flashMessages) {
        this._ = {
            flashMessages: flashMessages,
            registry: {},
            anonId: 0
        };

        Vendor.addError = this._handleError.bind(this);

    }, {
        getForm: function (id) {
            var elem;

            if (typeof id !== 'string') {
                elem = id;

                if (!elem.getAttribute('id')) {
                    elem.setAttribute('id', 'frm-anonymous' + (++this._.anonId));

                }

                id = elem.getAttribute('id');

            }

            if (!(id in this._.registry)) {
                this._.registry[id] = new Form(elem || id);
                this._.registry[id].on('error:default', this._showError.bind(this));

            }

            return this._.registry[id];

        },

        removeForm: function (id) {
            if (typeof id !== 'string') {
                id = id.getAttribute('id');

            }

            if (id in this._.registry) {
                delete this._.registry[id];

            }
        },

        _handleError: function (elem, msg) {
            var frm = this.getForm(elem.form);
            frm.trigger('error', {elem: elem, message: msg});

        },

        _showError: function (evt) {
            this._.flashMessages.add(evt.data.elem, 'warning', evt.data.message);

            if (evt.data.elem && typeof evt.data.elem.focus === 'function') {
                evt.data.elem.focus();

            }
        }
    });

    _context.register(Locator, 'Locator');

});
;
_context.invoke('Nittro.DI', function(Nittro, ReflectionClass, ReflectionFunction, Arrays, Strings, HashMap, Neon, NeonEntity, undefined) {

    var prepare = function (self) {
        if (!self._) {
            self._ = {};
        }

        if (!self._.services) {
            self._.services = {};
            self._.serviceDefs = {};

        }
    };

    var Container = {
        addService: function (name, service) {
            prepare(this);

            if (this._.services[name] || this._.serviceDefs[name]) {
                throw new Error('Container already has a service named "' + name + '"');

            }

            this._.services[name] = service;

            return this;

        },

        addServiceDefinition: function (name, definition) {
            prepare(this);

            if (this._.services[name] || this._.serviceDefs[name]) {
               throw new Error('Container already has a service named "' + name + '"');

            }

            this._.serviceDefs[name] = definition;

            return this;

        },

        getService: function (name) {
            prepare(this);

            if (name === 'container') {
                return this;

            } else if (this._.services[name] === undefined) {
                if (this._.serviceDefs[name]) {
                    this._createService(name);

                } else {
                    throw new Error('Container has no service named "' + name + '"');

                }
            }

            return this._.services[name];

        },

        hasService: function (name) {
            prepare(this);
            return name === 'container' || this._.services[name] !== undefined || this._.serviceDefs[name] !== undefined;

        },

        isServiceCreated: function (name) {
            if (!this.hasService(name)) {
                throw new Error('Container has no service named "' + name + '"');

            }

            return !!this._.services[name];

        },

        runServices: function () {
            prepare(this);

            var name, def;

            for (name in this._.serviceDefs) {
                def = this._.serviceDefs[name];

                if (typeof def === 'string' && def.match(/!$/) || def.factory !== undefined && def.run) {
                    this.getService(name);

                }
            }
        },

        invoke: function (callback, args, thisArg) {
            prepare(this);
            args = this._autowireArguments(callback, args);
            return callback.apply(thisArg || null, this._expandArguments(args));

        },

        _createService: function (name) {
            if (!this._.serviceDefs[name]) {
                throw new Error('Container has no service "' + name + '"');

            }

            if (typeof this._.serviceDefs[name] === 'string') {
                this._.serviceDefs[name] = {
                    run: !!this._.serviceDefs[name].match(/!$/),
                    factory: this._.serviceDefs[name].replace(/!$/, '')
                };
            }

            var def = this._.serviceDefs[name],
                factory,
                obj,
                service;

            if (typeof def.factory === 'function') {
                service = this.invoke(def.factory);

                if (!service) {
                    throw new Error('Factory failed to create service "' + name + '"');

                }
            } else {
                factory = this._toEntity(def.factory);
                service = this._expandEntity(factory);

                if (service === factory) {
                    throw new Error('Invalid factory for service "' + name + '"');

                }
            }

            this._.services[name] = service;

            if (def.setup !== undefined) {
                for (var i = 0; i < def.setup.length; i++) {
                    if (typeof def.setup[i] === 'function') {
                        this.invoke(def.setup[i], null, service);

                    } else {
                        obj = this._toEntity(def.setup[i]);
                        this._expandEntity(obj, service);

                    }
                }
            }

            return service;

        },

        _autowireArguments: function (callback) {
            var argList = ReflectionFunction.from(callback).getArgs();

            var args = Arrays.createFrom(arguments, 1)
                .filter(function(arg) { return !!arg; })
                .map(function (arg) {
                    if (arg instanceof HashMap) {
                        if (arg.isList()) {
                            arg = HashMap.from(arg.getValues(), argList);

                        }
                    } else {
                        arg = HashMap.from(arg, argList);

                    }

                    return arg;

                });

            var i, a;

            lookupArg:
            for (i = 0; i < argList.length; i++) {
                for (a = args.length - 1; a >= 0; a--) {
                    if (args[a].has(argList[i])) {
                        argList[i] = args[a].get(argList[i]);
                        continue lookupArg;

                    } else if (args[a].has(i)) {
                        argList[i] = args[a].get(i);
                        continue lookupArg;

                    }
                }

                if (this.hasService(argList[i])) {
                    argList[i] = this.getService(argList[i]);
                    continue;

                }

                throw new Error('Cannot autowire argument "' + argList[i] + '" of function');

            }

            return argList;

        },

        _expandArguments: function (args) {
            for (var i = 0; i < args.length; i++) {
                args[i] = this._expandArg(args[i]);

            }

            return args;

        },

        _expandArg: function (arg) {
            if (arg instanceof NeonEntity) {
                return this._expandEntity(arg);

            } else if (typeof arg === 'string' && arg.match(/^@\S+$/)) {
                return this.getService(arg.substr(1));

            } else {
                return arg;

            }
        },

        _toEntity: function (str) {
            var m = str.match(/^([^\(]+)\((.*)\)$/);

            if (m) {
                return new NeonEntity(m[1], Neon.decode('[' + m[2] + ']'));

            } else {
                return new NeonEntity(str, new HashMap());

            }
        },

        _expandEntity: function (entity, context, mergeArgs) {
            var m, obj, method, args;

            if (m = entity.value.match(/^(?:(@)?([^:].*?))?(?:::(.+))?$/)) {
                if (m[2]) {
                    obj = m[1] ? this.getService(m[2]) : ReflectionClass.getClass(m[2]);

                } else if (context) {
                    obj = context;

                } else {
                    throw new Error('No context for calling ' + entity.value + ' given');

                }

                if (m[3] !== undefined) {
                    method = m[3];
                    args = this._autowireArguments(obj[method], entity.attributes, mergeArgs);
                    return obj[method].apply(obj, this._expandArguments(args));

                } else if (!m[1]) {
                    args = this._autowireArguments(obj, entity.attributes, mergeArgs);
                    return ReflectionClass.from(obj).newInstanceArgs(this._expandArguments(args));

                } else if (entity.attributes.length) {
                    throw new Error('Invalid entity "' + entity.value + '"');

                } else {
                    return obj;

                }
            } else {
                return entity;

            }
        }
    };

    _context.register(Container, 'Container');

}, {
    ReflectionClass: 'Utils.ReflectionClass',
    ReflectionFunction: 'Utils.ReflectionFunction',
    Arrays: 'Utils.Arrays',
    Strings: 'Utils.Strings',
    HashMap: 'Utils.HashMap',
    Neon: 'Nittro.Neon.Neon',
    NeonEntity: 'Nittro.Neon.NeonEntity'
});
;
_context.invoke('Nittro.DI', function(Container, Arrays, HashMap, ReflectionClass, NeonEntity, undefined) {

    function traverse(cursor, path, create) {
        if (typeof path === 'string') {
            path = path.split(/\./g);

        }

        var i, p, n = path.length;

        for (i = 0; i < n; i++) {
            p = path[i];

            if (Arrays.isArray(cursor) && p.match(/^\d+$/)) {
                p = parseInt(p);

            }

            if (cursor[p] === undefined) {
                if (create) {
                    cursor[p] = {};

                } else {
                    return undefined;

                }
            }

            cursor = cursor[p];

        }

        return cursor;

    }

    var Context = _context.extend(function(config) {
        config || (config = {});

        this._ = {
            params: Arrays.mergeTree({}, config.params || null),
            serviceDefs: Arrays.mergeTree({}, config.services || null),
            services: {},
            factories: Arrays.mergeTree({}, config.factories || null)
        };

    }, {
        hasParam: function(name) {
            return traverse(this._.params, name) !== undefined;

        },

        getParam: function(name, def) {
            var value = traverse(this._.params, name);
            return value !== undefined ? value : (def !== undefined ? def : null);

        },

        setParam: function(name, value) {
            name = name.split(/\./g);

            var p = name.pop(),
                cursor = this._.params;

            if (name.length) {
                cursor = traverse(cursor, name, true);

            }

            if (Arrays.isArray(cursor) && p.match(/^\d+$/)) {
                p = parseInt(p);

            }

            cursor[p] = value;

            return this;

        },

        hasFactory: function(name) {
            return this._.factories[name] !== undefined;

        },

        addFactory: function(name, factory, params) {
            if (typeof factory === 'string') {
                this._.factories[name] = factory;

            } else {
                this._.factories[name] = {
                    callback: factory,
                    params: params || null
                };
            }

            return this;

        },

        create: function(name, args) {
            if (!this.hasFactory(name)) {
                throw new Error('No factory named "' + name + '" has been registered');

            }

            var factory = this._.factories[name];

            if (typeof factory === 'string') {
                this._.factories[name] = factory = this._toEntity(factory);

            } else if (!(factory.params instanceof HashMap)) {
                factory.params = new HashMap(factory.params);

            }

            if (factory instanceof NeonEntity) {
                return this._expandEntity(factory, null, args);

            } else {
                args = this._autowireArguments(factory.callback, factory.params, args);
                return factory.callback.apply(null, this._expandArguments(args));

            }
        },

        _expandArg: function (arg) {
            if (typeof arg === 'string' && arg.indexOf('%') > -1) {
                if (arg.match(/^%[^%]+%$/)) {
                    return this.getParam(arg.replace(/^%|%$/g, ''));

                } else {
                    return arg.replace(/%([a-z0-9_.-]+)%/gi, function () {
                        return this.getParam(arguments[1]);

                    }.bind(this));
                }
            } else {
                return this.__expandArg(arg);

            }
        }
    });

    _context.mixin(Context, Container, {
        _expandArg: '__expandArg'
    });

    _context.register(Context, 'Context');

}, {
    Arrays: 'Utils.Arrays',
    HashMap: 'Utils.HashMap',
    ReflectionClass: 'Utils.ReflectionClass',
    NeonEntity: 'Nittro.Neon.NeonEntity'
});
;
_context.invoke('Nittro.Application', function() {

    var Storage = _context.extend(function(namespace, persistent) {
        this._.persistent = persistent;
        this._.engine = persistent ? window.localStorage : window.sessionStorage;
        this._.items = {};
        this._.namespace = namespace || '';
        this._.filters = {
            'in': [],
            out: []
        };

    }, {
        STATIC: {
            NAMESPACE_SEPARATOR: '/',
            FILTER_IN : 'in',
            FILTER_OUT : 'out'
        },

        getItem: function(key, need) {
            var value = this._.engine.getItem(this._formatKey(key));

            if (value === null) {
                if (need) {
                    throw new Error();

                }

                return null;

            }

            return this._applyFilters(this._parseValue(value), Storage.FILTER_OUT);

        },

        setItem: function(key, value) {
            value = this._stringifyValue(this._applyFilters(value, Storage.FILTER_IN));
            this._.engine.setItem(this._formatKey(key), value);

            return this;

        },

        hasItem: function(key) {
            return this._.engine.getItem(this._formatKey(key)) !== null;

        },

        removeItem: function(key) {
            this._.engine.removeItem(this._formatKey(key));
            return this;

        },

        clear: function() {
            var ns = this._.namespace + Storage.NAMESPACE_SEPARATOR,
                nsl = ns.length,
                rem = [];

            for (var i = 0; i < this._.engine.length; i++) {
                var k = this._.engine.key(i);

                if (k.substr(0, nsl) === ns) {
                    rem.push(k);

                }
            }

            while (rem.length) {
                this._.engine.removeItem(rem.shift());

            }

            return this;

        },

        walk: function(callback) {
            var ns = this._.namespace + Storage.NAMESPACE_SEPARATOR,
                nsl = ns.length;

            for (var i = 0; i < this._.engine.length; i++) {
                var k = this._.engine.key(i);

                if (k.substr(0, nsl) === ns) {
                    k = k.substr(nsl);
                    var v = this.getItem(k);
                    callback.call(v, k, v);

                }
            }
        },

        getNamespace: function(namespace) {
            return new this.constructor((this._.namespace ? this._.namespace + Storage.NAMESPACE_SEPARATOR : '') + namespace, this._.persistent);

        },

        addFilter: function(callback, type) {
            this._.filters[type].push(callback);
            return this;

        },

        _formatKey: function(key) {
            return this._.namespace + Storage.NAMESPACE_SEPARATOR + key;

        },

        _parseValue: function(value) {
            return JSON.parse(value);

        },

        _stringifyValue: function(value) {
            return JSON.stringify(value);

        },

        _applyFilters: function(value, type) {
            for (var i = 0; i < this._.filters[type].length; i++) {
                value = this._.filters[type][i](value);

            }

            return value;

        }
    });

    _context.register(Storage, 'Storage');

});
;
_context.invoke('Nittro.Application.Routing', function (Nittro, Strings, Arrays) {

    var URLRoute = _context.extend(Nittro.Object, function (mask) {
        URLRoute.Super.call(this);
        this._.mask = this._prepareMask(mask);

    }, {
        STATIC: {
            styles: {
                'int': parseInt,
                'float': parseFloat,
                'bool': function(v) { return !v.match(/^(?:0|false|)$/); }
            }
        },

        match: function (url) {
            var params = this.tryMatch(url);

            if (params) {
                Arrays.mergeTree(params, url.getParams());
                this.trigger('match', params);

            }
        },

        tryMatch: function (url) {
            var match = this._.mask.pattern.exec(url.getPath().replace(/^\/|\/$/g, ''));

            if (!match) {
                return null;

            }

            var params = {},
                i, n, p, v;

            match.shift();

            for (i = 0, n = this._.mask.map.length; i < n; i++) {
                p = this._.mask.map[i];
                v = decodeURIComponent(match[i]);

                if (p.style) {
                    params[p.name] = URLRoute.styles[p.style].call(null, v);

                } else {
                    params[p.name] = v;

                }
            }

            return params;

        },

        _prepareMask: function (mask) {
            var reTop = /^([<\[\]\(])|^([^<\[\]\(]+)/,
                reParam = /^([^ #>]+)(?: +([^ #>]+))?(?: +#([^ >]+))? *>/,
                reParen = /\((?!\?:)/g,
                reOptional = /^\?:/,
                match, param,
                map = [],
                pattern = ['^'];

            mask = mask.replace(/^\/|\/$/g, '');

            while (mask.length) {
                match = reTop.exec(mask);

                if (!match) {
                    throw new Error('Invalid mask, error near ' + mask.substr(0, 10));

                }

                mask = mask.substr(match[0].length);

                if (match[1] === '<') {
                    param = reParam.exec(mask);

                    if (!param) {
                        throw new Error('Invalid mask, error near ' + mask.substr(0, 10));

                    }

                    mask = mask.substr(param[0].length);

                    if (param[2]) {
                        param[2] = param[2].replace(reParen, '(?:');

                    } else {
                        param[2] = '[^/]+';

                    }

                    pattern.push('(', param[2], ')');

                    if (param[3] && !(param[3] in URLRoute.styles)) {
                        throw new Error('Unknown parameter style: ' + param[3]);

                    }

                    map.push({
                        name: param[1],
                        style: param[3] || null
                    });

                } else if (match[1] === '[') {
                    pattern.push('(?:');

                } else if (match[1] === ']') {
                    pattern.push(')?');

                } else if (match[1] === '(') {
                    pattern.push(reOptional.test(mask) ? '(' : '(?:');

                } else {
                    pattern.push(Strings.escapeRegex(match[2]));

                }
            }

            pattern.push('$');

            return {
                pattern: new RegExp(pattern.join('')),
                map: map
            };
        }
    });

    _context.register(URLRoute, 'URLRoute');

}, {
    Strings: 'Utils.Strings',
    Arrays: 'Utils.Arrays'
});
;
_context.invoke('Nittro.Application.Routing', function (Nittro, DOM) {

    var DOMRoute = _context.extend(Nittro.Object, function (selector) {
        DOMRoute.Super.call(this);
        this._.selector = selector;

    }, {
        match: function () {
            var matches = DOM.find(this._.selector);

            if (matches.length) {
                this.trigger('match', matches);

            }
        }
    });

    _context.register(DOMRoute, 'DOMRoute');

}, {
    DOM: 'Utils.DOM'
});
;
_context.invoke('Nittro.Application.Routing', function (Nittro, DOMRoute, URLRoute, Url) {

    var Router = _context.extend(Nittro.Object, function (page, basePath) {
        Router.Super.call(this);

        this._.page = page;
        this._.basePath = '/' + basePath.replace(/^\/|\/$/g, '');
        this._.routes = {
            dom: {},
            url: {}
        };

        this._.page.on('setup', this._matchAll.bind(this));

    }, {
        getDOMRoute: function (selector) {
            if (!(selector in this._.routes.dom)) {
                this._.routes.dom[selector] = new DOMRoute(selector);

            }

            return this._.routes.dom[selector];

        },

        getURLRoute: function (mask) {
            if (!(mask in this._.routes.url)) {
                this._.routes.url[mask] = new URLRoute(mask);

            }

            return this._.routes.url[mask];

        },

        _matchAll: function () {
            var k, url = Url.fromCurrent();

            if (url.getPath().substr(0, this._.basePath.length) === this._.basePath) {
                url.setPath(url.getPath().substr(this._.basePath.length));

                for (k in this._.routes.url) {
                    this._.routes.url[k].match(url);

                }
            }

            for (k in this._.routes.dom) {
                this._.routes.dom[k].match();

            }
        }
    });

    _context.register(Router, 'Router');

}, {
    Url: 'Utils.Url'
});
;
_context.invoke('Nittro.Widgets', function(DOM, Arrays) {

    var Dialog = _context.extend('Nittro.Object', function(options) {
        Dialog.Super.call(this);

        this._.options = Arrays.mergeTree({}, Dialog.getDefaults(this.constructor), options);
        this._.visible = false;
        this._.scrollPosition = null;

        this._.elms = {
            holder : DOM.createFromHtml(this._.options.templates.holder),
            wrapper : DOM.createFromHtml(this._.options.templates.wrapper),
            content : DOM.createFromHtml(this._.options.templates.content),
            buttons : DOM.createFromHtml(this._.options.templates.buttons)
        };

        this._.elms.holder.appendChild(this._.elms.wrapper);
        this._.elms.wrapper.appendChild(this._.elms.content);

        if (this._.options.text) {
            this._.options.html = '<p>' + this._.options.text + '</p>';

        }

        DOM.html(this._.elms.content, this._.options.html);

        if (this._.options.buttons) {
            this._.elms.wrapper.appendChild(this._.elms.buttons);
            this._createButtons();
            DOM.addListener(this._.elms.buttons, 'click', this._handleButtons.bind(this));

        }

        this.on('button:default', function() {
            this.hide();

        });

        if (this._.options.keyMap) {
            this._prepareKeymap();

        }

        DOM.addListener(this._.elms.holder, 'touchmove', this._handleTouchScroll.bind(this));
        this._.options.layer.appendChild(this._.elms.holder);
        this._handleKey = this._handleKey.bind(this);
        this._handleScroll = this._handleScroll.bind(this);

    }, {
        STATIC: {
            defaults: {
                html: null,
                text: null,
                buttons: null,
                keyMap: {},
                templates: {
                    holder : '<div class="nittro-dialog-holder"></div>',
                    wrapper : '<div class="nittro-dialog-inner"></div>',
                    content : '<div class="nittro-dialog-content"></div>',
                    buttons : '<div class="nittro-dialog-buttons"></div>',
                    button : '<button></button>'
                },
                layer: null
            },
            getDefaults: function (type) {
                var defaults = type.defaults || {},
                    k;

                do {
                    type = type.Super;

                    if (type.defaults) {
                        for (k in type.defaults) {
                            if (type.defaults.hasOwnProperty(k) && !defaults.hasOwnProperty(k)) {
                                defaults[k] = type.defaults[k];

                            }
                        }
                    }
                } while (type && type !== Dialog);

                return defaults;

            },
            setDefaults: function(options) {
                Arrays.mergeTree(Dialog.defaults, options);

            }
        },

        isVisible: function() {
            return this._.visible;

        },

        show: function() {
            if (this._.visible) {
                return;

            }

            this._.visible = true;
            this.trigger('show');

            if (this._.keyMap) {
                DOM.addListener(document, 'keydown', this._handleKey);

            }

            this._.scrollLock = {
                left: window.pageXOffset,
                top: window.pageYOffset
            };

            if (/ipod|ipad|iphone/i.test(navigator.userAgent)) {
                this._.scrollPosition = window.pageYOffset;
                window.scrollTo(0, 0);
                this._.scrollLock.left = 0;
                this._.scrollLock.top = 0;

            }

            DOM.addListener(window, 'scroll', this._handleScroll);
            DOM.addClass(this._.elms.holder, 'visible');

        },

        hide: function() {
            if (!this._.visible) {
                return;

            }

            this._.visible = false;

            if (this._.keyMap) {
                DOM.removeListener(document, 'keydown', this._handleKey);

            }

            DOM.removeListener(window, 'scroll', this._handleScroll);

            if (/ipod|ipad|iphone/i.test(navigator.userAgent)) {
                window.scrollTo(0, this._.scrollPosition);
                this._.scrollPosition = null;

            }

            DOM.removeClass(this._.elms.holder, 'visible');
            this.trigger('hide');

        },

        getContent: function() {
            return this._.elms.content;

        },

        getButtons: function() {
            return this._.elms.buttons;

        },

        destroy: function () {
            if (this._.visible) {
                this.one('hide', this.destroy);
                this.hide();

            } else {
                this._.options.layer.removeChild(this._.elms.holder);
                this.off();

                window.setTimeout(function(k) {
                    for (k in this._.elms) {
                        this._.elms[k] = null;
                    }
                }.bind(this), 10);

            }
        },



        _createButtons: function () {
            var value, btn, def;

            for (value in this._.options.buttons) {
                btn = DOM.createFromHtml(this._.options.templates.button);

                def = this._.options.buttons[value];

                if (typeof def === 'string') {
                    def = { label: def, type: 'button' };

                }

                DOM.setData(btn, 'value', value);
                DOM.addClass(btn, 'nittro-dialog-button', def.type === 'button' ? 'nittro-dialog-button-text' : 'nittro-dialog-button-plain');
                btn.textContent = def.label;

                this._.elms.buttons.appendChild(btn);

            }
        },

        _handleButtons: function (evt) {
            evt.preventDefault();

            this.trigger('button', {
                value: DOM.getData(evt.target, 'value')
            });
        },

        _prepareKeymap: function () {
            var keyMap = {},
                v, k;

            for (v in this._.options.keyMap) {
                k = this._.options.keyMap[v];

                if (!(k instanceof Array)) {
                    k = [k];

                }

                k.forEach(function (k) {
                    keyMap[k] = v;

                });
            }

            this._.keyMap = keyMap;

        },

        _handleKey: function(evt) {
            if (evt.target.tagName.toLowerCase() === 'textarea') return;

            if (evt.which in this._.keyMap) {
                evt.preventDefault();

                this.trigger('button', {
                    value: this._.keyMap[evt.which]
                });
            }
        },

        _handleTouchScroll: function (evt) {
            if (this._.elms.holder === evt.target) {
                evt.preventDefault();

            }
        },

        _handleScroll: function () {
            window.scrollTo(this._.scrollLock.left, this._.scrollLock.top);

        }
    });

    _context.register(Dialog, 'Dialog');

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays'
});
;
_context.invoke('Nittro.Widgets', function (Dialog, Arrays, ReflectionClass) {

	var Confirm = _context.extend(Dialog, function (options) {
		if (!(this instanceof Confirm)) {
			var dlg = ReflectionClass.from(Confirm).newInstanceArgs(arguments);
			window.setTimeout(function() { dlg.show(); }, 1);
			return dlg;

		}

		Confirm.Super.call(this, this._prepareOptions(arguments));

		this._.promise = new Promise(function (fulfill, reject) {
            this.on('button', function(evt) {
                if (evt.data.value === 'confirm') {
                    fulfill();

                } else {
                    reject();

                }
            });
        }.bind(this));

	}, {
        STATIC: {
            defaults: {
                hideOnSuccess: true,
                buttons: {
                    confirm: 'OK',
                    cancel: {label: 'Cancel', type: 'text'}
                },
                keyMap: {
                    confirm: 13,
                    cancel: 27
                }
            },
            setDefaults: function(defaults) {
                Arrays.mergeTree(Confirm.defaults, defaults);

            }
        },

		_prepareOptions: function (args) {
			var options = args[0];

			if (typeof options === 'string') {
				options = {
					text: options
				};

				if (args.length > 1) {
					options.buttons = {
						confirm: args[1]
					};

					if (args.length > 2) {
						if (typeof args[2] === 'string') {
							options.buttons.cancel = {label: args[2], type: 'text'};

						} else {
							options.buttons.cancel = args[2];

						}
					} else {
						options.buttons.cancel = {label: 'Cancel', type: 'text'};

					}
				}
			}

			return options;

		},

		then: function (onfulfill, onreject) {
            return this._.promise.then(onfulfill, onreject);

        }
	});

    _context.register(Confirm, 'Confirm');

}, {
	ReflectionClass: 'Utils.ReflectionClass',
    Arrays: 'Utils.Arrays'
});
;
_context.invoke('Nittro.Widgets', function (DOM, Arrays, Confirm) {

    var AutoConfirm = _context.extend(function(page, options) {
        this._ = {
            page: page,
            options: Arrays.mergeTree(true, {}, AutoConfirm.defaults, options)
        };

        this._.page.on('create-request', this._handleRequest.bind(this));

    }, {
        STATIC: {
            defaults: {
                prompt: 'Are you sure?',
                confirm: 'Yes',
                cancel: 'No'
            }
        },

        _handleRequest: function (evt) {
            if (!evt.data.context || !DOM.hasClass(evt.data.context, 'nittro-confirm')) {
                return;

            } else if (DOM.getData(evt.data.context, 'confirmed')) {
                DOM.setData(evt.data.context, 'confirmed', null);
                return;

            }

            evt.preventDefault();

            var prompt = DOM.getData(evt.data.context, 'prompt') || this._.options.prompt,
                confirm = DOM.getData(evt.data.context, 'confirm') || this._.options.confirm,
                cancel = DOM.getData(evt.data.context, 'cancel') || this._.options.cancel;

            Confirm(prompt, confirm, cancel).then(function() {
                DOM.setData(evt.data.context, 'confirmed', true);

                if (evt.data.context instanceof HTMLFormElement) {
                    this._.page.sendForm(evt.data.context);

                } else {
                    this._.page.openLink(evt.data.context);

                }
            }.bind(this), function() {
                DOM.setData(evt.data.context, 'confirmed', null);

            });
        }
    });

    _context.register(AutoConfirm, 'AutoConfirm');

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays'
});
;
_context.invoke('Nittro.Widgets', function(Dialog, Form, DOM, Arrays) {

    var FormDialog = _context.extend(Dialog, function(formLocator, options) {
        FormDialog.Super.call(this, options);

        this._.elms.form = this.getContent().getElementsByTagName('form').item(0);
        this._.formLocator = formLocator;
        this._.form = formLocator.getForm(this._.elms.form);

        DOM.addListener(this._.elms.form, 'submit', this._handleSubmit.bind(this));
        this.on('button', this._handleButton.bind(this));

    }, {
        STATIC: {
            defaults: {
                hideOnSuccess: true,
                buttons: {
                    confirm: 'OK',
                    cancel: {label: 'Cancel', type: 'text'}
                },
                keyMap: {
                    confirm: 13,
                    cancel: 27
                }
            },
            setDefaults: function(defaults) {
                Arrays.mergeTree(FormDialog.defaults, defaults);

            }
        },

        setValues: function(values) {
            this._.form.setValues(values);
            return this;

        },

        reset: function() {
            this._.form.reset();
            return this;

        },

        getForm: function() {
            return this._.form;

        },

        _handleSubmit: function(evt) {
            if (!evt.defaultPrevented) {
                if (this._.options.hideOnSuccess) {
                    this.hide();

                }

                this.trigger('success');

            }
        },

        _handleButton: function(evt) {
            if (evt.data.value === 'confirm') {
                evt.preventDefault();
                this._.form.submit();

            } else {
                this._.form.reset();

            }
        },

        destroy: function () {
            this._.formLocator.removeForm(this._.elms.form);
            FormDialog.Super.prototype.destroy.call(this);

        }
    });

    _context.register(FormDialog, 'FormDialog');

}, {
    Form: 'Nittro.Forms.Form',
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays'
});
;
_context.invoke('Nittro.Widgets', function (Arrays, Strings, DOM, undefined) {

    var Paginator = _context.extend('Nittro.Object', function(page, options) {
        Paginator.Super.call(this);

        this._.pageService = page;
        this._.options = Arrays.mergeTree({}, Paginator.defaults, options);
        this._.container = this._.options.container;
        this._.scrollContainer = this._resolveScrollContainer(this._.options.container, this._.options.scrollContainer);

        if (this._.options.pageSize === null) {
            this._.options.pageSize = this._computePageSize();

        }

        if (this._.options.margin === null) {
            this._.options.margin = this._computeMargin();

        }

        this._.page = this._.options.currentPage;
        this._.nextThreshold = this._computeNextThreshold();
        this._.handleScroll = this._handleScroll.bind(this);

        DOM.addListener(this._getScrollListener(), 'scroll', this._.handleScroll);

    }, {
        STATIC: {
            defaults: {
                container: null,
                scrollContainer: null,
                template: null,
                items: null,
                margin: null,
                currentPage: 1,
                pageSize: null
            }
        },

        destroy: function () {
            DOM.removeListener(this._getScrollListener(), 'scroll', this._.handleScroll);
            this._.container = this._.scrollContainer = this._.options = null;

        },

        _handleScroll: function () {
            if (this._.nextThreshold !== null && this._.scrollContainer.scrollTop > this._.nextThreshold) {
                this._.nextThreshold = null;

                this._renderNextPage().then(function() {
                    this._.nextThreshold = this._computeNextThreshold();

                }.bind(this));
            }
        },

        _getScrollListener: function () {
            return this._.scrollContainer === document.body ? window : this._.scrollContainer;
        },

        _renderNextPage: function () {
            return new Promise(function(fulfill, reject) {
                this._.page++;

                if (Arrays.isArray(this._.options.items)) {
                    var items = this._.options.items.slice((this._.page - 1) * this._.options.pageSize, this._.page * this._.options.pageSize);
                    items.forEach(this._renderItem.bind(this));

                    if (items.length === this._.options.pageSize) {
                        fulfill();
                    } else {
                        reject();
                    }
                } else {
                    this._.pageService.open(this._.options.items.replace(/%page%/, this._.page))
                        .then(function(payload) {
                            for (var id in payload.snippets) {
                                fulfill();
                                return;
                            }

                            reject();

                        }.bind(this), reject);
                }
            }.bind(this));
        },

        _renderItem: function (data) {
            var tpl = DOM.getById(this._.options.template).innerHTML;

            tpl = tpl.replace(/%([a-z0-9_.-]+)%/gi, function () {
                var path = arguments[1].split(/\./g),
                    cursor = data,
                    i, p, n = path.length;

                for (i = 0; i < n; i++) {
                    p = path[i];

                    if (Arrays.isArray(cursor) && p.match(/^\d+$/)) {
                        p = parseInt(p);

                    }

                    if (cursor[p] === undefined) {
                        return '';

                    }

                    cursor = cursor[p];

                }

                return cursor;

            });

            var elem = DOM.create('div');
            DOM.html(elem, tpl);

            DOM.getChildren(elem).forEach(function (node) {
                this._.container.appendChild(node);
            }.bind(this));

        },

        _computePageSize: function () {
            return DOM.getChildren(this._.container).length;
        },

        _computeMargin: function () {
            return window.innerHeight / 2;
        },

        _computeNextThreshold: function () {
            if (!this._.container.lastElementChild) {
                return null;
            }

            var ofs = this._.container.lastElementChild.getBoundingClientRect().top;
            return Math.max(0, ofs + document.body.scrollTop - window.innerHeight - this._.options.margin);

        },

        _resolveScrollContainer: function (elem, scrollContainer) {
            if (scrollContainer === 'auto') {
                scrollContainer = elem;

                function isScrollable(elem) {
                    var style = window.getComputedStyle(elem);
                    return style.overflow === 'auto' || style.overflow === 'scroll'
                        || style.overflowX === 'auto' || style.overflowX === 'scroll'
                        || style.overflowY === 'auto' || style.overflowY === 'scroll';
                }

                while (scrollContainer && scrollContainer !== document.body && !isScrollable(scrollContainer)) {
                    scrollContainer = scrollContainer.parentNode;

                }
            } else if (scrollContainer === null) {
                scrollContainer = document.body;

            }

            return scrollContainer;

        }
    });

    _context.register(Paginator, 'Paginator');

}, {
    Arrays: 'Utils.Arrays',
    Strings: 'Utils.Strings',
    DOM: 'Utils.DOM'
});
;
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
            paginator: 'Nittro.Widgets.Paginator()'
        }
    });

    this.di = di;
    di.runServices();

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays'
});
;
window._stack || (window._stack = []);

(function(stack) {
    function exec(f) {
        if (typeof f === 'function') {
            _context.invoke(f);

        } else if (typeof f === 'object' && typeof f.load !== 'undefined') {
            var q = _context.load.apply(_context, f.load);

            if (typeof f.then === 'function') {
                q.then(f.then);

            } else if (f.then && f.then instanceof Array) {
                q.then.apply(_context, f.then);

            }
        } else {
            _context.invoke.apply(_context, f);

        }
    }

    while (stack.length) {
        exec(stack.shift());

    }

    stack.push = function() {
        for (var i = 0; i < arguments.length; i++) {
            exec(arguments[i]);

        }
    };
})(window._stack);

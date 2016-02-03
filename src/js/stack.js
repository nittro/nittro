window._stack || (window._stack = []);

(function() {
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

    function init() {
        while (_stack.length) {
            exec(_stack.shift());

        }

        _stack.push = function() {
            for (var i = 0; i < arguments.length; i++) {
                exec(arguments[i]);

            }
        };
    }

    function check() {
        if (typeof window._context !== 'undefined') {
            init();
            return true;

        } else {
            return false;

        }
    }

    if (!check()) {
        var tmr = window.setInterval(function() {
            if (check()) {
                window.clearInterval(tmr);
                tmr = null;

            }
        }, 100);
    }

})();

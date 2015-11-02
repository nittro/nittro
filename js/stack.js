(function(stack, context) {
    var exec = function(f) {
        if (typeof f === 'function') {
            context.invoke(f);

        } else if (typeof f === 'object' && typeof f.load !== 'undefined') {
            var q = context.load.apply(context, f.load);

            if (typeof f.then === 'function') {
                q.then(f.then);

            } else if (f.then && f.then instanceof Array) {
                q.then.apply(context, f.then);

            }
        } else {
            context.invoke.apply(context, f);

        }
    };

    while (stack.length) {
        exec(stack.shift());

    }

    stack.push = function() {
        for (var i = 0; i < arguments.length; i++) {
            exec(arguments[i]);

        }
    };

})(_stack || [], _context);
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

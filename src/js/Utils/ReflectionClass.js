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

NetteJS
=======

NetteJS is a javascript client-side framework and library specifically designed to be used with the [Nette framework](https://nette.org).

### Usage

Include NetteJS script and stylesheet files in your project, for example:

```html
<!-- In the <head> section: -->
<link rel="stylesheet" type="text/css" href="/nettejs/dist/css/nette.min.css" />

<!-- At the end of <body>: -->
<script type="text/javascript" src="/nettejs/dist/js/nette.min.js"></script>
```

If you intend to use the _stack library, include this snippet in your HTML `<head>` section:
```html
<script type="text/javascript">var _stack = [];</script>
```

And then include the _stack library at the end of `<body>` along with your other scripts, after the NetteJS library:
```html
<script type="text/javascript" src="/nettejs/dist/js/stack.min.js"></script>
```

### _stack

Javascript libraries should be loaded asynchronously in order to increase your website's performance
and provide truly _progressive_ enhancement. That has an unfortunate side effect: if you want to
include some inline scripting in your view templates and / or components, your JS libraries
will not be available at the time the inline script is executed in the browser. That's exactly what
`_stack` is here to solve: instead of directly executing the inline code, you wrap it in a function
and push this function onto a stack which only gets executed _after_ your libraries are loaded.
Like this:
```html
<script type="text/javascript">
_stack.push(function() {
    $(document).ready(function() {
        // .. do whatever
    });
});
</script>
```

You need to define the `_stack` array at the very beginning of your HTML `<head>`, so that it's
available globally any time you need it, and only load the `_stack` library as the very last
of all your libraries so that the other libraries are available when `_stack` gets processed.

### _context

NetteJS manages its internal namespacing structure and dependencies using an utility script called
`_context`. The utility has the following methods:

`_context.register(object, name)`: registers `object` in the internal storage under `name`. If `name`
contains a dot, `_context` treats it as a fully-qualified namespace name, otherwise the object is
registered in the current namespace.

`_context.lookup(name)`: retrieves an object previously registered using `_context.register()`. The
lookup always considers `name` to be a fully-qualified namespace name.

`_context.invoke([namespace, ]callback[, imports])`: invokes `callback`, injecting dependencies as arguments
and setting `this` to the specified namespace. Example:

```js
// register the Person object under the Entities namespace
_context.register(function Person(name) { this.name = name; }, 'Entities.Person');

// register some car parts
_context.register(function Wheel(size) { this.size = size; }, 'Items.CarParts.Wheel');
_context.register(function Engine(horsepower) { this.horsepower = horsepower; }, 'Items.CarParts.Engine');

// now let's define a car
_context.invoke('Items', function(Person, CarParts) {
    // 'this' is the Items namespace, so this.CarParts.Wheel and this.CarParts.Engine are available
    
    _context.register(function Car(driver, wheelSize, enginePower) {
        this.driver = new Person(driver);
        this.wheels = [
            new CarParts.Wheel(wheelSize),
            new CarParts.Wheel(wheelSize),
            new CarParts.Wheel(wheelSize),
            new CarParts.Wheel(wheelSize)
        ];
        this.engine = new CarParts.Engine(enginePower);
        
    }, 'Car'); // within _context.invoke(), _context.register() uses the current namespace
               // if the 'name' argument isn't a fully qualified namespace name - so
               // this invocation would register the Car object in the Items namespace
               
}, {
    Person: 'Entities.Person' // import Person from the Entities namespace
});
```

`_context.lookupClass(object)`: attempts to lookup the fully qualified namespace name of `object`.
This will only ever work for objects and instances of objects registered using `_context.register()`.

`_context.load(arg[, ...])`: load dependencies on demand. Arguments can either be URLs you want to
download or functions you'd like to execute. URLs may be downloaded in parallel, but are guaranteed
to be executed in the sequence you specify them; javascripts and stylesheets are supported. Functions 
will also only be called when all the items in the queue before them have been resolved; they are passed 
a callback as an argument and should invoke this callback to signal that they have completed whatever 
they were doing. The `_context.load()` function returns a Promise.

`_context.extend([parent, ]constructor, proto)`: Simple OOP support. Makes `constructor`'s prototype
derive itself from `parent`'s prototype and then extends constructors prototype with properties from `proto`.
If only two arguments are present, they are treated as `constructor` and `proto`. `parent` may also be
specified as a string, in which case `_context` will `lookup()` the parent.

`_context.mixin(target, source, map)`: Copies own properties from `source` to `target`. If `map` is specified,
properties in `source` that appear in `map` are copied over using the corresponding value from `map` as the new key.
`source` can also be specified as a string, in which case `_context` will `lookup()` the source object.

#### _context and _stack

`_stack` has built-in support for the `_context` utility, so all functions that are pushed onto `_stack`
aren't just invoked, they're `_context.invoke()`d. That means you can for example use:
```html
<script type="text/javascript">
_stack.push(function(Nette) {
    // _context will now inject the Nette namespace as the first argument,
    // so you can for example access the built-in widgets, such as Nette.Widget.FlashMessage.
});
</script>
```

`_stack` can also access more advanced features of `_context`: pass in an array and `_stack` will `apply()` this
array to the `_context.invoke()` function, effectively allowing you to use the `namespace` and `imports` arguments
of `_context.invoke()`. Or pass in an object with the `load` key: `_stack` will then apply that value to
`_context.load()`, and, if you also provide a `then` key, the returned Promise's `then()` function will be
called with the provided callback(s).

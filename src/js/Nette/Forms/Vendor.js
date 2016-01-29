_context.invoke('Nette.Forms', function (DOM, Arrays) {

    var define = function (cb) {
        _context.register(cb(), 'Vendor');

    };

    define.amd = true;

    /*! @package name="nette/forms" file="src/assets/netteForms.js" */

    var VendorForms = _context.lookup('Nette.Forms.Vendor');

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

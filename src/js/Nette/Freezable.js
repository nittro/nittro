_context.invoke('Nette', function () {

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

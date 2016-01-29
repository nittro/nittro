_context.invoke('Nette.Widgets', function (Dialog, Arrays, ReflectionClass) {

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

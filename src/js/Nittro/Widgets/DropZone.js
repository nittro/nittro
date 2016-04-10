_context.invoke('Nittro.Widgets', function(Form, Vendor, DOM, Arrays, Strings) {

    var DropZone = _context.extend('Nittro.Object', function(form, elem, options) {
        DropZone.Super.call(this);

        this._.form = form || null;
        this._.elem = null;
        this._.field = null;
        this._.rules = null;
        this._.files = [];
        this._.dragElems = [];
        this._.options = Arrays.mergeTree({}, DropZone.defaults, options);

        this.validate = this.validate.bind(this);
        this._serialize = this._serialize.bind(this);
        this._handleDragEvent = this._handleDragEvent.bind(this);
        this._handleDrop = this._handleDrop.bind(this);
        this._handleFieldChange = this._handleFieldChange.bind(this);

        if (this._.form) {
            this._.form.on('validate', this.validate);
            this._.form.on('serialize', this._serialize);

            this.on('error:default', function(evt) {
                this._.form.trigger('error', {
                    elem: this._.field || this._.elem,
                    message: evt.data.message
                });
            }.bind(this));
        }

        if (this._.options.allowedTypes) {
            this._.options.allowedTypes = this._normalizeTypes(this._.options.allowedTypes);

        }

        if (this._.options.maxSize) {
            this._.options.maxSize = this._normalizeMaxSize(this._.options.maxSize);

        }

        if (this._.options.field) {
            this._.field = this._.options.field;
            this._.rules = DOM.getData(this._.field, 'nette-rules');
            this._.options.fieldName = this._.field.name;
            this._.options.required = this._.field.required;
            this._.options.multiple = this._.field.multiple;

            if (this._.field.accept) {
                this._.options.allowedTypes = this._normalizeTypes(this._.field.accept);

            } else if (this._.options.allowedTypes) {
                this._.field.accept = this._formatAccept(this._.options.allowedTypes);

            }

            this._.options.field = null;
            this._.field.required = false;
            this._.field.removeAttribute('data-nette-rules');

            DOM.addListener(this._.field, 'change', this._handleFieldChange);

        }

        if (elem) {
            this.attach(elem);

        }
    }, {
        STATIC: {
            create: function(formLocator, from) {
                if (!(from instanceof HTMLInputElement) || from.type !== 'file') {
                    throw new Error('Invalid argument, must be a file input');

                }

                var form = from.form ? formLocator.getForm(from.form) : null;

                return new DropZone(form, null, {
                    field: from
                });
            },

            TYPES: {

            },

            defaults: {
                field: null,
                fieldName: null,
                required: false,
                allowedTypes: null,
                maxSize: null,
                multiple: true,

                messages: {
                    empty: 'This field is required.',
                    invalidType: 'File %s isn\'t an allowed kind of file',
                    exceededSize: 'File %s is too large.'
                }
            }
        },

        attach: function(elem) {
            this.detach();

            this._.dragElems = [];
            this._.elem = elem;

            DOM.addListener(document.body, 'dragenter', this._handleDragEvent);
            DOM.addListener(document.body, 'dragover', this._handleDragEvent);
            DOM.addListener(document.body, 'dragleave', this._handleDragEvent);
            DOM.addListener(document.body, 'drop', this._handleDrop);

        },

        detach: function() {
            if (this._.elem) {
                DOM.removeListener(document.body, 'dragenter', this._handleDragEvent);
                DOM.removeListener(document.body, 'dragover', this._handleDragEvent);
                DOM.removeListener(document.body, 'dragleave', this._handleDragEvent);
                DOM.removeListener(document.body, 'drop', this._handleDrop);
                this._.dragElems = [];
                this._.elem = null;

            }
        },

        setAllowedTypes: function(allowedTypes) {
            this._.options.allowedTypes = allowedTypes ? this._normalizeTypes(allowedTypes) : null;
            return this;

        },

        setMaxSize: function(size) {
            this._.options.maxSize = size ? this._normalizeMaxSize(size) : null;
            return this;

        },

        setRequired: function(required) {
            this._.options.required = required !== false;
            return this;

        },

        setMultiple: function(multiple) {
            this._.options.multiple = multiple !== false;
            return this;

        },

        setFieldName: function(fieldName) {
            this._.options.fieldName = fieldName;
            return this;

        },

        hasFiles: function() {
            return this._.files.length > 0;

        },

        getFiles: function() {
            return this._.files.slice();

        },

        getFile: function(index) {
            return this._.files[index] || null;

        },

        isImage: function(file) {
            return /^image\/.+$/i.test(file.type);

        },

        loadImages: function() {
            var queue = [];

            this._.files.forEach(function(file) {
                if (file.type.match(/^image\/.+$/i)) {
                    queue.push(this.loadImage(file));
                }
            }.bind(this));

            return Promise.all(queue);

        },

        loadImage: function(file) {
            return new Promise(function(fulfill, reject) {
                var reader = new FileReader(),
                    image = new Image();

                reader.onload = function() {
                    image.src = reader.result;
                    fulfill(image);
                };

                reader.onerror = function() {
                    reject();
                };

                reader.readAsDataURL(file);

            });
        },

        removeFile: function(file) {
            if (typeof file !== 'number') {
                file = this._.files.indexOf(file);

            }

            if (file >= 0 && file < this._.files.length) {
                this._.files.splice(file, 1);

            }

            return this;

        },

        destroy: function() {
            this.detach();
            this.off();
            this._.files = [];
            this._.form = null;

            if (this._.form) {
                this._.form.off('validate', this.validate);
                this._.form.off('serialize', this._serialize);

            }

            if (this._.field) {
                DOM.removeListener(this._.field, 'change', this._handleFieldChange);

            }
        },

        validate: function(evt) {
            if (this._.options.required && !this._.files.length) {
                evt.preventDefault();
                this.trigger('error', { message: this._formatErrorMessage('empty') });

            }
        },

        formatSize: function(bytes) {
            var units = ['kB', 'MB', 'GB', 'TB'],
                unit = 'B';

            while (bytes > 1024 && units.length) {
                unit = units.shift();
                bytes /= 1024;

            }

            return (unit === 'B' ? bytes : bytes.toFixed(2)) + ' ' + unit;

        },

        _addFiles: function(files) {
            var i = 0,
                n = this._.options.multiple ? files.length : 1;

            if (!this._.options.multiple) {
                this._.files = [];

            }

            if (this._.field && this._.rules && !Vendor.validateControl(this._.field, this._.rules, false, { value: files })) {
                return;

            }

            var errors = [],
                evt;

            for (; i < n; i++) try {
                this._validateFile(files.item(i));

                evt = this.trigger('file', {
                    file: files.item(i),
                    index: this._.files.length
                });

                if (!evt.isDefaultPrevented()) {
                    this._.files.push(files.item(i));

                }
            } catch (e) {
                if (e instanceof ValidationError) {
                    errors.push(e.message);

                } else {
                    throw e;

                }
            }

            if (errors.length) {
                this.trigger('error', { message: errors.join("\n") });

            }
        },

        _validateFile: function(file) {
            if (!this._validateType(file.name, file.type)) {
                throw new ValidationError(this._formatErrorMessage('invalidType', [file.name, file.type]));

            } else if (!this._validateSize(file.size)) {
                throw new ValidationError(this._formatErrorMessage('exceededSize', [file.name, this.formatSize(file.size), this.formatSize(this._.options.maxSize)]));

            }
        },

        _validateType: function(name, type) {
            if (!this._.options.allowedTypes) {
                return true;

            }

            return this._.options.allowedTypes.some(function(pattern) {
                if (pattern.charAt(0) === '.') {
                    return !name || name.match(new RegExp(Strings.escapeRegex(pattern) + '$', 'i'));

                } else {
                    return !type || type.match(new RegExp('^' + Strings.escapeRegex(pattern).replace(/\/\\\*$/, '/.+') + '$', 'i'));

                }
            });
        },

        _validateSize: function(size) {
            return !this._.options.maxSize || size <= this._.options.maxSize;
        },

        _handleFieldChange: function() {
            if (this._.field.files.length) {
                this._addFiles(this._.field.files);

                if (this._.form) {
                    this._.form.setValue(this._.options.fieldName, null);

                }
            }
        },

        _handleDrop: function(evt) {
            this._.dragElems = [];

            if (evt.defaultPrevented) {
                return;

            }

            evt.preventDefault();

            var drop = this.trigger('drop', {
                target: evt.target,
                allowed: evt.target === this._.elem || DOM.contains(this._.elem, evt.target)
            });

            if (drop.data.allowed) {
                this._addFiles(evt.dataTransfer.files);

            }
        },

        _handleDragEvent: function(evt) {
            evt.preventDefault();

            if (evt.type === 'dragenter') {
                if (this._.dragElems.indexOf(evt.target) === -1) {
                    this._.dragElems.push(evt.target);

                }

                if (this._.dragElems.length === 1) {
                    this.trigger('body-enter', { files: evt.dataTransfer.files });

                }

                if (evt.target === this._.elem) {
                    this.trigger('zone-enter', { files: evt.dataTransfer.files });

                }
            } else if (evt.type === 'dragleave') {
                var index = this._.dragElems.indexOf(evt.target);

                if (index > -1) {
                    this._.dragElems.splice(index, 1);

                }

                if (evt.target === this._.elem) {
                    this.trigger('zone-leave');

                }

                if (!this._.dragElems.length) {
                    this.trigger('body-leave');

                }
            }
        },

        _serialize: function(evt) {
            for (var i = 0; i < this._.files.length; i++) {
                evt.data.append(this._.options.fieldName, this._.files[i]);

            }
        },

        _formatAccept: function(allowedTypes) {
            return allowedTypes.join(',');

        },

        _normalizeTypes: function(allowedTypes) {
            if (typeof allowedTypes === 'string') {
                return allowedTypes.trim().split(/\s*,\s*/g);

            }

            return allowedTypes;

        },

        _normalizeMaxSize: function(size) {
            if (typeof size === 'string') {
                var unit;

                if (unit = size.match(/(k|M|G|T)?B$/)) {
                    unit = unit[1];
                    size = size.replace(/(k|M|G|T)?B$/, '');

                } else {
                    unit = 'B';

                }

                size = parseFloat(size.trim());

                switch (unit) {
                    case 'T': size *= 1024;
                    case 'G': size *= 1024;
                    case 'M': size *= 1024;
                    case 'k': size *= 1024;
                }
            }

            return size;

        },

        _formatErrorMessage: function(type, params) {
            var message = this._.options.messages[type];

            if (params) {
                message = Strings.vsprintf(message, params);

            }

            return message;

        }
    });

    var ValidationError = _context.extend(Error, function(message) {
        ValidationError.Super.call(this, message);
    });

    _context.register(DropZone, 'DropZone');

}, {
    Form: 'Nittro.Forms.Form',
    Vendor: 'Nittro.Forms.Vendor',
    Arrays: 'Utils.Arrays',
    Strings: 'Utils.Strings',
    DOM: 'Utils.DOM'
});

describe('Utils.Url', function () {

    var Url, testUrl;

    beforeAll(function () {
        Url = _context.lookup('Utils.Url');
    });

    describe('getDirName()', function () {
        it('should remove the last component from the specified path', function () {
            expect(Url.getDirName('/foo/bar/baz')).toBe('/foo/bar');
        });
    });

    describe('getRelativePath()', function () {
        it('should return a relative path from the first argument leading to the second', function () {
            expect(Url.getRelativePath('/foo/bar/baz', '/foo/dummy/shoe')).toBe('../dummy/shoe');
            expect(Url.getRelativePath('/foo/bar/baz/', '/foo/dummy/shoe')).toBe('../../dummy/shoe');
        });
    });

    describe('parseQuery()', function () {
        it('should parse a query string into an object', function () {
            expect(Url.parseQuery('?foo=1&bar=3.4&baz=true')).toEqual({foo: 1, bar: 3.4, baz: 'true'});
        });

        it('should support arrays', function () {
            expect(Url.parseQuery('?foo[]=1&foo[]=3.4&foo[]=true')).toEqual({foo:[1, 3.4, 'true']});
        });

        it('should support even nested objects', function () {
            expect(Url.parseQuery('?foo[bar][dum1]=1&foo[bar][dum2]=3.4&foo[bar][dum3]=true')).toEqual({foo: {bar: {dum1: 1, dum2: 3.4, dum3: 'true'}}});
        });
    });

    describe('buildQuery()', function () {
        it('should build a query string from the passed object', function () {
            expect(Url.buildQuery({foo: 1, bar: 3.4, baz: 'true'})).toBe('foo=1&bar=3.4&baz=true');
        });

        it('should support arrays', function () {
            expect(Url.buildQuery({foo:[1, 3.4, 'true']})).toBe('foo%5B%5D=1&foo%5B%5D=3.4&foo%5B%5D=true');
        });

        it('should support even nested objects', function () {
            expect(Url.buildQuery({foo: {bar: {dum1: 1, dum2: 3.4, dum3: 'true'}}})).toBe('foo%5Bbar%5D%5Bdum1%5D=1&foo%5Bbar%5D%5Bdum2%5D=3.4&foo%5Bbar%5D%5Bdum3%5D=true');
        });

        it('should support {name: .., value: ..} pairs if second argument is true', function () {
            expect(Url.buildQuery([{name: 'foo', value: 1}, {name: 'bar', value: 3.4}, {name: 'baz[]', value: true}, {name: 'baz[]', value: false}], true))
                .toBe('foo=1&bar=3.4&baz%5B%5D=1&baz%5B%5D=0');
        });
    });

    describe('constructor', function () {
        it('should create a new URL object with parsed URL parts', function () {
            testUrl = new Url('https://user:pass@myhost.com:440/path/to/file.json?foo=1&bar=3.4&baz=true#contact');

            expect(testUrl instanceof Url).toBe(true);
            expect(testUrl._).toEqual({
                protocol: 'https:',
                username: 'user',
                password: 'pass',
                hostname: 'myhost.com',
                port: '440',
                path: '/path/to/file.json',
                params: {
                    foo: 1,
                    bar: 3.4,
                    baz: 'true'
                },
                hash: '#contact'
            });
        });
    });

    describe('getProtocol()', function () {
        it('should return the protocol part of the URL', function () {
            expect(testUrl.getProtocol()).toBe('https:');
        });
    });

    describe('getUsername()', function () {
        it('should return the username part of the URL', function () {
            expect(testUrl.getUsername()).toBe('user');
        });
    });

    describe('getPassword()', function () {
        it('should return the password part of the URL', function () {
            expect(testUrl.getPassword()).toBe('pass');
        });
    });

    describe('getHostname()', function () {
        it('should return the hostname part of the URL', function () {
            expect(testUrl.getHostname()).toBe('myhost.com');
        });
    });

    describe('getPort()', function () {
        it('should return the port of the URL', function () {
            expect(testUrl.getPort()).toBe('440');
        });
    });

    describe('getAuthority()', function () {
        it('should return the credentials, hostname and port of the URL', function () {
            expect(testUrl.getAuthority()).toBe('user:pass@myhost.com:440');
        });
    });

    describe('getPath()', function () {
        it('should return the path portion of the URL', function () {
            expect(testUrl.getPath()).toBe('/path/to/file.json');
        });
    });

    describe('getQuery()', function () {
        it('should return the query string of the URL', function () {
            expect(testUrl.getQuery()).toBe('?foo=1&bar=3.4&baz=true');
        });
    });

    describe('getParams()', function () {
        it('should return the params parsed from the query string of the URL', function () {
            expect(testUrl.getParams()).toEqual({foo: 1, bar: 3.4, baz: 'true'});
        });
    });

    describe('getParam()', function () {
        it('should return the specified param from the query string', function () {
            expect(testUrl.getParam('bar')).toBe(3.4);
        });
    });

    describe('hasParam()', function () {
        it('should return true if the specified param exists in the query string', function () {
            expect(testUrl.hasParam('bar')).toBe(true);
            expect(testUrl.hasParam('dummy')).toBe(false);
        });
    });

    describe('getHash()', function () {
        it('should return the hash part of the URL', function () {
            expect(testUrl.getHash()).toBe('#contact');
        });
    });



    describe('setProtocol()', function () {
        it('should set the URL\'s protocol', function () {
            testUrl.setProtocol('http:');
            expect(testUrl.getProtocol()).toBe('http:');
        });
    });

    describe('setUsername()', function () {
        it('should set the username used in the URL', function () {
            testUrl.setUsername('john');
            expect(testUrl.getUsername()).toBe('john');
        });
    });

    describe('setPassword()', function () {
        it('should set the password part of the URL', function () {
            testUrl.setPassword('doedoe');
            expect(testUrl.getPassword()).toBe('doedoe');
        });
    });

    describe('setHostname()', function () {
        it('should set the URL\'s hostname', function () {
            testUrl.setHostname('yourhost.com');
            expect(testUrl.getHostname()).toBe('yourhost.com');
        });
    });

    describe('setPort()', function () {
        it('should set the URL\'s port', function () {
            testUrl.setPort('80');
            expect(testUrl.getPort()).toBe('80');
        });
    });

    describe('setPath()', function () {
        it('should set the URL\'s path', function () {
            testUrl.setPath('/some/other/file.xml');
            expect(testUrl.getPath()).toBe('/some/other/file.xml');
        });
    });

    describe('setQuery()', function () {
        it('should set the URL\'s query string', function () {
            testUrl.setQuery('?dummy=1&ditto=4');
            expect(testUrl.getParams()).toEqual({dummy: 1, ditto: 4});
        });
    });

    describe('setParam()', function () {
        it('should set the URL\'s query param to the specified value', function () {
            testUrl.setParam('bud', 'spencer');
            expect(testUrl.getParams()).toEqual({dummy: 1, ditto: 4, bud: 'spencer'});
        });
    });

    describe('addParams()', function () {
        it('should add the specified parameters to the URL\'s query', function () {
            testUrl.addParams({ foo: 1, bar: 4.5, baz: false });
            expect(testUrl.getParams()).toEqual({dummy: 1, ditto: 4, bud: 'spencer', foo: 1, bar: 4.5, baz: false});
        });
    });

    describe('setParams()', function () {
        it('should set the URL\'s query parameters to the specified value', function () {
            testUrl.setParams({ item1: 2, item2: 5, item3: false });
            expect(testUrl.getParams()).toEqual({ item1: 2, item2: 5, item3: false });
        });
    });

    describe('removeParam()', function () {
        it('should remove the specified parameter from the URL\'s query string', function () {
            testUrl.removeParam('item2');
            expect(testUrl.getParams()).toEqual({ item1: 2, item3: false });
        });
    });

    describe('setHash()', function () {
        it('should reset the URL\'s hash part to empty if null is given', function () {
            testUrl.setHash(null);
            expect(testUrl.getHash()).toBe('');
        });

        it('should set the URL\'s hash part to the specified value', function () {
            testUrl.setHash('info');
            expect(testUrl.getHash()).toBe('#info');
        });
    });

    describe('toAbsolute()', function () {
        it('should return the full absolute URL', function () {
            expect(testUrl.toAbsolute()).toBe('http://john:doedoe@yourhost.com:80/some/other/file.xml?item1=2&item3=0#info');
        });
    });

    describe('toLocal()', function () {
        it('should return the local part of the URL', function () {
            expect(testUrl.toLocal()).toBe('/some/other/file.xml?item1=2&item3=0#info');
        });
    });

    describe('toRelative()', function () {
        it('should return an URL relative to the specified URL that leads to the current URL', function () {
            expect(testUrl.toRelative('http://john:doedoe@yourhost.com:80/some/other/file.xml?item1=2&item3=0#contact')).toBe('#info');
            expect(testUrl.toRelative('http://john:doedoe@yourhost.com:80/some/other/file.xml?item1=2&item3=1#contact')).toBe('?item1=2&item3=0#info');
            expect(testUrl.toRelative('http://john:doedoe@yourhost.com:80/path/to/file.json?check=1&baz=')).toBe('../../some/other/file.xml?item1=2&item3=0#info');
            expect(testUrl.toRelative('http://john:doedoe@yourhost.com')).toBe('//john:doedoe@yourhost.com:80/some/other/file.xml?item1=2&item3=0#info');
            expect(testUrl.toRelative('http://john:fakepass@yourhost.com:80/some/other/file.xml?item1=2&item3=0#info')).toBe('//john:doedoe@yourhost.com:80/some/other/file.xml?item1=2&item3=0#info');
            expect(testUrl.toRelative('https://john:doedoe@yourhost.com')).toBe('http://john:doedoe@yourhost.com:80/some/other/file.xml?item1=2&item3=0#info');
        });
    });

    describe('toString()', function () {
        it('should return the full absolute URL', function () {
            expect(testUrl.toString()).toBe(testUrl.toAbsolute());
        });
    });

    describe('isLocal()', function () {
        it('should return true when the given URL is within the same origin', function () {
            expect(testUrl.isLocal()).toBe(false);
            expect(Url.from('/check.php?foo=bar').isLocal()).toBe(true);
        });
    });

    describe('compare()', function () {
        it('should return a bitmask specifying which parts of the two URLs are different', function () {
            expect(testUrl.compare(testUrl.toAbsolute())).toBe(0);
            expect(testUrl.compare('http://john:doedoe@yourhost.com:80/some/other/file.xml?item1=2&item3=0')).toBe(Url.PART.HASH);
            expect(testUrl.compare('http://john:doedoe@yourhost.com:80/some/other/file.xml?item1=2&item3=2#info')).toBe(Url.PART.QUERY);
            expect(testUrl.compare('http://john:doedoe@yourhost.com:80/path/to/file.xml?item1=2&item3=0#info')).toBe(Url.PART.PATH);
            expect(testUrl.compare('http://john:doedoe@yourhost.com:440/some/other/file.xml?item1=2&item3=0#info')).toBe(Url.PART.PORT);
            expect(testUrl.compare('http://john:doedoe@myhost.com:80/some/other/file.xml?item1=2&item3=0#info')).toBe(Url.PART.HOSTNAME);
            expect(testUrl.compare('http://john:fakepass@yourhost.com:80/some/other/file.xml?item1=2&item3=0#info')).toBe(Url.PART.PASSWORD);
            expect(testUrl.compare('http://joe:doedoe@yourhost.com:80/some/other/file.xml?item1=2&item3=0#info')).toBe(Url.PART.USERNAME);
            expect(testUrl.compare('https://john:doedoe@yourhost.com:80/some/other/file.xml?item1=2&item3=0#info')).toBe(Url.PART.PROTOCOL);
            expect(testUrl.compare('http://joe:doedoe@yourhost.com:440/some/other/file.xml?item1=5&item3=0#info')).toBe(Url.PART.USERNAME | Url.PART.PORT | Url.PART.QUERY);
        });
    });

    describe('from()', function () {
        it('should return a new Url instance derived from the specified argument', function () {
            expect(Url.from('http://google.com').toAbsolute()).toBe('http://google.com');
            expect(Url.from('//api.facebook.com/sdk.js').toAbsolute()).toBe(document.location.protocol + '//api.facebook.com/sdk.js');
            expect(Url.from(testUrl)).not.toBe(testUrl);
            expect(Url.from(testUrl).toAbsolute()).toBe(testUrl.toAbsolute());
        });
    });

    describe('fromCurrent()', function () {
        it('should return a new Url instance representing the current URL', function () {
            expect(Url.fromCurrent().toAbsolute()).toBe(document.location.href);
        });
    });

});

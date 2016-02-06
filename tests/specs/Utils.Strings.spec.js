describe('Utils.Strings', function () {

    var Strings;

    beforeAll(function () {
        Strings = _context.lookup('Utils.Strings');
    });

    describe('toString()', function () {
        it('should convert any value to a string', function () {
            function TestObject() {}

            TestObject.prototype.toString = function() {
                return 'Test Object';
            };

            var cases = {
                'string object': new String('string object'),
                '3': 3,
                '4': new Number(4),
                '[object Object]': {},
                '': [],
                'function () {}': function() {},
                'true': true,
                'Test Object': new TestObject()
            };

            var test, value;

            for (test in cases) {
                value = Strings.toString(cases[test]);
                expect(typeof value).toBe('string');
                expect(value).toBe(test);

            }
        });
    });

    describe('vsprintf()', function () {
        it('should replace any placeholders with formatted parameters', function () {
            expect(
                Strings.vsprintf('string: %s, int: %i or %d, float: %f, with precision: %.2f, array: %a, with separators: %[, : and ]a', [
                    'test',
                    2,
                    3,
                    3.14159,
                    3.14159,
                    [1, 2, 3],
                    ['a', 'b', 'c']
                ])
            ).toBe('string: test, int: 2 or 3, float: 3.14159, with precision: 3.14, array: 1, 2, 3, with separators: a, b and c');
        });

        it('should support numbered placeholders', function () {
            expect(Strings.vsprintf('%2$s, %3$d, %1$.2f', [3.14159, 'test', 3]))
                .toBe('test, 3, 3.14');
        });

        it('should preserve "%" symbols if preceded by another "%"', function () {
            expect(Strings.vsprintf('%%, %%%s, %%%%d', ['test'])).toBe('%, %test, %%d');
        });

        it('should throw an error if missing parameters', function () {
            expect(function() { Strings.vsprintf('%s', []); }).toThrow(new Error('Missing parameter #1'));
        });
    });

    describe('sprintf()', function () {
        it('should replace any placeholders with formatted arguments', function () {
            expect(Strings.sprintf('%s %i %d %f %.2f %a %[, : and ]a', 'test', 2, 3, 3.14159, 3.14159, [1, 2, 3], ['a', 'b', 'c']))
                .toBe('test 2 3 3.14159 3.14 1, 2, 3 a, b and c');
        });

        it('should support numbered placeholders', function () {
            expect(Strings.sprintf('%2$s %3$d %1$.2f', 3.14159, 'test', 3))
                .toBe('test 3 3.14');
        });

        it('should preserve the "%" symbol when preceded by another "%"', function () {
            expect(Strings.sprintf('%% %%%s %%%%d', 'test')).toBe('% %test %%d');
        });

        it('should throw an error if missing parameters', function () {
            expect(function() { Strings.sprintf('%s %d', 'test'); }).toThrow(new Error('Missing parameter #2'));
        });
    });

    describe('escapeRegex()', function () {
        it('should escape any special characters for regular expressions', function () {
            expect(Strings.escapeRegex('^[a-z]{3}(?:\\d+)?$|/.*')).toBe('\\^\\[a\\-z\\]\\{3\\}\\(\\?:\\\\d\\+\\)\\?\\$\\|\\/\\.\\*');
        });
    });

    describe('trim()', function () {
        it('should trim all whitespace from the start and end of a string', function () {
            expect(Strings.trim(" Aloha!! \t\n  ")).toBe('Aloha!!');
        });

        it('should trim all the specified characters from the start and end of a string', function () {
            expect(Strings.trim('??Aloha!!', '?!')).toBe('Aloha');
        });
    });

    describe('trimLeft()', function () {
        it('should trim all whitespace from the start of a string', function () {
            expect(Strings.trimLeft('  Aloha!!  ')).toBe('Aloha!!  ');
        });

        it('should trim all the specified characters from the start of a string', function () {
            expect(Strings.trimLeft('<!<Aloha>!>', '<>!')).toBe('Aloha>!>');
        });
    });

    describe('trimRight()', function () {
        it('should trim all whitespace from the end of a string', function () {
            expect(Strings.trimRight('  Aloha!!  ')).toBe('  Aloha!!');
        });

        it('should trim all the specified characters from the end of a string', function () {
            expect(Strings.trimRight('<!<Aloha>!>', '>!')).toBe('<!<Aloha');
        });
    });

    describe('webalize()', function () {
        it('should replace any unsafe characters with a "-"', function () {
            expect(Strings.webalize('He tried to put THIS in her hole. You won\'t believe what happened next!'))
                .toBe('He-tried-to-put-THIS-in-her-hole-You-won-t-believe-what-happened-next');
        });

        it('should preserve any additional characters specified', function () {
            expect(Strings.webalize('He tried to put THIS!!! in her hole & you won\'t believe what happened next!', '&'))
                .toBe('He-tried-to-put-THIS-in-her-hole-&-you-won-t-believe-what-happened-next');
        });

        it('should collapse all continuous whitespace to a single underscore if the third argument is true', function () {
            expect(Strings.webalize('He tried to put THIS in her hole   -   you won\'t believe what happened next!', null, true))
                .toBe('He_tried_to_put_THIS_in_her_hole_-_you_won-t_believe_what_happened_next');
        });
    });

    describe('split()', function () {
        it('should split the string into an array', function () {
            expect(Strings.split('He tried to put THIS in her hole. You won\'t believe what happened next!', ' '))
                .toEqual(['He', 'tried', 'to', 'put', 'THIS', 'in', 'her', 'hole.', 'You', 'won\'t', 'believe', 'what', 'happened', 'next!']);

            expect(Strings.split('He tried to put THIS in her hole. You won\'t believe what happened next!', /\W+/))
                .toEqual(['He', 'tried', 'to', 'put', 'THIS', 'in', 'her', 'hole', 'You', 'won', 't', 'believe', 'what', 'happened', 'next', '']);
        });

        it('should capture the offset of the match if the third argument is true', function () {
            expect(Strings.split('Let\'s try something simpler', ' ', true))
                .toEqual([['Let\'s', 0], ['try', 6],['something', 10], ['simpler', 20]]);
        });

        it('should not include zero-length or whitespace-only matches if the fourth argument is true', function () {
            expect(Strings.split('Always assumed alliteration annoys annoying assholes', /[ad]/i, false, true))
                .toEqual(['lw', 'ys ', 'ssume', 'lliter', 'tion ', 'nnoys ', 'nnoying ', 'ssholes']);
        });

        it('should include the delimiter(s) if the fifth argument is true', function () {
            expect(Strings.split('Let\'s try something simpler', ' ', false, false, true))
                .toEqual(['Let\'s', ' ', 'try', ' ', 'something', ' ', 'simpler']);
        });
    });

    describe('firstUpper()', function () {
        it('should convert the first character of the string to uppercase', function () {
            expect(Strings.firstUpper('this should change')).toBe('This should change');
            expect(Strings.firstUpper('This should not')).toBe('This should not');
        });
    });

    describe('compare()', function () {
        it('should return true if the longer string starts with the shorter string, case insensitive', function () {
            expect(Strings.compare('Hello i love you', 'hello')).toBe(true);
            expect(Strings.compare('Hello i love you', 'aloha')).toBe(false);
        });

        it('should return true if the first "len" characters are the same in both strings, case insensitive', function () {
            expect(Strings.compare('Hello i love you', 'hell', 4)).toBe(true);
            expect(Strings.compare('Hell\'s bells!', 'hell', 4)).toBe(true);
            expect(Strings.compare('How do you do?', 'hell', 4)).toBe(false);
        });
    });

    describe('contains()', function () {
        it('should return true if the first argument contains the second argument', function () {
            expect(Strings.contains('cookie jar', 'cookie')).toBe(true);
            expect(Strings.contains('blood', 'alcohol')).toBe(false);
        });
    });

    describe('isNumeric()', function () {
        it('should return true if the string is numeric', function () {
            expect(Strings.isNumeric('3.14159')).toBe(true);
            expect(Strings.isNumeric('four')).toBe(false);
        });
    });

    describe('escapeHtml()', function () {
        it('should replace the characters <, >, &, " and \' with their corresponding HTML entities', function () {
            expect(Strings.escapeHtml('<a href="/test?id=1&check=true">How\'s this?</a>'))
                .toBe('&lt;a href=&quot;/test?id=1&amp;check=true&quot;&gt;How&#039;s this?&lt;/a&gt;');
        });
    });

    describe('nl2br()', function () {
        it('should convert newlines to <br /> tags', function () {
            expect(Strings.nl2br("Hello\n\nI love you\nWon\'t you tell me your name?"))
                .toBe('Hello<br /><br />I love you<br />Won\'t you tell me your name?');
        });

        it('should collapse multiple newlines into a single <br /> tag if the second argument is true', function () {
            expect(Strings.nl2br("Hello\n\nI love you\nWon\'t you tell me your name?", true))
                .toBe('Hello<br />I love you<br />Won\'t you tell me your name?');
        });
    });

    describe('random()', function () {
        it('should generate a random string of the specified length', function () {
            expect(Strings.random(10).length).toBe(10);
        });

        it('should only use the characters a-z and 0-9 by default', function () {
            expect(Strings.random(10)).toMatch(/^[a-z0-9]+$/);
        });

        it('should only use the specified characters if the second argument is provided', function () {
            expect(Strings.random(20, 'a-f#')).toMatch(/^[a-f#]+$/);
        });
    });

});

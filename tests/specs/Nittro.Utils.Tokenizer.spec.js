describe('Nittro.Utils.Tokenizer', function () {

    var Tokenizer,
        testPatterns,
        testInstance,
        testData;

    beforeAll(function () {
        Tokenizer = _context.lookup('Nittro.Utils.Tokenizer');

        testData = "Tokenizer test data\n"
            + "###################\n"
            + "\n"
            + "This is an example content that will be parsed into tokens.\n\n"
            + "Let's go with a simple *Markdown*-like syntax and see how the tokenizer copes.\n"
            + "\n"
            + " - Just add some more tokens here\n"
            + " - This should be relatively easy to parse\n";

    });

    it('should tokenize a given string into an array of [token, offset]', function () {
        testPatterns = [
            '^###+', // headings
            '\\n\\n', // paragraphs
            '^\\s*(?:[-\\*#]|\\d+\\.)\\s+', // lists
            '\\*\\*?' // inline formatting
        ];

        testInstance = new Tokenizer(testPatterns);

        expect(testInstance.tokenize(testData)).toEqual([
            ["Tokenizer test data\n", 0],
            ["###################", 20],
            ["\n\n", 39],
            ["This is an example content that will be parsed into tokens.", 41],
            ["\n\n", 100],
            ["Let's go with a simple ", 102],
            ["*", 125],
            ["Markdown", 126],
            ["*", 134],
            ["-like syntax and see how the tokenizer copes.", 135],
            ["\n\n", 180],
            [" - ", 182],
            ["Just add some more tokens here\n", 185],
            [" - ", 216],
            ["This should be relatively easy to parse\n", 219]
        ]);
    });

    it('should tokenize a given string into an array of [token, offset, type]', function () {
        testPatterns = {
            heading: '^###+', // headings
            paragraph: '\\n\\n', // paragraphs
            listItem: '^\\s*(?:[-\\*#]|\\d+\\.)\\s+', // lists
            inline: '\\*\\*?' // inline formatting
        };

        testInstance = new Tokenizer(testPatterns);

        expect(testInstance.tokenize(testData)).toEqual([
            ["Tokenizer test data\n", 0, null],
            ["###################", 20, "heading"],
            ["\n\n", 39, "paragraph"],
            ["This is an example content that will be parsed into tokens.", 41, null],
            ["\n\n", 100, "paragraph"],
            ["Let's go with a simple ", 102, null],
            ["*", 125, "inline"],
            ["Markdown", 126, null],
            ["*", 134, "inline"],
            ["-like syntax and see how the tokenizer copes.", 135, null],
            ["\n\n", 180, "paragraph"],
            [" - ", 182, "listItem"],
            ["Just add some more tokens here\n", 185, null],
            [" - ", 216, "listItem"],
            ["This should be relatively easy to parse\n", 219, null]
        ]);
    });

});

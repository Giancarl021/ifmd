import { describe, test, expect } from '@jest/globals';
import locate from '@giancarl021/locate';

import ParseMarkdown from '../../src/services/ParseMarkdown';
import constants from '../../src/util/constants';
import { dirname } from 'path';

const ROOT = locate('../../index.ts');

describe('services/ParseMarkdown', () => {
    test('Initialization', () => {
        expect(() => ParseMarkdown()).not.toThrow();
    });

    test('convert/Simple conversion', () => {
        const parser = ParseMarkdown();

        expect(
            parser.convert(
                `# Jest Test Runner

123`,
                ROOT
            )
        ).toEqual({
            content: expect.stringMatching(/<p>123<\/p>/),
            localAssets: [],
            title: 'Jest Test Runner'
        });
    });

    test('convert/No title conversion', () => {
        const parser = ParseMarkdown();

        expect(parser.convert('123', ROOT)).toEqual({
            content: expect.stringMatching(/<p>123<\/p>/),
            localAssets: [],
            title: constants.pdf.defaultTitle
        });
    });

    test('convert/Conversion with local assets', () => {
        const parser = ParseMarkdown();

        expect(
            parser.convert(
                `# Jest Test Runner

[link](./tests/services/ParseMarkdown.ts)`,
                ROOT
            )
        ).toEqual({
            content: expect.stringMatching(
                /<p><a href="\.\/tests\/services\/ParseMarkdown\.ts">link<\/a><\/p>/
            ),
            localAssets: [
                {
                    originalPath: './tests/services/ParseMarkdown.ts',
                    owner: ROOT,
                    path: locate(
                        `${dirname(ROOT)}/tests/services/ParseMarkdown.ts`
                    ),
                    reference: expect.stringMatching(/[A-Z0-9\+\/=]/i)
                }
            ],
            title: 'Jest Test Runner'
        });
    });

    test('convert/With math code', () => {
        const parser = ParseMarkdown();

        expect(
            parser.convert(
                `# Jest Test Runner

$$x = 1 + y$$`,
                ROOT
            )
        ).toEqual({
            content: expect.stringMatching(
                /<p><span class="katex"><math(.*)?<\/math><\/span><\/p>/
            ),
            localAssets: [],
            title: 'Jest Test Runner'
        });
    });

    test('convertWithMetadata/Simple conversion', () => {
        const parser = ParseMarkdown();

        expect(
            parser.convertWithMetadata(
                `# Jest Test Runner

123`,
                ROOT,
                0
            )
        ).toEqual({
            content: expect.stringMatching(/<p>123<\/p>/),
            localAssets: [],
            title: 'Jest Test Runner',
            titleId: null
        });
    });

    test('convertWithMetadata/No title conversion', () => {
        const parser = ParseMarkdown();

        expect(parser.convertWithMetadata('123', ROOT, 0)).toEqual({
            content: expect.stringMatching(/<p>123<\/p>/),
            localAssets: [],
            title: constants.pdf.defaultTitle + ' 1',
            titleId: null
        });
    });

    test('convertWithMetadata/With Title ID', () => {
        const parser = ParseMarkdown();

        expect(
            parser.convertWithMetadata(
                `<h1 id="titleId">Jest Test Runner</h1>

123`,
                ROOT,
                0
            )
        ).toEqual({
            content: expect.stringMatching(/<p>123<\/p>/),
            localAssets: [],
            title: 'Jest Test Runner',
            titleId: 'titleId'
        });
    });
});
import { describe, test, expect } from '@jest/globals';

import ParseMultiMarkdown from '../../src/services/ParseMultiMarkdown';

describe('services/ParseMultiMarkdown', () => {
    test('Initialization', () => {
        expect(() => ParseMultiMarkdown()).not.toThrow();
    });

    test('compile with no files', async () => {
        const parser = ParseMultiMarkdown();

        expect(
            await parser.compile({
                description: 'Jest Test Runner',
                path: '',
                title: 'Jest Test Runner',
                files: [],
                createdAt: new Date(),
                generateIndex: true
            })
        ).toEqual({
            content: expect.stringMatching(
                /<h1>Jest Test Runner<\/h1><p>Jest Test Runner<\/p>/
            ),
            title: 'Jest Test Runner',
            localAssets: []
        });
    });
});

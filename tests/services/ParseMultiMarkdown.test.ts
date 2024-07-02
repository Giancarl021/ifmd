import { describe, test, expect } from '@jest/globals';

import ParseMultiMarkdown from '../../src/services/ParseMultiMarkdown';

describe('services/ParseMultiMarkdown', () => {
    test('Initialization', () => {
        expect(() => ParseMultiMarkdown()).not.toThrow();
    });

    test('compile', () => {
        const parser = ParseMultiMarkdown();

        parser.compile({
            description: '',
            path: '',
            title: '',
            files: [],
            createdAt: '',
            generateIndex: true
        });
    });
});

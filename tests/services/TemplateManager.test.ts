import { describe, test, expect } from '@jest/globals';

import ParseMultiMarkdown from '../../src/services/ParseMultiMarkdown';

describe('services/ParseMultiMarkdown', () => {
    test('Initialization', () => {
        expect(() => ParseMultiMarkdown()).not.toThrow();
    });
});

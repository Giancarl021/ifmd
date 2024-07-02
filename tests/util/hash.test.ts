import { describe, test, expect } from '@jest/globals';

import hash from '../../src/util/hash';

// 28 characters in base 64 enconding
const HASH_RESULT_REGEX = /[0-9A-Z\+\/=]{28}/i;

describe('util/hash', () => {
    test('Same input, same output', () => {
        const input = 'Jest Test Runner';
        expect(hash(input)).toBe(hash(input));
    });
    test('Different input, different output', () => {
        const input1 = 'Jest Test Runner';
        const input2 = 'IFMD Test Suite';

        expect(hash(input1)).not.toBe(hash(input2));
    });
    test('Similar input, different output', () => {
        const input1 = 'Jest Test Runner';
        const input2 = 'Test Test Runner';

        expect(hash(input1)).not.toBe(hash(input2));
    });
    test('Empty input', () => {
        expect(hash(String())).toMatch(HASH_RESULT_REGEX);
    });
    test('Invalid input', () => {
        const errorMessage = 'Value to hash must be a string';
        expect(() => hash(0 as unknown as string)).toThrow(errorMessage);
        expect(() => hash({} as unknown as string)).toThrow(errorMessage);
        expect(() => hash(false as unknown as string)).toThrow(errorMessage);
    });
});

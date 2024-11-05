import { describe, expect, test } from '@jest/globals';

import parseDate from '../../src/util/parseDate';

const DATE = new Date().toLocaleDateString();
const ADDITION = '+1d';
const SUBTRACTION = '-1d';
const DEFAULT = '1d';

const ADDED_DATE = date(d => d + 1);
const SUBTRACTED_DATE = date(d => d - 1);

function date(operator: (day: number) => number): string {
    const now = new Date();
    now.setDate(operator(now.getDate()));

    return now.toLocaleDateString();
}

describe('util/parseDate', () => {
    test('Invalid date input', () => {
        expect(parseDate(null as unknown as string, DEFAULT)).toBe('null');
        expect(parseDate(10 as unknown as string, DEFAULT)).toBe('10');
        expect(parseDate({} as unknown as string, DEFAULT)).toBe(
            '[object Object]'
        );
        expect(parseDate(false as unknown as string, DEFAULT)).toBe('false');
        expect(parseDate('Invalid date', DEFAULT)).toBe('Invalid date');
    });

    test('Invalid operand input', () => {
        expect(parseDate(DATE, 'Xalabaias')).toBe(DATE);
        expect(parseDate(DATE, null as unknown as string)).toBe(DATE);
        expect(parseDate(DATE, 10 as unknown as string)).toBe(DATE);
        expect(parseDate(DATE, {} as unknown as string)).toBe(DATE);
        expect(parseDate(DATE, false as unknown as string)).toBe(DATE);
    });

    test('Addition to date', () => {
        expect(parseDate(DATE, ADDITION)).toBe(ADDED_DATE);
        expect(parseDate(DATE, DEFAULT)).toBe(ADDED_DATE);
    });
    test('Subtraction to date', () => {
        expect(parseDate(DATE, SUBTRACTION)).toBe(SUBTRACTED_DATE);
    });
});

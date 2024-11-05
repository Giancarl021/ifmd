import { describe, test, expect } from '@jest/globals';

import help from '../../src/util/help.json';
import commands from '../../src/commands';

function toSnakeCase(input: string): string {
    const chars: string[] = [];
    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        if (i > 0 && char === char.toUpperCase()) {
            chars.push('-');
        }

        if (!['-', '_'].includes(char)) chars.push(char.toLowerCase());
    }

    return chars.join('');
}

const helpCommandNames = Object.keys(help)
    .filter(k => k !== '$schema')
    .sort();
const commandNames = Object.keys(commands).map(toSnakeCase).sort();

describe('util/help', () => {
    test('help commands matches actual commands', () => {
        expect(commandNames).toEqual(helpCommandNames);
    });
});

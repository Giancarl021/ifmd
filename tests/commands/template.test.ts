import { describe, test, expect, afterEach } from '@jest/globals';
import CommandBinder from '../__utils__/CommandBinder';

const binder = CommandBinder('template');

afterEach(binder.afterEach);

const template = binder.bindCommands();

describe('commands/template', () => {
    describe('list operation', () => {
        test('Vibe check', async () => {
            expect(true).toBe(true);
        });
    });
});

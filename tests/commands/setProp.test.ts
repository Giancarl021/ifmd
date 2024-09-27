import { describe, test, expect, afterEach } from '@jest/globals';
import CommandBinder from '../__utils__/CommandBinder';

const binder = CommandBinder('setProp');

afterEach(binder.afterEach);

const setProp = binder.bindCommand();

describe('commands/setProp', () => {
    test('Set property', async () => {
        await setProp(['prop', 'value'], {});

        expect(binder.data['props.prop']).toBe('value');
    });

    test('Set invalid key property', async () => {
        expect(setProp.wrap(['A B', 'value'], {})).rejects.toThrow(
            'Key must follow the regex /^[0-9a-zA-z-_]+$/'
        );
    });

    test('Set disallowed key property', async () => {
        expect(setProp.wrap(['__proto__', 'value'], {})).rejects.toThrow(
            'Key name __proto__ is disallowed'
        );
    });

    test('Set empty key property', async () => {
        expect(setProp.wrap(['', 'value'], {})).rejects.toThrow(
            'Key must be set to a value'
        );
    });

    test('Set empty value property', async () => {
        expect(setProp.wrap(['prop', ''], {})).rejects.toThrow(
            'Value must be set to a non-empty String'
        );
    });

    test.each([['unset'], ['u']])(
        'Set property with %s flag',
        async (flag: string) => {
            expect(await setProp(['prop', 'value'], {})).toBe(
                'Global property prop set to value'
            );

            expect(binder.data['props.prop']).toBe('value');

            expect(await setProp(['prop'], { [flag]: true })).toBe(
                'Global property prop unset'
            );

            expect(binder.data['props.prop']).toBeUndefined();

            expect(setProp.wrap(['prop'], { unset: true })).rejects.toThrow(
                'Global property prop not found'
            );

            expect(binder.data['props.prop']).toBeUndefined();
        }
    );
});

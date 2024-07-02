import { describe, test, expect } from '@jest/globals';

import getProps from '../../src/util/getProps';
import type { CommandHelpers, Flags } from '@giancarl021/cli-core/interfaces';

const FLAGS: Flags = {
    a: 1,
    b: true,
    c: 12,
    d: false
};

const SAVED_PROPS: Record<string, string> = {
    name: 'Giancarlo Luz',
    age: '22',
    power: 'Codekinesis',
    willMarrySoon: 'absolutly'
};

const ARGS = (
    props: Flags = {},
    savedProps: Record<string, string> = { name: 'Jest Test Runner' }
): Parameters<typeof getProps> => {
    return [
        {
            appName: 'ifmd-test-runner',
            helpers: {} as CommandHelpers,
            extensions: {
                vault: {
                    getData() {
                        return savedProps;
                    }
                }
            }
        },
        Object.entries(props).reduce((acc, [key, value]) => {
            acc['p:' + key] = value;
            return acc;
        }, {} as Flags)
    ];
};

const STR_PROPS = (obj: Flags): Record<string, string> =>
    Object.entries(obj).reduce(
        (acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
        },
        {} as Record<string, string>
    );

describe('util/getProps', () => {
    test('No flags / Default saved props', () => {
        expect(getProps(...ARGS())).toMatchObject({
            name: 'Jest Test Runner'
        });
    });

    test('With flags / Default saved props', () => {
        expect(getProps(...ARGS(FLAGS))).toMatchObject(STR_PROPS(FLAGS));
    });

    test('No flags / No saved props', () => {
        expect(getProps(...ARGS({}, {}))).toMatchObject({});
    });

    test('With flags / No saved props', () => {
        expect(getProps(...ARGS(FLAGS, {}))).toMatchObject(STR_PROPS(FLAGS));
    });

    test('No flags / With saved props', () => {
        expect(getProps(...ARGS({}, SAVED_PROPS))).toMatchObject(SAVED_PROPS);
    });

    test('With flags / With saved props [no overwriting]', () => {
        expect(getProps(...ARGS(FLAGS, SAVED_PROPS))).toMatchObject(
            STR_PROPS({
                ...SAVED_PROPS,
                ...FLAGS
            })
        );
    });

    test('With flags / With saved props [with overwriting]', () => {
        expect(
            getProps(
                ...ARGS(
                    { ...FLAGS, name: false },
                    { ...SAVED_PROPS, a: String(10) }
                )
            )
        ).toMatchObject(
            STR_PROPS({
                ...SAVED_PROPS,
                ...FLAGS,
                name: false
            })
        );
    });
});

import {
    jest,
    describe,
    test,
    expect,
    afterAll,
    beforeEach
} from '@jest/globals';

jest.mock('fs');

import { mkdirSync, existsSync, rmSync } from 'fs';

import assertDir from '../../src/util/assertDir';

const PATH = 'test-directory';

const CREATE_PATH = () => mkdirSync(PATH, { recursive: true });
const PATH_EXISTS = () => existsSync(PATH);

const TO_INITIAL_STATE = () => {
    rmSync(PATH);
    jest.clearAllMocks();
};

beforeEach(TO_INITIAL_STATE);
afterAll(TO_INITIAL_STATE);

describe('util/assertDir', () => {
    test('Existing folder, unaltered', () => {
        CREATE_PATH();
        expect(PATH_EXISTS()).toBe(true);
        assertDir(PATH);
        expect(PATH_EXISTS()).toBe(true);
    });

    test('Empty folder, create new one', () => {
        expect(PATH_EXISTS()).toBe(false);
        assertDir(PATH);
        expect(PATH_EXISTS()).toBe(true);
    });

    test('Invalid input', () => {
        expect(PATH_EXISTS()).toBe(false);
        const errorMessage = 'Invalid path provided';
        expect(() => assertDir(String())).toThrow(errorMessage);
        expect(() => assertDir(0 as unknown as string)).toThrow(errorMessage);
        expect(() => (assertDir as () => {})()).toThrow(errorMessage);
        expect(() => assertDir({} as unknown as string)).toThrow(errorMessage);
    });
});

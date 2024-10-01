import {
    jest,
    describe,
    test,
    expect,
    afterEach,
    beforeEach
} from '@jest/globals';

jest.mock('fs');
jest.mock('fs/promises');

import TempManager from '../../src/services/TempManager';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import locate from '@giancarl021/locate';
import constants from '../../src/util/constants';

beforeEach(() => {
    for (const key in constants.frontEndLibs) {
        mkdirSync(
            locate(
                constants.frontEndLibs[
                    key as keyof typeof constants.frontEndLibs
                ]
            ),
            {
                recursive: true
            }
        );
        writeFileSync(
            `${constants.frontEndLibs[key as keyof typeof constants.frontEndLibs]}/test.txt`,
            'test'
        );

        mkdirSync('/assets/data', {
            recursive: true
        });

        writeFileSync('/assets/data/test.txt', 'test');
    }
});

afterEach(() => {
    for (const key in constants.frontEndLibs) {
        rmSync(
            locate(
                constants.frontEndLibs[
                    key as keyof typeof constants.frontEndLibs
                ]
            ),
            { recursive: true, force: true }
        );
    }
    rmSync('/assets', { recursive: true, force: true });

    jest.restoreAllMocks();
});

describe('services/TempManager', () => {
    test('Initialization', () => {
        expect(() => TempManager()).not.toThrow();
    });

    test('getRootPath', async () => {
        const tmp = TempManager();

        expect(existsSync(tmp.getRootPath())).toBe(false);

        expect(tmp.getRootPath()).toMatch(/^(.*?)(\\|\/)\d+\.\d{1,3}\.d$/);

        expect(existsSync(tmp.getRootPath())).toBe(false);
    });

    test('create', async () => {
        const tmp = TempManager();

        expect(existsSync(tmp.getRootPath())).toBe(false);

        await tmp.create();

        expect(existsSync(tmp.getRootPath())).toBe(true);
    });

    test('remove', async () => {
        const tmp = TempManager();

        expect(existsSync(tmp.getRootPath())).toBe(false);

        await tmp.create();

        expect(existsSync(tmp.getRootPath())).toBe(true);

        await tmp.remove();

        expect(existsSync(tmp.getRootPath())).toBe(false);
    });

    test('clear', async () => {
        const tmp = TempManager();

        expect(existsSync(tmp.getRootPath())).toBe(false);

        await tmp.clear();

        expect(existsSync(tmp.getRootPath())).toBe(true);

        await tmp.write('test.txt', 'test');

        expect(existsSync(`${tmp.getRootPath()}/test.txt`)).toBe(true);

        await tmp.clear();

        expect(existsSync(tmp.getRootPath())).toBe(true);
        expect(existsSync(`${tmp.getRootPath()}/test.txt`)).toBe(false);
    });

    test('write', async () => {
        const tmp = TempManager();

        await tmp.create();

        await tmp.write('test.txt', 'test');

        expect(existsSync(`${tmp.getRootPath()}/test.txt`)).toBe(true);

        expect(readFileSync(`${tmp.getRootPath()}/test.txt`, 'utf8')).toBe(
            'test'
        );

        await tmp.clear();
    });

    test('read', async () => {
        const tmp = TempManager();

        await tmp.create();

        await tmp.write('test.txt', 'test');

        expect(existsSync(`${tmp.getRootPath()}/test.txt`)).toBe(true);
        expect(readFileSync(`${tmp.getRootPath()}/test.txt`, 'utf8')).toBe(
            'test'
        );
        expect(await tmp.read('test.txt')).toBe('test');

        await tmp.clear();
    });

    test('getFilePath', async () => {
        const tmp = TempManager();

        await tmp.create();

        expect(tmp.getFilePath('test.txt')).toBe(
            locate(`${tmp.getRootPath()}/test.txt`)
        );

        await tmp.clear();
    });

    test('fill', async () => {
        const tmp = TempManager();

        await tmp.create();

        await tmp.fill('test', '/assets');

        expect(
            existsSync(`${tmp.getRootPath()}/__injected_libs__/mermaid`)
        ).toBe(true);
        expect(
            readFileSync(
                `${tmp.getRootPath()}/__injected_libs__/mermaid/test.txt`,
                'utf8'
            )
        ).toBe('test');

        expect(existsSync(`${tmp.getRootPath()}/index.html`)).toBe(true);
        expect(readFileSync(`${tmp.getRootPath()}/index.html`, 'utf8')).toBe(
            'test'
        );

        expect(existsSync(`${tmp.getRootPath()}/data`)).toBe(true);
        expect(readFileSync(`${tmp.getRootPath()}/data/test.txt`, 'utf8')).toBe(
            'test'
        );

        await tmp.clear();
    });
});

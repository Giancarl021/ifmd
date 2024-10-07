import {
    describe,
    test,
    expect,
    beforeEach,
    beforeAll,
    afterAll
} from '@jest/globals';
import locate from '@giancarl021/locate';
import { writeFileSync, rmSync, mkdirSync } from 'fs';

import recursiveReadDir from '../../src/util/recursiveReadDir';

const RAND = () => Math.floor(3e4 * Math.random());
const DIR_PATH = locate('../../tmp' + RAND());

const FILL_DIR = () => {
    for (let i = 0; i < 10; i++) {
        const path = locate(`${DIR_PATH}/F/file${i}.${i < 5 ? 'a' : 'b'}`);
        writeFileSync(path, String(RAND()));
    }
};

const MAKE_DIR = () => {
    mkdirSync(DIR_PATH + '/F', { recursive: true });
};

const REMOVE_DIR = () => {
    rmSync(DIR_PATH, { recursive: true });
};

const CLEAR_DIR = () => {
    REMOVE_DIR();
    MAKE_DIR();
};

const DIR_PATH_MAPPER = (filename: string) =>
    locate(DIR_PATH + '/F/' + filename);

beforeAll(MAKE_DIR);
beforeEach(CLEAR_DIR);
afterAll(REMOVE_DIR);

describe('util/recursiveReadDir', () => {
    test('Empty directory', async () => {
        const files = await recursiveReadDir(DIR_PATH);
        expect(files.length).toBe(0);
    });
    test('Without filter', async () => {
        FILL_DIR();
        const files = await recursiveReadDir(DIR_PATH);

        expect(files).toEqual(
            [
                'file0.a',
                'file1.a',
                'file2.a',
                'file3.a',
                'file4.a',
                'file5.b',
                'file6.b',
                'file7.b',
                'file8.b',
                'file9.b'
            ].map(DIR_PATH_MAPPER)
        );
    });

    test('With filter for .a extension', async () => {
        FILL_DIR();
        const files = await recursiveReadDir(DIR_PATH, filename =>
            filename.endsWith('.a')
        );
        expect(files).toEqual(
            ['file0.a', 'file1.a', 'file2.a', 'file3.a', 'file4.a'].map(
                DIR_PATH_MAPPER
            )
        );
    });

    test('With filter for .b extension', async () => {
        FILL_DIR();
        const files = await recursiveReadDir(DIR_PATH, filename =>
            filename.endsWith('.b')
        );
        expect(files).toEqual(
            ['file5.b', 'file6.b', 'file7.b', 'file8.b', 'file9.b'].map(
                DIR_PATH_MAPPER
            )
        );
    });

    test('Invalid directory', async () => {
        await expect(
            async () => await recursiveReadDir(String())
        ).rejects.toThrow('Directory path is required');
        await expect(
            async () => await recursiveReadDir(DIR_PATH + DIR_PATH)
        ).rejects.toThrow(DIR_PATH + ' is not a directory');
    });
});

import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.mock('child_process');

import child_process from 'child_process';
import open from '../../src/util/open';

const spawnSpy = jest.spyOn(child_process, 'spawn');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('util/open', () => {
    test('Start process on Linux', async () => {
        open(process.cwd(), 'linux');

        expect(spawnSpy).toHaveBeenCalledTimes(1);
        expect(spawnSpy).toHaveBeenCalledWith(
            'xdg-open',
            [process.cwd()],
            expect.objectContaining({
                detached: true
            })
        );
    });

    test('Start process on Windows', async () => {
        open(process.cwd(), 'win32');

        expect(spawnSpy).toHaveBeenCalledTimes(1);
        expect(spawnSpy).toHaveBeenCalledWith(
            'explorer',
            [process.cwd()],
            expect.objectContaining({
                detached: true
            })
        );
    });

    test('Start process on MacOS', async () => {
        open(process.cwd(), 'darwin');

        expect(spawnSpy).toHaveBeenCalledTimes(1);
        expect(spawnSpy).toHaveBeenCalledWith(
            'open',
            [process.cwd()],
            expect.objectContaining({
                detached: true
            })
        );
    });

    test('Start process without defining platform', async () => {
        open(process.cwd());

        expect(spawnSpy).toHaveBeenCalledTimes(1);
        expect(spawnSpy).toHaveBeenCalledWith(
            expect.stringMatching(/(xdg-)?open|explorer/),
            [process.cwd()],
            expect.objectContaining({
                detached: true
            })
        );
    });
});

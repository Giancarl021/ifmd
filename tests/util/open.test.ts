import {
    describe,
    test,
    expect,
    jest,
    beforeEach,
    afterEach
} from '@jest/globals';

jest.mock('child_process');
jest.mock('os');

import child_process from 'child_process';
import os from 'os';

const spawnSpy = jest.spyOn(child_process, 'spawn');
const platformSpy = jest.spyOn(os, 'platform');

beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
});

afterEach(() => {
    delete (globalThis as any).__MOCK_PLATFORM__;
});

async function getOpenOnPlatform(
    platform: NodeJS.Platform
): Promise<(typeof import('../../src/util/open'))['default']> {
    (globalThis as any).__MOCK_PLATFORM__ = platform;
    const { default: open } = await import('../../src/util/open');
    return open;
}

describe('util/open', () => {
    test('Start process on Linux', async () => {
        const open = await getOpenOnPlatform('linux');
        open(process.cwd());

        expect(platformSpy).toHaveBeenCalledTimes(1);
        expect(platformSpy).toHaveReturnedWith('linux');
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
        const open = await getOpenOnPlatform('win32');
        open(process.cwd());

        expect(platformSpy).toHaveBeenCalledTimes(1);
        expect(platformSpy).toHaveReturnedWith('win32');
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
        const open = await getOpenOnPlatform('darwin');
        open(process.cwd());

        expect(platformSpy).toHaveBeenCalledTimes(1);
        expect(platformSpy).toHaveReturnedWith('darwin');
        expect(spawnSpy).toHaveBeenCalledTimes(1);
        expect(spawnSpy).toHaveBeenCalledWith(
            'open',
            [process.cwd()],
            expect.objectContaining({
                detached: true
            })
        );
    });
});

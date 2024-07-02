import { jest } from '@jest/globals';
import type {
    ChildProcessWithoutNullStreams,
    SpawnOptionsWithoutStdio
} from 'child_process';

const child_process =
    jest.createMockFromModule<typeof import('child_process')>('child_process');

function mockSpawn(
    _command: string,
    _args?: readonly string[],
    _options?: SpawnOptionsWithoutStdio
): ChildProcessWithoutNullStreams {
    return {
        unref() {}
    } as ChildProcessWithoutNullStreams;
}

child_process.spawn = mockSpawn as any;

module.exports = child_process;

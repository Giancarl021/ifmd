import { jest } from '@jest/globals';
import type { PathOrFileDescriptor, WriteFileOptions } from 'fs';

const fs = jest.createMockFromModule<typeof import('fs')>('fs');

const store: Record<string, true> = {};

function mkdirSync(path: string) {
    store[String(path)] = true;
}

function existsSync(path: string) {
    return store[path as string] !== undefined;
}

function rmSync(path: string) {
    delete store[path as string];
}

fs.mkdirSync = mkdirSync as any;
fs.existsSync = existsSync as any;
fs.rmSync = rmSync as any;

module.exports = fs;

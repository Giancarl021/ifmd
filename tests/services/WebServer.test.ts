import {
    describe,
    test,
    expect,
    beforeEach,
    afterEach,
    jest
} from '@jest/globals';

import { findFreePorts } from 'find-free-ports';
import WebServer, { WebServerInstance } from '../../src/services/WebServer';
import ioc from 'socket.io-client';

jest.mock('fs');
jest.mock('fs/promises');

import { mkdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'fs';
import locate from '@giancarl021/locate';

const findPort = async () => {
    const [port] = await findFreePorts(1, {
        startPort: 2e4,
        endPort: 2.5e4
    });
    return port;
};

beforeEach(() => {
    writeFileSync('/index.html', 'Hello, World!');
    mkdirSync(locate('assets'), { recursive: true });
    writeFileSync(locate('assets/image.png'), Buffer.from('[[IMAGE]]'));
    writeFileSync(locate('assets/file'), 'file');
});

afterEach(async () => {
    unlinkSync('/index.html');
    rmSync(locate('assets'), { recursive: true, force: true });
    jest.restoreAllMocks();
});

async function onServer(
    sockets: boolean,
    test: (server: WebServerInstance, port: number) => Promise<void>
): Promise<void> {
    const port = await findPort();

    const server = WebServer(port, '/', sockets);

    try {
        await test(server, port);
    } catch (err) {
        throw err;
    } finally {
        try {
            await server.close();
        } catch {}
    }
}

describe('services/WebServer', () => {
    test('Initialization', async () => {
        await onServer(false, async server => {
            expect(server).toBeDefined();
        });
    });

    test('Close without start', async () => {
        await onServer(false, async () => {});
    });

    test('Start without assets', async () => {
        await onServer(false, async (server, port) => {
            await server.start([]);
            const index = await (
                await fetch('http://localhost:' + port)
            ).text();

            expect(index).toBe('Hello, World!');
            expect(
                (
                    await fetch(
                        'http://localhost:' +
                            port +
                            '/__dynamic_assets__/imgRef'
                    )
                ).ok
            ).toBe(false);
        });
    }, 1e4);

    test('Start with assets', async () => {
        await onServer(false, async (server, port) => {
            await server.start([
                {
                    owner: 'file1.md',
                    reference: 'imgRef',
                    originalPath: 'image.png',
                    path: locate('assets/image.png')
                },
                {
                    owner: 'file2.md',
                    reference: 'inexistentRef',
                    originalPath: 'invalid.png',
                    path: locate('assets/invalid.png')
                },
                {
                    owner: 'file3.md',
                    reference: 'noMimeRef',
                    originalPath: 'file',
                    path: locate('assets/file')
                }
            ]);

            const index = await (
                await fetch('http://localhost:' + port)
            ).text();

            const imgBlob = await (
                await fetch(
                    'http://localhost:' + port + '/__dynamic_assets__/imgRef'
                )
            ).blob();

            const img = Buffer.from(await imgBlob.arrayBuffer());

            const invalidAsset = await fetch(
                'http://localhost:' + port + '/__dynamic_assets__/invalidRef'
            );

            const inexistentRef = await fetch(
                'http://localhost:' + port + '/__dynamic_assets__/inexistentRef'
            );

            const noMimeRef = await fetch(
                'http://localhost:' + port + '/__dynamic_assets__/noMimeRef'
            );

            expect(index).toBe('Hello, World!');
            expect(img).toEqual(readFileSync(locate('assets/image.png')));
            expect(invalidAsset.ok).toBe(false);
            expect(invalidAsset.status).toBe(404);
            expect(inexistentRef.ok).toBe(false);
            expect(inexistentRef.status).toBe(404);
            expect(noMimeRef.ok).toBe(true);
            expect(noMimeRef.headers.get('Content-Type')).toBeNull();
            expect(await noMimeRef.text()).toBe('file');
        });
    }, 1e4);

    test('Start with sockets', async () => {
        await onServer(true, async (server, port) => {
            await server.start([]);

            const socket = ioc('http://localhost:' + port);

            await new Promise(r => socket.on('connect', () => r(null)));

            const reloadPromise = new Promise<void>(r =>
                socket.on('reload', () => r())
            );

            server.reloadPage([]);

            await reloadPromise;

            socket.disconnect();

            await server.close();
        });
    }, 1e4);
});

import {
    describe,
    test,
    expect,
    afterEach,
    jest,
    beforeEach
} from '@jest/globals';
import waitForExpect from 'wait-for-expect';
import mockConsole from 'jest-mock-console';
import CommandBinder from '../__utils__/CommandBinder';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { findFreePorts } from 'find-free-ports';
import constants from '../../src/util/constants';
import locate from '@giancarl021/locate';
import { dirname } from 'path';

jest.mock('fs');
jest.mock('fs/promises');
jest.mock('child_process');
jest.setMock('../../src/util/constants', require('../__mocks__/constants'));

const templates = ['Document', 'Presentation', 'Spreadsheet'];

const binder = CommandBinder('preview');

let restoreConsole: () => void;

const findPort = async () => {
    const [port] = await findFreePorts(1, {
        startPort: 2.5e4,
        endPort: 3e4
    });
    return port;
};

beforeEach(() => {
    restoreConsole = mockConsole();
    for (const template of [...templates, 'Invalid', 'Corrupted']) {
        mkdirSync(
            locate(`${constants.templates.defaultRootPath}/${template}`),
            {
                recursive: true
            }
        );
        mkdirSync(locate(`${constants.templates.customRootPath}/${template}`), {
            recursive: true
        });

        if (template !== 'Invalid') {
            writeFileSync(
                `${constants.templates.defaultRootPath}/${template}/manifest.json`,
                JSON.stringify(
                    template !== 'Corrupted'
                        ? {
                              name: template,
                              createdAt: new Date(2021, 10, 1).toISOString(),
                              path: `${constants.templates.defaultRootPath}/${template}`,
                              isNative: true
                          }
                        : {}
                )
            );

            writeFileSync(
                `${constants.templates.customRootPath}/${template}/manifest.json`,
                JSON.stringify(
                    template !== 'Corrupted'
                        ? {
                              name: 'custom-' + template,
                              createdAt: new Date(2021, 10, 1).toISOString(),
                              path: `${constants.templates.customRootPath}/${template}`,
                              isNative: false
                          }
                        : {}
                )
            );

            writeFileSync(
                `${constants.templates.defaultRootPath}/${template}/index.html`,
                '<html><body>@@content</body></html>'
            );

            writeFileSync(
                `${constants.templates.customRootPath}/${template}/index.html`,
                '<html><body>@@content</body></html>'
            );
        }
    }

    mkdirSync(dirname(constants.templates.defaultSampleTemplateFile), {
        recursive: true
    });

    writeFileSync(
        constants.templates.defaultSampleTemplateFile,
        '## Sample content'
    );

    for (const lib in constants.frontEndLibs) {
        mkdirSync(
            constants.frontEndLibs[lib as keyof typeof constants.frontEndLibs],
            { recursive: true }
        );
    }
});

afterEach(() => {
    rmSync(constants.templates.defaultRootPath, {
        recursive: true,
        force: true
    });
    rmSync(constants.templates.customRootPath, {
        recursive: true,
        force: true
    });

    rmSync(dirname(constants.templates.defaultSampleTemplateFile), {
        recursive: true,
        force: true
    });

    for (const lib in constants.frontEndLibs) {
        rmSync(
            constants.frontEndLibs[lib as keyof typeof constants.frontEndLibs],
            { force: true, recursive: true }
        );
    }

    restoreConsole();
    jest.restoreAllMocks();
    binder.afterEach();
});

const preview = binder.bindCommand();

describe('commands/preview', () => {
    test('Empty execution', async () => {
        await expect(() => preview([], {})).rejects.toThrow(
            'No file specified'
        );
    });

    test('Inexistent file', async () => {
        await expect(() => preview(['inexistent'], {})).rejects.toThrow(
            'File inexistent not found'
        );
    });

    test('With invalid port', async () => {
        const promise = preview(
            [constants.templates.defaultSampleTemplateFile],
            { 'web-server-port': 0 }
        );

        await waitForExpect(() => {
            expect(console.log).toBeCalledTimes(1);
            expect(console.log).toHaveBeenCalledWith(
                expect.stringMatching(
                    /Preview available on http:\/\/localhost:\d+/
                )
            );
        }, 1e4);

        process.emit('SIGINT');

        await promise;
    }, 1e5);

    test('With default port', async () => {
        const promise = preview(
            [constants.templates.defaultSampleTemplateFile],
            {}
        );

        await waitForExpect(() => {
            expect(console.log).toBeCalledTimes(1);
            expect(console.log).toHaveBeenCalledWith(
                expect.stringMatching(
                    /Preview available on http:\/\/localhost:\d+/
                )
            );
        }, 1e4);

        process.emit('SIGINT');

        await promise;
    }, 1e5);

    test('Default template', async () => {
        const port = await findPort();
        const promise = preview(
            [constants.templates.defaultSampleTemplateFile],
            { 'web-server-port': port }
        );

        await waitForExpect(() => {
            expect(console.log).toBeCalledTimes(1);
            expect(console.log).toHaveBeenCalledWith(
                `Preview available on http://localhost:${port}`
            );
        }, 1e4);

        process.emit('SIGINT');

        await promise;
    }, 1e5);

    test('Custom template', async () => {
        const port = await findPort();
        const promise = preview(
            [constants.templates.defaultSampleTemplateFile],
            { template: 'custom-Document', 'web-server-port': port }
        );

        await waitForExpect(() => {
            expect(console.log).toBeCalledTimes(1);
            expect(console.log).toHaveBeenCalledWith(
                `Preview available on http://localhost:${port}`
            );
        }, 1e4);

        const html = await (await fetch(`http://localhost:${port}`)).text();

        expect(html).toMatch(/<h2>Sample content<\/h2>/);

        process.emit('SIGINT');

        await promise;
    });

    test('Update document', async () => {
        const port = await findPort();
        const promise = preview(
            [constants.templates.defaultSampleTemplateFile],
            { 'web-server-port': port }
        );

        await waitForExpect(() => {
            expect(console.log).toBeCalledTimes(1);
            expect(console.log).toHaveBeenCalledWith(
                `Preview available on http://localhost:${port}`
            );
        }, 1e4);

        const html = await (await fetch(`http://localhost:${port}`)).text();

        expect(html).toMatch(/<h2>Sample content<\/h2>/);

        writeFileSync(
            constants.templates.defaultSampleTemplateFile,
            '## Updated content'
        );

        await waitForExpect(() => {
            expect(console.log).toBeCalledTimes(2);
            expect(console.log).toHaveBeenCalledWith(
                `Changes detected, reloading preview...`
            );
        }, 1e4);

        const updatedHtml = await (
            await fetch(`http://localhost:${port}`)
        ).text();

        expect(updatedHtml).toMatch(/<h2>Updated content<\/h2>/);

        process.emit('SIGINT');

        await promise;
    });
});

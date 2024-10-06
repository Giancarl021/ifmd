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
const allTemplates = [...templates, ...templates.map(t => 'custom-' + t)];

const binder = CommandBinder('template');

let restoreConsole: () => void;

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
                '<html></html>'
            );

            writeFileSync(
                `${constants.templates.customRootPath}/${template}/index.html`,
                '<html></html>'
            );
        }
    }

    mkdirSync(dirname(constants.templates.defaultSampleTemplateFile), {
        recursive: true
    });

    writeFileSync(
        constants.templates.defaultSampleTemplateFile,
        '# Sample content'
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

const template = binder.bindFlatCommands<
    'list' | 'create' | 'remove' | 'show' | 'preview'
>();

describe('commands/template', () => {
    describe('list operation', () => {
        test('Empty execution', async () => {
            expect(await template.list([], {})).toBe(
                allTemplates.map(t => `* ${t}`).join('\n')
            );
        });

        test.each([['v'], ['verbose']])(
            'Verbose execution with %s flag',
            async (flag: string) => {
                expect(await template.list([], { [flag]: true })).toBe(
                    allTemplates
                        .map(
                            t =>
                                `${t}\n  Created at: ${new Date(2021, 10, 1).toISOString()}\n  Path: ${
                                    t.startsWith('custom-')
                                        ? locate(
                                              constants.templates
                                                  .customRootPath +
                                                  '/' +
                                                  t.replace('custom-', '')
                                          )
                                        : '[[INTERNAL]]'
                                }\n  Type: ${t.startsWith('custom-') ? 'Custom' : 'Native'}`
                        )
                        .join('\n')
                );
            }
        );

        test.each([['json'], ['j']])(
            'JSON execution with %s flag',
            async (flag: string) => {
                expect(
                    JSON.parse(await template.list([], { [flag]: true }))
                ).toEqual(
                    allTemplates.map(t => ({
                        name: t,
                        createdAt: new Date(2021, 10, 1).toISOString(),
                        path: t.startsWith('custom-')
                            ? locate(
                                  constants.templates.customRootPath +
                                      '/' +
                                      t.replace('custom-', '')
                              )
                            : null,
                        isNative: !t.startsWith('custom-')
                    }))
                );
            }
        );
    });

    describe('create operation', () => {
        test('Empty execution', async () => {
            await expect(template.create([], {})).rejects.toThrow(
                'Template name is required'
            );
        });

        test('Existing template name', async () => {
            await expect(template.create(['Document'], {})).rejects.toThrow(
                'Template "Document" already exists'
            );
        });

        test('Valid execution', async () => {
            expect(await template.create(['NewTemplate'], {})).toBe(
                `Template NewTemplate created at ${locate(constants.templates.customRootPath + '/newtemplate')}`
            );

            expect(
                JSON.parse(
                    readFileSync(
                        `${constants.templates.customRootPath}/newtemplate/manifest.json`,
                        'utf-8'
                    )
                )
            ).toMatchObject({
                name: 'NewTemplate',
                createdAt: expect.stringMatching(
                    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
                )
            });
        });

        test.each([['s'], ['seed']])(
            `With custom valid seed on flag %s`,
            async (flag: string) => {
                expect(
                    await template.create(['NewTemplate'], {
                        [flag]: 'Document'
                    })
                ).toBe(
                    `Template NewTemplate created at ${locate(constants.templates.customRootPath + '/newtemplate')}`
                );

                expect(
                    JSON.parse(
                        readFileSync(
                            `${constants.templates.customRootPath}/newtemplate/manifest.json`,
                            'utf-8'
                        )
                    )
                ).toMatchObject({
                    name: 'NewTemplate',
                    createdAt: expect.stringMatching(
                        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
                    )
                });
            }
        );

        test.each([['s'], ['seed']])(
            `With custom invalid seed on flag %s`,
            async (flag: string) => {
                await expect(
                    template.create(['NewTemplate'], { [flag]: 'Invalid' })
                ).rejects.toThrow('Invalid seed template');
            }
        );
    });

    describe('remove operation', () => {
        test('Empty execution', async () => {
            await expect(template.remove([], {})).rejects.toThrow(
                'Template name is required'
            );
        });

        test('Non-existing template', async () => {
            await expect(template.remove(['NonExisting'], {})).rejects.toThrow(
                'Template "NonExisting" does not exist'
            );
        });

        test('Valid execution', async () => {
            expect(await template.create(['MyTemplate'], {})).toBe(
                'Template MyTemplate created at ' +
                    locate(constants.templates.customRootPath + '/mytemplate')
            );
            expect(await template.remove(['MyTemplate'], {})).toBe(
                'Template MyTemplate successfully deleted'
            );
        });
    });

    describe('show operation', () => {
        test('Empty execution', async () => {
            await expect(template.show([], {})).rejects.toThrow(
                'Template name is required'
            );
        });

        test('Non-existing template', async () => {
            await expect(template.show(['NonExisting'], {})).rejects.toThrow(
                'Template "NonExisting" not found'
            );
        });

        test('Native template', async () => {
            await expect(template.show(['Document'], {})).rejects.toThrow(
                'Native templates cannot be edited'
            );
        });

        test('Successful execution', async () => {
            expect(await template.create(['MyTemplate'], {})).toBe(
                'Template MyTemplate created at ' +
                    locate(constants.templates.customRootPath + '/mytemplate')
            );

            expect(await template.show(['MyTemplate'], {})).toBe(
                `Template MyTemplate at ${locate(constants.templates.customRootPath + '/mytemplate')} opened in your default file explorer`
            );
        });
    });

    describe('preview operation', () => {
        test('Empty execution', async () => {
            await expect(template.preview([], {})).rejects.toThrow(
                'Template name is required'
            );
        });

        test('Non-existing template', async () => {
            await expect(template.preview(['NonExisting'], {})).rejects.toThrow(
                'Template "NonExisting" not found'
            );
        });

        test('Native template', async () => {
            await expect(template.preview(['Document'], {})).rejects.toThrow(
                'Native templates cannot be previewed'
            );
        });

        test('Custom template with default port', async () => {
            const promise = template.preview(['custom-Document'], {});

            await waitForExpect(() => {
                expect(console.log).toHaveBeenCalledTimes(1);
                expect(console.log).toHaveBeenCalledWith(
                    expect.stringMatching(
                        /Preview available on http:\/\/localhost:\d+/
                    )
                );
            }, 1e4);

            writeFileSync(
                `${constants.templates.customRootPath}/Document/index.html`,
                '<html><head></head><body></body></html>'
            );

            await waitForExpect(() => {
                expect(console.log).toHaveBeenCalledTimes(2);
                expect(console.log).toHaveBeenCalledWith(
                    'Changes detected, reloading preview...'
                );
            });

            process.emit('SIGINT');

            const result = await promise;

            expect(
                (console.log as any).mock.calls.length
            ).toBeGreaterThanOrEqual(4);
            expect(console.log).toHaveBeenCalledWith('Closing web server...');
            expect(console.log).toHaveBeenCalledWith(
                'Removing temporary files...'
            );
            expect(result).toBe('Preview ended');
        }, 1e5);

        test('Custom template with valid port', async () => {
            const [port] = await findFreePorts(1);

            const promise = template.preview(['custom-Document'], {
                'web-server-port': port
            });

            await waitForExpect(() => {
                expect(console.log).toHaveBeenCalledTimes(1);
                expect(console.log).toHaveBeenCalledWith(
                    port
                        ? `Preview available on http://localhost:${port}`
                        : expect.stringMatching(
                              /Preview available on http:\/\/localhost:\d+/
                          )
                );
            }, 1e4);

            writeFileSync(
                `${constants.templates.customRootPath}/Document/index.html`,
                '<html><head></head><body></body></html>'
            );

            await waitForExpect(() => {
                expect(console.log).toHaveBeenCalledTimes(2);
                expect(console.log).toHaveBeenCalledWith(
                    'Changes detected, reloading preview...'
                );
            });

            process.emit('SIGINT');

            const result = await promise;

            expect(
                (console.log as any).mock.calls.length
            ).toBeGreaterThanOrEqual(4);
            expect(console.log).toHaveBeenCalledWith('Closing web server...');
            expect(console.log).toHaveBeenCalledWith(
                'Removing temporary files...'
            );
            expect(result).toBe('Preview ended');
        }, 1e5);

        test('Custom template with invalid port', async () => {
            const promise = template.preview(['custom-Document'], {
                'web-server-port': 0
            });

            await waitForExpect(() => {
                expect(console.log).toHaveBeenCalledTimes(1);
                expect(console.log).toHaveBeenCalledWith(
                    expect.stringMatching(
                        /Preview available on http:\/\/localhost:\d+/
                    )
                );
            }, 1e4);

            writeFileSync(
                `${constants.templates.customRootPath}/Document/index.html`,
                '<html><head></head><body></body></html>'
            );

            await waitForExpect(() => {
                expect(console.log).toHaveBeenCalledTimes(2);
                expect(console.log).toHaveBeenCalledWith(
                    'Changes detected, reloading preview...'
                );
            });

            process.emit('SIGINT');

            const result = await promise;

            expect(
                (console.log as any).mock.calls.length
            ).toBeGreaterThanOrEqual(4);
            expect(console.log).toHaveBeenCalledWith('Closing web server...');
            expect(console.log).toHaveBeenCalledWith(
                'Removing temporary files...'
            );
            expect(result).toBe('Preview ended');
        }, 1e5);
    });
});

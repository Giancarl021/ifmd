import {
    describe,
    test,
    expect,
    afterEach,
    jest,
    beforeEach
} from '@jest/globals';
import mockConsole from 'jest-mock-console';
import CommandBinder from '../__utils__/CommandBinder';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import constants from '../../src/util/constants';
import locate from '@giancarl021/locate';
import { dirname } from 'path';
import { archiveFolder } from 'zip-lib';

jest.mock('fs');
jest.mock('fs/promises');
jest.mock('child_process');
jest.setMock('../../src/util/constants', require('../__mocks__/constants'));

const templates = ['Document', 'Presentation', 'Spreadsheet'];
const allTemplates = [...templates, ...templates.map(t => 'custom-' + t)];

const binder = CommandBinder('template');

let restoreConsole: () => void;

beforeEach(async () => {
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

    mkdirSync('tmp', { recursive: true });

    writeFileSync(
        'tmp/manifest.json',
        JSON.stringify({
            name: 'custom-tmp',
            createdAt: new Date().toISOString(),
            path: 'tmp',
            isNative: false
        })
    );

    await archiveFolder('tmp', 'tmp/tmp.zip');
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

    rmSync('tmp', { recursive: true, force: true });

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
    'list' | 'create' | 'remove' | 'show' | 'import' | 'export'
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

    describe('import operation', () => {
        test('Empty execution', async () => {
            await expect(() => template.import([], {})).rejects.toThrow(
                'File path or URL must be provided'
            );
        });

        test('Succesful importing', async () => {
            expect(await template.import(['tmp/tmp.zip'], {})).toBe(
                'Template custom-tmp successfully imported'
            );
        });

        test.each([['a'], ['as'], ['alias']])(
            `With custom name on flag %s`,
            async (flag: string) => {
                expect(
                    await template.import(['tmp/tmp.zip'], { [flag]: 'tmp' })
                ).toBe('Template tmp successfully imported');
            }
        );
    });

    describe('export operation', () => {
        test('Empty execution', async () => {
            await expect(() => template.export([], {})).rejects.toThrow(
                'Template name is required'
            );
        });

        test('Without output file', async () => {
            await expect(() =>
                template.export(['custom-Document'], {})
            ).rejects.toThrow('Output path is required');
        });

        test('Succesful exporting with filename', async () => {
            expect(
                await template.export(['custom-Document', 'tmp/custom.zip'], {})
            ).toMatch(
                /^Template\scustom-Document\ssuccessfully\sexported\sto\s(.*)tmp\/custom\.zip$/
            );
        });

        test('Successful export with folder', async () => {
            expect(
                await template.export(['custom-Document', 'tmp'], {})
            ).toMatch(
                /^Template\scustom-Document\ssuccessfully\sexported\sto\s(.*)tmp\/custom-Document\.zip$/
            );
        });
    });
});

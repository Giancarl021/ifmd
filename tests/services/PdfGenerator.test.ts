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
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { findFreePorts } from 'find-free-ports';
import constants from '../../src/util/constants';
import locate from '@giancarl021/locate';
import { dirname } from 'path';

jest.mock('fs');
jest.mock('fs/promises');

import PdfGenerator from '../../src/services/PdfGenerator';

const templates = ['Document', 'Presentation', 'Spreadsheet'];

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
                '<html></html>'
            );

            writeFileSync(
                `${constants.templates.customRootPath}/${template}/index.html`,
                '<html></html>'
            );

            writeFileSync(
                `${constants.templates.defaultRootPath}/${template}/mermaid.html`,
                '<html><pre class="mermaid"></pre></html>'
            );

            writeFileSync(
                `${constants.templates.customRootPath}/${template}/mermaid.html`,
                '<html><pre class="mermaid"></pre></html>'
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
});

describe('services/PdfGenerator', () => {
    test('Initialization', async () => {
        PdfGenerator(
            `${constants.templates.defaultRootPath}/Document`,
            await findPort(),
            {}
        );
    });

    describe('generate operation', () => {
        test('Invalid template', async () => {
            const generator = PdfGenerator(
                `${constants.templates.defaultRootPath}/Invalid`,
                await findPort(),
                {}
            );

            await expect(() =>
                generator.generate('index.html', [])
            ).rejects.toThrow();
        });

        test('Valid template', async () => {
            const generator = PdfGenerator(
                `${constants.templates.defaultRootPath}/Document`,
                await findPort(),
                {}
            );

            await generator.generate('index.html', []);
        });

        test('Valid template with mermaid on index.html', async () => {
            const generator = PdfGenerator(
                `${constants.templates.defaultRootPath}/Document`,
                await findPort(),
                {}
            );

            await generator.generate('mermaid.html', []);
        });
    });
});

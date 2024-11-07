import {
    jest,
    describe,
    test,
    expect,
    afterEach,
    beforeEach
} from '@jest/globals';

jest.mock('fs');
jest.mock('fs/promises');
jest.mock('node-fetch-commonjs');

import TemplateManager from '../../src/services/TemplateManager';
import { mkdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'fs';
import { archiveFolder } from 'zip-lib';
import locate from '@giancarl021/locate';
import constants from '../../src/util/constants';

const templates = ['Document', 'Presentation', 'Spreadsheet'];

function toTemplateData(template: string, native: boolean) {
    const basePath = native
        ? constants.templates.defaultRootPath
        : constants.templates.customRootPath;

    const noCustom = template.startsWith('custom-')
        ? template.slice(7)
        : template;

    const path = `${basePath}/${[...templates, 'Invalid', 'Corrupted'].includes(noCustom) ? noCustom : template.trim().replace(/\s\s+/g, '').toLowerCase().replace(/\s/g, '-')}`;
    return {
        name: template,
        createdAt: expect.any(Date),
        path: locate(path),
        isNative: native
    };
}

beforeEach(async () => {
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
                              createdAt: new Date().toISOString(),
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
                              createdAt: new Date().toISOString(),
                              path: `${constants.templates.customRootPath}/${template}`,
                              isNative: false
                          }
                        : {}
                )
            );
        }
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

    await archiveFolder(
        `${constants.templates.defaultRootPath}/Document`,
        'tmp/Document.zip'
    );

    await archiveFolder(constants.templates.defaultRootPath, 'tmp/Invalid.zip');
});

afterEach(() => {
    for (const template of [...templates, 'Invalid', 'Corrupted']) {
        rmSync(`${constants.templates.defaultRootPath}/${template}`, {
            recursive: true,
            force: true
        });
        rmSync(`${constants.templates.customRootPath}/${template}`, {
            recursive: true,
            force: true
        });
    }

    rmSync('tmp', { recursive: true, force: true });

    jest.restoreAllMocks();
});

describe('services/TemplateManager', () => {
    test('Initialization', () => {
        expect(() => TemplateManager()).not.toThrow();
    });

    test('getDefaultTemplates', async () => {
        const temp = await TemplateManager().getDefaultTemplates();
        expect(temp).toEqual(templates.map(t => toTemplateData(t, true)));
    });

    test('getCustomTemplates', async () => {
        const temp = await TemplateManager().getCustomTemplates();
        expect(temp).toEqual(
            templates.map(t => toTemplateData('custom-' + t, false))
        );
    });

    test('getAllTemplates', async () => {
        const temp = await TemplateManager().getAllTemplates();
        expect(temp).toEqual([
            ...templates.map(t => toTemplateData(t, true)),
            ...templates.map(t => toTemplateData('custom-' + t, false))
        ]);
    });

    test('getTemplate', async () => {
        const temp = await TemplateManager().getTemplate('Document');
        expect(temp).toEqual(toTemplateData('Document', true));
    });

    test('Get invalid template', async () => {
        const temp = TemplateManager();
        await expect(temp.getTemplate('Invalid')).rejects.toThrow(
            'Template "Invalid" does not exist'
        );
    });

    test('createTemplate', async () => {
        const temp = await TemplateManager().createTemplate(
            'New Template',
            'Document'
        );
        expect(temp).toEqual(toTemplateData('New Template', false));
    });

    test('Create template with invalid seed', async () => {
        const temp = TemplateManager();
        await expect(
            temp.createTemplate('New Template', 'Invalid')
        ).rejects.toThrow('Invalid seed template');
    });

    test('deleteTemplate', async () => {
        const temp = TemplateManager();

        expect(await temp.getTemplate('custom-Document')).toEqual(
            toTemplateData('custom-Document', false)
        );

        await temp.deleteTemplate('custom-Document');
        await expect(temp.getTemplate('custom-Document')).rejects.toThrow(
            'Template "custom-Document" does not exist'
        );
    });

    test('Delete Template invalid template', async () => {
        await expect(
            TemplateManager().deleteTemplate('Document')
        ).rejects.toThrow('Template "Document" does not exist');
    });

    test('Import file template', async () => {
        const temp = TemplateManager();

        expect(
            await temp.importTemplate('tmp/Document.zip', 'custom-Template')
        ).toBe('custom-Template');

        await temp.deleteTemplate('custom-Template');
    });

    test('Import file template on inexistent file', async () => {
        const temp = TemplateManager();

        await expect(() =>
            temp.importTemplate('/Inexistent-Document.zip', 'custom-Template')
        ).rejects.toThrow(
            'Template zip file not found at /Inexistent-Document.zip'
        );
    });

    test('Import file template with existing name', async () => {
        const temp = TemplateManager();

        await expect(() =>
            temp.importTemplate('tmp/Document.zip', 'custom-Document')
        ).rejects.toThrow(
            'Template with name custom-Document already exists. Use the --alias flag to import this template with a different name'
        );
    });

    test('Import invalid ZIP file', async () => {
        const temp = TemplateManager();

        await expect(() =>
            temp.importTemplate('tmp/Invalid.zip', 'custom-Document')
        ).rejects.toThrow('Invalid template zip');
    });

    test('Import file template without alias', async () => {
        const temp = TemplateManager();

        expect(await temp.importTemplate('tmp/tmp.zip')).toBe('custom-tmp');

        await temp.deleteTemplate('custom-tmp');
    });

    test('Import URL template', async () => {
        const temp = TemplateManager();

        expect(
            await temp.importTemplate(
                'http://www.ok.com',
                'custom-URL-Template'
            )
        ).toBe('custom-URL-Template');

        await temp.deleteTemplate('custom-URL-Template');
    });

    test('Import URL template with non-compliant server', async () => {
        const temp = TemplateManager();

        await expect(() =>
            temp.importTemplate('http://www.not-ok.com', 'custom-URL-Template')
        ).rejects.toThrow(
            'Failed to fetch http://www.not-ok.com: 400 - Bad Request'
        );
    });

    test('Export custom template', async () => {
        const temp = TemplateManager();
        await temp.exportTemplate('custom-Document', 'tmp/CustomDocument.zip');

        expect(readFileSync('tmp/CustomDocument.zip')).toBeInstanceOf(Buffer);
    });

    test('Export native template', async () => {
        const temp = TemplateManager();

        await expect(() =>
            temp.exportTemplate('Document', 'NativeDocument.zip')
        ).rejects.toThrow('Cannot export native templates');
    });

    test('Export inexistent template', async () => {
        const temp = TemplateManager();

        await expect(() =>
            temp.exportTemplate('Xalabaias', 'InexistentDocument.zip')
        ).rejects.toThrow('Template "Xalabaias" does not exist');
    });
});

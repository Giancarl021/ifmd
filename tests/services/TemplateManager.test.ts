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

import TemplateManager from '../../src/services/TemplateManager';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
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

beforeEach(() => {
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
});

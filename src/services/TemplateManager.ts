import constants from '../util/constants';
import assertDir from '../util/assertDir';
import { existsSync } from 'fs';
import { lstat, mkdir, readFile, readdir, rm, writeFile } from 'fs/promises';
import copyFiles from 'recursive-copy';
import TemplateData from '../interfaces/TemplateData';
import locate from '@giancarl021/locate';

assertDir(constants.templates.customRootPath);

export default function () {
    async function getDefaultTemplates() {
        return loadTemplateDirectory(constants.templates.defaultRootPath, true);
    }

    async function getCustomTemplates() {
        return loadTemplateDirectory(constants.templates.customRootPath, false);
    }

    async function getAllTemplates() {
        const defaultTemplates = await getDefaultTemplates();
        const customTemplates = await getCustomTemplates();

        return [...defaultTemplates, ...customTemplates];
    }

    async function loadTemplateDirectory(rootPath: string, type: boolean) {
        const dirContents = await readdir(rootPath);

        const templates = await Promise.all(
            dirContents.map(c => loadTemplate(`${rootPath}/${c}`, type))
        );

        const filteredTemplates: TemplateData[] = templates.filter(
            Boolean
        ) as NonNullable<TemplateData>[];

        return filteredTemplates;
    }

    async function loadTemplate(directory: string, isNative: boolean) {
        const stat = await lstat(directory);
        const isValid =
            stat.isDirectory() && existsSync(`${directory}/manifest.json`);

        if (!isValid) return null;

        const manifestData = JSON.parse(
            await readFile(`${directory}/manifest.json`, 'utf8')
        );

        if (!manifestData || !manifestData.name || !manifestData.createdAt)
            return null;

        const { name, createdAt: createdAtStr } = manifestData;

        return {
            name: name,
            path: locate(directory),
            createdAt: new Date(createdAtStr),
            isNative
        };
    }

    async function createTemplate(name: string, seedTemplateName: string) {
        const trimmedName = name.trim().replace(/\s\s+/g, '');

        const path = locate(
            `${constants.templates.customRootPath}/${trimmedName
                .toLowerCase()
                .replace(/\s/g, '-')}`
        );

        if (existsSync(path)) await rm(path, { recursive: true });
        await mkdir(path, { recursive: true });

        const allTemplates = await getAllTemplates();

        const seedTemplate = allTemplates.find(
            t => t.name === seedTemplateName
        );

        if (!seedTemplate) throw new Error('Invalid seed template');

        await new Promise((resolve, reject) => {
            copyFiles(seedTemplate.path, path, err => {
                if (err) return reject(err);

                resolve(null);
            });
        });

        const manifestPath = locate(`${path}/manifest.json`);

        const createdAt = new Date();

        const manifestData = {
            name: trimmedName,
            createdAt: createdAt.toISOString()
        };

        await writeFile(manifestPath, JSON.stringify(manifestData, null, 4));

        const newTemplate: TemplateData = {
            name: trimmedName,
            path,
            createdAt,
            isNative: false
        };

        return newTemplate;
    }

    async function deleteTemplate(name: string) {
        const customTemplates = await getCustomTemplates();

        const template = customTemplates.find(t => t.name === name);

        if (!template) throw new Error(`Template "${name}" does not exist`);

        await rm(template.path, { recursive: true });
    }

    async function getTemplate(name: string) {
        const allTemplates = await getAllTemplates();

        const template = allTemplates.find(t => t.name === name);

        if (!template) throw new Error(`Template "${name}" does not exist`);

        return template;
    }

    return {
        getDefaultTemplates,
        getCustomTemplates,
        getAllTemplates,
        createTemplate,
        deleteTemplate,
        getTemplate
    };
}

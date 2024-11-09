import constants from '../util/constants';
import assertDir from '../util/assertDir';
import { archiveFolder, extract } from 'zip-lib';
import isUrl from 'is-url-http';
import fetch from 'node-fetch-commonjs';
import { existsSync } from 'fs';
import { lstat, mkdir, readFile, readdir, rm, writeFile } from 'fs/promises';
import { ncp } from 'ncp';
import { promisify } from 'util';
import TemplateData from '../interfaces/TemplateData';
import TempManager from './TempManager';
import locate from '@giancarl021/locate';

const copyFiles = promisify(ncp).bind(ncp);

assertDir(constants.templates.customRootPath);

export default function TemplateManager() {
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

        require('fs').writeFileSync(
            '/home/giancarl021/tcc/Arquivos/templateManager.json',
            JSON.stringify(
                {
                    name: name,
                    path: locate(directory),
                    createdAt: new Date(createdAtStr),
                    isNative
                },
                null,
                2
            )
        );

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

        await copyFiles(seedTemplate.path, path);

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

    async function importTemplate(pathOrUrl: string, alias?: string) {
        const isHttp = isUrl(pathOrUrl);
        const temp = TempManager();

        await temp.createDir('extracted');
        const extractedDirName = temp.getFilePath('extracted');

        try {
            if (isHttp) {
                const response = await fetch(pathOrUrl);

                if (!response.ok)
                    throw new Error(
                        `Failed to fetch ${pathOrUrl}: ${response.status} - ${response.statusText}`
                    );

                const buffer = Buffer.from(await response.arrayBuffer());

                const zipName = 'downloaded.zip';

                await temp.create();
                await temp.write(zipName, buffer);

                await extract(temp.getFilePath(zipName), extractedDirName);
            } else {
                const path = locate(pathOrUrl, true);

                const isValidPath =
                    existsSync(path) && (await lstat(path)).isFile();

                if (!isValidPath)
                    throw new Error('Template zip file not found at ' + path);

                await extract(path, extractedDirName);
            }

            const manifest = await loadTemplate(extractedDirName, false);

            if (!manifest) throw new Error('Invalid template zip');

            const templateName = String(alias || manifest.name)
                .trim()
                .replace(/\s\s+/g, '');

            manifest.name = templateName;
            manifest.isNative = false;

            await temp.write(
                'extracted/manifest.json',
                JSON.stringify(manifest, null, 4)
            );

            const allTemplates = await getAllTemplates();

            if (allTemplates.find(t => t.name === templateName))
                throw new Error(
                    `Template with name ${templateName} already exists. Use the --alias flag to import this template with a different name`
                );

            await copyFiles(
                extractedDirName,
                locate(`${constants.templates.customRootPath}/${templateName}`)
            );

            return templateName;
        } finally {
            await temp.remove();
        }
    }

    async function exportTemplate(name: string, path: string) {
        const allTemplates = await getAllTemplates();

        const template = allTemplates.find(t => t.name === name);

        if (!template) throw new Error(`Template "${name}" does not exist`);

        if (template.isNative)
            throw new Error('Cannot export native templates');

        await archiveFolder(template.path, path);
    }

    return {
        getDefaultTemplates,
        getCustomTemplates,
        getAllTemplates,
        createTemplate,
        deleteTemplate,
        getTemplate,
        importTemplate,
        exportTemplate
    };
}

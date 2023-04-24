import constants from '../util/constants';
import assertDir from '../util/assertDir';
import { lstat, readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import TemplateData from '../interfaces/TemplateData';

assertDir(constants.templates.customRootPath);

export default function () {
    async function getDefaultTemplates(loadManifests = false) {
        return loadTemplateDirectory(
            constants.templates.defaultRootPath,
            loadManifests,
            'default'
        );
    }

    async function getCustomTemplates(loadManifests = false) {
        return loadTemplateDirectory(
            constants.templates.customRootPath,
            loadManifests,
            'custom'
        );
    }

    async function getAllTemplates(loadManifests = false) {
        const defaultTemplates = await getDefaultTemplates(loadManifests);
        const customTemplates = await getCustomTemplates(loadManifests);

        return [...defaultTemplates, ...customTemplates];
    }

    async function loadTemplateDirectory(
        rootPath: string,
        loadManifests = false,
        type: TemplateData['type']
    ) {
        const dirContents = await readdir(rootPath);

        const templates = await Promise.all(
            dirContents.map(c =>
                getTemplate(`${rootPath}/${c}`, loadManifests, type)
            )
        );

        return templates.filter(Boolean) as TemplateData[];
    }

    async function getTemplate(
        directory: string,
        loadManifests: boolean,
        type: TemplateData['type']
    ) {
        const stat = await lstat(directory);
        const isValid =
            stat.isDirectory() && existsSync(`${directory}/manifest.json`);

        if (!isValid) return null;

        return {
            name: directory.split(/(\\|\/)/).pop(),
            type,
            manifest: loadManifests
                ? JSON.parse(
                      await readFile(`${directory}/manifest.json`, 'utf8')
                  )
                : {}
        };
    }

    return {
        getDefaultTemplates,
        getCustomTemplates,
        getAllTemplates
    };
}

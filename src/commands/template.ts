import { Commands } from '@giancarl021/cli-core/interfaces';
import chokidar from 'chokidar';
import locate from '@giancarl021/locate';
import TemplateManager from '../services/TemplateManager';
import open from '../util/open';
import constants from '../util/constants';
import TemplatePreviewer from '../services/TemplatePreviewer';
import getProps from '../util/getProps';

async function getAllTemplates() {
    const templateManager = TemplateManager();
    const templates = await templateManager.getAllTemplates();

    return templates;
}

const commands: Commands = {
    async list() {
        const templates = await getAllTemplates();

        const verbose = this.helpers.hasFlag('v', 'verbose');
        const asJson = this.helpers.hasFlag('j', 'json');

        let output: string;

        if (asJson) {
            return JSON.stringify(
                templates.map(t => ({
                    ...t,
                    path: t.isNative ? null : t.path
                })),
                null,
                2
            );
        }

        if (verbose) {
            output = templates
                .map(
                    t =>
                        `${
                            t.name
                        }\n  Created at: ${t.createdAt.toISOString()}\n  Path: ${
                            t.isNative ? '[[INTERNAL]]' : t.path
                        }\n  Type: ${t.isNative ? 'Native' : 'Custom'}`
                )
                .join('\n');
        } else {
            output = templates.map(t => `* ${t.name}`).join('\n');
        }

        return output;
    },

    async create(args) {
        const [templateName] = args;

        if (!templateName) throw new Error('Template name is required');

        const templateManager = TemplateManager();
        const templates = await templateManager.getAllTemplates();

        const template = templates.find(t => t.name === templateName);

        if (template)
            throw new Error(`Template "${templateName}" already exists`);

        const seed = this.helpers.valueOrDefault(
            this.helpers.getFlag('s', 'seed'),
            constants.templates.defaultTemplateName
        );

        const newTemplate = await templateManager.createTemplate(
            templateName,
            seed
        );

        return `Template ${newTemplate.name} created at ${newTemplate.path}`;
    },

    async remove(args) {
        const [templateName] = args;

        if (!templateName) throw new Error('Template name is required');

        const templateManager = TemplateManager();

        await templateManager.deleteTemplate(templateName);

        return `Template ${templateName} successfully deleted`;
    },

    async show(args) {
        const [templateName] = args;

        if (!templateName) throw new Error('Template name is required');

        const templates = await getAllTemplates();

        const template = templates.find(t => t.name === templateName);

        if (!template) throw new Error(`Template "${templateName}" not found.`);

        if (template.isNative)
            throw new Error('Native templates cannot be edited');

        open(template.path);

        return `Template ${template.name} at ${template.path} opened in your default file explorer`;
    },

    async preview(args, flags) {
        const [templateName] = args;

        if (!templateName) throw new Error('Template name is required');

        const templates = await getAllTemplates();

        const template = templates.find(t => t.name === templateName);

        if (!template) throw new Error(`Template "${templateName}" not found.`);

        if (template.isNative)
            throw new Error('Native templates cannot be previewed');

        const defaultPort = await constants.webServer.defaultPort();

        const port =
            Number(
                this.helpers.valueOrDefault(
                    this.helpers.getFlag('web-server-port'),
                    String(defaultPort)
                )
            ) || defaultPort;

        const baseFilePath: string = this.helpers.valueOrDefault(
            this.helpers.getFlag('f', 'base-file'),
            constants.templates.defaultSampleTemplateFile
        );

        const props: Record<string, string> = getProps(this, flags);
        const date: string = this.helpers.valueOrDefault(
            this.helpers.getFlag('d', 'date'),
            new Date().toLocaleDateString()
        );

        const previewer = TemplatePreviewer(template, baseFilePath, port, {
            ...props,
            date
        });

        const watcher = chokidar.watch(template.path, {
            awaitWriteFinish: true
        });

        watcher.on('change', async () => {
            console.log('Changes detected, reloading preview...');

            await previewer.update();
        });

        await previewer.preview();

        await watcher.close();

        return 'Preview ended';
    },

    async import(args) {
        const [pathOrUrl] = args;

        const alias =
            this.helpers.getFlag('alias', 'as', 'a')?.toString() ?? undefined;

        if (!pathOrUrl) throw new Error('File path or URL must be provided');

        const manager = TemplateManager();

        const templateName = await manager.importTemplate(pathOrUrl, alias);

        return `Template ${templateName} successfully imported`;
    },

    async export(args) {
        const [templateName, path] = args;
        if (!templateName) throw new Error('Template name is required');
        if (!path) throw new Error('Output path is required');

        const manager = TemplateManager();

        const _path = locate(
            path.endsWith('.zip') ? path : `${path}/${templateName}.zip`,
            true
        );

        await manager.exportTemplate(templateName, _path);

        return `Template ${templateName} successfully exported to ${_path}`;
    }
};

export default commands;

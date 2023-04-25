import { Commands } from '@giancarl021/cli-core/interfaces';
import TemplateManager from '../services/TemplateManager';
import open from '../util/open';
import constants from '../util/constants';

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

        return `Template ${templateName} successful deleted`;
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
    }
};

export default commands;

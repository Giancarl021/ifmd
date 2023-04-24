import { Commands } from '@giancarl021/cli-core/interfaces';
import TemplateManager from '../services/TemplateManager';

const commands: Commands = {
    async list() {
        const templates = TemplateManager();
        const templatesData = await templates.getAllTemplates();

        const verbose = this.helpers.hasFlag('v', 'verbose');

        return templatesData
            .map(t => `* ${t.name} [${t.type.toUpperCase()}]`)
            .join('\n');
    },

    create() {
        return '';
    },

    remove() {
        return '';
    },

    show() {
        return '';
    }
};

export default commands;

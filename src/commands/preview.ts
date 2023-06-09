import { Command } from '@giancarl021/cli-core/interfaces';
import locate from '@giancarl021/locate';
import chokidar from 'chokidar';
import { existsSync as exists } from 'fs';
import { readFile } from 'fs/promises';
import ParseMarkdown from '../services/ParseMarkdown';
import TemplateEngine from '../services/TemplateEngine';
import Previewer from '../services/Previewer';
import constants from '../util/constants';
import TemplateManager from '../services/TemplateManager';

const command: Command = async function (args) {
    const [file] = args;

    if (!file) throw new Error('No file specified');

    const path = locate(file, true);

    const port =
        Number(
            this.helpers.valueOrDefault(
                this.helpers.getFlag('p', 'port'),
                String(constants.webServer.defaultPort)
            )
        ) || constants.webServer.defaultPort;

    if (!exists(path)) throw new Error(`File ${file} not found`);

    const template: string = this.helpers.valueOrDefault(
        this.helpers.getFlag('t', 'template'),
        constants.templates.defaultTemplateName
    );

    const templateManager = TemplateManager();

    const templateData = await templateManager.getTemplate(template);

    const parser = ParseMarkdown();
    const engine = TemplateEngine();
    const previewer = Previewer(templateData, port);

    const props: Record<string, string> =
        this.extensions.vault.getData(constants.data.propsKey) || {};
    const date: string = this.helpers.valueOrDefault(
        this.helpers.getFlag('date', 'd'),
        new Date().toLocaleDateString()
    );

    const watcher = chokidar.watch(path, {
        awaitWriteFinish: true
    });

    watcher.on('change', async () => {
        console.log('Changes detected, reloading preview...');

        const html = await generateHtml();

        await previewer.update(html);
    });

    const initialHtml = await generateHtml();

    await previewer.preview(initialHtml);

    async function generateHtml() {
        const rawContent = await readFile(path, 'utf8');

        const { title, content } = parser.convert(rawContent);

        const html = await engine.generateForPreview(
            templateData,
            {
                ...props,
                title,
                date,
                content
            },
            port
        );

        return html;
    }

    await watcher.close();

    return 'Preview ended';
};

export default command;

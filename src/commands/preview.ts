import { Command } from '@giancarl021/cli-core/interfaces';
import locate from '@giancarl021/locate';
import chokidar from 'chokidar';
import { existsSync as exists } from 'fs';
import { readFile } from 'fs/promises';
import ParseMarkdown from '../services/ParseMarkdown';
import TemplateEngine from '../services/TemplateEngine';
import Previewer from '../services/Previewer';
import constants from '../util/constants';
import getProps from '../util/getProps';
import TemplateManager from '../services/TemplateManager';

const command: Command = async function (args, flags) {
    const [file] = args;

    if (!file) throw new Error('No file specified');

    const path = locate(file, true);

    const port =
        Number(
            this.helpers.valueOrDefault(
                this.helpers.getFlag('web-server-port'),
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

    const props: Record<string, string> = getProps(this, flags);
    const date: string = this.helpers.valueOrDefault(
        this.helpers.getFlag('date', 'd'),
        new Date().toLocaleDateString()
    );

    const watcher = chokidar.watch(path, {
        awaitWriteFinish: true
    });

    watcher.on('change', async () => {
        console.log('Changes detected, reloading preview...');

        const data = await generateData();

        await previewer.update(data.html, data.localAssets);
    });

    const initialData = await generateData();

    await previewer.preview(initialData.html, initialData.localAssets);

    async function generateData() {
        const rawContent = await readFile(path, 'utf8');

        const { title, content, localAssets } = parser.convert(
            rawContent,
            path
        );

        const html = await engine.generateForPreview(
            templateData,
            {
                ...props,
                title,
                date,
                content
            },
            localAssets,
            port
        );

        return { html, localAssets };
    }

    await watcher.close();

    return 'Preview ended';
};

export default command;

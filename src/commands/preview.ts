import { Command } from '@giancarl021/cli-core/interfaces';
import locate from '@giancarl021/locate';
import { existsSync as exists } from 'fs';
import { readFile } from 'fs/promises';
import ParseMarkdown from '../services/ParseMarkdown';
import TemplateEngine from '../services/TemplateEngine';
import Previewer from '../services/Previewer';
import constants from '../util/constants';

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

    const parser = ParseMarkdown();
    const engine = TemplateEngine();
    const previewer = Previewer(port);

    const rawContent = await readFile(path, 'utf8');

    const props: Record<string, string> =
        this.extensions.vault.getData(constants.data.propsKey) || {};
    const date: string = this.helpers.valueOrDefault(
        this.helpers.getFlag('date', 'd'),
        new Date().toLocaleDateString()
    );

    const { title, content } = parser.convert(rawContent);

    const html = engine.generate({
        ...props,
        title,
        date,
        content
    });

    await previewer.preview(html);

    return 'Preview ended';
};

export default command;

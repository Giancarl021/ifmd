import { Command } from '@giancarl021/cli-core/interfaces';
import locate from '@giancarl021/locate';
import { existsSync as exists } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import ParseMarkdown from '../services/ParseMarkdown';
import PdfGenerator from '../services/PdfGenerator';
import TemplateEngine from '../services/TemplateEngine';
import constants from '../util/constants';
import TemplateManager from '../services/TemplateManager';
import getProps from '../util/getProps';

const command: Command = async function (args, flags) {
    const [file] = args;

    if (!file) throw new Error('No file specified');

    const path = locate(file, true);

    if (!exists(path)) throw new Error(`File ${file} not found`);

    const globalMargin = this.helpers.valueOrDefault(
        this.helpers.getFlag('m', 'margin'),
        constants.pdf.margins.globalDefault
    );

    const margins = {
        top: this.helpers.valueOrDefault(
            this.helpers.getFlag('mt', 'margin-top'),
            globalMargin
        ),
        bottom: this.helpers.valueOrDefault(
            this.helpers.getFlag('mb', 'margin-bottom'),
            globalMargin
        ),
        left: this.helpers.valueOrDefault(
            this.helpers.getFlag('ml', 'margin-left'),
            globalMargin
        ),
        right: this.helpers.valueOrDefault(
            this.helpers.getFlag('mr', 'margin-right'),
            globalMargin
        )
    };

    const template: string = this.helpers.valueOrDefault(
        this.helpers.getFlag('t', 'template'),
        constants.templates.defaultTemplateName
    );

    const defaultPort = await constants.webServer.defaultPort();

    const port =
        Number(
            this.helpers.valueOrDefault(
                this.helpers.getFlag('web-server-port'),
                String(defaultPort)
            )
        ) || defaultPort;

    const templateManager = TemplateManager();

    const templateData = await templateManager.getTemplate(template);

    const parser = ParseMarkdown();
    const engine = TemplateEngine();
    const generator = PdfGenerator(templateData.path, port, margins);

    const rawContent = await readFile(path, 'utf8');

    const props: Record<string, string> = getProps(this, flags);
    const date: string = this.helpers.valueOrDefault(
        this.helpers.getFlag('date', 'd'),
        new Date().toLocaleDateString()
    );

    const { title, content, localAssets } = parser.convert(rawContent, path);

    const html = await engine.generate(
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

    const pdf = await generator.generate(html, localAssets);

    const outPath = locate(
        this.helpers.valueOrDefault(
            this.helpers.getFlag('o', 'out', 'output'),
            path.replace(/(\.md)?$/, '.pdf')
        ),
        true
    );

    await writeFile(outPath, pdf);

    return `File generated at ${outPath}`;
};

export default command;

import { Command } from '@giancarl021/cli-core/interfaces';
import locate from '@giancarl021/locate';
import { existsSync as exists } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import ParseMarkdown from '../services/ParseMarkdown';
import PdfGenerator from '../services/PdfGenerator';
import TemplateEngine from '../services/TemplateEngine';
import constants from '../util/constants';

const command: Command = async function (args) {
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

    const parser = ParseMarkdown();
    const engine = TemplateEngine();
    const generator = PdfGenerator(margins);

    const rawContent = await readFile(path, 'utf8');

    const name = this.extensions.vault.getData('name') || 'Desconhecido';
    const date = this.helpers.valueOrDefault(
        this.helpers.getFlag('date', 'd'),
        new Date().toLocaleDateString()
    );

    const { title, content } = parser.convert(rawContent);

    const html = engine.generate({
        title,
        name,
        date,
        content
    });

    const pdf = await generator.generate(html);

    const outPath = path.replace(/(\.md)?$/, '.pdf');

    await writeFile(outPath, pdf);

    return `File generated at ${outPath}`;
};

export default command;

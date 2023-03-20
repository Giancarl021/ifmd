import { Command } from '@giancarl021/cli-core/interfaces';
import locate from '@giancarl021/locate';
import { existsSync as exists } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import ParseMarkdown from '../services/ParseMarkdown';
import PdfGenerator from '../services/PdfGenerator';
import TemplateEngine from '../services/TemplateEngine';

const command: Command = async function (args) {
    const [file] = args;

    if (!file) throw new Error('No file specified');

    const path = locate(file, true);

    if (!exists(path)) throw new Error(`File ${file} not found`);

    const parser = ParseMarkdown();
    const engine = TemplateEngine();
    const generator = PdfGenerator();

    const title: string = this.helpers.valueOrDefault(
        this.helpers.getFlag('t', 'title'),
        'Trabalho'
    );

    const rawContent = await readFile(path, 'utf8');

    const content = parser.convert(rawContent);

    const html = engine.generate({
        title,
        content
    });

    const pdf = await generator.generate(html);

    const outPath = path.replace(/(\.md)?$/, '.pdf');

    await writeFile(outPath, pdf);

    return `File generated at ${outPath}`;
};

export default command;

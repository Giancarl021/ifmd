import { Command } from '@giancarl021/cli-core/interfaces';
import constants from '../util/constants';
import locate from '@giancarl021/locate';
import ignore, { Ignore } from 'ignore';
import { basename, relative } from 'path';
import { readFile, lstat, writeFile } from 'fs/promises';
import { existsSync as exists } from 'fs';
import recursiveReadDir from '../util/recursiveReadDir';
import CompilationData from '../interfaces/CompilationData';
import Nullable from '../interfaces/Nullable';
import PdfGenerator from '../services/PdfGenerator';
import TemplateManager from '../services/TemplateManager';
import ParseMultiMarkdown from '../services/ParseMultiMarkdown';
import TemplateEngine from '../services/TemplateEngine';

const command: Command = async function (args) {
    const [directory] = args;

    if (!directory) throw new Error('Directory is required');

    const path = locate(directory);

    if (!exists(path) || !(await lstat(path)).isDirectory())
        throw new Error(`${directory} is not a directory`);

    const generateManifest = this.helpers.hasFlag('g', 'generate-manifest');
    const ignoreFilePath: Nullable<string> = this.helpers.valueOrDefault(
        this.helpers.getFlag('i', 'ignore-file'),
        null
    );

    const manifestPath = locate(`${path}/manifest.json`);
    const manifestExists = exists(manifestPath);

    const port =
        Number(
            this.helpers.valueOrDefault(
                this.helpers.getFlag('p', 'port'),
                String(constants.webServer.defaultPort)
            )
        ) || constants.webServer.defaultPort;

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

    const props: Record<string, string> =
        this.extensions.vault.getData(constants.data.propsKey) || {};
    const date: string = this.helpers.valueOrDefault(
        this.helpers.getFlag('date', 'd'),
        new Date().toLocaleDateString()
    );

    const template: string = this.helpers.valueOrDefault(
        this.helpers.getFlag('t', 'template'),
        constants.templates.defaultTemplateName
    );

    const outPath = locate(
        this.helpers.valueOrDefault(
            this.helpers.getFlag('o', 'out', 'output'),
            `${path}/${basename(path)}.pdf`
        ),
        true
    );

    const templateManager = TemplateManager();

    const templateData = await templateManager.getTemplate(template);

    const parser = ParseMultiMarkdown();
    const engine = TemplateEngine();
    const generator = PdfGenerator(templateData.path, margins, port);

    if (generateManifest) {
        const _ignoreFilePath = ignoreFilePath ? locate(ignoreFilePath) : null;

        if (
            ignoreFilePath &&
            (!exists(_ignoreFilePath!) ||
                !(await lstat(_ignoreFilePath!)).isFile())
        )
            throw new Error(`Ignore file does not exist at ${_ignoreFilePath}`);

        let ig: Ignore | null = null;

        if (ignoreFilePath) {
            ig = ignore();
            ig.add(await readFile(_ignoreFilePath!, 'utf-8'));
        }

        const files = await recursiveReadDir(path, filePath => {
            if (!filePath.endsWith('.md')) return false;

            if (ig) return !ig.ignores(relative(path, filePath));

            return true;
        });

        if (manifestExists) {
        }

        const manifest: CompilationData = manifestExists
            ? {
                  ...JSON.parse(await readFile(manifestPath, 'utf-8')),
                  files
              }
            : constants.compilation.getDefaultManifest(path, files);

        await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

        return `Manifest ${
            manifestExists ? 'updated' : 'generated'
        } at ${manifestPath}`;
    }

    if (ignoreFilePath) {
        console.log(
            'WARNING: Ignoring files can only be applied on a manifest generation'
        );
    }

    if (!manifestExists)
        throw new Error(
            `Manifest does not exist at ${path}.\nRun with this command with the \`--generate-manifest\` flag to generate one`
        );

    const manifestData = JSON.parse(await readFile(manifestPath, 'utf-8'));

    const manifest: CompilationData = {
        ...manifestData,
        createdAt: new Date(manifestData.createdAt)
    };

    const { title, content } = await parser.compile(manifest);

    const html = await engine.generate(
        templateData,
        {
            ...props,
            title,
            date,
            content
        },
        port
    );

    const pdf = await generator.generate(html);

    await writeFile(outPath, pdf);

    return `Files compiled at ${outPath}`;
};

export default command;

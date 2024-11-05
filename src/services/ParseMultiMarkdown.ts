import ParseMarkdown from './ParseMarkdown';
import CompilationData from '../interfaces/CompilationData';
import { readFile } from 'fs/promises';
import locate from '@giancarl021/locate';

export default function ParseMultiMarkdown() {
    const parser = ParseMarkdown();

    async function compile(manifest: CompilationData, pathOfOrigin: string) {
        const parsedFiles = await Promise.all(
            manifest.files.map(async filePath => {
                const markdown = await readFile(filePath, 'utf-8');

                return {
                    ...parser.convertWithMetadata(
                        markdown,
                        locate(`${pathOfOrigin}/${filePath}`)
                    ),
                    filePath
                };
            })
        );

        let content = parsedFiles.reduce(
            (acc, current, index) =>
                acc +
                (index > 0 ? '<div class="page-break"></div>' : '') +
                `<div class="file-content">${current.content}</div>`,
            ''
        );

        if (manifest.generateIndex) {
            const index =
                '<ul id="__compilation_index__">' +
                parsedFiles.reduce(
                    (acc, current) =>
                        `${acc}<li><a href="#${current.titleId}">${current.title}</a></li>`,
                    ''
                ) +
                '</ul><div class="page-break"></div>';

            content = index + content;
        }

        return {
            content: `<h1>${manifest.title}</h1>${
                manifest.description ? `<p>${manifest.description}</p>` : ''
            }${content}`,
            title: manifest.title,
            localAssets: parsedFiles.flatMap(file => file.localAssets)
        };
    }

    return {
        compile
    };
}

import ParseMarkdown from './ParseMarkdown';
import CompilationData from '../interfaces/CompilationData';
import { readFile } from 'fs/promises';

export default function ParseMultiMarkdown() {
    const parser = ParseMarkdown();

    async function compile(manifest: CompilationData) {
        const parsedFiles = await Promise.all(
            manifest.files.map(async filePath => {
                const markdown = await readFile(filePath, 'utf-8');

                return {
                    ...parser.convertWithMetadata(markdown, filePath),
                    filePath
                };
            })
        );

        let content = parsedFiles.reduce(
            (acc, current) => `
                ${acc}
                <div class="page-break"></div>
                <div class="file-content">
                    ${current.content}
                </div>
            `,
            ''
        );

        if (manifest.generateIndex) {
            const index =
                '<ul id="__compilation_index__">' +
                parsedFiles.reduce(
                    (acc, current) =>
                        `${acc}<li>${
                            current.titleId
                                ? `<a href="#${current.titleId}">${current.title}</a>`
                                : current.title
                        }</li>`,
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

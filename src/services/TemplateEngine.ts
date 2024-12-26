import { CheerioAPI, load } from 'cheerio';
import { readFile } from 'fs/promises';
import locate from '@giancarl021/locate';
import TemplateData from '../interfaces/TemplateData';
import parseDate from '../util/parseDate';
import LocalAsset from '../interfaces/LocalAsset';

export type Variables = Record<string, string> & {
    content: string;
    title: string;
};

const operandRegex = /\(.*?\)/;

const socketScript = `
<script>
    const socket = io();

    socket.on('reconnect', reload);
    socket.on('reload', reload);

    function reload() {
        console.log('Reloading...');
        location.reload();
    }
</script>
`;

export default function TemplateEngine() {
    async function _generate(
        template: TemplateData,
        localAssets: LocalAsset[],
        variables: Variables,
        serverPort: number,
        isPreview: boolean
    ) {
        const baseHtml = await readFile(
            locate(`${template.path}/index.html`),
            'utf8'
        );

        const html = replaceVariables(baseHtml, variables);

        const $ = replaceAssets(html, localAssets, serverPort);

        $('head').append(
            `<script type="module" src="http://localhost:${serverPort}/__injected_libs__/mermaid/dist/mermaid.esm.min.mjs"></script>`
        );

        $('code.language-mermaid').each(function () {
            const $el = $(this);

            const content = $el.text();

            const $parent = $el.parent();

            $el.remove('code');

            $parent.addClass('mermaid');
            $parent.text(content);
        });

        if (isPreview) {
            $('head')
                .append(
                    `<script src="http://localhost:${serverPort}/socket.io/socket.io.js"></script>`
                )
                .append(socketScript);
        }

        return $.html();
    }

    async function generate(
        template: TemplateData,
        variables: Variables,
        localAssets: LocalAsset[],
        serverPort: number
    ) {
        return await _generate(
            template,
            localAssets,
            variables,
            serverPort,
            false
        );
    }

    async function generateForPreview(
        template: TemplateData,
        variables: Variables,
        localAssets: LocalAsset[],
        previewPort: number
    ) {
        return await _generate(
            template,
            localAssets,
            variables,
            previewPort,
            true
        );
    }

    function replaceAssets(
        html: string,
        localAssets: LocalAsset[],
        serverPort: number
    ): CheerioAPI {
        if (!localAssets.length) return load(html);

        let parsedHtml = html;

        for (const asset of localAssets) {
            parsedHtml = parsedHtml.replaceAll(
                asset.originalPath,
                `http://localhost:${serverPort}/__dynamic_assets__/${asset.reference}`
            );
        }

        return load(parsedHtml);
    }

    function replaceVariables(
        content: string,
        variables: Variables,
        level = 0
    ) {
        if (level === 0) {
            variables.content = applySetters(variables.content, variables);
            content = applySetters(content, variables);
        }

        const data = content.replace(
            /@@[\\a-zA-Z-_]+[0-9]*(\(.*?\))?/g,
            match => {
                const key = match.slice(2).replace(operandRegex, '');

                if (key.startsWith('\\')) return match.replace(/@@\\/, '@@');

                const operand = (match.match(operandRegex)?.[0] ?? '').replace(
                    /^\(|\)$/g,
                    ''
                );
                const value = variables[key] ?? '';

                if (!variables.hasOwnProperty(key)) return match;

                let result: string;

                switch (key) {
                    case 'content':
                        if (level > 0) return match;

                        result = replaceVariables(
                            variables.content,
                            variables,
                            level + 1
                        );
                        break;
                    case 'date':
                        result = parseDate(value, operand);
                        break;

                    default:
                        result = value;
                        break;
                }

                return result;
            }
        );

        return data;
    }

    function applySetters(data: string, attributes: Variables): string {
        const _data = data.replace(/@@set\([a-zA-Z-_]+[0-9]*,.*?\)/g, match => {
            const [key, ...values] = match
                .slice(6, -1)
                .split(',')
                .map(str => str.trim());

            const value = values.join(',');

            if (Object.keys(attributes).includes(key)) return '';

            attributes[key] = value;
            return '';
        });

        return _data;
    }

    return { generate, generateForPreview };
}

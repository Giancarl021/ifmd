import { CheerioAPI, load } from 'cheerio';
import constants from '../util/constants';
import { readFile } from 'fs/promises';
import locate from '@giancarl021/locate';
import TemplateData from '../interfaces/TemplateData';
import parseDate from '../util/parseDate';
import LocalAsset from '../interfaces/LocalAsset';

type Variables = Record<string, string> & {
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
        isPreview: boolean = false
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
        previewPort: number = constants.webServer.defaultPort
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

        const isSingleFile = localAssets
            .slice(1)
            .every(asset => asset.owner === localAssets[0].owner);

        if (isSingleFile) {
            let parsedHtml = html;

            for (const asset of localAssets) {
                parsedHtml = parsedHtml.replaceAll(
                    asset.originalPath,
                    `http://localhost:${serverPort}/__dynamic_assets__/${asset.reference}`
                );
            }

            return load(parsedHtml);
        }

        const $ = load(html);

        return $;
    }

    function replaceVariables(
        content: string,
        variables: Variables,
        level = 0
    ) {
        if (level === 0) {
            let changedData: string[];
            [variables.content, changedData] = applySetters(
                variables.content,
                variables
            );
            [content] = applySetters(content, variables, changedData);
        } else if (level > 1) return content;

        const data = content.replace(
            /@@[a-zA-Z-_]+[0-9]*(\(.*?\))?/g,
            match => {
                const key = match.slice(2).replace(operandRegex, '');

                const operand = (match.match(operandRegex)?.[0] ?? '').replace(
                    /^\(|\)$/g,
                    ''
                );
                const value = variables[key] ?? '';

                if (!variables.hasOwnProperty(key)) return match;

                let result: string;

                switch (key) {
                    case 'content':
                        result = replaceVariables(
                            variables.content ?? '',
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

    function applySetters(
        data: string,
        attributes: Variables,
        ignore: string[] = []
    ): [string, string[]] {
        const changedVariables: string[] = [];
        const _data = data.replace(/@@set\([a-zA-Z-_]+[0-9]*,.*?\)/g, match => {
            const [key, value] = match
                .slice(6, -1)
                .split(',')
                .map(str => str.trim());

            if (['content', ...ignore].includes(key)) return '';

            attributes[key] = value;
            changedVariables.push(key);
            return '';
        });

        return [_data, changedVariables];
    }

    return { generate, generateForPreview };
}

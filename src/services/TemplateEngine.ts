import { load } from 'cheerio';
import constants from '../util/constants';
import { readFile } from 'fs/promises';
import locate from '@giancarl021/locate';
import TemplateData from '../interfaces/TemplateData';
import parseDate from '../util/parseDate';

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
    
    function done() {
        console.log('Communicating Print-ready state...')
        socket.emit('done');
    }

    window.Engine = {
        done,
        reload
    };
</script>
`;

export default function () {
    async function _generate(
        template: TemplateData,
        variables: Variables,
        serverPort: number,
        isPreview: boolean = false
    ) {
        const baseHtml = await readFile(
            locate(`${template.path}/index.html`),
            'utf8'
        );

        const html = replaceVariables(baseHtml, variables);

        const $ = load(html);

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
        serverPort: number
    ) {
        return await _generate(template, variables, serverPort, false);
    }

    async function generateForPreview(
        template: TemplateData,
        variables: Variables,
        previewPort: number = constants.webServer.defaultPort
    ) {
        return await _generate(template, variables, previewPort, true);
    }

    function replaceVariables(
        content: string,
        variables: Variables,
        level = 0
    ) {
        if (level > 1) return content;

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

    return { generate, generateForPreview };
}

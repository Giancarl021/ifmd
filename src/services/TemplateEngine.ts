import { load } from 'cheerio';
import constants from '../util/constants';
import TemplateManager from './TemplateManager';
import { readFile } from 'fs/promises';
import locate from '@giancarl021/locate';
import TemplateData from '../interfaces/TemplateData';

type Variables = Record<string, string> & {
    content: string;
    title: string;
};

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

export default function () {
    const templateManager = TemplateManager();

    async function generate(template: TemplateData, variables: Variables) {
        const baseHtml = await readFile(
            locate(`${template.path}/index.html`),
            'utf8'
        );

        const html = replaceVariables(baseHtml, variables);

        return html;
    }

    async function generateForPreview(
        template: TemplateData,
        variables: Variables,
        previewPort: number = constants.webServer.defaultPort
    ) {
        const html = await generate(template, variables);

        const $ = load(html);

        $('head')
            .append(
                `<script src="http://localhost:${previewPort}/socket.io/socket.io.js"></script>`
            )
            .append(socketScript);

        const socketReadyHtml = $.html();

        return socketReadyHtml;
    }

    function replaceVariables(
        content: string,
        variables: Variables,
        level = 0
    ) {
        if (level > 1) return content;

        const data = content.replace(/@@[a-zA-Z-_]+[0-9]*/g, match => {
            const key = match.slice(2);

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

                default:
                    result = variables[key] ?? '';
                    break;
            }

            return result;
        });

        return data;
    }

    return { generate, generateForPreview };
}

import locate from '@giancarl021/locate';
import { readFileSync } from 'fs';
import { load } from 'cheerio';
import constants from '../util/constants';

const baseHtml = readFileSync(locate('src/templates/index.html'), 'utf8');

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
    function generate(variables: Variables) {
        const html = replaceVariables(baseHtml, variables);

        return html;
    }

    function generateForPreview(
        variables: Variables,
        previewPort: number = constants.webServer.defaultPort
    ) {
        const html = generate(variables);

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

import locate from '@giancarl021/locate';
import { readFileSync } from 'fs';

const baseHtml = readFileSync(locate('src/templates/index.html'), 'utf8');

type Variables = Record<string, string> & {
    content: string;
    title: string;
};

export default function () {
    function generate(variables: Variables) {
        const html = baseHtml.replace(/@@[a-zA-Z-_]+[0-9]*/g, match => {
            const key = match.slice(2);

            if (!variables.hasOwnProperty(key)) return match;

            return variables[key] ?? '';
        });

        return html;
    }

    return { generate };
}

import { load } from 'cheerio';
import ModuleInjector from './ModuleInjector';
import { readFile } from 'fs/promises';
import locate from '@giancarl021/locate';
import TemplateData from '../interfaces/TemplateData';
import TemplateFeature from '../interfaces/TemplateFeature';
import parseDate from '../util/parseDate';

type Variables = Record<string, string> & {
    content: string;
    title: string;
};

const macroRegex = /\\?@@[A-Z0-9-_]+[0-9]*(\(.*?\))?/gi;
const operandRegex = /\(.*?\)/;

export default function TemplateEngine() {
    function _replaceVariables(
        content: string,
        variables: Variables,
        level = 0
    ) {
        if (level > 1) return content;

        const data = content.replace(macroRegex, match => {
            if (match.startsWith('\\')) {
                return match.slice(1);
            }

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
                    result = _replaceVariables(
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
        });

        return data;
    }

    async function generate(
        template: TemplateData,
        variables: Variables,
        serverPort: number,
        features: TemplateFeature[]
    ) {
        const baseHtml = await readFile(
            locate(`${template.path}/index.html`),
            'utf8'
        );

        const html = _replaceVariables(baseHtml, variables);

        const $ = load(html);

        const injector = ModuleInjector({ serverPort, $ });

        injector.injectModules(features);

        return $.html();
    }
    return { generate };
}

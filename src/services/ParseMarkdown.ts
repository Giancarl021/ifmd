import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { load } from 'cheerio';
import markedKatex from 'marked-katex-extension';
import constants from '../util/constants';

const window = new JSDOM('').window as unknown as Window;
const purify = DOMPurify(window);

marked.use(markedKatex());

export default function () {
    function parse(markdown: string) {
        const html = marked(markdown);

        const sanitized = purify.sanitize(html);

        return sanitized;
    }

    function convert(markdown: string) {
        const html = parse(markdown);

        const $ = load(html);

        const $h1 = $('h1:first-child');

        const title = $h1.text() || constants.pdf.defaultTitle;

        $h1.remove();

        return {
            title,
            content: $.html()
        };
    }

    function convertWithMetadata(markdown: string, index: number = 0) {
        const html = parse(markdown);

        const $ = load(html);

        const $h1 = $('h1:first-child');

        const title = $h1.text() || `${constants.pdf.defaultTitle} ${++index}`;

        const titleId = $h1.attr('id') || null;

        return {
            title,
            titleId,
            content: $.html()
        };
    }

    return {
        convert,
        convertWithMetadata
    };
}

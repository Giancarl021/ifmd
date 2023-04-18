import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { load } from 'cheerio';
import constants from '../util/constants';

const window = new JSDOM('').window as unknown as Window;
const purify = DOMPurify(window);

export default function () {
    function convert(markdown: string) {
        const html = marked(markdown);

        const sanitized = purify.sanitize(html);

        const $ = load(sanitized);

        const title = $('h1:first-child').text() || constants.pdf.defaultTitle;

        $('h1:first-child').remove();

        return {
            title,
            content: $.html()
        };
    }

    return {
        convert
    };
}

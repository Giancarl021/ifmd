import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window as unknown as Window;
const purify = DOMPurify(window);

export default function () {
    function convert(markdown: string) {
        const html = marked(markdown);

        return purify.sanitize(html);
    }

    return {
        convert
    };
}

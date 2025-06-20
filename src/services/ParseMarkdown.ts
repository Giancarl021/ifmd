import { marked } from 'marked';
import DOMPurify, { type WindowLike } from 'dompurify';
import { JSDOM } from 'jsdom';
import { CheerioAPI, load } from 'cheerio';
import markedKatex, { type MarkedKatexOptions } from 'marked-katex-extension';
import { basename } from 'path';
import constants from '../util/constants';
import parseAsset from '../util/parseAsset';

const window = new JSDOM('').window as unknown as WindowLike;
const purify = DOMPurify(window);

marked.use(
    markedKatex({
        throwOnError: false,
        output: 'mathml'
    } as MarkedKatexOptions)
);

export default function ParseMarkdown() {
    function parse(markdown: string) {
        const html = String(marked(markdown));

        const sanitized = purify.sanitize(html);

        return sanitized;
    }

    function getLocalAssets($: CheerioAPI, pathOfOrigin: string) {
        const localAssets = $('[src], [href]')
            .map((_, element) => {
                const $element = $(element);
                const asset = $element.attr('src') ?? $element.attr('href');

                const localAsset = parseAsset(asset, pathOfOrigin);

                return localAsset;
            })
            .toArray()
            .filter(Boolean);

        return localAssets;
    }

    function convert(markdown: string, pathOfOrigin: string) {
        const html = parse(markdown);

        const $ = load(html);

        const $h1 = $('h1:first-child');

        const title = $h1.text() || constants.pdf.defaultTitle;

        $h1.remove();

        return {
            title,
            content: $('body').html()!,
            localAssets: getLocalAssets($, pathOfOrigin)
        };
    }

    function convertWithMetadata(markdown: string, pathOfOrigin: string) {
        const html = parse(markdown);

        const $ = load(html);

        const $h1 = $('h1:first-child').length
            ? $('h1:first-child')
            : $(`<h1>${basename(pathOfOrigin)}</h1>`).prependTo('body');

        const title = $h1.text();

        const titleId = $h1.attr('id') || Buffer.from(title).toString('hex');

        $h1.attr('id', titleId);

        return {
            title,
            titleId,
            content: $('body').html(),
            localAssets: getLocalAssets($, pathOfOrigin)
        };
    }

    return {
        convert,
        convertWithMetadata
    };
}

import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { CheerioAPI, load } from 'cheerio';
import markedKatex from 'marked-katex-extension';
import { basename, dirname } from 'path';
import locate from '@giancarl021/locate';
import constants from '../util/constants';
import LocalAsset from '../interfaces/LocalAsset';
import hash from '../util/hash';

const window = new JSDOM('').window as unknown as Window;
const purify = DOMPurify(window);

marked.use(
    markedKatex({
        throwOnError: false,
        output: 'mathml'
    })
);

export default function ParseMarkdown() {
    function parse(markdown: string) {
        const html = String(marked(markdown));

        const sanitized = purify.sanitize(html);

        return sanitized;
    }

    function getLocalAssets($: CheerioAPI, pathOfOrigin: string) {
        const localAssets = $('[src], [href]')
            .map((index, element) => {
                const $element = $(element);
                const asset = String(
                    $element.attr('src') ?? $element.attr('href')
                );

                if (!asset || asset.startsWith('http') || asset.startsWith('#'))
                    return null;

                const localAsset: LocalAsset = {
                    originalPath: asset,
                    path: locate(`${dirname(pathOfOrigin)}/${asset}`),
                    reference: hash(`${pathOfOrigin}::${index}`),
                    owner: pathOfOrigin
                };

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
            content: $('body').html(),
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

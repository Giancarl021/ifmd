import puppeteer, { PDFMargin } from 'puppeteer';
import TempManager from './TempManager';
import constants from '../util/constants';

export default function (margins: PDFMargin = constants.pdf.margins.default) {
    const temp = TempManager();

    async function getPdf(indexPath: string) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(`file://${indexPath}`);

        const pdf = await page.pdf({
            format: 'A4',
            margin: margins,
            displayHeaderFooter: false
        });

        await page.close();
        await browser.close();

        return pdf;
    }

    async function generate(html: string) {
        await temp.create();
        await temp.fill(html);

        const indexPath = temp.getFilePath('index.html');

        const pdf = await getPdf(indexPath);

        await temp.remove();

        return pdf;
    }

    return {
        generate
    };
}

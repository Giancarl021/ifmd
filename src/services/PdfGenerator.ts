import puppeteer, { type PDFMargin } from 'puppeteer';
import TempManager from './TempManager';
import WebServer from './WebServer';
import constants from '../util/constants';

import type LocalAsset from '../interfaces/LocalAsset';

export default function PdfGenerator(
    templatePath: string,
    serverPort: number,
    margins: PDFMargin
) {
    const temp = TempManager();
    const webServer = WebServer(serverPort, temp.getRootPath(), false);

    async function getPdf(indexPath: string): Promise<Buffer> {
        const browser = await puppeteer.launch({
            headless: true,
            args: constants.containerMode
                ? ['--no-sandbox', '--disable-setuid-sandbox']
                : []
        });

        const page = await browser.newPage();

        await page.goto(indexPath);

        const mermaidElements = await page.$$('pre.mermaid');

        if (mermaidElements.length) {
            await page.waitForSelector('pre.mermaid[data-processed="true"]', {
                visible: true
            });
        }

        const pdf = await page.pdf({
            format: 'A4',
            margin: margins,
            displayHeaderFooter: false,
            printBackground: true,
            preferCSSPageSize: true
        });

        await page.close();
        await browser.close();

        return Buffer.from(pdf);
    }

    async function generate(html: string, localAssets: LocalAsset[]) {
        let pdf: Buffer;
        try {
            await temp.create();
            await temp.fill(html, templatePath);

            await webServer.start(localAssets);

            const indexPath = `http://localhost:${serverPort}/index.html`;

            pdf = await getPdf(indexPath);
        } finally {
            await webServer.close();
            await temp.remove();
        }

        return pdf;
    }

    return {
        generate
    };
}

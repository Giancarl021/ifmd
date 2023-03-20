import { existsSync as exists } from 'fs';
import puppeteer from 'puppeteer';
import locate from '@giancarl021/locate';
import { mkdir, rm, writeFile } from 'fs/promises';
import copyFiles from 'recursive-copy';

const srcPath = locate('src/templates/assets');
const tmpPath = locate('tmp');

export default function () {
    async function createTemp() {
        if (!exists(tmpPath)) {
            await mkdir(tmpPath, { recursive: true });
        }
    }

    async function deleteTemp() {
        if (exists(tmpPath)) {
            await rm(tmpPath, { recursive: true, force: true });
        }
    }

    async function fillTemp(indexContent: string) {
        await new Promise((resolve, reject) => {
            copyFiles(srcPath, tmpPath, err => {
                if (err) return reject(err);

                resolve(null);
            });
        });

        await writeFile(`${tmpPath}/index.html`, indexContent);
    }

    async function getPdf() {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(`file://${tmpPath}/index.html`);

        const pdf = await page.pdf({
            format: 'A4',
            displayHeaderFooter: false
        });

        await page.close();
        await browser.close();

        return pdf;
    }

    async function generate(html: string) {
        await createTemp();
        await fillTemp(html);

        const pdf = await getPdf();

        await deleteTemp();

        return pdf;
    }

    return {
        generate
    };
}

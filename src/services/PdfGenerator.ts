import { existsSync as exists } from 'fs';
import puppeteer from 'puppeteer';
import locate from '@giancarl021/locate';
import { mkdir, rm } from 'fs/promises';
import copyFiles from 'copyfiles';

const srcPath = locate('src/templates');
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

    async function fillTemp() {
        await new Promise((resolve, reject) => {
            copyFiles([srcPath, tmpPath], err => {
                if (err) return reject(err);

                resolve(null);
            });
        });
    }

    async function getPdf() {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(`file://${tmpPath}/index.html`);

        const pdf = await page.pdf({
            format: 'A4',
            displayHeaderFooter: false
        });

        return pdf;
    }

    async function generate() {
        await createTemp();
        await fillTemp();

        const pdf = await getPdf();

        return pdf;
    }

    return {
        generate
    };
}

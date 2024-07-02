import TempManager from './TempManager';
import constants from '../util/constants';
import WebServer from './WebServer';
import type TemplateData from '../interfaces/TemplateData';
import TemplateEngine from './TemplateEngine';
import ParseMarkdown from './ParseMarkdown';
import { readFileSync } from 'fs';

export default function TemplatePreviewer(
    template: TemplateData,
    baseFilePath: string,
    port: number = constants.webServer.defaultPort,
    extraProps: Record<string, string> = {}
) {
    const parser = ParseMarkdown();
    const engine = TemplateEngine();
    const temp = TempManager();

    const webServer = WebServer(port, temp.getRootPath(), true);

    const baseFile = readFileSync(baseFilePath, 'utf8');

    async function sigIntHandler() {
        console.log('Closing web server...');

        await webServer.close();

        console.log('Removing temporary files...');
        await temp.remove();
    }

    async function getData() {
        const { title, content, localAssets } = parser.convert(
            baseFile,
            baseFilePath
        );
        const html = await engine.generateForPreview(
            template,
            {
                title,
                content: content ?? '',
                ...extraProps
            },
            localAssets,
            port
        );
        return { html, localAssets };
    }

    async function preview() {
        const { html, localAssets } = await getData();
        await temp.create();
        await temp.fill(html, template.path);

        await webServer.start(localAssets);
        console.log(`Preview available on http://localhost:${port}`);

        await new Promise(resolve => {
            process.on('SIGINT', () => {
                sigIntHandler().then(resolve);
            });
        });
    }

    async function update() {
        const data = await getData();
        await temp.clear();
        await temp.fill(data.html, template.path);

        webServer.reloadPage(data.localAssets);
    }

    return {
        preview,
        update
    };
}

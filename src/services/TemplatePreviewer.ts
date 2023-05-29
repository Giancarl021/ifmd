import TempManager from './TempManager';
import constants from '../util/constants';
import WebServer from './WebServer';
import TemplateData from '../interfaces/TemplateData';
import TemplateEngine from './TemplateEngine';
import ParseMarkdown from './ParseMarkdown';
import { readFileSync } from 'fs';

export default function (
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

    async function getHtml() {
        const { title, content } = parser.convert(baseFile);
        const html = await engine.generateForPreview(
            template,
            {
                title,
                content,
                ...extraProps
            },
            port
        );
        return html;
    }

    async function preview() {
        const html = await getHtml();
        await temp.create();
        await temp.fill(html, template.path);

        await webServer.start();
        console.log(`Preview available on http://localhost:${port}`);

        await new Promise(resolve => {
            process.on('SIGINT', () => {
                sigIntHandler().then(resolve);
            });
        });
    }

    async function update() {
        await temp.clear();
        await temp.fill(await getHtml(), template.path);

        webServer.reloadPage();
    }

    return {
        preview,
        update
    };
}

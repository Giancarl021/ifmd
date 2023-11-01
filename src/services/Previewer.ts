import TempManager from './TempManager';
import constants from '../util/constants';
import WebServer from './WebServer';
import TemplateData from '../interfaces/TemplateData';
import LocalAsset from '../interfaces/LocalAsset';

export default function (
    template: TemplateData,
    port: number = constants.webServer.defaultPort
) {
    const temp = TempManager();

    const webServer = WebServer(port, temp.getRootPath(), true);

    async function sigIntHandler() {
        console.log('Closing web server...');

        await webServer.close();

        console.log('Removing temporary files...');
        await temp.remove();
    }

    async function preview(html: string, localAssets: LocalAsset[]) {
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

    async function update(html: string, localAssets: LocalAsset[]) {
        await temp.write('index.html', html);
        webServer.reloadPage(localAssets);
    }

    return {
        preview,
        update
    };
}

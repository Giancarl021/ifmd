import TempManager from './TempManager';
import constants from '../util/constants';
import WebServer from './WebServer';
import TemplateData from '../interfaces/TemplateData';

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

    async function preview(html: string) {
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

    async function update(html: string) {
        await temp.write('index.html', html);
        await webServer.reloadPage();
    }

    return {
        preview,
        update
    };
}

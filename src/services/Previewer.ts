import liveServer from 'live-server';
import TempManager from './TempManager';
import constants from '../util/constants';

export default function (port: number = constants.webServer.defaultPort) {
    const temp = TempManager();

    async function sigIntHandler() {
        console.log('Closing web server...');

        try {
            liveServer.shutdown();
        } catch {}

        console.log('Removing temporary files...');
        await temp.remove();
    }

    async function preview(html: string) {
        await temp.create();
        await temp.fill(html);

        liveServer.start({
            port,
            host: 'localhost',
            open: false,
            root: temp.getRootPath()
        });

        await new Promise(resolve => {
            process.on('SIGINT', () => {
                sigIntHandler().then(resolve);
            });
        });
    }

    return {
        preview
    };
}

import { IncomingMessage, ServerResponse, createServer } from 'http';
import serveHandler from 'serve-handler';
import TempManager from './TempManager';
import constants from '../util/constants';

interface Context {
    server: ReturnType<typeof createServer> | null;
}

export default function (port: number = constants.webServer.defaultPort) {
    const context: Context = {
        server: null
    };

    const temp = TempManager();

    function getServerRequestHandler() {
        const options = {
            public: temp.getRootPath()
        };

        return (
            request: IncomingMessage,
            response: ServerResponse<IncomingMessage>
        ) => serveHandler(request, response, options);
    }

    function serverListeningHandler() {
        console.log(`Preview available at http://localhost:${port}/index.html`);
    }

    async function sigIntHandler() {
        console.log('Closing web server...');

        if (context.server) {
            await new Promise((resolve, reject) => {
                context.server!.close(err => {
                    if (err) return reject(err);
                    resolve(null);
                });
            });

            console.log('Removing temporary files...');
            await temp.remove();
        }

        console.log('Preview ended');
        process.exit(0);
    }

    async function preview(html: string) {
        await temp.create();
        await temp.fill(html);

        context.server = createServer(getServerRequestHandler());

        context.server.listen(port, serverListeningHandler);

        process.on('SIGINT', sigIntHandler);
    }

    return {
        preview
    };
}

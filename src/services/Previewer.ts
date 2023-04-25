import { Server as ServerType, createServer } from 'http';
import { Server } from 'socket.io';
import serveHandler from 'serve-handler';
import TempManager from './TempManager';
import constants from '../util/constants';
import { Socket } from 'net';
import Nullable from '../interfaces/Nullable';
import TemplateData from '../interfaces/TemplateData';

type ServeHandlerOptions = Parameters<typeof serveHandler>[2];
interface Context {
    server: ServerType;
    socketServer: InstanceType<typeof Server>;
    connections: Set<Socket>;
}

export default function (
    template: TemplateData,
    port: number = constants.webServer.defaultPort
) {
    const context: Nullable<Context> = {
        server: null,
        socketServer: null,
        connections: new Set()
    };

    const temp = TempManager();

    async function sigIntHandler() {
        console.log('Closing web server...');

        if (context.server) {
            await new Promise((resolve, reject) => {
                for (const socket of context.connections.values()) {
                    socket.destroy();
                }

                context.server!.close(err => {
                    if (err) return reject(err);
                    return resolve(null);
                });
            });
        }

        console.log('Removing temporary files...');
        await temp.remove();
    }

    async function preview(html: string) {
        await temp.create();
        await temp.fill(html, template.path);

        const serveHandlerOptions: ServeHandlerOptions = {
            public: temp.getRootPath(),
            cleanUrls: true,
            directoryListing: false
        };

        context.server = createServer((req, res) =>
            serveHandler(req, res, serveHandlerOptions)
        );

        context.socketServer = new Server(context.server);

        context.server.listen(port, () =>
            console.log(`Preview available on http://localhost:${port}`)
        );
        context.server.on('connection', socket => {
            context.connections.add(socket);
            socket.on('close', () => context.connections.delete(socket));
        });

        await new Promise(resolve => {
            process.on('SIGINT', () => {
                sigIntHandler().then(resolve);
            });
        });
    }

    async function update(html: string) {
        await temp.write('index.html', html);
        if (context.socketServer) context.socketServer.emit('reload');
    }

    return {
        preview,
        update
    };
}

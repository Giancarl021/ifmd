import { Server as ServerType, createServer } from 'http';
import { Server } from 'socket.io';
import serveHandler from 'serve-handler';
import { Socket } from 'net';
import Nullable from '../interfaces/Nullable';

type ServeHandlerOptions = Parameters<typeof serveHandler>[2];

interface Context {
    server: ServerType;
    socketServer: InstanceType<typeof Server>;
    connections: Set<Socket>;
}

export default function (
    serverPort: number,
    rootPath: string,
    useSockets: boolean
) {
    const context: Nullable<Context> = {
        server: null,
        socketServer: null,
        connections: new Set()
    };

    const serveHandlerOptions: ServeHandlerOptions = {
        public: rootPath,
        cleanUrls: true,
        directoryListing: false
    };

    function reloadPage() {
        if (context.socketServer) context.socketServer.emit('reload');
    }

    async function start() {
        context.server = createServer((req, res) =>
            serveHandler(req, res, serveHandlerOptions)
        );

        if (useSockets) {
            context.socketServer = new Server(context.server);

            context.server.on('connection', socket => {
                context.connections.add(socket);
                socket.on('close', () => context.connections.delete(socket));
            });
        }

        await new Promise(resolve =>
            context.server!.listen(serverPort, () => resolve(null))
        );
    }

    async function close() {
        if (context.server) {
            await new Promise((resolve, reject) => {
                if (useSockets) {
                    for (const socket of context.connections.values()) {
                        socket.destroy();
                    }
                }

                context.server!.close(err => {
                    if (err) return reject(err);
                    return resolve(null);
                });
            });
        }
    }

    return {
        start,
        close,
        reloadPage
    };
}

import { Server as ServerType, createServer } from 'http';
import { Server } from 'socket.io';
import serveHandler from 'serve-handler';
import { Socket } from 'net';
import Nullable from '../interfaces/Nullable';
import LocalAsset from '../interfaces/LocalAsset';
import { createReadStream, existsSync } from 'fs';
import { lookup } from 'mime-types';
import { basename } from 'path';

type ServeHandlerOptions = Parameters<typeof serveHandler>[2];

interface Context {
    server: ServerType;
    socketServer: InstanceType<typeof Server>;
    connections: Set<Socket>;
    assetTable: Record<string, LocalAsset>;
}

export type WebServerInstance = ReturnType<typeof WebServer>;

export default function WebServer(
    serverPort: number,
    rootPath: string,
    useSockets: boolean
) {
    const context: Nullable<Omit<Context, 'assetTable'>> &
        Pick<Context, 'assetTable'> = {
        server: null,
        socketServer: null,
        connections: new Set(),
        assetTable: {}
    };

    const serveHandlerOptions: ServeHandlerOptions = {
        public: rootPath,
        cleanUrls: true,
        directoryListing: false
    };

    function _createAssetTable(localAssets: LocalAsset[]) {
        context.assetTable = localAssets.reduce(
            (table, item) => {
                table[item.reference] = item;
                return table;
            },
            {} as Record<string, LocalAsset>
        );
    }

    function reloadPage(localAssets: LocalAsset[]) {
        _createAssetTable(localAssets);
        if (context.socketServer) context.socketServer.emit('reload');
    }

    async function start(localAssets: LocalAsset[]) {
        _createAssetTable(localAssets);

        context.server = createServer((req, res) => {
            if (req.url) {
                if (req.url.includes('/__dynamic_assets__/')) {
                    const reference = req.url.replace(
                        /^(.*)__dynamic_assets__\//,
                        ''
                    );

                    const asset = context.assetTable[reference];

                    if (asset) {
                        const mime = lookup(
                            basename(asset.path).split('.')[1] ?? ''
                        );

                        if (mime) res.setHeader('Content-Type', mime);

                        if (!existsSync(asset.path)) {
                            res.writeHead(404);
                            res.end();
                            return;
                        }

                        createReadStream(asset.path).pipe(res);
                        return;
                    }
                }
            }

            serveHandler(req, res, serveHandlerOptions);
        });

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

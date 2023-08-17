import constants from '../util/constants';

type AvailableModules = keyof (typeof constants)['frontEndLibs'];

interface Options {
    serverPort: number;
    modules: AvailableModules[];
}

export default function ModuleInjector({ serverPort }: Options) {
    const requiredModules = [
        _remoteInjector(
            `http://localhost:${serverPort}/socket.io/socket.io.js`,
            false
        ),
        _directInjector(
            `
            const socket = io();

            socket.on('reconnect', reload);
            socket.on('reload', reload);

            function reload() {
                console.log('Reloading...');
                location.reload();
            }
    
            function done() {
                console.log('Communicating Print-ready state...')
                socket.emit('done');
            }

            window.Engine = {
                done,
                reload
            };
        `,
            false
        )
    ];

    function _scriptType(isESModule: boolean) {
        return isESModule ? 'module' : 'application/javascript';
    }

    function _remoteInjector(url: string, isESModule: boolean): string {
        return `<script src="${url}" type="${_scriptType(
            isESModule
        )}"></script>`;
    }

    function _nodeModuleInjector(
        pathToModule: string,
        isESModule: boolean
    ): string {
        return `<script src="http://localhost:${serverPort}/${
            constants.templates.injectedModulesRelativePath
        }/${pathToModule}" type="${_scriptType(isESModule)}"></script>`;
    }

    function _directInjector(script: string, isESModule: boolean): string {
        return `<script type="${_scriptType(isESModule)}">${script}</script>`;
    }

    function getHeadElements() {
        return requiredModules.join('\n');
    }

    return {
        getHeadElements
    };
}

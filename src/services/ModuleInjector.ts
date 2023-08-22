import constants from '../util/constants';
import TemplateFeature from '../interfaces/TemplateFeature';
import { CheerioAPI } from 'cheerio';

interface Options {
    serverPort: number;
    $: CheerioAPI;
}

export default function ModuleInjector(options: Options) {
    const requiredModules = [
        _remoteInjector(
            `http://localhost:${options.serverPort}/socket.io/socket.io.js`,
            false
        ),
        _directInjector(
            `
            const socket = io();

            window.Engine = {
                socket,
                reload() {
                    console.log('Reloading...');
                    location.reload();
                },
                done() {
                    console.log('Communicating print-ready state...');
                    socket.emit('done');
                }
            };

            socket.on('reconnect', reload);
            socket.on('reload', reload);
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
        return `<script src="http://localhost:${options.serverPort}/${
            constants.templates.injectedModulesRelativePath
        }/${pathToModule}" type="${_scriptType(isESModule)}"></script>`;
    }

    function _directInjector(script: string, isESModule: boolean): string {
        return `<script type="${_scriptType(isESModule)}">${script}</script>`;
    }

    function injectModules(features: TemplateFeature[]) {
        const modules = requiredModules.concat(
            features.map(key => {
                const module = constants.injectableModules[key];

                if (module.transformer) {
                    module.transformer(options.$);
                }

                return _nodeModuleInjector(module.path, module.isESModule);
            })
        );

        options.$('head').append(modules.join('\n'));
    }

    return {
        injectModules
    };
}

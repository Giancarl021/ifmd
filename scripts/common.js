const { existsSync: exists } = require('fs');
const { mkdir } = require('fs/promises');
const { ncp } = require('ncp');
const { promisify } = require('util');
const _locate = require('@giancarl021/locate');

const copy = promisify(ncp).bind(ncp);

const injectedModules = ['mermaid'];

const locate = path => _locate(`../${path}`);

async function copyTemplates() {
    const srcPath = locate('src/templates');
    const distPath = locate('lib/src/templates');

    if (!exists(distPath)) await mkdir(distPath, { recursive: true });

    await copy(srcPath, distPath, { overwrite: true });
}

async function injectModules() {
    const paths = injectedModules.map(mod => ({
        distPath: locate(`lib/node_modules/${mod}`),
        srcPath: locate(`node_modules/${mod}`),
        moduleName: mod
    }));

    const promises = paths.map(async path => {
        if (!exists(path.distPath))
            await mkdir(path.distPath, { recursive: true });

        await copy(path.srcPath, path.distPath, { overwrite: true });
    });

    await Promise.all(promises);
}

module.exports = {
    copyTemplates,
    injectModules
};

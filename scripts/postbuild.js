const { copyTemplates, injectModules } = require('./common');

async function main() {
    const promises = [copyTemplates(), injectModules()];

    await Promise.all(promises);
}

main().catch(console.error);

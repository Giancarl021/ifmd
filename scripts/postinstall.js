const { injectModules } = require('./common');

async function main() {
    const promises = [injectModules()];

    await Promise.all(promises);
}

main().catch(console.error);

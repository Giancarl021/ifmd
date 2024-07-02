#!/usr/bin/env node
import CliCore from '@giancarl021/cli-core';
import CliCoreVaultExtension from '@giancarl021/cli-core-vault-extension';
import commands from './src/commands';
import constants from './src/util/constants';
import help from './src/util/help.json';

import type {
    Behavior,
    HelpDescriptor
} from '@giancarl021/cli-core/interfaces';

const APP_NAME = 'ifmd';
const DEBUG_MODE = String(process.env.IFMD_DEBUG).toLowerCase() === 'true';

async function main() {
    const behavior: Behavior = {};

    const _help: HelpDescriptor = { ...help };
    delete _help['$schema'];

    if (DEBUG_MODE) {
        behavior.exitOnError = false;
        behavior.returnResult = true;
    }

    const runner = CliCore(APP_NAME, {
        appDescription:
            'Simple Markdown-to-pdf renderer for my college assignments',
        args: {
            flags: {
                helpFlags: ['?', 'h', 'help']
            }
        },
        behavior,
        commands,
        extensions: [CliCoreVaultExtension(constants.data.vaultConfig)],
        help: _help
    });

    return await runner.run();
}

const commandPromise = main();

if (DEBUG_MODE) {
    commandPromise.then(console.log).catch(console.error);
}

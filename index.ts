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

async function main(debugMode: boolean) {
    const behavior: Behavior = {};

    const _help: HelpDescriptor = { ...help };
    delete _help['$schema'];

    if (debugMode) {
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

export default main;

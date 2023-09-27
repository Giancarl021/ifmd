import CliCore from '@giancarl021/cli-core';
import { Behavior, HelpDescriptor } from '@giancarl021/cli-core/interfaces';
import CliCoreVaultExtension from '@giancarl021/cli-core-vault-extension';

import commands from './src/commands';
import constants from './src/util/constants';
import help from './src/util/help.json';
import vaultConfig from './src/util/vaultConfig';

async function IFMD() {
    const behavior: Behavior = {};

    const _help = { ...help } as HelpDescriptor;
    delete _help['$schema'];

    if (constants.cli.debugMode) {
        behavior.exitOnError = false;
        behavior.returnResult = true;
    }

    const runner = CliCore(constants.cli.appName, {
        appDescription: constants.cli.appDescription,
        args: {
            flags: {
                helpFlags: ['?', 'h', 'help']
            }
        },
        behavior,
        commands,
        extensions: [CliCoreVaultExtension(vaultConfig)],
        help: _help
    });

    return await runner.run();
}

export default IFMD;

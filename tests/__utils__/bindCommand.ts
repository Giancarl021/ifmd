import type { Flags, Command } from '@giancarl021/cli-core/interfaces';
import createHelpers from '@giancarl021/cli-core/src/util/helpers';

export default function bindCommand(
    command: Command
): (args: string[], flags: Flags) => Promise<string> {
    return async function (args: string[], flags: Flags) {
        return await command.bind(
            {
                appName: 'ifmd-test-runner',
                extensions: {},
                helpers: createHelpers(args, flags),
                context: {}
            },
            args,
            flags
        )();
    };
}

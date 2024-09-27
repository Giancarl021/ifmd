import type {
    Flags,
    Command,
    Commands
} from '@giancarl021/cli-core/interfaces';
import createHelpers from '@giancarl021/cli-core/src/util/helpers';

export type BoundCommand = ((
    args: string[],
    flags: Flags
) => Promise<string>) & {
    wrap: (args: string[], flags: Flags) => () => Promise<string>;
};

export interface BoundCommands {
    [commandName: string]: BoundCommand | BoundCommands;
}

export default function CommandBinder(commandName: string) {
    const data: Record<string, any> = {};
    const secrets: Record<string, string> = {};

    function _bindCommand(command: Command): BoundCommand {
        const callback = async (args: string[], flags: Flags) =>
            await command.bind(
                {
                    appName: 'ifmd-test-runner',
                    extensions: {
                        vault: {
                            async setSecret(name: string, value: string) {
                                secrets[name] = value;
                            },
                            async getSecret(name: string) {
                                if (!secrets[name])
                                    throw new Error('Secret not found');
                                return secrets[name];
                            },
                            async removeSecret(name: string) {
                                delete secrets[name];
                            },
                            setData(name: string, value: any) {
                                data[name] = value;
                            },
                            getData(name: string) {
                                return data[name];
                            },
                            removeData(name: string) {
                                delete data[name];
                            }
                        }
                    },
                    helpers: createHelpers(args, flags),
                    context: {}
                },
                args,
                flags
            )();

        callback.wrap = (args: string[], flags: Flags) => async () =>
            await callback(args, flags);

        return callback;
    }

    function _bindCommands(
        command: Command | Commands
    ): BoundCommand | BoundCommands {
        if (typeof command === 'function') {
            return _bindCommand(command);
        }

        const boundCommands: BoundCommands = {};

        for (const key in command) {
            boundCommands[key] = _bindCommands(command[key]);
        }

        return boundCommands;
    }

    function bindCommands(): BoundCommands {
        const boundCommands: BoundCommands = {};
        const commands = require(`../../src/commands/${commandName}`)
            .default as Commands;

        for (const key in commands) {
            boundCommands[key] = _bindCommands(commands[key]);
        }

        return boundCommands;
    }

    function bindCommand(): BoundCommand {
        const command = require(`../../src/commands/${commandName}`)
            .default as Command;

        return _bindCommand(command);
    }

    function afterEach() {
        Object.keys(data).forEach(key => delete data[key]);
        Object.keys(secrets).forEach(key => delete secrets[key]);
    }

    return {
        bindCommand,
        bindCommands,
        afterEach,
        data,
        secrets
    };
}

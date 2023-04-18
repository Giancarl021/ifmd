import { Command } from '@giancarl021/cli-core/interfaces';

const command: Command = function (args) {
    const [name] = args;

    if (!name) throw new Error('Name must be set to a value');

    this.extensions.vault.setData('name', name);

    return `Name set to ${name}`;
};

export default command;

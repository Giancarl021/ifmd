import { Command } from '@giancarl021/cli-core/interfaces';
import constants from '../util/constants';

const disallowedKeys = ['__proto__', 'prototype', 'constructor'];

const command: Command = function (args) {
    const [key, value] = args;

    const trimmedKey = key.trim();

    if (!trimmedKey) throw new Error('Key must be set to a value');
    if (!constants.data.varKeyRegex.test(trimmedKey))
        throw new Error(
            `Key must follow the regex ${constants.data.varKeyRegex}`
        );

    if (disallowedKeys.includes(trimmedKey))
        throw new Error(`Key name ${trimmedKey} is disallowed`);

    const trimmedValue = value.trim();

    if (!trimmedValue)
        throw new Error('Value must be set to a non-empty String');

    this.extensions.vault.setData(`props.${key}`, value);

    return `Global property ${trimmedKey} set to ${trimmedValue}`;
};

export default command;

import { CommandInternal, Flags } from '@giancarl021/cli-core/interfaces';
import constants from './constants';

export default function getProps(
    commandThis: CommandInternal,
    flags: Flags
): Record<string, string> {
    type Key = keyof typeof flags;

    const props: Record<string, string> =
        commandThis.extensions.vault.getData(constants.data.propsKey) ?? {};

    const keys: Key[] = Object.keys(flags);

    for (const key of keys) {
        if (
            typeof key === 'number' ||
            !key.includes(constants.data.propsFlagSeparator)
        )
            continue;

        const [prefix, propName] = key.split(constants.data.propsFlagSeparator);

        if (
            !constants.data.propFlagPrefixes.includes(prefix) ||
            !constants.data.varKeyRegex.test(propName)
        )
            continue;

        props[propName] = String(flags[key]);
    }

    return props;
}

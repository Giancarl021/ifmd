import { VaultExtensionOptions } from '@giancarl021/cli-core-vault-extension/interfaces';
import locate from '@giancarl021/locate';

const config: VaultExtensionOptions = {
    baseData: {
        name: 'Unknown'
    },
    dataPath: locate('~/.ifmd')
};

export default config;

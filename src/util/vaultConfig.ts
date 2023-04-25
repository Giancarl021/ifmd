import { VaultExtensionOptions } from '@giancarl021/cli-core-vault-extension/interfaces';
import locate from '@giancarl021/locate';
import constants from './constants';

const config: VaultExtensionOptions = {
    baseData: {
        name: 'Unknown'
    },
    dataPath: locate(constants.data.rootPath + '/vars.json')
};

export default config;

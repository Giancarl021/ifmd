import locate from '@giancarl021/locate';
import CompilationData from '../interfaces/CompilationData';
import { VaultExtensionOptions } from '@giancarl021/cli-core-vault-extension/interfaces';

const dataRootPath = locate('~/.ifmd');

const defaultManifest: Omit<CompilationData, 'files' | 'path' | 'createdAt'> = {
    title: 'Compilation',
    description: null,
    generateIndex: true
};

const vaultConfig: VaultExtensionOptions = {
    baseData: {
        name: 'Unknown'
    },
    dataPath: locate(dataRootPath + '/vars.json')
};

export default {
    templates: {
        customRootPath: locate('~/.ifmd/templates'),
        defaultRootPath: locate('src/templates'),
        defaultTemplateName: 'Document',
        defaultSampleTemplateFile: locate('src/templates/sample.md')
    },
    containerMode:
        String(process.env.IFMD_CONTAINER_MODE).toLowerCase() === 'true',
    compilation: {
        getDefaultManifest(root: string, files: string[]) {
            const manifest: CompilationData = {
                ...defaultManifest,
                files,
                createdAt: new Date(),
                path: root
            };

            return manifest;
        }
    },
    data: {
        rootPath: dataRootPath,
        varKeyRegex: /^[0-9a-zA-z-_]+$/,
        propsKey: 'props',
        propFlagPrefixes: ['p', 'prop'] as string[],
        propsFlagSeparator: ':',
        vaultConfig
    } as const,
    temp: {
        rootPath: locate('tmp')
    },
    frontEndLibs: {
        mermaid: locate('node_modules/mermaid')
    },
    webServer: {
        async defaultPort() {
            return 3000;
        }
    },
    pdf: {
        defaultTitle: 'Trabalho',
        margins: {
            globalDefault: '20px',
            default: {
                top: '20px',
                bottom: '20px',
                left: '20px',
                right: '20px'
            }
        }
    }
} as const;

import locate from '@giancarl021/locate';
import CompilationData from '../interfaces/CompilationData';

const defaultManifest: Omit<CompilationData, 'files' | 'path' | 'createdAt'> = {
    title: 'Compilation',
    description: null,
    generateIndex: true
};

export default {
    cli: {
        appName: 'ifmd',
        appDescription:
            '[I]nherently [F]ascinating [M]ark[D]own, a Markdown to PDF converter with great customization capabilities',
        debugMode: String(process.env.IFMD_DEBUG).toLowerCase() === 'true'
    },
    templates: {
        customRootPath: locate('~/.ifmd/templates'),
        defaultRootPath: locate('src/templates'),
        defaultTemplateName: 'Document',
        defaultSampleTemplateFile: locate('src/templates/sample.md'),
        injectedModulesRelativePath: '__injected_modules__'
    },
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
        rootPath: locate('~/.ifmd'),
        varKeyRegex: /^[0-9a-zA-z-_]+$/,
        propsKey: 'props'
    },
    temp: {
        rootPath: locate('tmp')
    },
    frontEndLibs: {
        mermaid: locate('node_modules/mermaid')
    },
    webServer: {
        defaultPort: 3000
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

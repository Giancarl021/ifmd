import locate from '@giancarl021/locate';
import CompilationData from '../interfaces/CompilationData';

const defaultManifest: Omit<CompilationData, 'files' | 'path' | 'createdAt'> = {
    title: 'Compilation',
    description: null,
    generateIndex: true
};

export default {
    templates: {
        customRootPath: locate('~/.ifmd/templates'),
        defaultRootPath: locate('src/templates'),
        defaultTemplateName: 'Document',
        defaultSampleTemplateFile: locate('src/templates/sample.md')
    } as const,
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
    } as const,
    data: {
        rootPath: locate('~/.ifmd'),
        varKeyRegex: /^[0-9a-zA-z-_]+$/,
        propsKey: 'props'
    } as const,
    temp: {
        rootPath: locate('tmp')
    } as const,
    frontEndLibs: {
        mermaid: locate('node_modules/mermaid')
    } as const,
    webServer: {
        defaultPort: 3000
    } as const,
    pdf: {
        defaultTitle: 'Trabalho',
        margins: {
            globalDefault: '20px',
            default: {
                top: '20px',
                bottom: '20px',
                left: '20px',
                right: '20px'
            } as const
        } as const
    } as const
};

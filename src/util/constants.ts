import locate from '@giancarl021/locate';

export default {
    templates: {
        customRootPath: locate('~/.ifmd/templates'),
        defaultRootPath: locate('src/templates')
    },
    data: {
        rootPath: locate('~/.ifmd'),
        varKeyRegex: /^[0-9a-zA-z-_]+$/
    },
    temp: {
        rootPath: locate('tmp')
    },
    assets: {
        rootPath: locate('src/templates/assets')
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
};

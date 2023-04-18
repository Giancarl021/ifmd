import locate from '@giancarl021/locate';

export default {
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

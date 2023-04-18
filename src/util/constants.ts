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
    }
};

import { readFileSync } from 'fs';

module.exports = async function (url: string) {
    return {
        ok: url === 'http://www.ok.com',
        status: 400,
        statusText: 'Bad Request',
        async arrayBuffer() {
            return new Uint8Array(readFileSync('tmp/Document.zip')).buffer;
        }
    };
};

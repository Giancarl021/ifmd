import { existsSync as exists } from 'fs';
import { mkdir, rm, writeFile } from 'fs/promises';
import copyFiles from 'recursive-copy';
import locate from '@giancarl021/locate';
import constants from '../util/constants';

export default function () {
    const tmpPath = locate(
        `${constants.temp.rootPath}/${Date.now()}.${Math.floor(
            Math.random() * 1000
        )}.d`
    );
    const tmpPathAssets = locate(`${tmpPath}/assets`);

    async function create() {
        if (!exists(tmpPath)) {
            await mkdir(tmpPath, { recursive: true });
        }
    }

    async function remove() {
        if (exists(tmpPath)) {
            await rm(tmpPath, { recursive: true, force: true });
        }
    }

    async function fill(indexContent: string) {
        await new Promise((resolve, reject) => {
            copyFiles(constants.assets.rootPath, tmpPathAssets, err => {
                if (err) return reject(err);

                resolve(null);
            });
        });

        await writeFile(`${tmpPath}/index.html`, indexContent);
    }

    function getFilePath(relativePath: string) {
        return locate(`${tmpPath}/${relativePath}`);
    }

    function getRootPath() {
        return tmpPath;
    }

    return {
        create,
        remove,
        fill,
        getRootPath,
        getFilePath
    };
}

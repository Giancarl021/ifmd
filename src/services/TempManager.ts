import { existsSync as exists } from 'fs';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import copyFiles from 'recursive-copy';
import locate from '@giancarl021/locate';
import constants from '../util/constants';

export default function TempManager() {
    const tmpPath = locate(
        `${constants.temp.rootPath}/${Date.now()}.${Math.floor(
            Math.random() * 1000
        )}.d`
    );

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

    async function loadLibraries() {
        for (const lib in constants.frontEndLibs) {
            const path =
                constants.frontEndLibs[
                    lib as keyof typeof constants.frontEndLibs
                ];

            await copyFiles(path, `${tmpPath}/__injected_libs__/${lib}`);
        }
    }

    async function clear() {
        await remove();
        await create();
    }

    async function fill(indexContent: string, rootPath: string) {
        await loadLibraries();
        await new Promise((resolve, reject) => {
            copyFiles(rootPath, tmpPath, err => {
                if (err) return reject(err);

                resolve(null);
            });
        });

        await write('index.html', indexContent);
    }

    async function write(relativePath: string, data: string) {
        await writeFile(`${tmpPath}/${relativePath}`, data);
    }

    async function read(relativePath: string) {
        return await readFile(`${tmpPath}/${relativePath}`, 'utf8');
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
        clear,
        fill,
        write,
        read,
        getRootPath,
        getFilePath
    };
}

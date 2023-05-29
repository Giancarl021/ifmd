import { lstat, readdir } from 'fs/promises';
import locate from '@giancarl021/locate';
import { existsSync as exists } from 'fs';

type FilterCallback = (path: string) => boolean;

const defaultFilter = () => true;

async function getFiles(
    directoryPath: string,
    filterCallback: FilterCallback
): Promise<string[]> {
    const dirData = await readdir(directoryPath, { withFileTypes: true });
    const files = (
        await Promise.all(
            dirData.map(file => {
                const path = locate(`${directoryPath}/${file.name}`);
                const isDirectory = file.isDirectory();

                if (!isDirectory && !filterCallback(path)) return null;

                return isDirectory ? getFiles(path, filterCallback) : path;
            })
        )
    ).filter(Boolean);

    return files.flat() as string[];
}

export default async function (
    directoryPath: string,
    filterCallback: FilterCallback = defaultFilter
): Promise<string[]> {
    if (!directoryPath) throw new Error('Directory path is required');
    const basePath = locate(directoryPath);

    if (!exists(basePath) || !(await lstat(basePath)).isDirectory()) {
        throw new Error(`${directoryPath} is not a directory`);
    }

    const files = await getFiles(basePath, filterCallback);

    return files;
}

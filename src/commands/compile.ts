import { Command } from '@giancarl021/cli-core/interfaces';
import constants from '../util/constants';
import locate from '@giancarl021/locate';
import { readFile, lstat, writeFile } from 'fs/promises';
import { existsSync as exists } from 'fs';
import recursiveReadDir from '../util/recursiveReadDir';
import CompilationData from '../interfaces/CompilationData';

const command: Command = async function (args) {
    const [directory] = args;

    if (!directory) throw new Error('Directory is required');

    const path = locate(directory);

    if (!exists(path) || !(await lstat(path)).isDirectory())
        throw new Error(`${directory} is not a directory`);

    const generateManifest = this.helpers.hasFlag('g', 'generate-manifest');

    const manifestPath = locate(`${path}/manifest.json`);
    const manifestExists = exists(manifestPath);

    if (generateManifest) {
        if (manifestExists)
            throw new Error(`Manifest already exists at ${manifestPath}`);

        const files = await recursiveReadDir(path, path =>
            path.endsWith('.md')
        );

        const manifest = constants.compilation.getDefaultManifest(path, files);

        await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

        return `Manifest generated at ${manifestPath}`;
    }

    if (!manifestExists)
        throw new Error(
            `Manifest does not exist at ${path}.\nRun with this command with the \`--generate-manifest\` flag to generate one`
        );

    const manifestData = JSON.parse(await readFile(manifestPath, 'utf-8'));

    const manifest: CompilationData = {
        ...manifestData,
        createdAt: new Date(manifestData.createdAt)
    };

    return ``;
};

export default command;

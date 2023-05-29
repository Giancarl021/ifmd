import { Command } from '@giancarl021/cli-core/interfaces';
import constants from '../util/constants';
import locate from '@giancarl021/locate';
import ignore, { Ignore } from 'ignore';
import { relative } from 'path';
import { readFile, lstat, writeFile } from 'fs/promises';
import { existsSync as exists } from 'fs';
import recursiveReadDir from '../util/recursiveReadDir';
import CompilationData from '../interfaces/CompilationData';
import Nullable from '../interfaces/Nullable';

const command: Command = async function (args) {
    const [directory] = args;

    if (!directory) throw new Error('Directory is required');

    const path = locate(directory);

    if (!exists(path) || !(await lstat(path)).isDirectory())
        throw new Error(`${directory} is not a directory`);

    const generateManifest = this.helpers.hasFlag('g', 'generate-manifest');
    const ignoreFilePath: Nullable<string> = this.helpers.valueOrDefault(
        this.helpers.getFlag('i', 'ignore-file'),
        null
    );

    const manifestPath = locate(`${path}/manifest.json`);
    const manifestExists = exists(manifestPath);

    if (generateManifest) {
        const _ignoreFilePath = ignoreFilePath ? locate(ignoreFilePath) : null;

        if (
            ignoreFilePath &&
            (!exists(_ignoreFilePath!) ||
                !(await lstat(_ignoreFilePath!)).isFile())
        )
            throw new Error(`Ignore file does not exist at ${_ignoreFilePath}`);

        let ig: Ignore | null = null;

        if (ignoreFilePath) {
            ig = ignore();
            ig.add(await readFile(_ignoreFilePath!, 'utf-8'));
        }

        const files = await recursiveReadDir(path, filePath => {
            if (!filePath.endsWith('.md')) return false;

            if (ig) return !ig.ignores(relative(path, filePath));

            return true;
        });

        if (manifestExists) {
        }

        const manifest: CompilationData = manifestExists
            ? {
                  ...JSON.parse(await readFile(manifestPath, 'utf-8')),
                  files
              }
            : constants.compilation.getDefaultManifest(path, files);

        await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

        return `Manifest ${
            manifestExists ? 'updated' : 'generated'
        } at ${manifestPath}`;
    }

    if (ignoreFilePath) {
        console.log(
            'WARNING: Ignoring files can only be applied on a manifest generation'
        );
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

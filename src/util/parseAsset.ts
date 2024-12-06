import { isUri } from 'valid-url';
import isValidPath from 'is-valid-path';
import { dirname, isAbsolute } from 'path';
import type LocalAsset from '../interfaces/LocalAsset';
import hash from './hash';
import locate from '@giancarl021/locate';

export default function parseFilePath(
    asset: string | undefined,
    pathOfOrigin: string
): LocalAsset | null {
    if (!asset) return null;

    if (isUri(asset)) return null;

    if (!isValidPath(asset)) return null;

    const absolutePath = locate(
        isAbsolute(asset) ? asset : `${dirname(pathOfOrigin)}/${asset}`
    );

    const localAsset: LocalAsset = {
        originalPath: asset,
        path: absolutePath,
        reference: hash(`${pathOfOrigin}::${absolutePath}`),
        owner: pathOfOrigin
    };

    return localAsset;
}

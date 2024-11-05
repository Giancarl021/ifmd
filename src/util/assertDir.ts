import { existsSync, mkdirSync } from 'fs';

export default function assertDir(path: string) {
    if (!path || typeof path !== 'string')
        throw new Error('Invalid path provided');

    if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
    }
}

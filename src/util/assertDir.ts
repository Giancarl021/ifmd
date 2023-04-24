import { existsSync, mkdirSync } from 'fs';

export default function (path: string) {
    if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
    }
}

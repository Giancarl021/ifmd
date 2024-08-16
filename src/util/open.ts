import { spawn } from 'child_process';
import { platform } from 'os';

const openCommandMap = {
    win32: 'explorer',
    linux: 'xdg-open',
    default: 'open'
} as Record<NodeJS.Platform | 'default', string>;

type OpenCommandMap = typeof openCommandMap;
type OpenCommandMapKey = keyof OpenCommandMap;

const currentOS = platform();

export default function open(path: string) {
    const command: string =
        openCommandMap[currentOS as OpenCommandMapKey] ??
        openCommandMap.default;

    const process = spawn(command, [path], {
        detached: true
    });

    process.unref();
}

import { spawn } from 'child_process';
import { platform } from 'os';

const openCommandMap = {
    win32: 'explorer',
    linux: 'xdg-open',
    darwin: 'open',
    default: 'open'
} as const;

type OpenCommandMap = typeof openCommandMap;
type OpenCommandMapKey = keyof OpenCommandMap;

const currentOS = platform();

export default function (path: string) {
    const command: string =
        openCommandMap[currentOS as OpenCommandMapKey] ??
        openCommandMap.default;

    const process = spawn(command, [path], {
        detached: true
    });

    process.unref();
}

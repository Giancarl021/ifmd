import { spawn } from 'child_process';
import { platform } from 'os';

const COMMAND_MAP = {
    win32: 'explorer',
    linux: 'xdg-open',
    default: 'open'
} as Record<NodeJS.Platform | 'default', string>;

const currentOS = platform();

export default function open(path: string, platform?: NodeJS.Platform) {
    const command: string =
        COMMAND_MAP[platform ?? currentOS] ?? COMMAND_MAP.default;

    const process = spawn(command, [path], {
        detached: true
    });

    process.unref();
}

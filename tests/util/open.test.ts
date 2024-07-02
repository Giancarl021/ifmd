import { describe, test, expect, jest } from '@jest/globals';

jest.mock('child_process');

import child_process from 'child_process';
import open from '../../src/util/open';

const spawnSpy = jest.spyOn(child_process, 'spawn');

describe('util/open', () => {
    test('Start process', () => {
        open(process.cwd());
        expect(spawnSpy).toHaveBeenCalledTimes(1);
        expect(spawnSpy).toHaveBeenCalledWith(
            expect.stringMatching(/^((xdg-)?open|explorer)$/),
            [process.cwd()],
            expect.objectContaining({
                detached: true
            })
        );
    });
});

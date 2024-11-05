import { jest, describe, test, expect } from '@jest/globals';

import constants from '../../src/util/constants';

describe('util/constants functions', () => {
    test('compilation/getDefaultManifest', () => {
        const root = 'root';
        const files = ['file1', 'file2'];
        expect(
            constants.compilation.getDefaultManifest(root, files)
        ).toMatchObject({
            title: 'Compilation',
            description: null,
            generateIndex: true,
            createdAt: expect.any(Date),
            path: root,
            files
        });
    });

    test('webServer/defaultPort', async () => {
        await expect(constants.webServer.defaultPort()).resolves.toBe(3000);
    });
});

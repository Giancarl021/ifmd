import {
    describe,
    test,
    expect,
    beforeEach,
    afterEach,
    jest
} from '@jest/globals';

import ParseMultiMarkdown from '../../src/services/ParseMultiMarkdown';
import locate from '@giancarl021/locate';
import { unlinkSync, writeFileSync } from 'fs';

jest.mock('fs');
jest.mock('fs/promises');

const ROOT = '/';

beforeEach(() => {
    writeFileSync(
        '/file1.md',
        `# File 1
![image](./image.png)
[link](./tests/services/ParseMarkdown.ts)
[localLink](#jest-test-runner)`
    );
    writeFileSync('/file2.md', '# File 2');
    writeFileSync('/file3.md', 'File 3');
});

afterEach(() => {
    unlinkSync('/file1.md');
    unlinkSync('/file2.md');
    unlinkSync('/file3.md');
});

describe('services/ParseMultiMarkdown', () => {
    test('Initialization', () => {
        expect(() => ParseMultiMarkdown()).not.toThrow();
    });

    test('compile with no files', async () => {
        const parser = ParseMultiMarkdown();

        expect(
            await parser.compile(
                {
                    description: 'Jest Test Runner',
                    path: '',
                    title: 'Jest Test Runner',
                    files: [],
                    createdAt: new Date(),
                    generateIndex: true
                },
                ROOT
            )
        ).toEqual({
            content: expect.stringMatching(
                /<h1>Jest Test Runner<\/h1><p>Jest Test Runner<\/p><ul id="__compilation_index__"><\/ul><div class="page-break"><\/div>/
            ),
            title: 'Jest Test Runner',
            localAssets: []
        });
    });

    test('compile with files', async () => {
        const parser = ParseMultiMarkdown();

        expect(
            await parser.compile(
                {
                    description: 'Jest Test Runner',
                    path: '',
                    title: 'Jest Test Runner',
                    files: ['/file1.md', '/file2.md', '/file3.md'],
                    createdAt: new Date(),
                    generateIndex: true
                },
                ROOT
            )
        ).toEqual({
            content: expect.stringMatching(
                /<h1>Jest Test Runner<\/h1><p>Jest Test Runner<\/p><ul id="__compilation_index__">(<li><a href="#[0-9a-f]+">(File 1|File 2|file3\.md)<\/a><\/li>){3}<\/ul><div class="page-break"><\/div>(<div class="file-content"><h1 id="[0-9a-f]+">(File 1|File 2)<\/h1>((.|\n)*?)<\/div><div class="page-break"><\/div>){2}<div class="file-content"><h1 id="[0-9a-f]+">file3\.md<\/h1><p>File 3<\/p>((.|\n)*?)<\/div>/
            ),
            title: 'Jest Test Runner',
            localAssets: [
                {
                    originalPath: './image.png',
                    owner: locate('/file1.md'),
                    path: locate('/image.png'),
                    reference: expect.stringMatching(/[A-Z0-9\+\/=]/i)
                },
                {
                    originalPath: './tests/services/ParseMarkdown.ts',
                    owner: locate('/file1.md'),
                    path: locate('/tests/services/ParseMarkdown.ts'),
                    reference: expect.stringMatching(/[A-Z0-9\+\/=]/i)
                }
            ]
        });
    });

    test('compile with no description', async () => {
        const parser = ParseMultiMarkdown();

        expect(
            await parser.compile(
                {
                    description: null,
                    path: '',
                    title: 'Jest Test Runner',
                    files: [],
                    createdAt: new Date(),
                    generateIndex: true
                },
                ROOT
            )
        ).toEqual({
            content: expect.stringMatching(
                /<h1>Jest Test Runner<\/h1><ul id="__compilation_index__"><\/ul><div class="page-break"><\/div>/
            ),
            title: 'Jest Test Runner',
            localAssets: []
        });
    });
});

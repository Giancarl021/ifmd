import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import mock from 'mock-fs';

import TemplateEngine from '../../src/services/TemplateEngine';
import { readFileSync } from 'fs';

const originalHtml = readFileSync('src/templates/Document/index.html', 'utf-8');

beforeEach(() => {
    mock({
        '/index.html': originalHtml,
        '/withSet': {
            'index.html': originalHtml.replace(
                '@@content',
                '@@set(prop, value)@@content'
            )
        }
    });
});

afterEach(() => {
    mock.restore();
});

describe('services/TemplateEngine', () => {
    test('Initialization', () => {
        expect(() => TemplateEngine()).not.toThrow();
    });

    test('generate/Empty content', async () => {
        const engine = TemplateEngine();

        const result = await engine.generate(
            {
                isNative: true,
                createdAt: new Date(),
                name: 'Jest Test Runner',
                path: '/'
            },
            {
                content: '',
                title: 'Jest Test Runner'
            },
            [],
            9090
        );

        expect(result).toContain(
            '<script type="module" src="http://localhost:9090/__injected_libs__/mermaid/dist/mermaid.esm.min.mjs"></script>'
        );
        expect(result).toContain('@@name');
        expect(result).toContain('@@date');
        expect(result).toContain('<title>Jest Test Runner</title>');
        expect(result).toContain('<h1>Jest Test Runner</h1>');
        expect(result).not.toContain('@@title');
        expect(result).toContain('<main class="markdown-body"></main>');
    });

    test('generate/Escaped prop', async () => {
        const engine = TemplateEngine();

        const result = await engine.generate(
            {
                isNative: true,
                createdAt: new Date(),
                name: 'Jest Test Runner',
                path: '/'
            },
            {
                content: '@@\\title',
                title: 'Jest Test Runner'
            },
            [],
            9090
        );

        expect(result).toContain(
            '<script type="module" src="http://localhost:9090/__injected_libs__/mermaid/dist/mermaid.esm.min.mjs"></script>'
        );
        expect(result).toContain('@@name');
        expect(result).toContain('@@date');
        expect(result).toContain('<title>Jest Test Runner</title>');
        expect(result).toContain('<h1>Jest Test Runner</h1>');
        expect(result).toContain('@@title');
        expect(result).toContain('<main class="markdown-body">@@title</main>');
    });

    test('generate/Recursive content', async () => {
        const engine = TemplateEngine();

        const result = await engine.generate(
            {
                isNative: true,
                createdAt: new Date(),
                name: 'Jest Test Runner',
                path: '/'
            },
            {
                content: '@@content',
                title: 'Jest Test Runner'
            },
            [],
            9090
        );

        expect(result).toContain(
            '<script type="module" src="http://localhost:9090/__injected_libs__/mermaid/dist/mermaid.esm.min.mjs"></script>'
        );
        expect(result).toContain('@@name');
        expect(result).toContain('@@date');
        expect(result).toContain('<title>Jest Test Runner</title>');
        expect(result).toContain('<h1>Jest Test Runner</h1>');
        expect(result).not.toContain('@@title');
        expect(result).toContain(
            '<main class="markdown-body">@@content</main>'
        );
    });

    test('generate/All props', async () => {
        const engine = TemplateEngine();

        const result = await engine.generate(
            {
                isNative: true,
                createdAt: new Date(),
                name: 'Jest Test Runner',
                path: '/'
            },
            {
                content: '',
                title: 'Jest Test Runner',
                name: 'Jest Test Runner',
                date: '2021-10-10'
            },
            [],
            9090
        );

        expect(result).toContain(
            '<script type="module" src="http://localhost:9090/__injected_libs__/mermaid/dist/mermaid.esm.min.mjs"></script>'
        );
        expect(result).not.toContain('@@name');
        expect(result).toContain('<h2>Jest Test Runner</h2>');
        expect(result).not.toContain('@@date');
        expect(result).toContain('<h3>2021-10-10</h3>');
        expect(result).toContain('<title>Jest Test Runner</title>');
        expect(result).toContain('<h1>Jest Test Runner</h1>');
        expect(result).not.toContain('@@title');
        expect(result).toContain('<main class="markdown-body"></main>');
    });

    test('generate/With mermaid block', async () => {
        const engine = TemplateEngine();

        const result = await engine.generate(
            {
                isNative: true,
                createdAt: new Date(),
                name: 'Jest Test Runner',
                path: '/'
            },
            {
                content:
                    '<pre><code class="language-mermaid">flowchart TB;\nA --> B</code></pre>',
                title: 'Jest Test Runner'
            },
            [],
            9090
        );

        expect(result).toContain(
            '<script type="module" src="http://localhost:9090/__injected_libs__/mermaid/dist/mermaid.esm.min.mjs"></script>'
        );
        expect(result).toContain('@@name');
        expect(result).toContain('@@date');
        expect(result).toContain('<title>Jest Test Runner</title>');
        expect(result).toContain('<h1>Jest Test Runner</h1>');
        expect(result).not.toContain('@@title');
        expect(result).toContain(
            '<main class="markdown-body"><pre class="mermaid">flowchart TB;\nA --&gt; B</pre></main>'
        );
    });

    test('generate/Unfilled value macro', async () => {
        const engine = TemplateEngine();

        const result = await engine.generate(
            {
                isNative: true,
                createdAt: new Date(),
                name: 'Jest Test Runner',
                path: '/'
            },
            {
                content: '@@prop',
                title: 'Jest Test Runner'
            },
            [],
            9090
        );

        expect(result).toContain(
            '<script type="module" src="http://localhost:9090/__injected_libs__/mermaid/dist/mermaid.esm.min.mjs"></script>'
        );
        expect(result).toContain('@@name');
        expect(result).toContain('@@date');
        expect(result).toContain('<title>Jest Test Runner</title>');
        expect(result).toContain('<h1>Jest Test Runner</h1>');
        expect(result).not.toContain('@@title');
        expect(result).toContain('<main class="markdown-body">@@prop</main>');
    });

    test('generate/Filled value macro', async () => {
        const engine = TemplateEngine();

        const result = await engine.generate(
            {
                isNative: true,
                createdAt: new Date(),
                name: 'Jest Test Runner',
                path: '/'
            },
            {
                content: '@@prop',
                title: 'Jest Test Runner',
                prop: 'Xalabaias'
            },
            [],
            9090
        );

        expect(result).toContain(
            '<script type="module" src="http://localhost:9090/__injected_libs__/mermaid/dist/mermaid.esm.min.mjs"></script>'
        );
        expect(result).toContain('@@name');
        expect(result).toContain('@@date');
        expect(result).toContain('<title>Jest Test Runner</title>');
        expect(result).toContain('<h1>Jest Test Runner</h1>');
        expect(result).not.toContain('@@title');
        expect(result).toContain(
            '<main class="markdown-body">Xalabaias</main>'
        );
    });

    test('generate/Date displacement macro', async () => {
        const engine = TemplateEngine();

        const date = new Date(2021, 10, 10);
        const dayBefore = new Date(2021, 10, 10);
        dayBefore.setDate(dayBefore.getDate() - 1);

        const result = await engine.generate(
            {
                isNative: true,
                createdAt: new Date(),
                name: 'Jest Test Runner',
                path: '/'
            },
            {
                content: '@@date(-1d)',
                title: 'Jest Test Runner',
                date: date.toLocaleDateString()
            },
            [],
            9090
        );

        expect(result).toContain(
            '<script type="module" src="http://localhost:9090/__injected_libs__/mermaid/dist/mermaid.esm.min.mjs"></script>'
        );

        expect(result).toContain('@@name');
        expect(result).not.toContain('@@date');
        expect(result).toContain(`<h3>${date.toLocaleDateString()}</h3>`);
        expect(result).toContain('<title>Jest Test Runner</title>');
        expect(result).toContain('<h1>Jest Test Runner</h1>');
        expect(result).not.toContain('@@title');
        expect(result).toContain(
            `<main class="markdown-body">${dayBefore.toLocaleDateString()}</main>`
        );
    });

    test('generate/Date displacement macro with invalid date', async () => {
        const engine = TemplateEngine();

        const result = await engine.generate(
            {
                isNative: true,
                createdAt: new Date(),
                name: 'Jest Test Runner',
                path: '/'
            },
            {
                content: '@@date(-1d)',
                title: 'Jest Test Runner',
                date: 'NaN'
            },
            [],
            9090
        );

        expect(result).toContain(
            '<script type="module" src="http://localhost:9090/__injected_libs__/mermaid/dist/mermaid.esm.min.mjs"></script>'
        );

        expect(result).toContain('@@name');
        expect(result).not.toContain('@@date');
        expect(result).toContain(`<h3>NaN</h3>`);
        expect(result).toContain('<title>Jest Test Runner</title>');
        expect(result).toContain('<h1>Jest Test Runner</h1>');
        expect(result).not.toContain('@@title');
        expect(result).toContain(`<main class="markdown-body">NaN</main>`);
    });

    test('generate/Set on content', async () => {
        const engine = TemplateEngine();

        const result = await engine.generate(
            {
                isNative: true,
                createdAt: new Date(),
                name: 'Jest Test Runner',
                path: '/'
            },
            {
                content: '@@prop@@set(prop, value)',
                title: 'Jest Test Runner'
            },
            [],
            9090
        );

        expect(result).toContain(
            '<script type="module" src="http://localhost:9090/__injected_libs__/mermaid/dist/mermaid.esm.min.mjs"></script>'
        );
        expect(result).toContain('@@name');
        expect(result).toContain('@@date');
        expect(result).toContain('<title>Jest Test Runner</title>');
        expect(result).toContain('<h1>Jest Test Runner</h1>');
        expect(result).not.toContain('@@title');
        expect(result).toContain('<main class="markdown-body">value</main>');
    });

    test('generate/Set on content overwritten by props', async () => {
        const engine = TemplateEngine();

        const result = await engine.generate(
            {
                isNative: true,
                createdAt: new Date(),
                name: 'Jest Test Runner',
                path: '/'
            },
            {
                content: '@@prop@@set(prop, value)',
                title: 'Jest Test Runner',
                prop: 'Xalabaias'
            },
            [],
            9090
        );

        expect(result).toContain(
            '<script type="module" src="http://localhost:9090/__injected_libs__/mermaid/dist/mermaid.esm.min.mjs"></script>'
        );
        expect(result).toContain('@@name');
        expect(result).toContain('@@date');
        expect(result).toContain('<title>Jest Test Runner</title>');
        expect(result).toContain('<h1>Jest Test Runner</h1>');
        expect(result).not.toContain('@@title');
        expect(result).toContain(
            '<main class="markdown-body">Xalabaias</main>'
        );
    });

    test('generate/Set on base HTML', async () => {
        const engine = TemplateEngine();

        const result = await engine.generate(
            {
                isNative: true,
                createdAt: new Date(),
                name: 'Jest Test Runner',
                path: '/withSet'
            },
            {
                content: '@@prop',
                title: 'Jest Test Runner'
            },
            [],
            9090
        );

        expect(result).toContain(
            '<script type="module" src="http://localhost:9090/__injected_libs__/mermaid/dist/mermaid.esm.min.mjs"></script>'
        );
        expect(result).toContain('@@name');
        expect(result).toContain('@@date');
        expect(result).toContain('<title>Jest Test Runner</title>');
        expect(result).toContain('<h1>Jest Test Runner</h1>');
        expect(result).not.toContain('@@title');
        expect(result).toContain('<main class="markdown-body">value</main>');
    });

    test('generate/Set on base HTML overwritten by content', async () => {
        const engine = TemplateEngine();

        const result = await engine.generate(
            {
                isNative: true,
                createdAt: new Date(),
                name: 'Jest Test Runner',
                path: '/withSet'
            },
            {
                content: '@@prop@@set(prop, Xalabaias)',
                title: 'Jest Test Runner'
            },
            [],
            9090
        );

        expect(result).toContain(
            '<script type="module" src="http://localhost:9090/__injected_libs__/mermaid/dist/mermaid.esm.min.mjs"></script>'
        );
        expect(result).toContain('@@name');
        expect(result).toContain('@@date');
        expect(result).toContain('<title>Jest Test Runner</title>');
        expect(result).toContain('<h1>Jest Test Runner</h1>');
        expect(result).not.toContain('@@title');
        expect(result).toContain(
            '<main class="markdown-body">Xalabaias</main>'
        );
    });

    test('generate/Set on base HTML overwritten by props', async () => {
        const engine = TemplateEngine();

        const result = await engine.generate(
            {
                isNative: true,
                createdAt: new Date(),
                name: 'Jest Test Runner',
                path: '/withSet'
            },
            {
                content: '@@prop',
                title: 'Jest Test Runner',
                prop: 'Xalabaias'
            },
            [],
            9090
        );

        expect(result).toContain(
            '<script type="module" src="http://localhost:9090/__injected_libs__/mermaid/dist/mermaid.esm.min.mjs"></script>'
        );
        expect(result).toContain('@@name');
        expect(result).toContain('@@date');
        expect(result).toContain('<title>Jest Test Runner</title>');
        expect(result).toContain('<h1>Jest Test Runner</h1>');
        expect(result).not.toContain('@@title');
        expect(result).toContain(
            '<main class="markdown-body">Xalabaias</main>'
        );
    });

    test('generate/With assets', async () => {
        const engine = TemplateEngine();

        const result = await engine.generate(
            {
                isNative: true,
                createdAt: new Date(),
                name: 'Jest Test Runner',
                path: '/'
            },
            {
                content: '<img src="./image.png" alt="Image" />',
                title: 'Jest Test Runner'
            },
            [
                {
                    originalPath: './image.png',
                    owner: 'file1.md',
                    path: '/image.png',
                    reference: 'imgRef'
                }
            ],
            9090
        );

        expect(result).toContain(
            '<script type="module" src="http://localhost:9090/__injected_libs__/mermaid/dist/mermaid.esm.min.mjs"></script>'
        );
        expect(result).toContain('@@name');
        expect(result).toContain('@@date');
        expect(result).toContain('<title>Jest Test Runner</title>');
        expect(result).toContain('<h1>Jest Test Runner</h1>');
        expect(result).not.toContain('@@title');
        expect(result).toContain(
            '<main class="markdown-body"><img src="http://localhost:9090/__dynamic_assets__/imgRef" alt="Image"></main>'
        );
    });

    test('generateForPreview/Empty content', async () => {
        const engine = TemplateEngine();

        const result = await engine.generateForPreview(
            {
                isNative: true,
                createdAt: new Date(),
                name: 'Jest Test Runner',
                path: '/'
            },
            {
                content: '',
                title: 'Jest Test Runner'
            },
            [],
            9090
        );

        expect(result).toContain(
            '<script type="module" src="http://localhost:9090/__injected_libs__/mermaid/dist/mermaid.esm.min.mjs"></script>'
        );
        expect(result).toContain(
            '<script src="http://localhost:9090/socket.io/socket.io.js"></script>'
        );
        expect(result).toContain(`
<script>
    const socket = io();

    socket.on('reconnect', reload);
    socket.on('reload', reload);

    function reload() {
        console.log('Reloading...');
        location.reload();
    }
</script>
`);
        expect(result).toContain('@@name');
        expect(result).toContain('@@date');
        expect(result).toContain('<title>Jest Test Runner</title>');
        expect(result).toContain('<h1>Jest Test Runner</h1>');
        expect(result).not.toContain('@@title');
        expect(result).toContain('<main class="markdown-body"></main>');
    });
});

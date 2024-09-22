import {
    jest,
    describe,
    test,
    expect,
    afterEach,
    beforeAll,
    afterAll
} from '@jest/globals';

let argv: string[] = [];

const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockExit = jest
    .spyOn(process, 'exit')
    .mockImplementation(_ => _ as never);

async function getRunner() {
    return (await import('../index')).default;
}

beforeAll(() => {
    argv = [...process.argv];
});

afterEach(() => {
    process.argv = [...argv];
    jest.resetModules();
    jest.clearAllMocks();
});

afterAll(() => {
    consoleLogMock.mockRestore();
});

describe('app/runner', () => {
    test('Run in normal mode', async () => {
        process.argv = ['node', 'bin.js'];
        const runner = await getRunner();
        expect(async () => await runner(false)).not.toThrow();
        expect(consoleLogMock).toHaveBeenCalledTimes(1);
        expect(mockExit).toHaveBeenCalledTimes(0);
    });

    test('Run in debug mode', async () => {
        process.argv = ['node', 'bin.js'];
        const runner = await getRunner();
        const result = await runner(true);
        expect(result).toBe(`ifmd
  Description: Simple Markdown-to-pdf renderer for my college assignments
  Commands:
    generate: Generate a PDF file from a Markdown file
    preview: Create a web preview of the rendered document with live reload on changes
    compile: Compile multiple Markdown files into a single PDF file
    set-prop: Set global properties to be used as variables in templates
    template: Manage custom templates`);
        expect(consoleLogMock).toHaveBeenCalledTimes(0);
        expect(mockExit).toHaveBeenCalledTimes(0);
    });
});

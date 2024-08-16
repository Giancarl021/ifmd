import { jest } from '@jest/globals';

const os = jest.createMockFromModule<typeof import('os')>('os');

function mockPlaftorm(): NodeJS.Platform {
    console.log('PLATFORM CALL ...................');
    return (globalThis as any).__MOCK_PLATFORM__;
}

os.platform = mockPlaftorm as any;

module.exports = os;

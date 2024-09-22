import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
    testMatch: ['<rootDir>/tests/**/*.test.ts'],
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/lib/'],
    transformIgnorePatterns: [],
    moduleFileExtensions: [
        'js',
        'mjs',
        'cjs',
        'jsx',
        'ts',
        'tsx',
        'json',
        'node',
        'd.ts'
    ],
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: false,
                tsconfig: './tsconfig.json'
            }
        ]
    }
};

export default config;

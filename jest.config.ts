import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
    testEnvironment: 'node',
    testMatch: ['<rootDir>/tests/**/*.test.ts'],
    // collectCoverage: true,
    collectCoverageFrom: ['<rootDir>/src/**/*.ts', '<rootDir>/index.ts'],
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

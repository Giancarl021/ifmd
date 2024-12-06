import { describe, expect, test } from '@jest/globals';

import parseAsset from '../../src/util/parseAsset';

const ASSET_OWNER = '/dir/owner.md';

describe('util/parseAsset', () => {
    test('Invalid asset input', () => {
        expect(parseAsset(undefined, ASSET_OWNER)).toBe(null);
        expect(parseAsset(null as unknown as undefined, ASSET_OWNER)).toBe(
            null
        );
        expect(parseAsset('', ASSET_OWNER)).toBe(null);
    });

    test('URI asset', () => {
        expect(parseAsset('https://example.com', ASSET_OWNER)).toBe(null);
        expect(parseAsset('ftp://example.com', ASSET_OWNER)).toBe(null);
        expect(parseAsset('file://example.com', ASSET_OWNER)).toBe(null);
        expect(parseAsset('mailto:example@example.com', ASSET_OWNER)).toBe(
            null
        );
        expect(parseAsset('tel:1234567890', ASSET_OWNER)).toBe(null);
    });

    test('Invalid Path', () => {
        expect(parseAsset('*.png', ASSET_OWNER)).toBe(null);
        expect(parseAsset('(a|b).ts', ASSET_OWNER)).toBe(null);
        expect(parseAsset('#title', ASSET_OWNER)).toBe(null);
        expect(parseAsset('?', ASSET_OWNER)).toBe(null);
    });
    test('Absolute path', () => {
        expect(parseAsset('/dir/asset.png', ASSET_OWNER)).toMatchObject({
            originalPath: '/dir/asset.png',
            path: '/dir/asset.png',
            reference: expect.any(String),
            owner: ASSET_OWNER
        });
    });

    test('Relative path', () => {
        expect(parseAsset('asset.png', ASSET_OWNER)).toMatchObject({
            originalPath: 'asset.png',
            path: '/dir/asset.png',
            reference: expect.any(String),
            owner: ASSET_OWNER
        });
    });
});

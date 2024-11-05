import { createHash } from 'crypto';

const HASHING_FUNCTION = 'sha1';

export default function hash(value: string): string {
    if (typeof value !== 'string')
        throw new Error('Value to hash must be a string');

    return createHash(HASHING_FUNCTION).update(value).digest('base64');
}

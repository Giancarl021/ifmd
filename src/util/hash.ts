import { createHash } from 'crypto';

const HASHING_FUNCTION = 'md5';

export default function hash(value: string): string {
    return createHash(HASHING_FUNCTION).update(value).digest('base64');
}

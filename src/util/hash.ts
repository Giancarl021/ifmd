import { createHash } from 'crypto';

const hashingFunction = createHash('md5');

export default function hash(value: string): string {
    return hashingFunction.update(value).digest('base64');
}

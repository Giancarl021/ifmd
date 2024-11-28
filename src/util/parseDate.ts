import parser from 'any-date-parser';
import timestring from 'timestring';

const parse: (date: string) => Date = parser.fromString.bind(parser);

const defaultOperation = '+' as const;
const allowedOperations: Readonly<DateOperator[]> = [defaultOperation, '-'];

export type DateOperator = '+' | '-';
export type DateOperand = `${DateOperator | ''}${string}`;

export default function parseDate(date: string, operand: DateOperand): string {
    if (!date || typeof date !== 'string') return String(date);

    const dateObject = parse(date);

    if (isNaN(Number(dateObject))) return date;

    if (!operand || typeof operand !== 'string') return date;

    const hasOperator = allowedOperations.includes(
        operand.charAt(0) as DateOperator
    );

    const value = hasOperator ? operand.slice(1) : operand;

    const operation = hasOperator ? operand.charAt(0) : defaultOperation;

    let millis: number;

    try {
        millis = timestring(value, 'ms');
    } catch {
        return date;
    }

    const resultDate =
        operation === defaultOperation
            ? add(dateObject, millis)
            : subtract(dateObject, millis);

    return resultDate.toLocaleDateString(undefined, { timeZone: 'UTC' });
}

function add(date: Date, millis: number) {
    return new Date(date.getTime() + millis);
}

function subtract(date: Date, millis: number) {
    return new Date(date.getTime() - millis);
}

import parser from 'any-date-parser';
import timestring from 'timestring';

const parse: (date: string) => Date = parser.exportAsFunction().bind(parser);

const defaultOperation = '+';
const allowedOperations = [defaultOperation, '-'];

export default function (date: string, operand: string): string {
    const dateObject = parse(date);

    if (isNaN(Number(dateObject))) {
        return date;
    }

    if (!operand) {
        return date;
    }

    const hasOperator = allowedOperations.includes(operand.charAt(0));

    const value = hasOperator ? operand.slice(1) : operand;

    const operation = hasOperator ? operand.charAt(0) : defaultOperation;

    const millis = timestring(value, 'ms');

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

function utcDate(date: Date) {
    return new Date(
        Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds(),
            date.getUTCMilliseconds()
        )
    );
}

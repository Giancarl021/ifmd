type NullablePrimitive<T> = T extends string
    ? string | null
    : T extends Iterable<any>
      ? T
      : T | null;

type NullableObject<T> = {
    [P in keyof T]: NullablePrimitive<T[P]>;
};

type Nullable<T> = T extends number | string | boolean | Iterable<any>
    ? NullablePrimitive<T>
    : NullableObject<T>;

export default Nullable;

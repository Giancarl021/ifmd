type NullablePrimitive<T> = T extends Iterable<any> ? T : T | null;

type NullableObject<T> = {
    [P in keyof T]: NullablePrimitive<T[P]>;
};

type Nullable<T> = T extends {} ? NullableObject<T> : NullablePrimitive<T>;

export default Nullable;

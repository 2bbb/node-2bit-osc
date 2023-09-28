import { TypeName, TypeNameToValueType, BufferLike } from './value';

export type SpecifiedArgument<T extends TypeName> = {
    type: T;
    value: TypeNameToValueType[T];
}

export type Argument = SpecifiedArgument<TypeName>;
export type ArgumentLike = Argument | TypeNameToValueType[TypeName] | BufferLike;

export function int32(v: number | bigint): SpecifiedArgument<'integer'> {
    return { type: 'integer', value: Number(v) };
}

export function float(v: number | bigint): SpecifiedArgument<'float'> {
    return { type: 'float', value: Number(v) };
}

export function double(v: number | bigint): SpecifiedArgument<'double'> {
    return { type: 'double', value: Number(v) };
}

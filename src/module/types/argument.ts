import { TypeName, TypeNameToValueType, BufferLike } from './value';

export type SpecifiedArgument<T extends TypeName> = {
    type: T;
    value: TypeNameToValueType[T];
}

export type Argument = SpecifiedArgument<TypeName>;
export type ArgumentLike = Argument | TypeNameToValueType[TypeName] | BufferLike;

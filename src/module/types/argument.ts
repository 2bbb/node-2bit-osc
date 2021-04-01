import { ValueType, ValueTypeMap, BufferLike } from './value';

export interface SpecifiedArgument<T extends ValueType> {
    type: T;
    value: ValueTypeMap[T];
}

export type Argument = SpecifiedArgument<ValueType>;
export type ArgumentLike = Argument | ValueTypeMap[ValueType] | BufferLike;

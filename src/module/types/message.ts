import * as Convert from './convert';
import { Argument, ArgumentLike } from './argument';
import { TypeName, TypeNameToValueType } from './value';

export interface MessageInterface {
    address: string;
    args: Argument[];
    oscType: 'message';
}

export class Message implements MessageInterface {
    address: string;
    args: Argument[] = [];
    readonly oscType: 'message' = 'message';
    constructor(address: string, ... args: ArgumentLike[]) {
        this.address = address ?? '';
        this.args = args.map(arg => Convert.toArgument(arg));
    }

    add(arg: ArgumentLike, ... args: ArgumentLike[]): this {
        this.args.push(Convert.toArgument(arg), ... args.map(arg => Convert.toArgument(arg)));
        return this;
    }
    addWithType<T extends TypeName>(type: T, value: TypeNameToValueType[T]): this {
        this.args.push({ type: type, value });
        return this;
    }

    setAddress(address: string): this {
        this.address = address;
        return this;
    }

    static from(address: string, ... args: ArgumentLike[]): Message
    { return new Message(address, ... args); }
}

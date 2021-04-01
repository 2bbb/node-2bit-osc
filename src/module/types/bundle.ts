import { TimetagSending } from './value';
import { ArgumentLike } from './argument';
import { Message, MessageInterface } from './message';

export interface BundleInterface {
    timetag: TimetagSending;
    elements: (MessageInterface | BundleInterface)[];
    oscType: 'bundle';
}

export class Bundle implements BundleInterface {
    timetag: TimetagSending = [0, 1];
    elements: (MessageInterface | BundleInterface)[];
    readonly oscType: 'bundle' = 'bundle';

    constructor(timetag?: TimetagSending,
                ... messages: (MessageInterface | BundleInterface)[])
    {
        if(timetag) this.timetag = timetag;
        this.elements = messages;
    }

    add(message: MessageInterface): this;
    add(message: BundleInterface): this;
    add(address: string, ... args: ArgumentLike[]): this;
    add(message_or_address: MessageInterface | BundleInterface | string,
        ... args: ArgumentLike[]): this
    {
        if(typeof message_or_address === 'string') {
            this.elements.push(Message.from(message_or_address, ... args));
        } else {
            this.elements.push(message_or_address);
        }
        return this;
    }

    setTimetag(date: Date): this {
        this.timetag = date;
        return this;
    }

    static from(timetag: TimetagSending,
                ... messages: (MessageInterface | BundleInterface)[]): Bundle
    { return new Bundle(timetag, ... messages); }
}

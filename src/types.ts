export declare type BufferLike = Buffer | ArrayBuffer | Uint8Array;
export declare type RelativeSecondsFromNow = number;
export declare type SecondsSince1900 = number;
export declare type FractionalSeconds = number;
export declare type TimetagReceived = [SecondsSince1900, FractionalSeconds]
export declare type TimetagSending = 
    | null
    | Date
    | RelativeSecondsFromNow
    | TimetagReceived;

export const Type = {
    string:  's',
    integer: 'i',
    timetag: 't',
    float:   'f',
    double:  'd',
    blob:    'b',
    true:    'T',
    false:   'F',
    null:    'N',
    bang:    'I',
} as const;

export type TypeMap = {
    s: string,
    i: number,
    t: TimetagSending,
    f: number,
    d: number,
    b: Buffer,
    T: true,
    F: false,
    N: null,
    I: null,
};

export type Value = TypeMap[keyof TypeMap];

export type Argument = {
    type: keyof typeof Type;
    value: TypeMap[keyof TypeMap];
}

export type ArgumentLike = Argument | Value;

export type Message = {
    address: string;
    args: Argument[];
    oscType: 'message'
};

export type Bundle = {
    timetag: TimetagSending,
    elements: (Message | Bundle)[],
    oscType: 'bundle'
};
